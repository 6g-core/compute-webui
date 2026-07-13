<template>
  <div
    class="image-node"
    :class="[data.active && 'image-node-active', data.flashActive && 'image-node-flash']"
  >
    <div class="image-node-img-wrap">
      <img
        v-if="data.src"
        :src="data.src"
        :alt="data.label || ''"
        class="image-node-img"
        draggable="false"
      />
      <div v-else class="image-node-placeholder">
        <ImageIcon :size="24" color="#94a3b8" />
      </div>
    </div>
    <div v-if="data.label" class="image-node-caption">{{ data.label }}</div>

    <!-- Handles -->
    <Handle
      v-for="h in handles"
      :key="h.id"
      :id="h.id"
      :type="h.type"
      :position="h.position"
      :style="h.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps<{ data: any }>()

interface H { id: string; type: 'source' | 'target'; position: Position; style?: Record<string, string> }

const handles = computed<H[]>(() => {
  const list: H[] = []
  const ids: string[] = props.data.handles || ['in-top', 'out-bottom']
  for (const id of ids) {
    const isOut = id.startsWith('out')
    const t: 'source' | 'target' = isOut ? 'source' : 'target'
    let pos = Position.Top
    let style: Record<string, string> | undefined
    if (id.includes('top'))    pos = Position.Top
    if (id.includes('bottom')) pos = Position.Bottom
    if (id.includes('left'))   pos = Position.Left
    if (id.includes('right'))  pos = Position.Right
    const quarterMatch = id.match(/^(in|out)-(top|bottom|left|right)-(25|75)$/)
    if (quarterMatch) {
      const side = quarterMatch[2]
      const pct = quarterMatch[3] + '%'
      const axis = (side === 'top' || side === 'bottom') ? 'left' : 'top'
      style = { [axis]: pct }
    }
    list.push({ id, type: t, position: pos, style })
  }
  return list
})
</script>

<style scoped>
.image-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: rgba(255, 255, 255, 0.95);
  transform: scale(var(--graph-component-scale));
  transform-origin: center;
  transition: transform 180ms ease, border-color 0.25s, box-shadow 0.25s;
  min-width: 80px;
}
.image-node-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18), 0 4px 12px rgba(59, 130, 246, 0.10);
}
.image-node-flash {
  animation: image-node-pulse 1.2s ease-in-out infinite;
}
@keyframes image-node-pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12); }
  50%      { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.22); }
}
.image-node-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}
.image-node-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
.image-node-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}
.image-node-caption {
  font-size: calc(0.7rem * var(--ui-font-scale));
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
