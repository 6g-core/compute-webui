<template>
  <section class="panel flex flex-col h-full overflow-hidden">
    <div class="panel-header">
      <div class="flex items-center gap-2">
        <span>架构图</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          v-for="v in viewTabs"
          :key="v.id"
          :class="['sidebar-tab', activeView === v.id && 'sidebar-tab-active']"
          :disabled="v.id === 'public-cloud' && currentStage !== 'MEDIA_ESTABLISHED'"
          @click="switchView(v.id)"
        >
          {{ v.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 relative">
      <!-- STAGE 悬浮条：可拖拽，位置保存到 server state -->
      <div
        v-if="nodes.length > 0 && captionVisible"
        class="canvas-caption-card text-center"
        :key="captionKey"
        :style="{ '--caption-top': captionTop + 'px' }"
        @mousedown="onCaptionDragStart"
        title="拖拽调整位置"
      >
        <div class="canvas-caption-kicker">{{ caption.kicker }}</div>
        <h2 class="canvas-caption-title">{{ caption.title }}</h2>
        <div v-if="caption.phase" class="canvas-caption-meta justify-center">
          {{ caption.phase }}
        </div>
      </div>

      <!-- 空态 -->
      <div v-if="nodes.length === 0" class="absolute inset-0 grid place-items-center z-20 pointer-events-none">
        <div class="text-center pointer-events-auto">
          <div
            class="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
            style="background: rgba(59, 130, 246, 0.10);"
          >
            <el-icon :size="32" color="#3b82f6"><Connection /></el-icon>
          </div>
          <div style="font-size: calc(0.92rem * var(--ui-font-scale)); font-weight: 700; color: var(--color-text);">
            尚未创建架构图
          </div>
          <div class="mt-1 text-ink-500" style="font-size: calc(0.76rem * var(--ui-font-scale));">
            前往编辑器创建架构图
          </div>
        </div>
      </div>

      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-viewport="{ x: -22, y: 12, zoom: 0.78 }"
        :min-zoom="0.4"
        :max-zoom="2"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="false"
        :elevate-nodes-on-select="false"
        :elevate-edges-on-select="false"
        fit-view-on-init
        class="!bg-white"
        @init="onFlowInit"
      >
        <Background :gap="40" :size="1" pattern-color="#f1f5f9" />
        <Controls />
      </VueFlow>

      <div v-if="legend.visible && legend.items.length" class="canvas-legend">
        <span
          v-for="item in legend.items"
          :key="item.id"
          class="canvas-legend-pill"
          :style="{ '--lg-color': item.color } as any"
        >
          {{ item.label }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { VueFlow, type Node, type Edge, type VueFlowStore } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Connection } from '@element-plus/icons-vue'

import MissionNode from './flow/MissionNode.vue'
import MissionEdge from './flow/MissionEdge.vue'
import RegionNode from './flow/RegionNode.vue'
import BusNode from './flow/BusNode.vue'
import BarNode from './flow/BarNode.vue'
import ImageNode from './flow/ImageNode.vue'
import {
  loadAll,
  pushRemoteState,
  DEFAULT_VIEW,
  type SequenceStep,
  type LegendConfig,
  type ViewId
} from './flow/storage'
import {
  fetchTransportModeFromSandboxHealth,
  resolveTopologyViewFromBackendState,
  syncTransportModeForTopologyView
} from '../composables/topologyTransportMode'

const nodeTypes = {
  mission: markRaw(MissionNode),
  region:  markRaw(RegionNode),
  bus:     markRaw(BusNode),
  bar:     markRaw(BarNode),
  image:   markRaw(ImageNode)
}
const edgeTypes = { mission: markRaw(MissionEdge) }

const baseNodes = ref<Node[]>([])
const baseEdges = ref<Edge[]>([])
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const sequence = ref<SequenceStep[]>([])
const legend = ref<LegendConfig>({ visible: false, items: [] })
const captionTop = ref<number>(40)
const captionVisible = ref(true)
const { percent: graphScalePercent } = useGraphScale()

let flowInstance: VueFlowStore | null = null
let componentScaleRefreshTimer: ReturnType<typeof setTimeout> | null = null

function refreshScaledComponents() {
  if (!flowInstance) return
  const updateHandles = () => {
    flowInstance?.updateNodeInternals(
      nodes.value
        .filter(node => node.type === 'mission' || node.type === 'image')
        .map(node => node.id)
    )
  }
  void nextTick(updateHandles)
  if (componentScaleRefreshTimer) clearTimeout(componentScaleRefreshTimer)
  componentScaleRefreshTimer = setTimeout(updateHandles, 220)
}

function onFlowInit(instance: VueFlowStore) {
  flowInstance = instance
  refreshScaledComponents()
}

watch(graphScalePercent, refreshScaledComponents)

const viewTabs: { id: ViewId; label: string }[] = [
  { id: 'public-cloud', label: '公有云' },
  { id: 'core-network', label: '核心网' }
]
const activeView = useTopologyView()
const currentStage = ref('INIT')
const sharedSystemStage = useSystemStage()

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function restoreBaseCanvas() {
  nodes.value = cloneJson(baseNodes.value)
  edges.value = cloneJson(baseEdges.value)
}

async function hydrate(view: ViewId) {
  const all = await loadAll(view)
  const cleanNodes = all.topology.nodes.map(n => {
    if (n.type !== 'mission') return { ...n }
    const d = (n.data || {}) as any
    const cleaned: any = { ...d }
    cleaned.active = false
    cleaned.flashActive = false
    delete cleaned.message
    delete cleaned.messageIcon
    delete cleaned.messageState
    delete cleaned.plan
    return { ...n, data: cleaned }
  })
  const cleanEdges = all.topology.edges.map(e => ({
    ...e, data: { ...((e.data as any) || {}) }
  }))
  baseNodes.value = cleanNodes
  baseEdges.value = cleanEdges
  restoreBaseCanvas()
  sequence.value = all.sequence
  legend.value = all.legend
  captionTop.value = all.captionTop
  captionVisible.value = all.captionVisible
}
async function activateView(next: ViewId, syncTransportMode = false) {
  if (next === activeView.value) return
  if (syncTransportMode) {
    await syncTransportModeForTopologyView(next, { backendUrl, traceCall })
  }
  // 停掉演示、清除高亮、释放 baseSnap，避免跨视图污染
  // 切视图前先停掉轮询和定时演示，避免跨视图残留状态
  timers.forEach(clearTimeout); timers = []
  stopStagePolling()
  activeView.value = next
  captionKey.value++
  await hydrate(next)
  await applyDefaultStage()
  startStagePolling()
}

async function switchView(next: ViewId) {
  try {
    await activateView(next, true)
  } catch (error) {
    console.warn('[topology] transport mode sync failed', error)
  }
}

// ---- Caption 拖拽（位置保存到 server state） ----
let saveCaptionTimer: any = null
function saveCaptionTopDebounced() {
  clearTimeout(saveCaptionTimer)
  const view = activeView.value
  saveCaptionTimer = setTimeout(() => {
    pushRemoteState({
      topology: { nodes: baseNodes.value, edges: baseEdges.value },
      sequence: sequence.value,
      legend:   legend.value,
      captionTop: captionTop.value,
      captionVisible: captionVisible.value
    }, view)
  }, 500)
}
function onCaptionDragStart(e: MouseEvent) {
  const startY = e.clientY
  const startTop = captionTop.value
  e.preventDefault()
  const onMove = (ev: MouseEvent) => {
    const dy = ev.clientY - startY
    captionTop.value = Math.max(8, Math.min(startTop + dy, 600))
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    saveCaptionTopDebounced()
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const missionNodeCount = computed(() => nodes.value.filter(n => n.type === 'mission').length)

const caption = ref({ kicker: '', title: '', phase: '' })
const captionKey = ref(0)

function setCaption(c: Partial<typeof caption.value>) {
  caption.value = { ...caption.value, ...c }
  captionKey.value++
}

/** 回到"默认态"：先从后端拉当前 stage，匹配到就展示；否则展示第一个 */
async function applyDefaultStage(): Promise<string> {
  if (sequence.value.length === 0) {
    restoreBaseCanvas()
    return currentStage.value
  }
  // 尝试从后端获取当前 stage，优先展示后端状态
  try {
    const url = backendUrl('/api/v1/system/topology/stage')
    const data = await traceCall('stage', url, () =>
      $fetch<{ status: string; current_stage: string }>(url)
    )
    if (data?.status === 'SUCCESS') {
      lastStage = data.current_stage
      currentStage.value = data.current_stage
      sharedSystemStage.value = data.current_stage
      const step = findStepByStage(data.current_stage)
      if (step) {
        applyStep(step)
        return data.current_stage
      }
    }
  } catch {}
  // fallback：展示第一个
  applyStep(sequence.value[0])
  return currentStage.value
}

function clearHighlight() {
  nodes.value = nodes.value.map(n => {
    if (n.type !== 'mission') return { ...n }
    const d = { ...(n.data || {}) } as any
    d.active = false
    d.flashActive = false
    // 每次进入 READY 都彻底擦掉 step 临时注入的气泡 / 清单
    delete d.message
    delete d.messageIcon
    delete d.messageState
    delete d.plan
    return { ...n, data: d }
  })
  edges.value = edges.value.map(e => ({
    ...e,
    data: { ...((e.data as any) || {}), state: 'idle' }
  }))
}

let timers: ReturnType<typeof setTimeout>[] = []

// 纯"动画态"字段：每个 stage 独立，base 上的取值不 leak 到 stage。
const EDGE_ANIM_ONLY = new Set(['state', 'direction', 'glow'])
const NODE_ANIM_ONLY = new Set([
  'active', 'flashActive', 'message', 'messageIcon', 'messageState', 'plan'
])
function stripKeys<T extends Record<string, any>>(obj: T, keys: Set<string>): T {
  const out: Record<string, any> = {}
  for (const k of Object.keys(obj)) {
    if (!keys.has(k)) out[k] = (obj as any)[k]
  }
  return out as T
}

function applyStep(step: SequenceStep) {
  setCaption({ kicker: step.kicker, title: step.title, phase: step.phase })
  const base = {
    nodes: baseNodes.value,
    edges: baseEdges.value
  }
  const nodeS = (step as any).nodeSettings || {}
  nodes.value = base.nodes.map(n => {
    const baseData = (n.data || {}) as any
    const baseVisual = stripKeys(baseData, NODE_ANIM_ONLY)
    const ov = (nodeS[n.id] || {}) as Record<string, any>
    const stageHidden = typeof ov.hidden === 'boolean' ? ov.hidden : n.hidden
    if (n.type !== 'mission') {
      const { hidden: _hidden, ...dataOverride } = ov
      return {
        ...n,
        hidden: stageHidden,
        data: { ...baseVisual, ...dataOverride }
      }
    }
    const isActive = step.nodes.includes(n.id)
    const next: any = {
      ...baseVisual,
      ...ov,
      active: ov.active ?? isActive,
      flashActive: ov.flashActive ?? isActive
    }
    if ('plan' in ov && ov.plan === null) delete next.plan
    return { ...n, hidden: stageHidden, data: next }
  })
  const settings = step.edgeSettings || {}
  edges.value = base.edges.map(e => {
    const baseData = (e.data as any) || {}
    const baseVisual = stripKeys(baseData, EDGE_ANIM_ONLY)
    const override = settings[e.id] as Record<string, any> | undefined
    const highlighted = step.edges.includes(e.id) || !!override
    if (!highlighted) {
      return { ...e, data: { ...baseVisual, state: 'idle', glow: false } }
    }
    return {
      ...e,
      data: {
        ...baseVisual,
        ...(override || {}),
        state:     override?.state     || 'selected',
        direction: override?.direction || 'forward',
        glow:      override?.glow      ?? false
      }
    }
  })
}

const { backendUrl, traceCall } = useBackendIp()

async function syncInitialTopologyView(stage: string) {
  try {
    const transportMode = await fetchTransportModeFromSandboxHealth({ backendUrl, traceCall })
    const desiredView = resolveTopologyViewFromBackendState(stage, transportMode)
    await activateView(desiredView, false)
  } catch {
    // sandbox health unavailable should not block the diagram
  }
}

// ---- 核心网 stage 轮询 ----
let stageTimer: ReturnType<typeof setInterval> | null = null
let lastStage = ''

function findStepByStage(stageName: string): SequenceStep | null {
  return sequence.value.find(s => s.title === stageName) ?? null
}

async function pollStage() {
  try {
    const url = backendUrl('/api/v1/system/topology/stage')
    const data = await traceCall('stage', url, () =>
      $fetch<{ status: string; current_stage: string; scene: string }>(url)
    )
    if (!data || data.status !== 'SUCCESS') return
    const stage = data.current_stage
    currentStage.value = stage
    sharedSystemStage.value = stage
    // 仅核心网视图驱动拓扑动画
    if (activeView.value !== 'core-network') return
    if (stage === lastStage) return
    lastStage = stage
    const step = findStepByStage(stage)
    if (step) {
      applyStep(step)
    } else {
      await applyDefaultStage()
    }
  } catch {
    // 轮询失败静默忽略
  }
}

function startStagePolling() {
  stopStagePolling()
  lastStage = ''
  pollStage()
  stageTimer = setInterval(pollStage, 2000)
}

function stopStagePolling() {
  if (stageTimer) { clearInterval(stageTimer); stageTimer = null }
}

onMounted(async () => {
  await hydrate(activeView.value)
  const stage = await applyDefaultStage()
  await syncInitialTopologyView(stage)
  startStagePolling()
})

// 当前视图是公有云但 stage 离开 MEDIA_ESTABLISHED 时，自动切回核心网
watch(currentStage, (stage) => {
  if (activeView.value === 'public-cloud' && stage !== 'MEDIA_ESTABLISHED') {
    switchView('core-network')
  }
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  stopStagePolling()
  if (componentScaleRefreshTimer) clearTimeout(componentScaleRefreshTimer)
})
</script>
