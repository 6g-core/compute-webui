<template>
  <section class="panel overflow-hidden flex flex-col">
    <div class="panel-header">
      <div class="flex items-center gap-2">
        <span class="title-kicker">Sequence</span>
        <span>动画序列编排 · 共 {{ steps.length }} 步</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="icon-button icon-button-sm" @click="addStep" title="新增空步骤" :disabled="collapsed">
          <el-icon :size="14"><Plus /></el-icon>
        </button>
        <button
          class="icon-button icon-button-sm"
          @click="duplicateLast"
          title="复制上一步骤并追加"
          :disabled="collapsed || !steps.length"
        >
          <el-icon :size="14"><DocumentCopy /></el-icon>
        </button>
        <button
          class="primary-button"
          style="height: 32px; padding: 0 14px; font-size: calc(0.78rem * var(--ui-font-scale));"
          @click="play"
          :disabled="!steps.length"
        >
          <el-icon :size="13"><VideoPlay /></el-icon>
          播放预览
        </button>
        <button
          class="icon-button icon-button-sm"
          @click="$emit('toggle')"
          :title="collapsed ? '展开' : '折叠'"
        >
          <el-icon :size="14">
            <ArrowUp v-if="collapsed" />
            <ArrowDown v-else />
          </el-icon>
        </button>
      </div>
    </div>

    <div v-if="!collapsed" class="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
      <div v-if="!steps.length" class="text-center text-ink-500 py-6" style="font-size: calc(0.82rem * var(--ui-font-scale));">
        暂无步骤，点击 ＋ 添加
      </div>

      <div
        v-for="(step, idx) in steps"
        :key="step.id"
        class="step-queue-item"
        :class="{ 'step-queue-item-active': idx === playingIdx }"
      >
        <span class="step-queue-number">{{ idx + 1 }}</span>

        <div class="min-w-0 flex flex-col gap-2">
          <div class="grid grid-cols-3 gap-2">
            <input
              class="settings-input"
              style="height: 30px; font-size: calc(0.72rem * var(--ui-font-scale));"
              :value="step.kicker"
              placeholder="STAGE · X"
              @input="patch(idx, 'kicker', ($event.target as HTMLInputElement).value)"
            />
            <input
              class="settings-input col-span-2"
              style="height: 30px; font-size: calc(0.72rem * var(--ui-font-scale));"
              :value="step.title"
              placeholder="步骤标题"
              @input="patch(idx, 'title', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <input
            class="settings-input"
            style="height: 30px; font-size: calc(0.72rem * var(--ui-font-scale));"
            :value="step.phase"
            placeholder="阶段说明（如：控制面 · IDM）"
            @input="patch(idx, 'phase', ($event.target as HTMLInputElement).value)"
          />

          <!-- 当前 Stage 高亮概览 (只读) -->
          <div class="text-[calc(0.62rem*var(--ui-font-scale))] text-ink-500 tracking-wider">
            节点 <b class="text-ink-800">{{ step.nodes.length }}</b>
            · 连线 <b class="text-ink-800">{{ step.edges.length }}</b>
            <span class="ml-1 text-ink-400">
              （画布上点元素 → Inspector 改动即自动加入）
            </span>
          </div>
          <div v-if="regions.length" class="flex flex-wrap gap-1.5">
            <button
              v-for="region in regions"
              :key="`${step.id}-${region.id}`"
              class="chip-btn"
              :class="isRegionVisible(step, idx, region) && 'chip-btn-on'"
              type="button"
              @click="toggleRegionVisibility(idx, region)"
            >
              {{ region.label }} · {{ isRegionVisible(step, idx, region) ? '显示' : '隐藏' }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <button
            class="icon-button icon-button-sm"
            :class="{ 'is-on': previewIdx === idx }"
            @click="togglePreview(idx)"
            title="预览此 Stage"
          >
            <el-icon :size="12"><View /></el-icon>
          </button>
          <button class="icon-button icon-button-sm" @click="duplicate(idx)" title="复制本步骤并插入到下一位">
            <el-icon :size="12"><DocumentCopy /></el-icon>
          </button>
          <button class="icon-button icon-button-sm" @click="move(idx, -1)" :disabled="idx === 0" title="上移">
            <el-icon :size="12"><Top /></el-icon>
          </button>
          <button class="icon-button icon-button-sm" @click="move(idx, 1)" :disabled="idx === steps.length - 1" title="下移">
            <el-icon :size="12"><Bottom /></el-icon>
          </button>
          <button
            class="icon-button icon-button-sm"
            style="color: #b91c1c;"
            @click="remove(idx)"
            title="删除"
            :disabled="idx === 0 || steps.length <= 1"
          >
            <el-icon :size="12"><Delete /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus, VideoPlay, Top, Bottom, Delete, ArrowUp, ArrowDown, View, DocumentCopy } from '@element-plus/icons-vue'
import type { SequenceStep } from '../flow/storage'

const props = defineProps<{
  steps: SequenceStep[]
  nodeIds: string[]
  regions: { id: string; label: string; hidden?: boolean }[]
  edgeIds: string[]
  playingIdx: number
  previewIdx?: number
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'update:steps': [steps: SequenceStep[]]
  'play': []
  'toggle': []
  'preview': [idx: number | null]
  'sync-preview': [idx: number]
  'focus': [type: 'node' | 'edge', id: string]
  'toggle-region-visibility': [stepIdx: number, id: string, visible: boolean]
}>()

function togglePreview(idx: number) {
  emit('preview', props.previewIdx === idx ? null : idx)
}

function onChipClick(key: 'nodes' | 'edges', stepIdx: number, id: string) {
  toggle(stepIdx, key, id)
  emit('focus', key === 'nodes' ? 'node' : 'edge', id)
  // 实时把画布切到该 step 的预览状态
  emit('sync-preview', stepIdx)
}

function update(next: SequenceStep[]) { emit('update:steps', next) }

function addStep() {
  const newStep: SequenceStep = {
    id: `step-${Date.now()}`,
    kicker: `STAGE ${props.steps.length + 1}`,
    title: '新步骤',
    phase: '',
    nodes: [],
    edges: []
  }
  update([...props.steps, newStep])
}

function deepClone<T>(v: T): T {
  // 不用 structuredClone：Vue 响应式 Proxy / VueFlow 的 Raw/markRaw 对象会 DataCloneError。
  // SequenceStep 全部是 JSON-safe 的 (string / number / plain object)，用 JSON 往返最稳。
  return JSON.parse(JSON.stringify(v))
}

function cloneStep(src: SequenceStep, indexAfterInsert: number): SequenceStep {
  const copy = deepClone(src)
  copy.id = `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  // 若原 kicker 形如 "STAGE 3"，就把序号自动升级为目标位置的 1-based 索引；否则追加 (copy)
  const match = typeof copy.kicker === 'string' ? copy.kicker.match(/^(.*?)(\d+)\s*$/) : null
  if (match) {
    copy.kicker = `${match[1]}${indexAfterInsert + 1}`
  } else if (typeof copy.kicker === 'string') {
    copy.kicker = `${copy.kicker} (copy)`
  }
  return copy
}

function duplicate(idx: number) {
  if (idx < 0 || idx >= props.steps.length) return
  const next = props.steps.slice()
  const copy = cloneStep(next[idx], idx + 1)
  next.splice(idx + 1, 0, copy)
  update(next)
}

function duplicateLast() {
  if (!props.steps.length) return
  duplicate(props.steps.length - 1)
}

function patch(idx: number, key: keyof SequenceStep, value: any) {
  const next = props.steps.slice()
  next[idx] = { ...next[idx], [key]: value }
  update(next)
}

function toggle(idx: number, key: 'nodes' | 'edges', id: string) {
  const next = props.steps.slice()
  const arr = next[idx][key]
  const nextArr = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
  let edgeSettings = next[idx].edgeSettings
  // 如果取消某条边的高亮，顺带清掉它的 override
  if (key === 'edges' && edgeSettings && arr.includes(id)) {
    const { [id]: _, ...rest } = edgeSettings
    edgeSettings = rest
  }
  next[idx] = { ...next[idx], [key]: nextArr, edgeSettings }
  update(next)
}

function move(idx: number, delta: number) {
  const to = idx + delta
  if (idx === 0 || to === 0) return
  if (to < 0 || to >= props.steps.length) return
  const next = props.steps.slice()
  const [item] = next.splice(idx, 1)
  next.splice(to, 0, item)
  update(next)
}

function remove(idx: number) {
  if (idx === 0) return
  const next = props.steps.slice()
  next.splice(idx, 1)
  update(next)
}

function isRegionVisible(
  step: SequenceStep,
  stepIdx: number,
  region: { id: string; label: string; hidden?: boolean }
) {
  if (stepIdx === 0) return !region.hidden
  const override = step.nodeSettings?.[region.id] as Record<string, any> | undefined
  if (typeof override?.hidden === 'boolean') return !override.hidden
  return !region.hidden
}

function toggleRegionVisibility(
  stepIdx: number,
  region: { id: string; label: string; hidden?: boolean }
) {
  const step = props.steps[stepIdx]
  if (!step) return
  emit('toggle-region-visibility', stepIdx, region.id, !isRegionVisible(step, stepIdx, region))
}

function play() { emit('play') }
</script>

<style scoped>
.chip-btn {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  min-height: 20px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(248, 250, 252, 0.9);
  color: #475569;
  font-size: calc(0.62rem * var(--ui-font-scale));
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: 'IBM Plex Mono', monospace;
}
.chip-btn:hover {
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.06);
}
.chip-btn-on {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.42);
  font-weight: 700;
}
.icon-button.is-on {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.10), rgba(255, 255, 255, 0.96));
  border-color: color-mix(in srgb, var(--color-blue) 40%, var(--color-border));
  color: #2563eb;
}

</style>
