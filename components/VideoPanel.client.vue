<template>
  <section class="panel flex flex-col h-full overflow-hidden">
    <div class="panel-header">
      <div class="flex items-center gap-2">
        <span>实时视频流</span>
      </div>
      <div class="flex items-center gap-2">
        <span :class="['status-badge', statusBadgeClass]">
          <span class="status-badge-icon"></span>
          {{ statusText }}
        </span>
        <button class="icon-button icon-button-sm" @click="reconnect" title="重连">
          <el-icon :size="14"><Refresh /></el-icon>
        </button>
      </div>
    </div>

    <div
      class="flex-1 relative grid place-items-center overflow-hidden"
      style="background:
        radial-gradient(circle at 20% 10%, rgba(56, 189, 248, 0.10), transparent 50%),
        radial-gradient(circle at 90% 100%, rgba(99, 102, 241, 0.08), transparent 50%),
        #f1f5f9;"
    >
      <video
        v-show="connected"
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="w-full h-full object-contain"
      />
      <div
        v-if="!connected"
        style="
          font-family: 'IBM Plex Mono', monospace;
          font-size: calc(0.86rem * var(--ui-font-scale));
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #64748b;
        "
      >
        {{ connecting ? '连接中…' : '等待视频连接' }}
      </div>

      <!-- 状态条 · 视频上方，玻璃拟态 -->
      <div class="glass-bar glass-bar-top">
        <span class="glass-bar-kicker">{{ arStatus }}</span>
        <span class="glass-bar-text glass-bar-text-wrap">{{ arMessage }}</span>
      </div>

<!-- 对话条 · 视频下方的固定长条，左贴边、右侧给手势留位（与手势独立） -->
      <div v-if="arWhisper" class="glass-bar glass-bar-whisper">
        <span class="glass-bar-text glass-bar-text-wrap">“{{ arWhisper }}”</span>
      </div>

      <!-- 手势条 · 视频下方右侧（与对话相互独立） -->
      <div v-if="arGesture" class="glass-bar glass-bar-gesture">
        <img
          :src="`/assets/gestures/${arGesture}.png`"
          :alt="arGesture"
          class="gesture-icon"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'

const {
  videoEl,
  connected,
  connecting,
  start,
  reconnect,
  stop
} = usePassiveVideoPeer({
  clientId: 'web-monitor-display-01'
})
const { backendUrl, traceCall } = useBackendIp()

const statusText = computed(() =>
  connected.value ? 'Live' : connecting.value ? 'Connecting' : 'Offline'
)
const statusBadgeClass = computed(() =>
  connected.value ? 'status-badge-live'
    : connecting.value ? 'status-badge-accent'
    : 'status-badge-idle'
)

// AR 业务状态轮询
const arStatus = ref('INIT')
const arMessage = ref('系统就绪，等待演示开始...')
const arWhisper = ref('')
const arGesture = ref('')
const GESTURE_ENUM = ['pointing_up', 'back', 'pointing_left', 'pointing_right', 'hello', 'palm']
let arTimer: ReturnType<typeof setInterval> | null = null

async function fetchArStatus() {
  const url = backendUrl('/api/v1/system/ar/status')
  try {
    const data = await traceCall('ar', url, () => $fetch<{
      status: string
      ar_status: string
      message: string
      last_whisper?: string
      current_gesture?: string
    }>(url))
    if (data && data.status === 'SUCCESS') {
      arStatus.value = data.ar_status
      arMessage.value = data.message
      arWhisper.value = data.last_whisper ?? ''
      const g = (data.current_gesture ?? '').trim()
      arGesture.value = GESTURE_ENUM.includes(g) ? g : ''
    }
  } catch {
    // traceCall 已经在翻转边界打了 error，这里静默
  }
}

onMounted(() => {
  start()
  fetchArStatus()
  arTimer = setInterval(fetchArStatus, 2000)
})
onBeforeUnmount(() => {
  stop()
  if (arTimer) { clearInterval(arTimer); arTimer = null }
})
</script>

<style scoped>
.glass-bar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 252, 248, 0.38);
  backdrop-filter: blur(22px) saturate(1.35);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 10px 28px rgba(180, 160, 140, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.70);
  color: #3f3632;
  font-size: calc(0.78rem * var(--ui-font-scale));
  font-weight: 600;
  letter-spacing: 0.01em;
  pointer-events: none;
  z-index: 2;
}

.glass-bar-top {
  top: 14px;
  left: 16px;
  right: 16px;
  border-radius: 14px;
  padding: 10px 16px;
  justify-content: flex-start;
}

/* whisper: 固定长条，左贴边、右侧与手势框间距 = 手势框距视频右边缘的间距，更对称 */
.glass-bar-whisper {
  bottom: 18px;
  left: 18px;
  right: 128px;               /* 18(视频右边距) + 92(手势框宽度) + 18(对称间距) */
  border-radius: 14px;
  padding: 10px 16px;
  justify-content: flex-start;
}

.glass-bar-whisper .glass-bar-text-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.glass-bar-gesture {
  bottom: 16px;
  right: 18px;
  border-radius: 16px;
  padding: 8px;
  justify-content: center;
}

.gesture-icon {
  flex: 0 0 auto;
  width: 76px;
  height: 76px;
  object-fit: contain;
  display: block;
}

.glass-bar-kicker {
  flex: 0 0 auto;
  font-size: calc(0.62rem * var(--ui-font-scale));
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7d6a5a;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(200, 180, 160, 0.20);
}

.glass-bar-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: calc(0.82rem * var(--ui-font-scale));
  color: #3f3632;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.glass-bar-text-wrap {
  white-space: normal;
  line-height: 1.35;
  overflow: visible;
  text-overflow: clip;
}
</style>
