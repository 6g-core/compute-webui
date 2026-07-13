<template>
  <aside class="panel h-full overflow-y-auto scrollbar-thin">
    <div class="panel-header sticky top-0 z-10 bg-white/95 backdrop-blur">
      <div class="flex items-center gap-2">
        <span class="title-kicker">Toolbox</span>
        <span>节点 / 区域</span>
      </div>
    </div>

    <div class="p-3 space-y-4">
      <div>
        <div class="text-[calc(0.62rem*var(--ui-font-scale))] tracking-[0.14em] uppercase font-bold text-ink-500 mb-2 px-1">
          Mission 节点
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="k in kinds"
            :key="k"
            class="toolbox-item"
            @click="$emit('add-mission', k)"
            :title="'添加 ' + (kindMeta[k].label || k)"
          >
            <component :is="kindMeta[k].icon" :size="16" :color="kindMeta[k].tint" />
            <span>{{ kindMeta[k].label || k }}</span>
          </button>
          <button class="toolbox-item" @click="$emit('add-bar')" title="添加 粗横条">
            <span style="display:inline-block; width:16px; height:3px; background:#64748b; border-radius:2px;"></span>
            <span>粗横条</span>
          </button>
          <button class="toolbox-item" @click="$emit('add-image')" title="添加 图片节点">
            <ImageIcon :size="16" color="#14b8a6" />
            <span>图片节点</span>
          </button>
        </div>
      </div>

      <div>
        <div class="text-[calc(0.62rem*var(--ui-font-scale))] tracking-[0.14em] uppercase font-bold text-ink-500 mb-2 px-1">
          外观
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button class="toolbox-item" @click="$emit('add-region', 'default')">
            Region · Core
          </button>
          <button class="toolbox-item" @click="$emit('add-region', 'external')">
            Region · OTT
          </button>
          <button class="toolbox-item" @click="$emit('add-region', 'mno')">
            Region · MNO
          </button>
          <button class="toolbox-item" @click="$emit('add-region', 'access')">
            Region · Access
          </button>
          <button class="toolbox-item col-span-2" @click="$emit('add-bus')">
            ＋ AgentBus
          </button>
        </div>
      </div>

      <LegendEditor
        :config="legend"
        @update="$emit('update-legend', $event)"
      />

      <div>
        <div class="text-[calc(0.62rem*var(--ui-font-scale))] tracking-[0.14em] uppercase font-bold text-ink-500 mb-2 px-1">
          操作
        </div>
        <div class="flex flex-col gap-2">
          <button class="icon-button" style="width:100%; height:36px; gap:8px; color:#b91c1c;" @click="$emit('clear')">
            <el-icon :size="14"><Delete /></el-icon>
            <span style="font-size:calc(0.78rem * var(--ui-font-scale)); font-weight:600;">清空画布</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { Image as ImageIcon } from 'lucide-vue-next'
import { kindMeta, type NodeKind } from '../flow/kindMeta'
import LegendEditor from './LegendEditor.vue'
import type { LegendConfig } from '../flow/storage'

defineProps<{ legend: LegendConfig }>()
defineEmits<{
  'add-mission': [kind: NodeKind]
  'add-region':  [variant: 'default' | 'external' | 'mno' | 'access']
  'add-bus':     []
  'add-bar':     []
  'add-image':   []
  'clear':       []
  'update-legend': [cfg: LegendConfig]
}>()

const kinds: NodeKind[] = [
  // 网络 / 服务
  'endpoint', 'access', 'upf', 'router', 'service', 'idm', 'agent',
  'srf', 'scf', 'up', 'gw', 'card', 'server',
  // 电信 / 信令
  'identity_mgr', 'signaling', 'base_station', 'user_plane',
  // 智能体家族
  'sys_agent', 'compute_agent', 'connect_agent', 'acn_agent',
  // 算力 / 服务
  'csf', 'maas', 'sandbox', 'aic',
  // 终端 / 机器
  'machine', 'robot', 'arm', 'dog', 'labubu', 'car', 'glasses', 'drone', 'merchant'
]
</script>

<style scoped>
.toolbox-item {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: #ffffff;
  color: var(--color-text);
  font-size: calc(0.72rem * var(--ui-font-scale));
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  text-transform: capitalize;
  text-align: left;
  overflow: hidden;
}
.toolbox-item > :first-child {
  flex: 0 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.toolbox-item > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toolbox-item:hover {
  background: #f1f5f9;
  border-color: color-mix(in srgb, var(--color-blue) 28%, var(--color-border));
  transform: translateY(-1px);
}
</style>
