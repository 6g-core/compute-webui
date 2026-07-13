<template>
  <div class="metrics-value-panel">
    <div v-if="showLoading" class="state-block">
      <div class="spinner"></div>
      <div class="state-text">加载指标中…</div>
    </div>

    <template v-else-if="showEmpty">
      <div v-if="error" class="error-banner">
        <span class="error-text">{{ errorMessage }}</span>
        <button class="retry-btn" @click="onRetry">重试</button>
      </div>
      <div class="state-block">
        <div class="state-text state-empty">暂无指标数据</div>
      </div>
    </template>

    <template v-else>
      <div v-if="error" class="error-banner">
        <span class="error-text">{{ errorMessage }}，显示最近一次成功数据</span>
        <button class="retry-btn" @click="onRetry">重试</button>
      </div>

      <div class="value-card">
        <div class="value-meta">
          <span class="value-kicker">E2E</span>
          <span class="value-source">{{ sourceLabel }}</span>
        </div>
        <div class="value-main">
          <span class="value-number">{{ displayValue }}</span>
          <span class="value-unit">ms</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { samples, ottSamples, isLoading, error, refresh } = useMetricsHistory()
const activeView = useTopologyView()

const activeSamples = computed(() => {
  if (activeView.value === 'public-cloud' && ottSamples.value.length > 0) {
    return ottSamples.value
  }
  return samples.value
})

const latestSample = computed(() => activeSamples.value[activeSamples.value.length - 1] ?? null)
const displayValue = computed(() => {
  const value = latestSample.value?.e2e_latency_ms
  return Number.isFinite(value) ? Math.round(value as number).toString() : '--'
})
const sourceLabel = computed(() =>
  activeView.value === 'public-cloud' && ottSamples.value.length > 0
    ? 'Public Cloud'
    : 'Core'
)
const showLoading = computed(() => isLoading.value && activeSamples.value.length === 0 && !error.value)
const showEmpty = computed(() => !isLoading.value && activeSamples.value.length === 0)
const errorMessage = computed(() => error.value?.message || '请求失败')

function onRetry() {
  void refresh()
}
</script>

<style scoped>
.metrics-value-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px;
  gap: 8px;
  overflow: hidden;
}

.value-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.94));
  border: 1px solid rgba(59, 130, 246, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.value-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.value-kicker {
  font-size: calc(0.72rem * var(--ui-font-scale));
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2563eb;
}

.value-source {
  font-size: calc(0.72rem * var(--ui-font-scale));
  font-family: 'IBM Plex Mono', monospace;
  color: #64748b;
}

.value-main {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.value-number {
  font-size: calc(clamp(2.6rem, 5vw, 4.8rem) * var(--ui-font-scale));
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.value-unit {
  padding-bottom: 8px;
  font-size: calc(0.9rem * var(--ui-font-scale));
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.state-block {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  min-height: 0;
}

.state-text {
  font-size: calc(0.78rem * var(--ui-font-scale));
  letter-spacing: 0.02em;
}

.state-empty {
  opacity: 0.75;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(148, 163, 184, 0.35);
  border-top-color: #3b82f6;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 10px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  border-radius: var(--radius-btn, 6px);
  font-size: calc(0.72rem * var(--ui-font-scale));
  flex: 0 0 auto;
}

.error-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retry-btn {
  flex: 0 0 auto;
  padding: 3px 10px;
  font-size: calc(0.7rem * var(--ui-font-scale));
  font-weight: 700;
  border: 1px solid rgba(185, 28, 28, 0.4);
  background: #fff;
  color: #b91c1c;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.retry-btn:hover {
  background: #b91c1c;
  color: #fff;
}
</style>
