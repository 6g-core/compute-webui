import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../artifacts/presentation');
const origin = process.env.PRESENTATION_URL || 'http://localhost:3000';
const api = 'http://localhost:8787';
const stages = [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const failedRequests = [];
const inspect = page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
};
const post = async (endpoint, data) => {
  const response = await fetch(`${api}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  assert.ok(response.ok, `${endpoint}: ${response.status}`);
};
const waitVideo = async page => {
  await page.waitForFunction(() => [...document.querySelectorAll('.runtime-frame video')].some(video => video.getBoundingClientRect().height > 1 && video.readyState >= 2 && video.videoWidth > 0), null, { timeout: 30000 });
};

try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  inspect(page);
  await page.goto(`${origin}/?stage=1`, { waitUntil: 'networkidle' });
  await page.locator('.connection-dot.online').waitFor();
  await page.locator('.ppt-artwork-image').evaluate(image => image.decode());
  await page.locator('.scene-image').evaluate(image => image.decode());
  const options = await page.getByRole('combobox', { name: '演示阶段', exact: true }).locator('option').allTextContents();
  assert.deepEqual(options.map(Number), stages);

  for (const stage of stages) {
    await page.getByRole('combobox', { name: '演示阶段', exact: true }).selectOption(String(stage));
    await page.locator(`.presentation-canvas[data-stage="${stage}"]`).waitFor();
    assert.equal(await page.locator('.scene-frame').isVisible(), stage === 1);
    assert.equal(await page.locator('.runtime-frame').isVisible(), stage !== 1);
    if ([5, 7, 9, 10, 24].includes(stage)) await waitVideo(page);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: path.join(output, `stage-${stage}.png`) });
  }
  const previousTime = await page.locator('.runtime-frame video').last().evaluate(video => video.currentTime);
  await page.waitForFunction(previous => [...document.querySelectorAll('.runtime-frame video')].at(-1).currentTime > previous + 1, previousTime);
  const video = await page.locator('.runtime-frame video').last().evaluate(video => ({ readyState: video.readyState, width: video.videoWidth, height: video.videoHeight, currentTime: video.currentTime }));

  await page.keyboard.press('Home');
  await page.locator('.presentation-canvas[data-stage="1"]').waitFor();
  await page.getByRole('button', { name: '下一阶段', exact: true }).click();
  await page.locator('.presentation-canvas[data-stage="2"]').waitFor();
  await page.getByRole('button', { name: '上一阶段', exact: true }).click();
  for (const size of [{ width: 1366, height: 768 }, { width: 2560, height: 1440 }, { width: 3840, height: 2160 }]) {
    await page.setViewportSize(size);
    await page.waitForFunction(({ width, height }) => Math.abs(document.querySelector('.presentation-fit').getBoundingClientRect().width - Math.min(width, height * 16 / 9)) < 1, size);
    await page.screenshot({ path: path.join(output, `stage-1-${size.width}.png`) });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.getByRole('button', { name: '恢复跟随后端', exact: true }).click();
  await post('/api/stage', { stage: 24 });
  await page.locator('.presentation-canvas[data-stage="24"]').waitFor();
  await post('/api/stage', { stage: 1 });
  await page.locator('.presentation-canvas[data-stage="1"]').waitFor();

  // Exercise the actual SSE/cache/reset chain with demo dialogs disabled.
  const realContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await realContext.route('**/runtime-config.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('mockStage9Dialogs: true', 'mockStage9Dialogs: false') });
  });
  const realPage = await realContext.newPage();
  inspect(realPage);
  const message = '迁移验证：缓存对话';
  await post('/api/v1/qos', { dialogs: [message], images: [`${origin}/mock/grape-juice.png`], imagePlacements: [['left', 'below']] });
  await realPage.goto(`${origin}/?stage=9`, { waitUntil: 'domcontentloaded' });
  await realPage.getByText(message, { exact: true }).waitFor();
  await waitVideo(realPage);
  await post('/api/v1/qos', { reset: true });
  await realPage.getByText(message, { exact: true }).waitFor({ state: 'detached' });
  await realPage.reload({ waitUntil: 'domcontentloaded' });
  await realPage.getByRole('region', { name: 'QoS conversation' }).waitFor();
  await waitVideo(realPage);
  assert.equal(await realPage.getByText(message, { exact: true }).count(), 0, 'Reset clears cached dialogs across reconnects');
  await realPage.goto(`${origin}/?view=network&stage=9`, { waitUntil: 'domcontentloaded' });
  await realPage.getByLabel('关键步骤展示', { exact: true }).waitFor();
  assert.equal(await realPage.locator('.presentation-canvas').count(), 0, 'Original network view remains available');
  await realContext.close();
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  assert.deepEqual(failedRequests, [], 'No failed application requests');
  const report = { baseBranch: 'fix/qos-reset-clears-dialog-cache', stages, video, qosCacheReset: true, backendStageFollowing: true, legacyNetworkView: true, errors, failedRequests };
  await writeFile(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await post('/api/stage', { stage: 1 }).catch(() => {});
  await browser.close();
}
