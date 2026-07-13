<template>
  <header
    class="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur border-b border-ink-200"
    style="box-shadow: 0 1px 0 rgba(15,23,42,0.02);"
  >
    <!-- 左：Logo + 标题 -->
    <div class="flex items-center gap-4">
      <img
        src="/assets/cmcc-logo.svg"
        alt="CMCC"
        class="h-10 w-auto select-none"
        draggable="false"
      />
      <span
        class="dashboard-title"
        style="
          font-family: 'Orbitron', 'Segoe UI', 'PingFang SC', sans-serif;
          font-size: 23.2px;
          font-weight: 700;
          color: #0085D0;
          letter-spacing: 0.06em;
          line-height: 1.2;
        "
      >
        端网协同
      </span>
    </div>

    <!-- 右：首页动作 + 编辑器切换 + 时间 -->
    <div class="flex items-center gap-2">
      <button
        v-if="inEditor"
        class="icon-button"
        title="返回首页"
        @click="navigateTo('/')"
      >
        <el-icon :size="16"><Back /></el-icon>
      </button>

      <el-dropdown v-else trigger="click" @command="onMenuCommand">
        <button class="icon-button" title="设置">
          <el-icon :size="16"><Setting /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <div
              class="font-size-control"
              role="group"
              aria-label="全局字体大小"
              @click.stop
              @mousedown.stop
            >
              <span class="font-size-control-label">字体大小</span>
              <div class="font-size-stepper">
                <button
                  class="font-size-step-button"
                  type="button"
                  aria-label="减小字体"
                  title="减小字体"
                  :disabled="!canDecreaseFontSize"
                  @click.stop="decreaseFontSize"
                >
                  <el-icon :size="12"><Minus /></el-icon>
                </button>
                <span class="font-size-value" aria-live="polite">{{ displayFontSize }}</span>
                <button
                  class="font-size-step-button"
                  type="button"
                  aria-label="增大字体"
                  title="增大字体"
                  :disabled="!canIncreaseFontSize"
                  @click.stop="increaseFontSize"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
            </div>
            <div
              class="font-size-control graph-scale-control"
              role="group"
              aria-label="架构图缩放"
              @click.stop
              @mousedown.stop
            >
              <span class="font-size-control-label">架构图缩放</span>
              <div class="font-size-stepper">
                <button
                  class="font-size-step-button"
                  type="button"
                  aria-label="缩小架构图"
                  title="缩小架构图"
                  :disabled="!canDecreaseGraphScale"
                  @click.stop="decreaseGraphScale"
                >
                  <el-icon :size="12"><Minus /></el-icon>
                </button>
                <span class="font-size-value" aria-live="polite">{{ displayGraphScale }}</span>
                <button
                  class="font-size-step-button"
                  type="button"
                  aria-label="放大架构图"
                  title="放大架构图"
                  :disabled="!canIncreaseGraphScale"
                  @click.stop="increaseGraphScale"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
            </div>
            <el-dropdown-item command="backend-ip">
              <el-icon :size="14"><Link /></el-icon>
              后端地址
            </el-dropdown-item>
            <el-dropdown-item command="editor">
              <el-icon :size="14"><Edit /></el-icon>
              架构图编辑器
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <span class="font-mono text-[calc(0.75rem*var(--ui-font-scale))] text-ink-500 ml-2 tabular-nums">{{ now }}</span>
    </div>

    <!-- 后端地址弹窗 -->
    <el-dialog v-model="ipDialogVisible" title="后端地址配置" width="460px" :append-to-body="true">
      <div class="ip-form">
        <div v-for="item in ipFields" :key="item.key" class="ip-field">
          <label class="ip-label">{{ item.label }}</label>
          <span class="ip-prefix">{{ item.prefix }}</span>
          <el-input v-model="ipDraft[item.key]" :placeholder="item.placeholder" size="small" />
        </div>
      </div>
      <template #footer>
        <el-button @click="ipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveIp">确定</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { Setting, Back, Link, Edit, Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { resolveDefaultBackendOrigin } from '~/composables/backendOrigin'
import type { BackendIps } from '~/composables/useBackendIp'

const route = useRoute()
const inEditor = computed(() => route.path.startsWith('/editor'))

const now = ref(formatTime(new Date()))
let timer: ReturnType<typeof setInterval> | null = null

const {
  displayPercent: displayFontSize,
  canDecrease: canDecreaseFontSize,
  canIncrease: canIncreaseFontSize,
  decrease: decreaseFontSize,
  increase: increaseFontSize
} = useUiFontSize()

const {
  displayPercent: displayGraphScale,
  canDecrease: canDecreaseGraphScale,
  canIncrease: canIncreaseGraphScale,
  decrease: decreaseGraphScale,
  increase: increaseGraphScale
} = useGraphScale()

// 后端地址
const { ips, load: loadIp, save: saveBackendIps, diagnose } = useBackendIp()
const ipDialogVisible = ref(false)
const ipDraft = ref<BackendIps>({ sdp: '', metrics: '', stage: '', ar: '' })
const defaultBackendOrigin = computed(() => resolveDefaultBackendOrigin())

const ipFields = computed<{ key: keyof BackendIps; label: string; prefix: string; placeholder: string }[]>(() => [
  { key: 'sdp',     label: 'SDP 协商', prefix: 'POST /api/v1/web/sdp/offer',         placeholder: defaultBackendOrigin.value },
  { key: 'metrics', label: '指标历史', prefix: 'GET  /api/v1/metrics/history',       placeholder: defaultBackendOrigin.value },
  { key: 'stage',   label: '业务阶段', prefix: 'GET  /api/v1/system/topology/stage', placeholder: defaultBackendOrigin.value },
  { key: 'ar',      label: 'AR 状态',  prefix: 'GET  /api/v1/system/ar/status',      placeholder: defaultBackendOrigin.value },
])

function onMenuCommand(cmd: string) {
  if (cmd === 'editor') {
    navigateTo('/editor')
  } else if (cmd === 'backend-ip') {
    ipDraft.value = { ...ips.value }
    ipDialogVisible.value = true
  }
}

function saveIp() {
  saveBackendIps(ipDraft.value)
  ipDialogVisible.value = false
  ElMessage.success('后端地址已更新')
  diagnose('backend-ip saved')
}

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  loadIp()
  diagnose('backend-ip init')
  timer = setInterval(() => { now.value = formatTime(new Date()) }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.font-size-control {
  min-width: 224px;
  padding: 10px 12px 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid #edf2f7;
  background: linear-gradient(135deg, rgba(0, 133, 208, 0.055), rgba(255, 255, 255, 0));
}
.graph-scale-control {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.055), rgba(255, 255, 255, 0));
}
.font-size-control-label {
  color: var(--color-text-sub);
  font-size: calc(0.78rem * var(--ui-font-scale));
  font-weight: 700;
  letter-spacing: 0.02em;
}
.font-size-stepper {
  display: grid;
  grid-template-columns: 28px 50px 28px;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid #dbe7ef;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}
.font-size-step-button {
  width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  color: #0369a1;
  background: rgba(14, 165, 233, 0.09);
  cursor: pointer;
  transition: color 140ms ease, background 140ms ease, transform 140ms ease;
}
.font-size-step-button:hover:not(:disabled) {
  color: #fff;
  background: #0085d0;
  transform: translateY(-1px);
}
.font-size-step-button:focus-visible {
  outline: 2px solid rgba(0, 133, 208, 0.45);
  outline-offset: 1px;
}
.font-size-step-button:disabled {
  color: #a8b6c2;
  background: #f1f5f9;
  cursor: not-allowed;
}
.font-size-value {
  color: var(--color-text);
  font-family: 'IBM Plex Mono', monospace;
  font-size: calc(0.7rem * var(--ui-font-scale));
  font-weight: 700;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.ip-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ip-field {
  display: grid;
  grid-template-columns: 72px 1fr;
  grid-template-rows: auto auto;
  gap: 4px 10px;
  align-items: center;
}
.ip-label {
  font-size: calc(0.78rem * var(--ui-font-scale));
  font-weight: 700;
  color: var(--color-text);
  grid-row: 1;
  grid-column: 1;
}
.ip-prefix {
  font-size: calc(0.66rem * var(--ui-font-scale));
  font-family: 'IBM Plex Mono', monospace;
  color: #94a3b8;
  grid-row: 2;
  grid-column: 1;
}
.ip-field .el-input {
  grid-row: 1 / 3;
  grid-column: 2;
}
</style>
