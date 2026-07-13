<template>
  <div class="live-header">
    <div class="live-values">
      <div v-if="secondaryValue !== undefined" class="live-metric live-metric-secondary">
        <span class="live-metric-label">{{ secondaryLabel }}</span>
        <div class="live-metric-main">
          <span class="live-metric-number">{{ formatNumber(secondaryValue) }}</span>
          <span class="live-metric-unit">{{ unit }}</span>
        </div>
      </div>

      <div class="live-metric">
        <span class="live-metric-label">{{ primaryLabel }}</span>
        <div class="live-metric-main">
          <span class="live-metric-number">{{ formatNumber(primaryValue) }}</span>
          <span class="live-metric-unit">{{ unit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  primaryLabel: string
  primaryValue?: number | null
  secondaryLabel?: string
  secondaryValue?: number | null
  unit: string
  digits?: number
}>(), {
  secondaryLabel: '',
  primaryValue: null,
  secondaryValue: undefined,
  digits: 1
})

function formatNumber(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }
  return value.toFixed(props.digits)
}
</script>

<style scoped>
.live-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px 6px;
}

.live-values {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.live-metric {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  padding: 2px 0;
  white-space: nowrap;
}

.live-metric-secondary .live-metric-label {
  color: #c2410c;
}

.live-metric-secondary .live-metric-number {
  color: #9a3412;
}

.live-metric-label {
  font-size: calc(0.62rem * var(--ui-font-scale));
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}

.live-metric-main {
  display: inline-flex;
  align-items: flex-end;
  gap: 6px;
}

.live-metric-number {
  font-size: calc(clamp(1.25rem, 1.8vw, 1.9rem) * var(--ui-font-scale));
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 800;
  line-height: 0.9;
  color: #0f172a;
}

.live-metric-unit {
  font-size: calc(0.68rem * var(--ui-font-scale));
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  line-height: 1.2;
  color: #64748b;
  text-transform: uppercase;
  padding-bottom: 2px;
}
</style>
