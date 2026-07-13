<template>
  <div class="metrics-chart-panel">
    <div v-if="showLoading" class="state-block">
      <div class="spinner"></div>
      <div class="state-text">加载指标中</div>
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
        <span class="error-text">{{ errorMessage }}，展示最近一次成功的数据</span>
        <button class="retry-btn" @click="onRetry">重试</button>
      </div>

      <div class="chart-grid">
        <section class="chart-card">
          <MetricsLiveValueHeader
            primary-label="E2E latency"
            :primary-value="latestCoreE2E"
            secondary-label="OTT"
            :secondary-value="latestOttE2E"
            unit="ms"
            :digits="1"
          />
          <div class="chart-body">
            <MetricsLineChart
              :samples="samples"
              :ott-samples="ottSamples"
              :average="average"
              :ott-average="ottAverage"
              :stage="currentStage"
              metric-key="e2e_latency_ms"
              :series="e2eSeries"
              y-axis-label="ms"
            />
          </div>
        </section>

        <section class="chart-card">
          <MetricsLiveValueHeader
            primary-label="FPS"
            :primary-value="latestFps"
            unit="fps"
            :digits="1"
          />
          <div class="chart-body">
            <MetricsLineChart
              :samples="samples"
              :stage="currentStage"
              metric-key="fps"
              :series="fpsSeries"
              y-axis-label="fps"
            />
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SeriesDef } from './MetricsLineChart.vue'

const { samples, ottSamples, average, ottAverage, isLoading, error, refresh } = useMetricsHistory()
const activeView = useTopologyView()
const currentStage = useSystemStage()

const e2eSeries = computed<SeriesDef[]>(() => {
  const series: SeriesDef[] = [
    {
      key: 'e2e_latency_ms',
      label: 'E2E latency',
      color: '#3b82f6'
    }
  ]

  if (activeView.value === 'public-cloud' && ottSamples.value.length > 0) {
    series.push({
      key: 'e2e_latency_ms',
      label: 'E2E latency · OTT',
      color: '#f97316',
      sampleSource: 'ott'
    })
  }

  return series
})

const fpsSeries = computed<SeriesDef[]>(() => [
  {
    key: 'fps',
    label: 'FPS',
    color: '#2563eb'
  }
])

const latestCoreSample = computed(() => samples.value[samples.value.length - 1] ?? null)
const latestOttSample = computed(() => ottSamples.value[ottSamples.value.length - 1] ?? null)
const latestCoreE2E = computed(() => latestCoreSample.value?.e2e_latency_ms ?? null)
const latestOttE2E = computed(() =>
  activeView.value === 'public-cloud' && ottSamples.value.length > 0
    ? latestOttSample.value?.e2e_latency_ms ?? null
    : undefined
)
const latestFps = computed(() => latestCoreSample.value?.fps ?? null)
const showLoading = computed(() => isLoading.value && samples.value.length === 0 && !error.value)
const showEmpty = computed(() => !isLoading.value && samples.value.length === 0)
const errorMessage = computed(() => (error.value ? error.value.message || '请求失败' : ''))

function onRetry() {
  void refresh()
}
</script>

<style scoped>
.metrics-chart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 6px 10px 8px;
  gap: 6px;
  overflow: hidden;
}

.chart-grid {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.chart-card {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.chart-body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 8px 8px;
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
