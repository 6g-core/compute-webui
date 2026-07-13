const STORAGE_KEY = 'ui-font-size-percent'

export const UI_FONT_SIZE_DEFAULT = 100
export const UI_FONT_SIZE_MIN = 75
export const UI_FONT_SIZE_MAX = 137.5
export const UI_FONT_SIZE_STEP = 6.25

function clampFontSize(value: number) {
  if (!Number.isFinite(value)) return UI_FONT_SIZE_DEFAULT
  return Math.min(UI_FONT_SIZE_MAX, Math.max(UI_FONT_SIZE_MIN, value))
}

export function useUiFontSize() {
  const percent = useState<number>('ui-font-size-percent', () => UI_FONT_SIZE_DEFAULT)

  const canDecrease = computed(() => percent.value > UI_FONT_SIZE_MIN)
  const canIncrease = computed(() => percent.value < UI_FONT_SIZE_MAX)
  const displayPercent = computed(() => `${Math.round(percent.value)}%`)

  function apply(value: number, persist = true) {
    const next = clampFontSize(value)
    percent.value = next

    if (import.meta.client) {
      document.documentElement.style.setProperty('--ui-font-scale', String(next / 100))
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, String(next))
        } catch {
          // Font sizing still works when storage is unavailable.
        }
      }
    }
  }

  function load() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      apply(stored === null ? UI_FONT_SIZE_DEFAULT : Number(stored), false)
    } catch {
      apply(UI_FONT_SIZE_DEFAULT, false)
    }
  }

  function increase() {
    apply(percent.value + UI_FONT_SIZE_STEP)
  }

  function decrease() {
    apply(percent.value - UI_FONT_SIZE_STEP)
  }

  return {
    percent: readonly(percent),
    displayPercent,
    canDecrease,
    canIncrease,
    load,
    increase,
    decrease
  }
}
