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
          font-size: 1.45rem;
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

      <span class="font-mono text-[12px] text-ink-500 ml-2 tabular-nums">{{ now }}</span>
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
import { Setting, Back, Link, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { resolveDefaultBackendOrigin } from '~/composables/backendOrigin'
import type { BackendIps } from '~/composables/useBackendIp'

const route = useRoute()
const inEditor = computed(() => route.path.startsWith('/editor'))

const now = ref(formatTime(new Date()))
let timer: ReturnType<typeof setInterval> | null = null

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
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
  grid-row: 1;
  grid-column: 1;
}
.ip-prefix {
  font-size: 0.66rem;
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
