<template>
  <ClientOnly>
  <div class="editor-shell h-[calc(100vh-4rem-2rem)] flex flex-col gap-3">
    <!-- 顶部操作栏 -->
    <div class="panel flex items-center justify-between px-4 py-2.5">
      <div class="flex items-center gap-3">
        <button class="icon-button icon-button-sm" @click="back" title="返回首页">
          <el-icon :size="14"><Back /></el-icon>
        </button>
        <div class="flex flex-col leading-tight">
          <span style="font-size:calc(0.72rem * var(--ui-font-scale)); font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#0369a1;">
            Architecture Editor
          </span>
          <span style="font-size:calc(0.92rem * var(--ui-font-scale)); font-weight:700;">架构图编辑器 · {{ viewLabel }}</span>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <button
            v-for="v in viewSwitchTabs"
            :key="v.id"
            :class="['sidebar-tab', activeView === v.id && 'sidebar-tab-active']"
            @click="switchEditorView(v.id)"
            :title="`编辑 ${v.label}`"
          >
            {{ v.label }}
          </button>
        </div>
        <span class="status-badge status-badge-idle ml-2">
          <span class="status-badge-icon"></span>
          {{ nodes.length }} Nodes · {{ edges.length }} Edges
        </span>
        <span v-if="selectedIds.length > 1" class="status-badge status-badge-live">
          <span class="status-badge-icon"></span>
          已选 {{ selectedIds.length }} 项
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Snap Grid Toggle -->
        <button
          :class="['icon-button', snap && 'is-on']"
          style="width:auto; padding:0 12px; gap:6px;"
          @click="snap = !snap"
          :title="snap ? '关闭网格吸附' : '打开网格吸附'"
        >
          <el-icon :size="14"><Grid /></el-icon>
          <span style="font-size:calc(0.74rem * var(--ui-font-scale)); font-weight:600;">吸附 {{ snap ? 'ON' : 'OFF' }}</span>
        </button>
        <button
          :class="['icon-button', captionVisible && 'is-on']"
          style="width:auto; padding:0 12px; gap:6px;"
          @click="captionVisible = !captionVisible"
          :title="captionVisible ? '隐藏标题条' : '显示标题条'"
        >
          <el-icon :size="14"><Postcard /></el-icon>
          <span style="font-size:calc(0.74rem * var(--ui-font-scale)); font-weight:600;">标题 {{ captionVisible ? 'ON' : 'OFF' }}</span>
        </button>
        <button class="icon-button" style="width:auto; padding:0 14px; gap:6px;" @click="openIo('export')">
          <el-icon :size="14"><Download /></el-icon>
          <span style="font-size:calc(0.78rem * var(--ui-font-scale)); font-weight:600;">导出</span>
        </button>
        <button class="icon-button" style="width:auto; padding:0 14px; gap:6px;" @click="openIo('import')">
          <el-icon :size="14"><Upload /></el-icon>
          <span style="font-size:calc(0.78rem * var(--ui-font-scale)); font-weight:600;">导入</span>
        </button>
        <button class="icon-button" style="width:auto; padding:0 14px; gap:6px;" @click="clearCanvas">
          <el-icon :size="14"><Delete /></el-icon>
          <span style="font-size:calc(0.78rem * var(--ui-font-scale)); font-weight:600;">清空</span>
        </button>
        <button class="primary-button" @click="save">
          <el-icon :size="14"><Check /></el-icon>
          保存并应用
        </button>
      </div>
    </div>

    <!-- 对齐工具栏 (多选时出现) -->
    <div
      v-if="selectedIds.length >= 2"
      class="panel flex items-center gap-2 px-4 py-2"
    >
      <span class="text-[calc(0.62rem*var(--ui-font-scale))] font-bold tracking-wider uppercase text-ink-500">Align</span>
      <div class="flex items-center gap-1">
        <button class="icon-button icon-button-sm" @click="align('left')" title="左对齐">
          <el-icon :size="14"><AlignLeft /></el-icon>
        </button>
        <button class="icon-button icon-button-sm" @click="align('centerX')" title="水平居中">
          <el-icon :size="14"><AlignCenterH /></el-icon>
        </button>
        <button class="icon-button icon-button-sm" @click="align('right')" title="右对齐">
          <el-icon :size="14"><AlignRight /></el-icon>
        </button>
        <span class="mx-2 w-px h-5 bg-ink-200"></span>
        <button class="icon-button icon-button-sm" @click="align('top')" title="顶部对齐">
          <el-icon :size="14"><AlignTop /></el-icon>
        </button>
        <button class="icon-button icon-button-sm" @click="align('centerY')" title="垂直居中">
          <el-icon :size="14"><AlignCenterV /></el-icon>
        </button>
        <button class="icon-button icon-button-sm" @click="align('bottom')" title="底部对齐">
          <el-icon :size="14"><AlignBottom /></el-icon>
        </button>
      </div>
      <span class="text-[calc(0.62rem*var(--ui-font-scale))] font-bold tracking-wider uppercase text-ink-500 ml-3">Distribute</span>
      <div class="flex items-center gap-1">
        <button
          class="icon-button icon-button-sm"
          :disabled="selectedIds.length < 3"
          @click="distribute('h')"
          title="水平等距分布"
        >
          <el-icon :size="14"><DArrowRight /></el-icon>
        </button>
        <button
          class="icon-button icon-button-sm"
          :disabled="selectedIds.length < 3"
          @click="distribute('v')"
          title="垂直等距分布"
        >
          <el-icon :size="14"><Bottom /></el-icon>
        </button>
      </div>
      <span class="text-[calc(0.62rem*var(--ui-font-scale))] font-bold tracking-wider uppercase text-ink-500 ml-3">Snap</span>
      <button
        class="icon-button icon-button-sm"
        style="width:auto; padding:0 10px;"
        @click="snapSelectedToGrid"
        title="将选中对齐到网格"
      >
        <span style="font-size:calc(0.7rem * var(--ui-font-scale)); font-weight:600;">对齐到网格</span>
      </button>
    </div>

    <!-- 主体 -->
    <div class="flex-1 grid gap-3 min-h-0" style="grid-template-columns: 220px 1fr 380px;">
      <NodeToolbox
        :legend="legend"
        @add-mission="addMission"
        @add-region="addRegion"
        @add-bus="addBus"
        @add-bar="addBar"
        @add-image="addImage"
        @clear="clearCanvas"
        @update-legend="legend = $event"
      />

      <!-- 画布 -->
      <section class="panel flex flex-col overflow-hidden relative">
        <div class="panel-header">
          <div class="flex items-center gap-2">
            <span class="title-kicker">Canvas</span>
            <span>自由绘制 · 拖拽 · 双击改名</span>
          </div>
          <div class="flex items-center gap-3 text-[calc(0.7rem*var(--ui-font-scale))] text-ink-500">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-0.5" style="background:#7c3aed;"></span>控制
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-0.5" style="background:#f59e0b;"></span>数据
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-0.5" style="background:#0284c7;"></span>无线
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-0.5" style="background:#38bdf8;"></span>总线
            </span>
          </div>
        </div>

        <div class="flex-1 relative editor-canvas">
          <!-- 空画布提示 -->
          <div
            v-if="nodes.length === 0"
            class="absolute inset-0 grid place-items-center pointer-events-none z-10"
          >
            <div class="text-center pointer-events-auto">
              <div
                class="w-14 h-14 rounded-full grid place-items-center mx-auto mb-3"
                style="background: rgba(59, 130, 246, 0.10);"
              >
                <el-icon :size="28" color="#3b82f6"><Plus /></el-icon>
              </div>
              <div style="font-size: calc(0.82rem * var(--ui-font-scale)); font-weight: 700;">空白画布</div>
              <div class="mt-1 text-ink-500" style="font-size: calc(0.72rem * var(--ui-font-scale));">
                从左侧工具箱添加节点开始
              </div>
            </div>
          </div>

          <!-- 连线操作引导（≥2 节点、0 边时显示） -->
          <div
            v-if="nodes.length >= 2 && edges.length === 0"
            class="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style="
              background: rgba(255, 255, 255, 0.95);
              border: 1px solid rgba(59, 130, 246, 0.35);
              border-radius: 10px;
              padding: 8px 14px;
              box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
              font-size: calc(0.74rem * var(--ui-font-scale));
              font-weight: 600;
              color: #1e3a8a;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            <span class="w-2.5 h-2.5 rounded-full" style="background:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.22);"></span>
            鼠标悬停节点 → 从边缘的
            <span style="color:#3b82f6; font-weight:800;">蓝色圆点</span>
            按住拖到另一个节点的圆点
          </div>

          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            :node-types="nodeTypes"
            :edge-types="edgeTypes"
            :default-viewport="{ x: 0, y: 0, zoom: 1 }"
            :min-zoom="0.3"
            :max-zoom="2.4"
            :connection-mode="ConnectionMode.Loose"
            :snap-to-grid="snap"
            :snap-grid="[20, 20]"
            :nodes-draggable="true"
            :nodes-connectable="true"
            :elements-selectable="true"
            :elevate-nodes-on-select="false"
            :elevate-edges-on-select="false"
            :multi-selection-key-code="'Shift'"
            :selection-key-code="'Shift'"
            class="!bg-white"
            @connect="onConnect"
            @node-click="onNodeClick"
            @node-double-click="onNodeDoubleClick"
            @edge-click="onEdgeClick"
            @pane-click="onPaneClick"
          >
            <Background
              :gap="snap ? 20 : 40"
              :size="1"
              :pattern-color="snap ? '#e2e8f0' : '#f1f5f9'"
            />
            <MiniMap pannable zoomable mask-color="rgba(241,245,249,0.7)" />
            <Controls />
          </VueFlow>

          <!-- 当前 Stage 指示器 -->
          <div
            v-if="previewIdx !== null && sequence[previewIdx]"
            class="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style="
              background: rgba(255, 255, 255, 0.95);
              border: 1px solid rgba(59, 130, 246, 0.35);
              box-shadow: 0 4px 14px rgba(15, 23, 42, 0.10);
              font-size: calc(0.76rem * var(--ui-font-scale));
              font-weight: 600;
              color: #1e3a8a;
            "
          >
            <span class="w-2 h-2 rounded-full" style="background:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.22);"></span>
            <span style="font-size:calc(0.64rem * var(--ui-font-scale)); letter-spacing:0.12em; text-transform:uppercase; color:#2563eb;">
              {{ sequence[previewIdx].kicker || `STAGE ${previewIdx + 1}` }}
            </span>
            <span style="color:#334155;">{{ sequence[previewIdx].title }}</span>
            <span v-if="sequence[previewIdx].phase" style="color:#64748b; font-weight:400;">
              · {{ sequence[previewIdx].phase }}
            </span>
          </div>

          <div
            class="absolute top-3 right-3 text-[calc(0.66rem*var(--ui-font-scale))] font-mono px-2.5 py-1 rounded-full"
            style="background:rgba(255,255,255,0.92); border:1px solid var(--color-border); color:#475569;"
          >
            <span style="color:#3b82f6; font-weight:700;">●</span>
            从蓝点拖出连线 · Shift 多选 · 双击改名
          </div>

          <!-- 图例预览 -->
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

      <!-- 右侧竖排：Inspector + Sequence Builder -->
      <div class="grid gap-3 min-h-0" style="grid-template-rows: 1fr 1fr;">
        <Inspector
          :selection="singleSelection"
          :preview-idx="previewIdx"
          class="min-h-0"
          @patch-node="patchNode"
          @patch-node-style="patchNodeStyle"
          @patch-edge="patchEdge"
          @rename-node="renameNode"
          @rename-edge="renameEdge"
          @delete-node="deleteNode"
          @delete-edge="deleteEdge"
          @remove-from-stage="removeFromStage"
          @deselect="clearSelection"
        />
        <SequenceBuilder
          :steps="sequence"
          :node-ids="missionNodeIds"
          :regions="regionNodes"
          :edge-ids="edgeIds"
          :playing-idx="playingIdx"
          :preview-idx="previewIdx"
          :collapsed="seqCollapsed"
          class="min-h-0"
          @update:steps="setSequence($event)"
          @toggle-region-visibility="setRegionVisibility"
          @play="playSequence"
          @toggle="seqCollapsed = !seqCollapsed"
          @preview="previewStep"
          @sync-preview="syncPreview"
          @focus="focusElement"
        />
      </div>
    </div>
  </div>

  <!-- JSON 导入/导出 Modal -->
  <div v-if="ioMode" class="io-backdrop" @click.self="ioMode = null">
    <div class="io-modal panel">
      <div class="panel-header">
        <div class="flex items-center gap-2">
          <span class="title-kicker">{{ ioMode === 'export' ? 'Export' : 'Import' }}</span>
          <span>{{ ioMode === 'export' ? '导出流程图 JSON' : '导入流程图 JSON' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="ioMode === 'export'"
            class="icon-button icon-button-sm"
            @click="copyIoText"
            title="复制到剪贴板"
          >
            <el-icon :size="14"><CopyDocument /></el-icon>
          </button>
          <button class="close-button" @click="ioMode = null" title="关闭">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </div>
      </div>
      <div class="io-body">
        <textarea
          v-model="ioText"
          class="io-textarea"
          :readonly="ioMode === 'export'"
          :placeholder="ioMode === 'import' ? '粘贴 { nodes, edges, sequence?, legend? } 的 JSON …' : ''"
          spellcheck="false"
        ></textarea>
        <div v-if="ioError" class="io-error">{{ ioError }}</div>
      </div>
      <div class="io-footer">
        <button class="icon-button" style="width:auto; padding:0 14px;" @click="ioMode = null">取消</button>
        <button v-if="ioMode === 'import'" class="primary-button" @click="applyImport">
          <el-icon :size="14"><Check /></el-icon>
          应用
        </button>
      </div>
    </div>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onMounted, ref, watch } from 'vue'
import { VueFlow, ConnectionMode, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import {
  Back, Check, Delete, Plus, Grid, Postcard,
  Bottom, DArrowRight, Download, Upload, CopyDocument
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 对齐图标 (lucide)
import {
  AlignLeft, AlignRight,
  AlignHorizontalJustifyCenter as AlignCenterH,
  AlignVerticalJustifyCenter  as AlignCenterV,
  AlignStartVertical          as AlignTop,
  AlignEndVertical            as AlignBottom
} from 'lucide-vue-next'

import MissionNode from '~/components/flow/MissionNode.vue'
import MissionEdge from '~/components/flow/MissionEdge.vue'
import RegionNode from '~/components/flow/RegionNode.vue'
import BusNode from '~/components/flow/BusNode.vue'
import BarNode from '~/components/flow/BarNode.vue'
import ImageNode from '~/components/flow/ImageNode.vue'
import NodeToolbox from '~/components/editor/NodeToolbox.vue'
import Inspector, { type Selection } from '~/components/editor/Inspector.vue'
import SequenceBuilder from '~/components/editor/SequenceBuilder.vue'
import { kindMeta, type NodeKind } from '~/components/flow/kindMeta'
import {
  loadAll, saveAll, fetchRemoteState,
  DEFAULT_LEGEND, DEFAULT_VIEW, VIEW_IDS, normalizeSequenceSteps as normalizeStoredSequenceSteps,
  type SequenceStep, type LegendConfig, type ViewId
} from '~/components/flow/storage'

// ?view=public-cloud | core-network — 决定本次编辑哪张架构图
const route = useRoute()
const activeView = computed<ViewId>(() => {
  const v = String(route.query.view ?? '')
  return (VIEW_IDS as readonly string[]).includes(v) ? (v as ViewId) : DEFAULT_VIEW
})
const viewLabel = computed(() => (activeView.value === 'public-cloud' ? '公有云' : '核心网'))

const viewSwitchTabs: { id: ViewId; label: string }[] = [
  { id: 'public-cloud', label: '公有云' },
  { id: 'core-network', label: '核心网' }
]

const router = useRouter()
function switchEditorView(next: ViewId) {
  if (next === activeView.value) return
  router.replace({ query: { ...route.query, view: next } })
}

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
const snap = ref(true)
const playingIdx = ref(-1)
const previewIdx = ref<number | null>(null)
const seqCollapsed = ref(false)
const legend = ref<LegendConfig>({ ...DEFAULT_LEGEND })
const captionVisible = ref(true)

// 选择状态
const selectedIds = ref<string[]>([])
const singleSelection = ref<Selection | null>(null)

const missionNodeIds = computed(() => baseNodes.value.filter(n => n.type === 'mission').map(n => n.id))
const regionNodes = computed(() =>
  baseNodes.value
    .filter(n => n.type === 'region')
    .map(n => ({
      id: n.id,
      label: String((n.data as any)?.label || n.id),
      hidden: !!n.hidden
    }))
)
const edgeIds = computed(() => baseEdges.value.map(e => e.id))

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function restoreBaseCanvas() {
  nodes.value = cloneJson(baseNodes.value)
  edges.value = cloneJson(baseEdges.value)
}

function syncCanvasWithCurrentStep() {
  if (previewIdx.value !== null && sequence.value[previewIdx.value]) {
    applyStep(sequence.value[previewIdx.value], previewIdx.value)
    return
  }
  restoreBaseCanvas()
}

function loadStateIntoEditor(all: Awaited<ReturnType<typeof loadAll>>) {
  baseNodes.value = cloneJson(all.topology.nodes)
  baseEdges.value = cloneJson(all.topology.edges)
  restoreBaseCanvas()
  sequence.value = normalizeStoredSequenceSteps(all.sequence)
  legend.value = all.legend
  captionVisible.value = all.captionVisible
}

function setSequence(nextSteps: SequenceStep[]) {
  const normalized = normalizeStoredSequenceSteps(nextSteps)
  sequence.value = normalized

  const nextPreviewIdx = previewIdx.value === null
    ? 0
    : Math.min(Math.max(previewIdx.value, 0), normalized.length - 1)

  previewIdx.value = nextPreviewIdx
  applyStep(normalized[nextPreviewIdx], nextPreviewIdx)
  refreshSelectionFromCanvas()
}

function setRegionVisibility(stepIdx: number, id: string, visible: boolean) {
  const hidden = !visible
  const step = sequence.value[stepIdx]
  if (!step) return
  const baseHidden = !!baseNodes.value.find(n => n.id === id)?.hidden
  const currentOverride = step.nodeSettings?.[id] ? { ...step.nodeSettings[id] } : {}

  if (hidden === baseHidden) delete (currentOverride as Record<string, any>).hidden
  else (currentOverride as Record<string, any>).hidden = hidden

  const nextNodeSettings = { ...(step.nodeSettings || {}) }
  if (Object.keys(currentOverride).length > 0) nextNodeSettings[id] = currentOverride
  else delete nextNodeSettings[id]

  const nextSteps = sequence.value.slice()
  nextSteps[stepIdx] = {
    ...step,
    nodeSettings: Object.keys(nextNodeSettings).length ? nextNodeSettings : undefined
  }
  setSequence(nextSteps)
}

onMounted(async () => {
  const all = await loadAll(activeView.value)
  loadStateIntoEditor(all)
  // 自动预览第一个 stage，让画布立刻展示该 stage
  nextTick(() => previewStep(0))
})

// 手动切换 ?view= 时重新装载
watch(activeView, async (v) => {
  previewIdx.value = null
  restoreSnapshot()
  const all = await loadAll(v)
  loadStateIntoEditor(all)
  selectedIds.value = []
  singleSelection.value = null
  nextTick(() => previewStep(0))
})

watch(nodes, (nextNodes) => {
  const layoutById = new Map(nextNodes.map(node => [
    node.id,
    {
      position: cloneJson(node.position),
      style: cloneJson(node.style ?? {}),
      zIndex: node.zIndex
    }
  ]))

  baseNodes.value = baseNodes.value.map(node => {
    const layout = layoutById.get(node.id)
    if (!layout) return node
    return {
      ...node,
      position: layout.position,
      style: layout.style,
      zIndex: layout.zIndex
    }
  })
}, { deep: true, flush: 'sync' })

// ----- 选择 -----
function onNodeClick(e: { event: MouseEvent; node: Node }) {
  const { event, node } = e
  if (event?.shiftKey) {
    if (!selectedIds.value.includes(node.id)) selectedIds.value = [...selectedIds.value, node.id]
    singleSelection.value = null
  } else {
    selectedIds.value = [node.id]
    singleSelection.value = { type: 'node', node }
  }
}
function onNodeDoubleClick(e: { node: Node }) {
  selectedIds.value = [e.node.id]
  singleSelection.value = { type: 'node', node: e.node }
  // 延迟让 Inspector 渲染后聚焦 label 输入
  nextTick(() => {
    const input = document.querySelector<HTMLInputElement>('.field .settings-input')
    input?.focus(); input?.select()
  })
}
function onEdgeClick(e: { edge: Edge }) {
  selectedIds.value = []
  singleSelection.value = { type: 'edge', edge: e.edge }
}
function onPaneClick() { clearSelection() }
function clearSelection() {
  selectedIds.value = []
  singleSelection.value = null
}

// ----- 连线 -----
function onConnect(conn: Connection) {
  const id = `e-${conn.source}-${conn.target}-${Date.now().toString(36)}`
  const edge: Edge = {
    id, source: conn.source!, target: conn.target!,
    sourceHandle: conn.sourceHandle || undefined,
    targetHandle: conn.targetHandle || undefined,
    type: 'mission',
    data: { kind: 'baseline', state: 'idle', pathType: 'bezier' }
  }
  baseEdges.value = [...baseEdges.value, cloneJson(edge)]
  syncCanvasWithCurrentStep()
}

// ----- 添加节点 -----
function uniqueId(prefix: string) {
  let i = 1
  while (nodes.value.find(n => n.id === `${prefix}-${i}`)) i++
  return `${prefix}-${i}`
}
function snapTo(v: number) { return snap.value ? Math.round(v / 20) * 20 : v }

function addMission(kind: NodeKind) {
  const id = uniqueId(kind)
  const baseX = 160 + (nodes.value.filter(n => n.type === 'mission').length % 5) * 180
  const baseY = 120 + Math.floor(nodes.value.filter(n => n.type === 'mission').length / 5) * 120
  const node: Node = {
    id, type: 'mission',
    position: { x: snapTo(baseX), y: snapTo(baseY) },
    style: { width: '140px' },
    zIndex: 10,
    data: {
      label: kindMeta[kind].label || kind.toUpperCase(),
      role: '',
      kind,
      handles: [
        // 四边中点
        'in-top', 'out-top', 'in-bottom', 'out-bottom',
        'in-left', 'out-left', 'in-right', 'out-right',
        // 四边 1/4 与 3/4 (in/out 各一)
        'in-top-25',    'out-top-25',    'in-top-75',    'out-top-75',
        'in-bottom-25', 'out-bottom-25', 'in-bottom-75', 'out-bottom-75',
        'in-left-25',   'out-left-25',   'in-left-75',   'out-left-75',
        'in-right-25',  'out-right-25',  'in-right-75',  'out-right-75'
      ]
    }
  }
  baseNodes.value = [...baseNodes.value, cloneJson(node)]
  syncCanvasWithCurrentStep()
}
function addRegion(variant: 'default' | 'external' | 'mno' | 'access') {
  const id = uniqueId(`region-${variant}`)
  const node: Node = {
    id, type: 'region',
    position: { x: snapTo(60), y: snapTo(60) },
    style: { width: '420px', height: '240px' },
    zIndex: 0,
    data: { label: `REGION · ${variant.toUpperCase()}`, variant }
  }
  baseNodes.value = [...baseNodes.value, cloneJson(node)]
  syncCanvasWithCurrentStep()
}
function addBus() {
  const id = uniqueId('bus')
  const node: Node = {
    id, type: 'bus',
    position: { x: snapTo(200), y: snapTo(220) },
    style: { width: '440px', height: '24px' },
    zIndex: 2,
    data: { label: 'AGENT BUS' }
  }
  baseNodes.value = [...baseNodes.value, cloneJson(node)]
  syncCanvasWithCurrentStep()
}
function addBar() {
  const id = uniqueId('bar')
  const baseX = 160 + (nodes.value.filter(n => n.type === 'mission' || n.type === 'bar').length % 5) * 180
  const baseY = 120 + Math.floor(nodes.value.filter(n => n.type === 'mission' || n.type === 'bar').length / 5) * 120
  const node: Node = {
    id, type: 'bar',
    position: { x: snapTo(baseX), y: snapTo(baseY) },
    style: { width: '140px', height: '28px' },
    zIndex: 10,
    data: { color: '#64748b', height: 8 }
  }
  baseNodes.value = [...baseNodes.value, cloneJson(node)]
  syncCanvasWithCurrentStep()
}

function addImage() {
  const id = uniqueId('img')
  const count = nodes.value.filter(n => n.type === 'image').length
  const baseX = 160 + (count % 5) * 180
  const baseY = 120 + Math.floor(count / 5) * 120
  const node: Node = {
    id, type: 'image',
    position: { x: snapTo(baseX), y: snapTo(baseY) },
    style: { width: '100px' },
    zIndex: 10,
    data: {
      label: '机器狗',
      src: '/assets/unitree-robotdog.png',
      handles: [
        'in-top', 'out-top', 'in-bottom', 'out-bottom',
        'in-left', 'out-left', 'in-right', 'out-right'
      ]
    }
  }
  baseNodes.value = [...baseNodes.value, cloneJson(node)]
  syncCanvasWithCurrentStep()
}

// ----- Patch -----
function patchNodeStyle(id: string, style: Record<string, any>) {
  const merge = (old: any) => {
    const m = { ...(old || {}), ...style }
    Object.keys(style).forEach(k => { if (style[k] === undefined) delete m[k] })
    return m
  }
  baseNodes.value = baseNodes.value.map(n =>
    n.id === id ? { ...n, style: merge(n.style) } : n
  )
  nodes.value = nodes.value.map(n => {
    if (n.id !== id) return n
    const next = { ...n, style: merge(n.style) }
    if (singleSelection.value?.type === 'node' && singleSelection.value.node?.id === id) {
      singleSelection.value = { type: 'node', node: next }
    }
    return next
  })
}

function patchNode(id: string, key: string, value: any) {
  // 预览中修改任何非结构性字段 → 写入当前 step 的 nodeSettings
  if (previewIdx.value !== null && NODE_STAGE_KEYS.has(key)) {
    const stepIdx = previewIdx.value
    const step = sequence.value[stepIdx]
    if (step) {
      const curOv = step.nodeSettings?.[id] || {}
      const newOv: any = { ...curOv, [key]: value }
      const map = { ...(step.nodeSettings || {}), [id]: newOv }
      const newNodes = step.nodes.includes(id) ? step.nodes : [...step.nodes, id]
      const newSeq = sequence.value.slice()
      newSeq[stepIdx] = { ...step, nodes: newNodes, nodeSettings: map }
      sequence.value = newSeq
      applyStep(sequence.value[stepIdx], stepIdx)
      const updated = nodes.value.find(n => n.id === id)
      if (updated && singleSelection.value?.type === 'node' && singleSelection.value.node?.id === id) {
        singleSelection.value = { type: 'node', node: updated }
      }
      return
    }
  }

  if (key === 'hidden') {
    baseNodes.value = baseNodes.value.map(n =>
      n.id === id ? { ...n, hidden: !!value } : n
    )
    nodes.value = nodes.value.map(n => {
      if (n.id !== id) return n
      const next = { ...n, hidden: !!value }
      if (singleSelection.value?.type === 'node' && singleSelection.value.node?.id === id) {
        singleSelection.value = { type: 'node', node: next }
      }
      return next
    })
    return
  }

  baseNodes.value = baseNodes.value.map(n =>
    n.id === id ? { ...n, data: { ...(n.data || {}), [key]: value } } : n
  )
  nodes.value = nodes.value.map(n => {
    if (n.id !== id) return n
    const next = { ...n, data: { ...n.data, [key]: value } }
    if (singleSelection.value?.type === 'node' && singleSelection.value.node?.id === id) {
      singleSelection.value = { type: 'node', node: next }
    }
    return next
  })
}
// 预览某 stage 时，对 node/edge 的 data 做的任何改动全部进入 step override，
// 该 stage 之外的画面一概不受影响。结构性字段（id / source / target / type）
// 本就不从 patchEdge / patchNode 流过，无需再单独例外。
const EDGE_STAGE_KEYS = new Set([
  'state', 'direction', 'glow', 'lineColor', 'lineWidth', 'lineOpacity', 'pathType', 'note'
])
const NODE_STAGE_KEYS = new Set([
  'active', 'flashActive', 'message', 'messageIcon', 'messageState', 'plan', 'hidden'
])

// 纯"动画态"字段 —— 每个 stage 完全独立；base 上的取值不允许 leak 到 stage。
// applyStep 会从 baseData 中剥掉这些 key，再把 step override 叠加上去。
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

function patchEdge(id: string, key: string, value: any) {
  // 预览中修改任何字段 → 写入 step.edgeSettings，这个 stage 独立拥有
  if (previewIdx.value !== null && EDGE_STAGE_KEYS.has(key)) {
    const stepIdx = previewIdx.value
    const step = sequence.value[stepIdx]
    if (step) {
      const curOverride = step.edgeSettings?.[id] || {}
      const newOverride: any = { ...curOverride, [key]: value }
      const newMap = { ...(step.edgeSettings || {}), [id]: newOverride }
      const newEdges = step.edges.includes(id) ? step.edges : [...step.edges, id]
      const newSeq = sequence.value.slice()
      newSeq[stepIdx] = { ...step, edges: newEdges, edgeSettings: newMap }
      sequence.value = newSeq
      applyStep(sequence.value[stepIdx], stepIdx)
      const updatedEdge = edges.value.find(e => e.id === id)
      if (updatedEdge && singleSelection.value?.type === 'edge' && singleSelection.value.edge?.id === id) {
        singleSelection.value = { type: 'edge', edge: updatedEdge }
      }
      return
    }
  }

  // 否则：更新 base
  baseEdges.value = baseEdges.value.map(e =>
    e.id === id ? { ...e, data: { ...((e.data as any) || {}), [key]: value } } : e
  )
  edges.value = edges.value.map(e => {
    if (e.id !== id) return e
    const next = { ...e, data: { ...(e.data as any || {}), [key]: value } }
    if (singleSelection.value?.type === 'edge' && singleSelection.value.edge?.id === id) {
      singleSelection.value = { type: 'edge', edge: next }
    }
    return next
  })
}
function deleteNode(id: string) {
  const removedEdgeIds = new Set(
    baseEdges.value
      .filter(e => e.source === id || e.target === id)
      .map(e => e.id)
  )
  baseNodes.value = baseNodes.value.filter(n => n.id !== id)
  baseEdges.value = baseEdges.value.filter(e => e.source !== id && e.target !== id)
  sequence.value = sequence.value.map(step => {
    const nextNodeSettings = step.nodeSettings ? { ...step.nodeSettings } : undefined
    const nextEdgeSettings = step.edgeSettings ? { ...step.edgeSettings } : undefined
    if (nextNodeSettings) delete nextNodeSettings[id]
    if (nextEdgeSettings) {
      for (const edgeId of removedEdgeIds) delete nextEdgeSettings[edgeId]
    }
    return {
      ...step,
      nodes: step.nodes.filter(nodeId => nodeId !== id),
      edges: step.edges.filter(edgeId => !removedEdgeIds.has(edgeId)),
      nodeSettings: nextNodeSettings && Object.keys(nextNodeSettings).length ? nextNodeSettings : undefined,
      edgeSettings: nextEdgeSettings && Object.keys(nextEdgeSettings).length ? nextEdgeSettings : undefined
    }
  })
  syncCanvasWithCurrentStep()
  clearSelection()
}
function deleteEdge(id: string) {
  baseEdges.value = baseEdges.value.filter(e => e.id !== id)
  sequence.value = sequence.value.map(step => {
    const nextEdgeSettings = step.edgeSettings ? { ...step.edgeSettings } : undefined
    if (nextEdgeSettings) delete nextEdgeSettings[id]
    return {
      ...step,
      edges: step.edges.filter(edgeId => edgeId !== id),
      edgeSettings: nextEdgeSettings && Object.keys(nextEdgeSettings).length ? nextEdgeSettings : undefined
    }
  })
  syncCanvasWithCurrentStep()
  clearSelection()
}

// ----- Rename (cascade to edges + sequence + selection) -----
function renameNode(oldId: string, newId: string) {
  if (nodes.value.find(n => n.id === newId)) {
    ElMessage?.warning?.(`节点 ID "${newId}" 已存在`)
    // 触发 Inspector 重渲染（回退输入框）
    if (singleSelection.value?.type === 'node') {
      const cur = nodes.value.find(n => n.id === oldId)
      if (cur) singleSelection.value = { type: 'node', node: { ...cur } }
    }
    return
  }
  baseNodes.value = baseNodes.value.map(n => n.id === oldId ? { ...n, id: newId } : n)
  baseEdges.value = baseEdges.value.map(e => ({
    ...e,
    source: e.source === oldId ? newId : e.source,
    target: e.target === oldId ? newId : e.target
  }))
  nodes.value = nodes.value.map(n => n.id === oldId ? { ...n, id: newId } : n)
  edges.value = edges.value.map(e => ({
    ...e,
    source: e.source === oldId ? newId : e.source,
    target: e.target === oldId ? newId : e.target
  }))
  sequence.value = sequence.value.map(s => {
    const nextNodeSettings = s.nodeSettings ? { ...s.nodeSettings } : undefined
    if (nextNodeSettings?.[oldId]) {
      nextNodeSettings[newId] = nextNodeSettings[oldId]
      delete nextNodeSettings[oldId]
    }
    return {
      ...s,
      nodes: s.nodes.map(i => i === oldId ? newId : i),
      nodeSettings: nextNodeSettings
    }
  })
  selectedIds.value = selectedIds.value.map(i => i === oldId ? newId : i)
  if (singleSelection.value?.type === 'node' && singleSelection.value.node?.id === oldId) {
    const updated = nodes.value.find(n => n.id === newId)
    if (updated) singleSelection.value = { type: 'node', node: updated }
  }
  ElMessage?.success?.(`已重命名: ${oldId} → ${newId}`)
}

function renameEdge(oldId: string, newId: string) {
  if (edges.value.find(e => e.id === newId)) {
    ElMessage?.warning?.(`连线 ID "${newId}" 已存在`)
    if (singleSelection.value?.type === 'edge') {
      const cur = edges.value.find(e => e.id === oldId)
      if (cur) singleSelection.value = { type: 'edge', edge: { ...cur } }
    }
    return
  }
  baseEdges.value = baseEdges.value.map(e => e.id === oldId ? { ...e, id: newId } : e)
  edges.value = edges.value.map(e => e.id === oldId ? { ...e, id: newId } : e)
  sequence.value = sequence.value.map(s => {
    const nextEdgeSettings = s.edgeSettings ? { ...s.edgeSettings } : undefined
    if (nextEdgeSettings?.[oldId]) {
      nextEdgeSettings[newId] = nextEdgeSettings[oldId]
      delete nextEdgeSettings[oldId]
    }
    return {
      ...s,
      edges: s.edges.map(i => i === oldId ? newId : i),
      edgeSettings: nextEdgeSettings
    }
  })
  if (singleSelection.value?.type === 'edge' && singleSelection.value.edge?.id === oldId) {
    const updated = edges.value.find(e => e.id === newId)
    if (updated) singleSelection.value = { type: 'edge', edge: updated }
  }
  ElMessage?.success?.(`已重命名: ${oldId} → ${newId}`)
}

// ----- 对齐 -----
function getSize(n: Node) {
  const w = parseFloat(String((n.style as any)?.width ?? 140))
  const h = parseFloat(String((n.style as any)?.height ?? 60))
  return { w: isNaN(w) ? 140 : w, h: isNaN(h) ? 60 : h }
}

function align(mode: 'left' | 'right' | 'centerX' | 'top' | 'bottom' | 'centerY') {
  const selected = nodes.value.filter(n => selectedIds.value.includes(n.id))
  if (selected.length < 2) return

  if (mode === 'left') {
    const x = Math.min(...selected.map(n => n.position.x))
    mutate(selected, n => ({ ...n.position, x }))
  } else if (mode === 'right') {
    const target = Math.max(...selected.map(n => n.position.x + getSize(n).w))
    mutate(selected, n => ({ ...n.position, x: target - getSize(n).w }))
  } else if (mode === 'centerX') {
    const centers = selected.map(n => n.position.x + getSize(n).w / 2)
    const cx = centers.reduce((a, b) => a + b, 0) / centers.length
    mutate(selected, n => ({ ...n.position, x: cx - getSize(n).w / 2 }))
  } else if (mode === 'top') {
    const y = Math.min(...selected.map(n => n.position.y))
    mutate(selected, n => ({ ...n.position, y }))
  } else if (mode === 'bottom') {
    const target = Math.max(...selected.map(n => n.position.y + getSize(n).h))
    mutate(selected, n => ({ ...n.position, y: target - getSize(n).h }))
  } else if (mode === 'centerY') {
    const centers = selected.map(n => n.position.y + getSize(n).h / 2)
    const cy = centers.reduce((a, b) => a + b, 0) / centers.length
    mutate(selected, n => ({ ...n.position, y: cy - getSize(n).h / 2 }))
  }
}

function distribute(axis: 'h' | 'v') {
  const selected = nodes.value.filter(n => selectedIds.value.includes(n.id))
  if (selected.length < 3) return
  const sorted = [...selected].sort((a, b) =>
    axis === 'h' ? a.position.x - b.position.x : a.position.y - b.position.y
  )
  const first = sorted[0], last = sorted[sorted.length - 1]
  const total = axis === 'h'
    ? last.position.x - first.position.x
    : last.position.y - first.position.y
  const gap = total / (sorted.length - 1)
  sorted.forEach((n, i) => {
    if (i === 0 || i === sorted.length - 1) return
    const newPos = axis === 'h'
      ? { ...n.position, x: first.position.x + gap * i }
      : { ...n.position, y: first.position.y + gap * i }
    updatePos(n.id, newPos)
  })
}

function snapSelectedToGrid() {
  const selected = nodes.value.filter(n => selectedIds.value.includes(n.id))
  mutate(selected, n => ({
    x: Math.round(n.position.x / 20) * 20,
    y: Math.round(n.position.y / 20) * 20
  }))
}

function mutate(targets: Node[], mapPos: (n: Node) => { x: number; y: number }) {
  const ids = new Set(targets.map(n => n.id))
  baseNodes.value = baseNodes.value.map(n => ids.has(n.id) ? { ...n, position: mapPos(n) } : n)
  nodes.value = nodes.value.map(n => ids.has(n.id) ? { ...n, position: mapPos(n) } : n)
}
function updatePos(id: string, pos: { x: number; y: number }) {
  baseNodes.value = baseNodes.value.map(n => n.id === id ? { ...n, position: pos } : n)
  nodes.value = nodes.value.map(n => n.id === id ? { ...n, position: pos } : n)
}

// ----- 动作 -----
async function clearCanvas() {
  if (nodes.value.length === 0 && edges.value.length === 0) return
  if (!confirm('确认清空所有节点和连线？（立即生效并持久化）')) return
  baseNodes.value = []
  baseEdges.value = []
  setSequence([])
  clearSelection()
  const view = activeView.value
  const prev = await fetchRemoteState(view)
  await saveAll({
    topology: { nodes: [], edges: [] },
    sequence: sequence.value,
    legend:   legend.value,
    captionTop: typeof prev?.captionTop === 'number' ? prev.captionTop : 40,
    captionVisible: captionVisible.value
  }, view)
  ElMessage?.success?.(`已清空 · ${viewLabel.value}`)
}

async function save() {
  // 如果正在预览某个 stage，edges.value / nodes.value 已经被 step override 染色了，
  // 不能直接当 base 存下去——否则"stage 的改动会渗进 base、污染其他 stage"。
  // 共享布局始终以 base topology 为准。
  const sourceNodes = baseNodes.value
  const sourceEdges = baseEdges.value
  sequence.value = normalizeStoredSequenceSteps(sequence.value)

  const cleanNodes = sourceNodes.map(n => {
    if (n.type !== 'mission') return { ...n, data: { ...((n.data || {}) as any) } }
    const data = stripKeys((n.data || {}) as Record<string, any>, NODE_ANIM_ONLY)
    return { ...n, data }
  })
  const cleanEdges = sourceEdges.map(e => ({
    ...e,
    data: stripKeys(((e.data as any) || {}) as Record<string, any>, EDGE_ANIM_ONLY)
  }))
  // 保留用户在主页拖拽后的 captionTop
  const view = activeView.value
  const prev = await fetchRemoteState(view)
  await saveAll({
    topology: { nodes: cleanNodes, edges: cleanEdges },
    sequence: sequence.value,
    legend:   legend.value,
    captionTop: typeof prev?.captionTop === 'number' ? prev.captionTop : 40,
    captionVisible: captionVisible.value
  }, view)
  ElMessage?.success?.(`已保存并应用到首页 · ${viewLabel.value}`)
  back()
}
function back() { navigateTo('/') }

/* ============ JSON 导入 / 导出 ============ */
const ioMode  = ref<'import' | 'export' | null>(null)
const ioText  = ref('')
const ioError = ref('')

function openIo(mode: 'import' | 'export') {
  ioError.value = ''
  if (mode === 'export') {
    const payload = {
      nodes: baseNodes.value,
      edges: baseEdges.value,
      sequence: normalizeStoredSequenceSteps(sequence.value),
      legend: legend.value
    }
    ioText.value = JSON.stringify(payload, null, 2)
  } else {
    ioText.value = ''
  }
  ioMode.value = mode
}

async function copyIoText() {
  try {
    await navigator.clipboard.writeText(ioText.value)
    ElMessage?.success?.('已复制到剪贴板')
  } catch {
    ElMessage?.warning?.('复制失败，请手动选择复制')
  }
}

function applyImport() {
  ioError.value = ''
  if (!ioText.value.trim()) { ioError.value = 'JSON 不能为空'; return }
  let parsed: any
  try { parsed = JSON.parse(ioText.value) }
  catch (e: any) { ioError.value = 'JSON 解析失败: ' + (e?.message || e); return }
  if (!parsed || typeof parsed !== 'object') {
    ioError.value = '根对象必须是 { nodes, edges, ... }'; return
  }
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    ioError.value = 'nodes 和 edges 必须是数组'; return
  }
  // 应用
  baseNodes.value = cloneJson(parsed.nodes)
  baseEdges.value = cloneJson(parsed.edges)
  setSequence(Array.isArray(parsed.sequence) ? parsed.sequence : [])
  if (parsed.legend && typeof parsed.legend === 'object') legend.value = parsed.legend
  clearSelection()
  ioMode.value = null
  ElMessage?.success?.(`已导入：${parsed.nodes.length} 节点 / ${parsed.edges.length} 连线`)
}

// ----- 序列预览 -----
let timers: ReturnType<typeof setTimeout>[] = []
function playSequence() {
  previewIdx.value = null
  restoreSnapshot()
  clearHighlight()
  timers.forEach(clearTimeout); timers = []
  takeSnapshot()
  sequence.value.forEach((step, idx) => {
    timers.push(setTimeout(() => applyStep(step, idx), (idx + 1) * 1200))
  })
  timers.push(setTimeout(() => {
    playingIdx.value = -1
    restoreSnapshot()
    // 播放结束后回到默认 stage
    if (sequence.value.length > 0) {
      previewIdx.value = 0
      nextTick(() => applyStep(sequence.value[0], 0))
    }
  }, (sequence.value.length + 2) * 1200))
}
// 在进入预览/播放前抓取基线快照；退出时还原
function takeSnapshot() {
  // shared base topology is tracked continuously via baseNodes/baseEdges
}
function restoreSnapshot() {
  restoreBaseCanvas()
}
/** 编辑器修改节点/边后，snapshot 失效，下次 applyStep 时重新采集，
 *  保证基线是最新的 Inspector 编辑结果 */
function invalidateSnapshot() {
  syncCanvasWithCurrentStep()
}

function applyStep(step: SequenceStep, idx: number) {
  playingIdx.value = idx
  const base = {
    nodes: baseNodes.value,
    edges: baseEdges.value
  }
  const nodeS = step.nodeSettings || {}
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
    const active = step.nodes.includes(n.id)
    // 顺序：base 视觉 → stage override（含动画态）→ stage 的 active/flashActive 兜底
    const next: any = {
      ...baseVisual,
      ...ov,
      active: ov.active ?? active,
      flashActive: ov.flashActive ?? active
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
        // 动画态字段：只认 step override；base 的取值不 leak
        state:     override?.state     || 'selected',
        direction: override?.direction || 'forward',
        glow:      override?.glow      ?? false
      }
    }
  })
}
function clearHighlight() {
  nodes.value = nodes.value.map(n => n.type === 'mission'
    ? { ...n, data: { ...n.data, active: false, flashActive: false } } : n)
  edges.value = edges.value.map(e => ({ ...e, data: { ...(e.data as any), state: 'idle' } }))
}

/** 用户在 SequenceBuilder 里改动任何 chip / override 时立即重放该 step，让画布同步 */
function syncPreview(idx: number) {
  timers.forEach(clearTimeout); timers = []
  playingIdx.value = -1
  if (idx < 0 || idx >= sequence.value.length) return
  previewIdx.value = idx
  nextTick(() => {
    applyStep(sequence.value[idx], idx)
    refreshSelectionFromCanvas()
  })
}

function removeFromStage(type: 'node' | 'edge', id: string) {
  if (previewIdx.value === null) return
  const stepIdx = previewIdx.value
  const step = sequence.value[stepIdx]
  if (!step) return
  const newStep: any = { ...step }
  if (type === 'node') {
    newStep.nodes = step.nodes.filter(i => i !== id)
    if (step.nodeSettings && step.nodeSettings[id]) {
      const m = { ...step.nodeSettings }; delete m[id]
      newStep.nodeSettings = Object.keys(m).length ? m : undefined
    }
  } else {
    newStep.edges = step.edges.filter(i => i !== id)
    if (step.edgeSettings && step.edgeSettings[id]) {
      const m = { ...step.edgeSettings }; delete m[id]
      newStep.edgeSettings = Object.keys(m).length ? m : undefined
    }
  }
  const newSeq = sequence.value.slice()
  newSeq[stepIdx] = newStep
  sequence.value = newSeq
  applyStep(sequence.value[stepIdx], stepIdx)
  ElMessage?.success?.(`已从 Stage ${stepIdx + 1} 移除该${type === 'node' ? '节点' : '连线'}`)
}

function focusElement(type: 'node' | 'edge', id: string) {
  if (type === 'node') {
    const node = nodes.value.find(n => n.id === id)
    if (node) {
      selectedIds.value = [node.id]
      singleSelection.value = { type: 'node', node }
    }
  } else {
    const edge = edges.value.find(e => e.id === id)
    if (edge) {
      selectedIds.value = []
      singleSelection.value = { type: 'edge', edge }
    }
  }
}

// 单步预览 — idx 为 null 时回退到默认 stage(第 0 个)
function previewStep(idx: number | null) {
  timers.forEach(clearTimeout); timers = []
  playingIdx.value = -1
  if (idx === null || idx < 0 || idx >= sequence.value.length) {
    // 退出预览时，先还原快照，再自动回到默认 stage
    restoreSnapshot()
    clearHighlight()
    if (sequence.value.length > 0) {
      previewIdx.value = 0
      nextTick(() => {
        applyStep(sequence.value[0], 0)
        refreshSelectionFromCanvas()
      })
    } else {
      previewIdx.value = null
      refreshSelectionFromCanvas()
    }
    return
  }
  previewIdx.value = idx
  applyStep(sequence.value[idx], idx)
  refreshSelectionFromCanvas()
}

/** 画布重绘后（切预览 / 应用 step / 退出预览）让 Inspector 里选中的对象拿到最新 data */
function refreshSelectionFromCanvas() {
  const sel = singleSelection.value
  if (!sel) return
  if (sel.type === 'edge') {
    const id = sel.edge?.id
    if (!id) return
    const fresh = edges.value.find(e => e.id === id)
    if (fresh) singleSelection.value = { type: 'edge', edge: fresh }
  } else if (sel.type === 'node') {
    const id = sel.node?.id
    if (!id) return
    const fresh = nodes.value.find(n => n.id === id)
    if (fresh) singleSelection.value = { type: 'node', node: fresh }
  }
}
</script>

<style scoped>
.editor-shell { overflow: hidden; }
.icon-button.is-on {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.10), rgba(255, 255, 255, 0.96));
  border-color: color-mix(in srgb, var(--color-blue) 40%, var(--color-border));
  color: #2563eb;
}
.io-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 100;
}
.io-modal {
  width: min(760px, calc(100% - 48px));
  max-height: min(80vh, 860px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.22);
}
.io-body {
  flex: 1;
  padding: 14px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.io-textarea {
  flex: 1;
  min-height: 320px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: #0f172a;
  color: #e2e8f0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: calc(0.76rem * var(--ui-font-scale));
  line-height: 1.5;
  resize: vertical;
  outline: none;
}
.io-textarea:focus {
  border-color: color-mix(in srgb, var(--color-blue) 42%, var(--color-border));
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}
.io-error {
  font-size: calc(0.78rem * var(--ui-font-scale));
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: var(--radius-btn);
  padding: 8px 10px;
}
.io-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background: rgba(248, 250, 252, 0.6);
}
</style>
