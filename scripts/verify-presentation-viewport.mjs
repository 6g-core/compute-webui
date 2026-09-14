import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'artifacts/presentation')
const origin = process.env.PRESENTATION_URL || 'http://localhost:3000'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const results = []

async function ready(page) {
  await page.goto(`${origin}/?stage=1`, { waitUntil: 'networkidle' })
  await page.locator('.scene-image').evaluate(image => image.decode())
  await page.locator('.ppt-artwork-image').evaluate(image => image.decode())
  await page.locator('.presentation-background').evaluate(async element => {
    const image = new Image()
    image.src = getComputedStyle(element).backgroundImage.slice(5, -2)
    await image.decode()
  })
}

async function geometry(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.presentation-canvas').getBoundingClientRect()
    const scroll = document.querySelector('.presentation-scroll')
    return {
      canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
      scroll: { width: scroll.clientWidth, height: scroll.clientHeight, fullWidth: scroll.scrollWidth, fullHeight: scroll.scrollHeight },
      dpr: devicePixelRatio,
      background: getComputedStyle(document.querySelector('.presentation-background')).backgroundImage
    }
  })
}

try {
  const context = await browser.newContext({ viewport: { width: 2560, height: 1080 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await ready(page)
  const wide = await geometry(page)
  assert.equal(wide.canvas.x, 320)
  assert.equal(wide.canvas.width, 1920)
  assert.ok(wide.background.includes('background-tile.svg'), 'PPT background fills the gutters')
  assert.equal(wide.scroll.fullWidth, wide.scroll.width, 'Decorative tiles do not cause horizontal overflow')
  await page.mouse.move(0, 0)
  await page.screenshot({ path: path.join(output, 'wide-2560.png') })

  // Match desktop browser zoom: the physical window/screen stay fixed while
  // CSS viewport dimensions and devicePixelRatio change inversely. This is
  // layout zoom emulation, not CDP pinch/page-scale emulation.
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false,
    screenWidth: 1920, screenHeight: 1080
  })
  await ready(page)
  for (const factor of [0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.2, 1.25, 1.5, 1.75, 2]) {
    const width = Math.round(1920 / factor)
    const height = Math.round(1080 / factor)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: factor, mobile: false,
      screenWidth: 1920, screenHeight: 1080
    })
    await page.waitForFunction(({ factor, height }) => {
      const box = document.querySelector('.presentation-canvas').getBoundingClientRect()
      return Math.abs(window.devicePixelRatio - factor) < 0.001 && Math.abs(box.height - Math.min(innerWidth / 1920, height / 1080) * factor * 1080) < 0.2
    }, { factor, height })
    const measured = await geometry(page)
    // At 150%, content must occupy 150% of the physical height, instead of
    // being silently shrunk back to fit the viewport.
    assert.ok(Math.abs(measured.canvas.height * measured.dpr / 1080 - factor) < 0.002, `Actual magnification at ${factor * 100}%`)
    if (factor > 1) {
      assert.ok(measured.scroll.fullHeight > measured.scroll.height)
      assert.ok(measured.scroll.fullWidth > measured.scroll.width)
      await page.locator('.presentation-scroll').evaluate(element => element.scrollTo(element.scrollWidth, element.scrollHeight))
      const end = await geometry(page)
      assert.ok(Math.abs(end.canvas.x + end.canvas.width - end.scroll.width) < 1, 'Right edge is reachable')
      assert.ok(Math.abs(end.canvas.y + end.canvas.height - end.scroll.height) < 1, 'Bottom edge is reachable')
    } else {
      assert.equal(measured.scroll.fullWidth, measured.scroll.width)
      assert.equal(measured.scroll.fullHeight, measured.scroll.height)
    }
    await page.locator('.presentation-scroll').evaluate(element => element.scrollTo(0, 0))
    if ([0.8, 1.2, 1.5].includes(factor)) {
      // Capture the emulated viewport directly; Playwright's screenshot
      // helper restores its configured viewport and would undo CDP metrics.
      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      const png = Buffer.from(screenshot.data, 'base64')
      assert.ok(Math.abs(png.readUInt32BE(16) - 1920) <= 1, 'Screenshot keeps the physical viewport width')
      assert.ok(Math.abs(png.readUInt32BE(20) - 1080) <= 1, 'Screenshot keeps the physical viewport height')
      await writeFile(path.join(output, `browser-zoom-${Math.round(factor * 100)}.png`), png)
    }
    results.push({ zoom: `${Math.round(factor * 100)}%`, ...measured })
  }

  await page.reload({ waitUntil: 'networkidle' })
  const reloaded = await geometry(page)
  assert.ok(Math.abs(reloaded.canvas.height - 1080) < 1, 'Reload preserves browser zoom')
  assert.equal(await page.getByRole('combobox', { name: '页面缩放' }).count(), 0, 'Uses native browser controls')

  // High-DPI displays must still fit at their default browser zoom.
  const retina = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const retinaPage = await retina.newPage()
  await ready(retinaPage)
  const highDpi = await geometry(retinaPage)
  assert.equal(highDpi.canvas.width, 1440)
  assert.equal(highDpi.scroll.width, highDpi.scroll.fullWidth)
  assert.equal(highDpi.scroll.height, highDpi.scroll.fullHeight)
  await retina.close()

  assert.deepEqual(errors, [])
  const report = { wide, zooms: results, reloaded, highDpi, errors }
  await writeFile(path.join(output, 'viewport-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: true, zooms: results.map(item => item.zoom), wide: wide.canvas, highDpi: highDpi.canvas, errors, output }, null, 2))
} finally {
  await browser.close()
}
