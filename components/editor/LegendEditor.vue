<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="text-[calc(0.62rem*var(--ui-font-scale))] tracking-[0.14em] uppercase font-bold text-ink-500 px-1">
        画布图例
      </div>
      <button
        type="button"
        :class="['toggle-mini', config.visible && 'toggle-mini-on']"
        @click="$emit('update', { ...config, visible: !config.visible })"
      >
        {{ config.visible ? 'ON' : 'OFF' }}
      </button>
    </div>

    <div v-if="config.visible" class="space-y-1.5">
      <div
        v-for="(item, idx) in config.items"
        :key="item.id"
        class="legend-row"
      >
        <input
          type="color"
          class="legend-color"
          :value="item.color"
          @input="patch(idx, 'color', ($event.target as HTMLInputElement).value)"
        />
        <input
          class="settings-input legend-label"
          :value="item.label"
          placeholder="Label"
          @input="patch(idx, 'label', ($event.target as HTMLInputElement).value)"
        />
        <button class="icon-button icon-button-sm" @click="remove(idx)" title="删除">
          <el-icon :size="12"><Delete /></el-icon>
        </button>
      </div>

      <button class="add-btn" @click="addItem">
        <el-icon :size="12"><Plus /></el-icon>
        <span>添加图例项</span>
      </button>

      <div v-if="!config.items.length" class="text-[calc(0.68rem*var(--ui-font-scale))] text-ink-500 text-center py-1">
        点击上方添加第一个图例项
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import type { LegendConfig } from '../flow/storage'

const props = defineProps<{ config: LegendConfig }>()
const emit = defineEmits<{ 'update': [cfg: LegendConfig] }>()

const PALETTE = ['#7c3aed', '#f59e0b', '#0284c7', '#38bdf8', '#10b981', '#ec4899', '#64748b']

function patch(idx: number, key: 'color' | 'label', value: string) {
  const items = props.config.items.slice()
  items[idx] = { ...items[idx], [key]: value }
  emit('update', { ...props.config, items })
}

function addItem() {
  const i = props.config.items.length
  emit('update', {
    ...props.config,
    items: [
      ...props.config.items,
      {
        id: `legend-${Date.now()}-${i}`,
        color: PALETTE[i % PALETTE.length],
        label: '新图例'
      }
    ]
  })
}

function remove(idx: number) {
  const items = props.config.items.slice()
  items.splice(idx, 1)
  emit('update', { ...props.config, items })
}
</script>

<style scoped>
.legend-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-color {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: #ffffff;
  cursor: pointer;
}
.legend-label {
  flex: 1;
  height: 32px;
  min-height: 32px;
  font-size: calc(0.74rem * var(--ui-font-scale));
}
.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 30px;
  border: 1px dashed rgba(59, 130, 246, 0.4);
  border-radius: var(--radius-btn);
  background: rgba(59, 130, 246, 0.04);
  color: #2563eb;
  font-size: calc(0.72rem * var(--ui-font-scale));
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.add-btn:hover {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.6);
}

.toggle-mini {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(148, 163, 184, 0.10);
  color: var(--color-muted);
  font-size: calc(0.6rem * var(--ui-font-scale));
  font-weight: 800;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-mini-on {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.42);
}
</style>
