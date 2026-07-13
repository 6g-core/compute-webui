const STORAGE_KEY = 'ui-graph-scale-percent'

export const GRAPH_SCALE_DEFAULT = 100
export const GRAPH_SCALE_MIN = 80
export const GRAPH_SCALE_MAX = 160
export const GRAPH_SCALE_STEP = 10

function clampGraphScale(value: number) {
  if (!Number.isFinite(value)) return GRAPH_SCALE_DEFAULT
  return Math.min(GRAPH_SCALE_MAX, Math.max(GRAPH_SCALE_MIN, value))
}

export function useGraphScale() {
  const percent = useState<number>('ui-graph-scale-percent', () => GRAPH_SCALE_DEFAULT)

  const canDecrease = computed(() => percent.value > GRAPH_SCALE_MIN)
  const canIncrease = computed(() => percent.value < GRAPH_SCALE_MAX)
  const displayPercent = computed(() => `${Math.round(percent.value)}%`)

  function apply(value: number, persist = true) {
    const next = clampGraphScale(value)
    percent.value = next

    if (import.meta.client) {
      document.documentElement.style.setProperty('--graph-component-scale', String(next / 100))
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, String(next))
        } catch {
          // Component scaling still works when storage is unavailable.
        }
      }
    }
  }

  function load() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      apply(stored === null ? GRAPH_SCALE_DEFAULT : Number(stored), false)
    } catch {
      apply(GRAPH_SCALE_DEFAULT, false)
    }
  }

  function increase() {
    apply(percent.value + GRAPH_SCALE_STEP)
  }

  function decrease() {
    apply(percent.value - GRAPH_SCALE_STEP)
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
