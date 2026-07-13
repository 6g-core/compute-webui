<template>
  <aside class="panel h-full overflow-y-auto scrollbar-thin">
    <div class="panel-header sticky top-0 z-10 bg-white/95 backdrop-blur">
      <div class="flex items-center gap-2">
        <span class="title-kicker">Inspector</span>
        <span>{{ tabLabel }}</span>
      </div>
      <button v-if="selection" class="close-button" @click="$emit('deselect')" title="取消选择">
        <el-icon :size="14"><Close /></el-icon>
      </button>
    </div>

    <!-- 空态 -->
    <div v-if="!selection" class="p-6 text-center text-ink-500">
      <el-icon :size="24" class="mb-2"><Pointer /></el-icon>
      <div style="font-size: calc(0.82rem * var(--ui-font-scale)); font-weight: 600;">未选择元素</div>
      <div style="font-size: calc(0.72rem * var(--ui-font-scale)); margin-top: 4px;">
        在画布上点击节点或边进行编辑
      </div>
    </div>

    <!-- 节点表单 -->
    <div v-else-if="selection.type === 'node'" class="p-3 space-y-4">
      <div v-if="inStagePreview" class="preview-banner">
        <span class="status-badge status-badge-live" style="font-size: calc(0.58rem * var(--ui-font-scale));">
          <span class="status-badge-icon"></span>
          PREVIEW Stage {{ previewIdx + 1 }}
        </span>
        <button
          class="icon-button icon-button-sm"
          style="width:auto; padding:0 10px; color:#b91c1c; border-color:rgba(239,68,68,0.3); font-size:calc(0.7rem * var(--ui-font-scale)); margin-left:auto;"
          @click="$emit('remove-from-stage', 'node', selection.node.id)"
          title="从当前 Stage 移除此节点的高亮与覆盖"
        >
          移除
        </button>
      </div>

      <Field label="ID (回车/失焦生效)">
        <input
          class="settings-input font-mono"
          :value="selection.node.id"
          @change="tryRenameNode(selection.node.id, ($event.target as HTMLInputElement).value)"
          @keydown.enter="(($event.target as HTMLInputElement)).blur()"
        />
      </Field>

      <Field label="名称 Label">
        <input
          class="settings-input"
          :value="selection.node.data.label"
          @input="patchData('label', ($event.target as HTMLInputElement).value)"
        />
      </Field>

      <Field label="角色 Role">
        <input
          class="settings-input"
          :value="selection.node.data.role || ''"
          @input="patchData('role', ($event.target as HTMLInputElement).value)"
        />
      </Field>

      <template v-if="selection.node.type === 'image'">
        <Field label="上传图片">
          <label class="upload-btn">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageUpload"
            />
            <span>{{ selection.node.data.src ? '更换图片' : '选择图片' }}</span>
          </label>
        </Field>
        <div v-if="selection.node.data.src" class="px-1">
          <img
            :src="selection.node.data.src"
            class="w-full rounded border border-ink-200"
            style="max-height: 120px; object-fit: contain; background: #f8fafc;"
          />
        </div>
      </template>

      <Field v-if="selection.node.type === 'mission'" label="Kind (类型)">
        <select
          class="settings-input"
          :value="selection.node.data.kind"
          @change="patchData('kind', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="k in kinds" :key="k" :value="k">{{ k }}</option>
        </select>
      </Field>

      <Field v-if="selection.node.type === 'mission'" label="外观 Appearance">
        <select
          class="settings-input"
          :value="selection.node.data.appearance || 'default'"
          @change="patchData('appearance', ($event.target as HTMLSelectElement).value)"
        >
          <option value="default">default</option>
          <option value="agent">agent</option>
          <option value="gateway">gateway</option>
          <option value="pill">pill</option>
        </select>
      </Field>

      <template v-if="selection.node.type === 'mission' && inStagePreview">
        <Field label="消息气泡 (预览中写入当前 Stage)">
          <input
            class="settings-input"
            :value="selection.node.data.message || ''"
            placeholder="留空关闭气泡"
            @input="patchData('message', ($event.target as HTMLInputElement).value)"
          />
        </Field>
        <div class="grid grid-cols-2 gap-2">
          <Field label="气泡图标">
            <select
              class="settings-input"
              :value="selection.node.data.messageIcon || ''"
              @change="patchData('messageIcon', ($event.target as HTMLSelectElement).value || undefined)"
            >
              <option value="">默认 (loader)</option>
              <option value="spinner">spinner</option>
              <option value="done">done ✓</option>
              <option value="sparkles">sparkles</option>
              <option value="radio">radio</option>
              <option value="brain">brain</option>
              <option value="scan">scan</option>
            </select>
          </Field>
          <Field label="气泡状态">
            <select
              class="settings-input"
              :value="selection.node.data.messageState || ''"
              @change="patchData('messageState', ($event.target as HTMLSelectElement).value || undefined)"
            >
              <option value="">默认</option>
              <option value="processing">processing</option>
              <option value="done">done</option>
            </select>
          </Field>
        </div>
      </template>

      <div v-if="selection.node.type === 'mission' && inStagePreview" class="grid grid-cols-2 gap-2">
        <ToggleField
          label="静态激活"
          :value="!!selection.node.data.active"
          @update="patchData('active', $event)"
        />
        <ToggleField
          label="闪烁脉冲"
          :value="!!selection.node.data.flashActive"
          @update="patchData('flashActive', $event)"
        />
      </div>

      <!-- Plan Checklist 编辑 -->
      <div v-if="selection.node.type === 'mission' && inStagePreview" class="region-section">
        <div class="section-title">Plan 清单 (可选)</div>
        <template v-if="selection.node.data.plan">
          <Field label="标题">
            <input
              class="settings-input"
              :value="selection.node.data.plan.title || ''"
              @input="onPlanTitle"
            />
          </Field>
          <div
            v-for="(item, idx) in selection.node.data.plan.items"
            :key="item.id || idx"
            class="plan-item-row"
          >
            <input
              class="settings-input"
              style="height:30px; font-size:calc(0.7rem * var(--ui-font-scale));"
              :value="item.label"
              placeholder="任务描述"
              @input="onPlanItemField(idx, 'label', $event)"
            />
            <select
              class="settings-input"
              style="height:30px; font-size:calc(0.7rem * var(--ui-font-scale)); width:100px;"
              :value="item.phase"
              @change="onPlanItemField(idx, 'phase', $event)"
            >
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="done">done</option>
            </select>
            <button class="icon-button icon-button-sm" style="color:#b91c1c;" @click="removePlanItem(idx)" title="删除">
              <el-icon :size="12"><Delete /></el-icon>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="icon-button"
              style="width:auto; padding:0 12px; height:30px; font-size:calc(0.72rem * var(--ui-font-scale)); gap:4px;"
              @click="addPlanItem"
            >
              <el-icon :size="12"><Plus /></el-icon>
              添加任务
            </button>
            <button
              class="icon-button"
              style="width:auto; padding:0 12px; height:30px; font-size:calc(0.72rem * var(--ui-font-scale)); color:#b91c1c;"
              @click="removePlan"
            >
              清除 Plan
            </button>
          </div>
        </template>
        <button
          v-else
          class="icon-button"
          style="width:100%; padding:0 12px; height:32px; font-size:calc(0.76rem * var(--ui-font-scale)); gap:6px;"
          @click="initPlan"
        >
          <el-icon :size="14"><Plus /></el-icon>
          添加 Plan
        </button>
      </div>

      <template v-if="selection.node.type === 'bar'">
        <Field label="粗横条颜色">
          <input
            type="color"
            class="settings-input"
            style="padding: 4px; height: 40px;"
            :value="selection.node.data.color || '#64748b'"
            @input="patchData('color', ($event.target as HTMLInputElement).value)"
          />
        </Field>
        <Field label="粗横条厚度 (2 ~ 26px)">
          <input
            type="number"
            step="1"
            min="2"
            max="26"
            class="settings-input"
            :value="selection.node.data.height ?? 8"
            @input="onBarHeightInput"
          />
        </Field>
      </template>

      <div v-if="selection.node.type === 'region'" class="region-section">
        <div class="section-title">Region 设置</div>
        <Field label="区域底色">
          <select
            class="settings-input"
            :value="selection.node.data.variant || 'default'"
            @change="onRegionVariantChange"
          >
            <option value="default">蓝 (Core)</option>
            <option value="external">橙 (OTT / External)</option>
            <option value="mno">青绿 (MNO)</option>
            <option value="access">灰 (Access)</option>
          </select>
        </Field>
        <Field label="区域图案">
          <select
            class="settings-input"
            :value="regionPattern"
            @change="onRegionPatternChange"
          >
            <option value="none">无</option>
            <option value="grid">网格</option>
            <option value="dots">点阵</option>
          </select>
        </Field>
        <ToggleField
          :label="inStagePreview ? '当前 Stage 显示' : 'Base Stage 显示'"
          :value="!selection.node.hidden"
          @update="patchData('hidden', !$event)"
        />
      </div>

      <!-- 通用尺寸微调：任意节点类型都可手动调整 -->
      <div class="region-section">
        <div class="section-title">节点尺寸（手动微调）</div>
        <div class="grid grid-cols-2 gap-2">
          <Field label="宽 px">
            <input
              type="number"
              min="40"
              step="1"
              class="settings-input"
              :value="nodeWidth"
              placeholder="auto"
              @change="onNodeWidthChange"
            />
          </Field>
          <Field label="高 px">
            <input
              type="number"
              min="20"
              step="1"
              class="settings-input"
              :value="nodeHeight"
              placeholder="auto"
              @change="onNodeHeightChange"
            />
          </Field>
        </div>
      </div>

      <div class="pt-2 flex justify-end">
        <button
          class="icon-button"
          style="width: auto; padding: 0 14px; gap: 6px; color: #b91c1c; border-color: rgba(239,68,68,0.3);"
          @click="$emit('delete-node', selection.node.id)"
        >
          <el-icon :size="14"><Delete /></el-icon>
          <span style="font-size: calc(0.78rem * var(--ui-font-scale)); font-weight: 600;">删除节点</span>
        </button>
      </div>
    </div>

    <!-- 边表单 -->
    <div v-else-if="selection.type === 'edge'" class="p-3 space-y-4">
      <!-- 预览模式提示 -->
      <div v-if="inStagePreview" class="preview-banner">
        <span class="status-badge status-badge-live" style="font-size: calc(0.58rem * var(--ui-font-scale));">
          <span class="status-badge-icon"></span>
          PREVIEW Stage {{ previewIdx + 1 }}
        </span>
        <span style="font-size: calc(0.66rem * var(--ui-font-scale)); color: #334155; flex: 1 1 auto;">
          修改 <b>流向 · 流光</b> 会写入当前 Stage
        </span>
        <button
          class="icon-button icon-button-sm"
          style="width:auto; padding:0 10px; color:#b91c1c; border-color:rgba(239,68,68,0.3); font-size:calc(0.7rem * var(--ui-font-scale));"
          @click="$emit('remove-from-stage', 'edge', selection.edge.id)"
          title="从当前 Stage 移除此连线"
        >
          移除
        </button>
      </div>

      <Field label="ID (回车/失焦生效)">
        <input
          class="settings-input font-mono"
          :value="selection.edge.id"
          @change="tryRenameEdge(selection.edge.id, ($event.target as HTMLInputElement).value)"
          @keydown.enter="(($event.target as HTMLInputElement)).blur()"
        />
      </Field>

      <div class="grid grid-cols-2 gap-2">
        <Field label="源">
          <input class="settings-input" :value="selection.edge.source" readonly />
        </Field>
        <Field label="目标">
          <input class="settings-input" :value="selection.edge.target" readonly />
        </Field>
      </div>

      <Field label="路径形态">
        <select
          class="settings-input"
          :value="selection.edge.data?.pathType || 'bezier'"
          @change="patchEdge('pathType', ($event.target as HTMLSelectElement).value)"
        >
          <option value="bezier">bezier · 平滑曲线</option>
          <option value="straight">straight · 直线</option>
          <option value="smoothstep">smoothstep · 圆角折线</option>
          <option value="step">step · 直角折线</option>
        </select>
      </Field>

      <Field label="Kind (平面语义)">
        <select
          class="settings-input"
          :value="selection.edge.data?.kind || 'baseline'"
          @change="patchEdge('kind', ($event.target as HTMLSelectElement).value)"
        >
          <option value="baseline">baseline · 基线绿</option>
          <option value="logic">logic · 控制面紫</option>
          <option value="wireless">wireless · 无线蓝</option>
          <option value="bus">bus · 总线青</option>
        </select>
      </Field>

      <Field label="Plane">
        <select
          class="settings-input"
          :value="selection.edge.data?.plane || ''"
          @change="patchEdge('plane', ($event.target as HTMLSelectElement).value || undefined)"
        >
          <option value="">自动</option>
          <option value="control">control · 控制面</option>
          <option value="data">data · 数据面</option>
        </select>
      </Field>

      <Field v-if="inStagePreview" label="状态 (动画)">
        <select
          class="settings-input"
          :value="selection.edge.data?.state || 'idle'"
          @change="patchEdge('state', ($event.target as HTMLSelectElement).value)"
        >
          <option value="idle">idle · 空闲</option>
          <option value="active">active · 激活流动</option>
          <option value="selected">selected · 强高亮</option>
        </select>
      </Field>

      <Field v-if="inStagePreview" label="流向">
        <select
          class="settings-input"
          :value="selection.edge.data?.direction || 'forward'"
          @change="patchEdge('direction', ($event.target as HTMLSelectElement).value)"
        >
          <option value="forward">forward · 正向（源 → 目标）</option>
          <option value="reverse">reverse · 反向（目标 → 源）</option>
          <option value="bidirectional">bidirectional · 双向（中点 → 两端）</option>
        </select>
      </Field>

      <ToggleField
        v-if="inStagePreview"
        label="流光滑段"
        :value="!!selection.edge.data?.glow"
        @update="patchEdge('glow', $event)"
      />

      <Field label="标注 note (N3 / N6 / control)">
        <input
          class="settings-input"
          :value="selection.edge.data?.note || ''"
          @input="patchEdge('note', ($event.target as HTMLInputElement).value)"
        />
      </Field>

      <Field v-if="inStagePreview" label="强制色 tone (激活时可选)">
        <input
          type="color"
          class="settings-input"
          style="padding: 4px; height: 40px;"
          :value="selection.edge.data?.tone || '#10b981'"
          @input="onEdgeColorInput($event, 'tone')"
        />
      </Field>

      <div class="region-section">
        <div class="section-title">Idle 默认样式覆盖</div>
        <Field label="线条颜色 (idle)">
          <input
            type="color"
            class="settings-input"
            style="padding: 4px; height: 40px;"
            :value="selection.edge.data?.lineColor || '#c3cedb'"
            @input="onEdgeColorInput($event, 'lineColor')"
          />
        </Field>
        <Field label="线宽">
          <select
            class="settings-input"
            :value="String(selection.edge.data?.lineWidth ?? '')"
            @change="onLineWidthChange"
          >
            <option value="">默认 (中 · 2.5)</option>
            <option value="1">细 · 1.0</option>
            <option value="1.5">正常 · 1.5</option>
            <option value="2.5">中 · 2.5</option>
            <option value="4">粗 · 4.0</option>
            <option value="6">超粗 · 6.0</option>
          </select>
        </Field>
        <Field label="不透明度">
          <select
            class="settings-input"
            :value="String(selection.edge.data?.lineOpacity ?? '')"
            @change="onLineOpacityChange"
          >
            <option value="">默认 (明显 · 0.75)</option>
            <option value="0.15">很淡 · 0.15</option>
            <option value="0.32">淡 · 0.32</option>
            <option value="0.5">中 · 0.5</option>
            <option value="0.75">明显 · 0.75</option>
            <option value="1">完全 · 1.0</option>
          </select>
        </Field>
      </div>

      <div class="pt-2 flex justify-end">
        <button
          class="icon-button"
          style="width: auto; padding: 0 14px; gap: 6px; color: #b91c1c; border-color: rgba(239,68,68,0.3);"
          @click="$emit('delete-edge', selection.edge.id)"
        >
          <el-icon :size="14"><Delete /></el-icon>
          <span style="font-size: calc(0.78rem * var(--ui-font-scale)); font-weight: 600;">删除连线</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { Close, Pointer, Delete, Plus } from '@element-plus/icons-vue'
import { kindMeta, type NodeKind } from '../flow/kindMeta'

export interface Selection {
  type: 'node' | 'edge'
  node?: Node
  edge?: Edge
}

const props = defineProps<{
  selection: Selection | null
  previewIdx?: number | null
}>()
const inStagePreview = computed(() =>
  props.previewIdx !== null && props.previewIdx !== undefined && props.previewIdx >= 0
)
const emit = defineEmits<{
  'patch-node': [id: string, key: string, value: any]
  'patch-node-style': [id: string, style: Record<string, any>]
  'patch-edge': [id: string, key: string, value: any]
  'rename-node': [oldId: string, newId: string]
  'rename-edge': [oldId: string, newId: string]
  'delete-node': [id: string]
  'delete-edge': [id: string]
  'remove-from-stage': [type: 'node' | 'edge', id: string]
  'deselect':   []
}>()

// Region: 当前图案（未指定则回退 mno=dots / 其它=grid）
const regionPattern = computed(() => {
  if (!props.selection || props.selection.type !== 'node' || !props.selection.node) return 'none'
  const d = props.selection.node.data || {}
  if (d.pattern) return d.pattern
  return d.variant === 'mno' ? 'dots' : 'grid'
})

function onRegionVariantChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  patchData('variant', v)
}

function onRegionPatternChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  patchData('pattern', v)
}

function onEdgeColorInput(e: Event, field: string) {
  patchEdge(field, (e.target as HTMLInputElement).value)
}

// ---- Plan 编辑 ----
function initPlan() {
  patchData('plan', { title: 'Plan', items: [{ id: `p-${Date.now()}`, label: '任务 1', phase: 'pending' }] })
}
function removePlan() { patchData('plan', null) }
function onPlanTitle(e: Event) {
  const title = (e.target as HTMLInputElement).value
  const cur = props.selection?.node?.data?.plan || { title: '', items: [] }
  patchData('plan', { ...cur, title })
}
function onPlanItemField(idx: number, field: string, e: Event) {
  const val = (e.target as HTMLInputElement | HTMLSelectElement).value
  const cur = props.selection?.node?.data?.plan || { title: '', items: [] }
  const items = (cur.items || []).slice()
  items[idx] = { ...items[idx], [field]: val }
  patchData('plan', { ...cur, items })
}
function addPlanItem() {
  const cur = props.selection?.node?.data?.plan || { title: 'Plan', items: [] }
  const items = [...(cur.items || []), { id: `p-${Date.now()}`, label: `任务 ${(cur.items?.length || 0) + 1}`, phase: 'pending' }]
  patchData('plan', { ...cur, items })
}
function removePlanItem(idx: number) {
  const cur = props.selection?.node?.data?.plan || { title: '', items: [] }
  const items = (cur.items || []).slice()
  items.splice(idx, 1)
  patchData('plan', { ...cur, items })
}

function onBarHeightInput(e: Event) {
  const raw = parseInt((e.target as HTMLInputElement).value)
  const v = isNaN(raw) ? 8 : Math.max(2, Math.min(raw, 26))
  patchData('height', v)
}

function sizeFromStyle(s: any): string {
  if (!s) return ''
  if (typeof s === 'string') return String(parseInt(s) || '')
  if (typeof s === 'number')  return String(s)
  return ''
}
const nodeWidth  = computed(() => sizeFromStyle((props.selection?.node?.style as any)?.width))
const nodeHeight = computed(() => sizeFromStyle((props.selection?.node?.style as any)?.height))

function onNodeWidthChange(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const id  = props.selection?.node?.id
  if (!id) return
  const w = raw === '' ? undefined : Math.max(40, parseInt(raw) || 0)
  emit('patch-node-style', id, { width: w === undefined ? undefined : `${w}px` })
}
function onNodeHeightChange(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const id  = props.selection?.node?.id
  if (!id) return
  const h = raw === '' ? undefined : Math.max(20, parseInt(raw) || 0)
  emit('patch-node-style', id, { height: h === undefined ? undefined : `${h}px` })
}
function onLineWidthChange(e: Event) {
  const v = (e.target as HTMLInputElement).value
  patchEdge('lineWidth', v === '' ? undefined : parseFloat(v))
}
function onLineOpacityChange(e: Event) {
  const v = (e.target as HTMLInputElement).value
  patchEdge('lineOpacity', v === '' ? undefined : parseFloat(v))
}

function tryRenameNode(oldId: string, raw: string) {
  const next = raw.trim()
  if (!next || next === oldId) return
  if (!/^[A-Za-z0-9_\-]+$/.test(next)) {
    alert('ID 只能包含字母 / 数字 / _ / -')
    return
  }
  emit('rename-node', oldId, next)
}
function tryRenameEdge(oldId: string, raw: string) {
  const next = raw.trim()
  if (!next || next === oldId) return
  if (!/^[A-Za-z0-9_\-]+$/.test(next)) {
    alert('ID 只能包含字母 / 数字 / _ / -')
    return
  }
  emit('rename-edge', oldId, next)
}

const kinds = Object.keys(kindMeta) as NodeKind[]

const tabLabel = computed(() => {
  if (!props.selection) return '未选中'
  if (props.selection.type === 'node') {
    const n = props.selection.node!
    return `节点 · ${n.type}`
  }
  return '连线 · edge'
})

function patchData(key: string, value: any) {
  if (!props.selection || props.selection.type !== 'node' || !props.selection.node) return
  emit('patch-node', props.selection.node.id, key, value)
}

async function onImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('file', file)
  try {
    const res = await $fetch<{ ok: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: form
    })
    if (res.url) patchData('src', res.url)
  } catch (err) {
    console.error('[upload] failed', err)
  }
  ;(e.target as HTMLInputElement).value = ''
}
function patchEdge(key: string, value: any) {
  if (!props.selection || props.selection.type !== 'edge' || !props.selection.edge) return
  emit('patch-edge', props.selection.edge.id, key, value)
}

// 表单字段
const Field = defineComponent({
  props: { label: { type: String, required: true } },
  setup(p, { slots }) {
    return () => h('div', { class: 'field' }, [
      h('label', { class: 'field-label' }, p.label),
      slots.default?.()
    ])
  }
})

// 开关字段
const ToggleField = defineComponent({
  props: { label: String, value: Boolean },
  emits: ['update'],
  setup(p, { emit }) {
    return () => h('button', {
      type: 'button',
      class: ['toggle-row', p.value && 'toggle-row-on'],
      onClick: () => emit('update', !p.value)
    }, [
      h('span', { class: 'toggle-row-label' }, p.label),
      h('span', { class: ['toggle-switch', p.value && 'toggle-switch-on'] },
        [h('span', { class: 'toggle-thumb' })]
      )
    ])
  }
})
</script>

<style scoped>
.preview-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: var(--radius-btn);
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.10), rgba(255, 255, 255, 0.85));
  flex-wrap: wrap;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.region-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-btn);
  border: 1px solid var(--color-border);
  background: linear-gradient(180deg, rgba(59,130,246,0.04), rgba(255,255,255,0.85));
}
.section-title {
  font-size: calc(0.66rem * var(--ui-font-scale));
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0369a1;
}
.plan-item-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.field-label {
  font-size: calc(0.64rem * var(--ui-font-scale));
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--color-muted);
}
:deep(.toggle-row) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: #ffffff;
  font-size: calc(0.78rem * var(--ui-font-scale));
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s;
}
:deep(.toggle-row-on) {
  border-color: color-mix(in srgb, var(--color-blue) 40%, var(--color-border));
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.08), rgba(255, 255, 255, 0.95));
}
:deep(.toggle-switch) {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  transition: background 0.2s;
}
:deep(.toggle-switch-on) {
  background: rgba(14, 165, 233, 0.32);
}
:deep(.toggle-thumb) {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  transition: transform 0.2s;
}
:deep(.toggle-switch-on) .toggle-thumb {
  transform: translateX(16px);
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-btn);
  background: #f8fafc;
  font-size: calc(0.76rem * var(--ui-font-scale));
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.upload-btn:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: #3b82f6;
}
</style>
