<template>
  <section class="panel mbbf-panel flex h-full min-h-0 flex-col overflow-hidden">
    <div class="panel-header mbbf-header">
      <span>架构图</span>
      <span class="mbbf-stage-chip">{{ stageCaption }}</span>
    </div>

    <div class="mbbf-shell">
      <div class="mbbf-corner top-left" />
      <div class="mbbf-corner top-right" />
      <div class="mbbf-corner bottom-left" />
      <div class="mbbf-corner bottom-right" />

      <div class="mbbf-title">
        <div class="mbbf-title-kicker">{{ activeConfig.kicker }}</div>
        <h2>{{ activeConfig.title }}</h2>
      </div>

      <div class="mbbf-canvas">
        <div class="mbbf-zone zone-cp">
          <span>CP</span>
        </div>
        <div class="mbbf-zone zone-up">
          <span>UP</span>
        </div>
        <div v-if="showSecureDomain" class="secure-domain-box">
          <span>Secure Domain</span>
        </div>
        <aside v-if="taskSummary" class="task-summary">
          <span class="task-summary-bar" />
          <span>{{ taskSummary }}</span>
        </aside>
        <aside v-if="showSandboxInfo" class="sandbox-info-panel">
          <svg class="sandbox-info-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect class="sandbox-info-border-line" x="1.2" y="1.2" width="97.6" height="97.6" rx="2.5" ry="2.5" />
          </svg>
          <div class="sandbox-info-title">Compute Sandbox</div>
          <div class="sandbox-info-grid">
            <span v-for="item in sandboxInfo" :key="item.label" class="sandbox-info-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </span>
          </div>
        </aside>

        <svg class="mbbf-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="mbbf-topology-line-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g v-for="connection in connections" :key="connectionKey(connection)">
            <path
              :d="pathFor(connection)"
              fill="none"
              stroke="#cbd5e1"
              stroke-width="0.35"
              stroke-dasharray="1.2 1.1"
              stroke-linecap="round"
              opacity="0.42"
            />
            <template v-if="activeLineByKey[connectionKey(connection)]">
              <path
                :d="pathFor(connection)"
                fill="none"
                :stroke="activeFlowColor"
                stroke-width="1.15"
                stroke-linecap="round"
                opacity="0.78"
                filter="url(#mbbf-topology-line-glow)"
                class="line-pulse"
              />
              <path
                :d="pathFor(connection)"
                fill="none"
                :stroke="activeFlowColor"
                stroke-width="0.9"
                stroke-dasharray="4 8"
                stroke-linecap="round"
                opacity="0.95"
                class="flow-line"
              />
            </template>
          </g>
        </svg>

        <div class="latency-layer">
          <div
            v-for="item in latencyLabels"
            :key="item.key"
            :class="['latency-badge', item.below ? 'below' : 'above']"
            :style="{ left: `${item.x}%`, top: item.below ? `calc(${item.y}% + 8px)` : `calc(${item.y}% - 8px)` }"
          >
            {{ item.value }}ms
          </div>
        </div>

        <svg class="active-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="mbbf-active-line-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g v-for="connection in normalizedActiveConnections" :key="connection.key">
            <path
              :d="pathFor(connection.path)"
              fill="none"
              stroke="#67e8f9"
              stroke-width="1.25"
              stroke-linecap="round"
              opacity="0.82"
              filter="url(#mbbf-active-line-glow)"
              class="line-pulse"
            />
            <path
              :d="pathFor(connection.path)"
              fill="none"
              stroke="#e0f2fe"
              stroke-width="0.9"
              stroke-dasharray="4 8"
              stroke-linecap="round"
              opacity="0.95"
              :class="['flow-line-fast', connection.reverse && 'reverse']"
            />
          </g>
        </svg>

        <div class="tool-panel">
          <div v-for="group in toolGroups" :key="group.title" class="tool-group">
            <div class="tool-group-title">{{ group.title }}</div>
            <div class="tool-list">
              <div
                v-for="tool in group.items"
                :key="tool"
                :class="['tool-row', toolStates[tool] === 'working' && 'working']"
              >
                <span class="tool-name">
                  <component :is="toolIcon(tool)" class="tool-icon" />
                  {{ tool }}
                </span>
                <span class="tool-state">
                  <span class="tool-dot" />
                  {{ toolStates[tool] === 'working' ? 'work' : 'idle' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="node-layer">
          <div
            v-for="node in topologyNodes"
            :key="node.id"
            :class="['topology-node', hoveredIdentityNode === node.id && 'identity-hovered']"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            :tabindex="isDigitalIdentityVisible(node.id) ? 0 : undefined"
            @mouseenter="hoveredIdentityNode = hasDigitalIdentity(node.id) ? node.id : null"
            @mouseleave="hoveredIdentityNode = null"
            @focus="hoveredIdentityNode = isDigitalIdentityVisible(node.id) ? node.id : null"
            @blur="hoveredIdentityNode = null"
          >
            <div class="node-body">
              <span class="node-glow" :style="{ backgroundColor: node.color }" />
              <img :src="node.image" :alt="node.name" :class="['node-image', node.size]" draggable="false" />
              <div
                v-if="hoveredIdentityNode === node.id && isDigitalIdentityVisible(node.id)"
                :class="['digital-identity-card', node.id === 'UE' && 'ar-identity-card']"
              >
                <div class="identity-card-panel">
                  <div class="identity-title">Digital ID</div>
                  <div class="identity-did">{{ digitalIdentityByNode[node.id]?.did }}</div>
                  <div class="identity-detail">
                    <span>Capabilities:</span>
                    <strong>{{ digitalIdentityByNode[node.id]?.capabilities }}</strong>
                  </div>
                  <div class="identity-status">
                    <span>Status:</span>
                    <strong>Active <i /></strong>
                  </div>
                </div>
              </div>
              <div
                :class="['node-label', highlightedSet.has(node.id) && 'highlighted', node.labelClass]"
                :style="node.labelStyle"
              >
                {{ node.name }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-for="(bubble, index) in positionedBubbles"
          :key="`${bubble.targetNode || 'bubble'}-${index}`"
          :class="['agent-bubble', bubble.variant === 'plan' && 'plan-bubble', bubble.variant === 'voice' && 'voice-bubble', bubble.status === 'success' && 'success']"
          :style="bubble.style"
        >
          <template v-if="bubble.variant === 'plan'">
            <div class="plan-heading">用户意图：</div>
            <strong>{{ bubble.title }}</strong>
            <div class="plan-divider" />
            <div class="plan-heading">网络任务规划：</div>
            <div class="plan-tasks">
              <div v-for="task in bubble.tasks" :key="task.label" class="plan-task">
                <CheckCircle2 v-if="task.status === 'success'" class="bubble-icon success-icon" />
                <LoaderCircle v-else-if="task.status === 'working'" class="bubble-icon spin-icon" />
                <CircleDot v-else class="bubble-icon pending-icon" />
                <span>{{ task.label }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <template v-if="!bubble.noIcon">
              <Radio v-if="bubble.variant === 'voice'" class="bubble-icon pulse-icon" />
              <CheckCircle2 v-else-if="bubble.status === 'success'" class="bubble-icon success-icon" />
              <LoaderCircle v-else class="bubble-icon spin-icon" />
            </template>
            <span class="bubble-lines">
              <span v-for="line in bubble.lines" :key="line">{{ line }}</span>
            </span>
          </template>
          <span :class="['bubble-arrow', bubble.arrow || 'left']" />
        </div>
      </div>

      <div class="core-functions">
        <div class="core-heading">
          <h3>核心网作用</h3>
          <span>Core Network Functions</span>
        </div>
        <div class="core-grid" :style="{ gridTemplateColumns: `repeat(${activeConfig.coreFunctions.length}, minmax(0, 1fr))` }">
          <div v-for="item in activeConfig.coreFunctions" :key="item" class="core-item">
            <CheckCircle2 class="core-icon" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BrainCircuit, CheckCircle2, CircleDot, Cpu, LoaderCircle, Radio } from 'lucide-vue-next'

type StageKey = 'INIT' | 'ACN_NETWORKING' | 'COMPUTING' | 'MEDIA_ESTABLISHED'
type NodeId = string
type IdentityNodeId = 'RobotDog' | 'UE'
type ConnectionTuple = [string, string]
type LatencyRange = { min: number; max: number }
type LineConfig = { key: string; latencyMs: LatencyRange; labelPosition?: 'below' }
type ActiveConnection = string | { key: string; pathKey?: string; reverse?: boolean }
type TaskStatus = 'pending' | 'working' | 'success'

interface TopologyNode {
  id: NodeId
  name: string
  x: number
  y: number
  color: string
  image: string
  size: string
  labelClass?: string
  labelStyle?: Record<string, string>
}

interface DigitalIdentity {
  did: string
  capabilities: string
}

interface Bubble {
  targetNode?: NodeId
  lines?: string[]
  title?: string
  tasks?: { label: string; status: TaskStatus }[]
  variant?: 'plan' | 'voice'
  status?: TaskStatus
  placement?: 'above' | 'left' | 'right' | 'cpPlanBox' | 'cpSystemBubble'
  offsetX?: number
  offsetY?: number
  activeTools?: string[]
  arrow?: 'left' | 'right' | 'down' | 'cp'
  noIcon?: boolean
  style?: Record<string, string>
}

interface Phase {
  key: string
  summary: string
  highlightedNodes?: NodeId[]
  topologyLines?: LineConfig[]
  activeConnections?: ActiveConnection[]
  systemAgentBubble?: Bubble
  agentBubbles?: Bubble[]
  activeFlowType?: 'domain' | 'a2aGateway' | 'a2aTrust' | 'computeSandbox' | 'dogVision'
}

const { backendUrl, traceCall } = useBackendIp()
const sharedSystemStage = useSystemStage()

const currentStage = ref<StageKey>('INIT')
const phaseIndex = ref(0)
const latencyTick = ref(0)
const finalFlashActive = ref(true)
const hoveredIdentityNode = ref<NodeId | null>(null)
const digitalIdentityVisibility = ref<Record<string, boolean>>({
  RobotDog: false,
  UE: false,
})
const digitalIdentityDisplayReady = ref<Record<IdentityNodeId, boolean>>({
  RobotDog: false,
  UE: false,
})
const previousIdentityVisibility = ref<Record<IdentityNodeId, boolean>>({
  RobotDog: false,
  UE: false,
})
const identityVisibilityInitialized = ref(false)
const identityApplicationTarget = ref<IdentityNodeId | null>(null)
const identityApplicationPhaseIndex = ref(0)

let pollTimer: ReturnType<typeof setInterval> | null = null
let phaseTimer: ReturnType<typeof setTimeout> | null = null
let latencyTimer: ReturnType<typeof setInterval> | null = null
let finalFlashTimer: ReturnType<typeof setTimeout> | null = null
let identityVisibilityTimer: ReturnType<typeof setInterval> | null = null
let identityApplicationTimer: ReturnType<typeof setTimeout> | null = null

const identityApplicationQueue: IdentityNodeId[] = []

const topologyNodes: TopologyNode[] = [
  { id: 'UE', name: 'AR Glasses\n(Physical AI)', x: 7, y: 78, color: '#22f5ff', image: '/topology/glasses_transparent.png', size: 'node-sm' },
  { id: 'RobotDog', name: 'Robot Dog\n(Physical AI)', x: 7, y: 32, color: '#22e6b8', image: '/topology/robotdog_transparent.png', size: 'node-lg' },
  { id: 'gNB', name: 'RAN', x: 22, y: 55, color: '#60a5fa', image: '/topology/upload-ran.png', size: 'node-lg' },
  { id: 'SRF', name: 'SRF', x: 36, y: 43, color: '#38bdf8', image: '/topology/upload-srf.png', size: 'node-lg', labelClass: 'tight-label' },
  { id: 'SystemAgent', name: 'SystemAgent', x: 53.5, y: 40, color: '#c084fc', image: '/topology/upload-system-agent.png', size: 'node-lg', labelClass: 'tight-label' },
  { id: 'UPF', name: 'UPF', x: 36, y: 82, color: '#34d399', image: '/topology/upload-upf.png', size: 'node-lg', labelClass: 'tight-label' },
  { id: 'ConnectionAgent', name: 'Connection Agent', x: 69, y: 13, color: '#22d3ee', image: '/topology/upload-connection-agent.png', size: 'node-md', labelClass: 'tight-label' },
  { id: 'ACN', name: 'ACN Agent', x: 69, y: 32, color: '#f472b6', image: '/topology/upload-acn-agent.png', size: 'node-md', labelClass: 'tight-label' },
  { id: 'Computing', name: 'Computing Agent', x: 69, y: 50, color: '#fbbf24', image: '/topology/upload-computing-agent.png', size: 'node-md', labelClass: 'low-label', labelStyle: { whiteSpace: 'nowrap' } },
  { id: 'AgentGW', name: 'Agent GW', x: 62.5, y: 91, color: '#38bdf8', image: '/topology/upload-agent-gw.png', size: 'node-md', labelClass: 'tight-label' },
  { id: 'Gateway', name: 'Computing Node', x: 62.5, y: 72, color: '#38bdf8', image: '/topology/upload-computing-node.png', size: 'node-md', labelClass: 'tight-label' },
]

const digitalIdentityByNode: Partial<Record<NodeId, DigitalIdentity>> = {
  UE: {
    did: '3lt1zY73G@CMCC.org',
    capabilities: '[Device-Network Synergy, AR]',
  },
  RobotDog: {
    did: 'DID:2168nLB3G@CMCC.org',
    capabilities: '[4 Legs, Camera, Payload:10KG/10KM]',
  },
}

function isDigitalIdentityVisible(nodeId: NodeId) {
  if (!hasDigitalIdentity(nodeId)) return false
  return Boolean(digitalIdentityVisibility.value[nodeId] && digitalIdentityDisplayReady.value[nodeId as IdentityNodeId])
}

function hasDigitalIdentity(nodeId: NodeId) {
  return Boolean(digitalIdentityByNode[nodeId])
}

const nodeById = Object.fromEntries(topologyNodes.map((node) => [node.id, node]))

const connections: ConnectionTuple[] = [
  ['UE', 'gNB'],
  ['RobotDog', 'gNB'],
  ['gNB', 'SRF'],
  ['SRF', 'SystemAgent'],
  ['gNB', 'UPF'],
  ['UPF', 'Gateway'],
  ['UPF', 'AgentGW'],
  ['SystemAgent', 'ConnectionAgent'],
  ['SystemAgent', 'ACN'],
  ['SystemAgent', 'Computing'],
]

const toolGroups = [
  { title: 'Agentic Base', items: ['AM Tool', 'SM Tool', 'Policy Tool', 'UDM Tool', 'IDM Tool', 'ARF Tool'] },
  { title: 'Beyond Connectivity', items: ['CMF Tool', 'CSPF Tool'] },
]

const computingToolIcons = new Set(['CMF Tool', 'CSPF Tool'])
const aboveIconBubbleNodes = new Set<NodeId>(['ConnectionAgent', 'ACN', 'Computing'])
const identityNodeIds: IdentityNodeId[] = ['RobotDog', 'UE']

const flowConfigs = {
  domain: {
    color: '#34d399',
    lines: [
      line('RobotDog->gNB', 4, 8),
      line('UE->gNB', 3, 7),
      line('gNB->SRF', 7, 13),
      line('SRF->SystemAgent', 3, 6),
      line('SystemAgent->ACN', 5, 10),
    ],
  },
  a2aGateway: {
    color: '#38bdf8',
    lines: [
      line('RobotDog->gNB', 4, 8),
      line('UE->gNB', 3, 7),
      line('gNB->UPF', 8, 14, 'below'),
      line('UPF->AgentGW', 9, 16),
    ],
  },
  a2aTrust: {
    color: '#f472b6',
    lines: [
      line('RobotDog->gNB', 4, 8),
      line('UE->gNB', 3, 7),
      line('gNB->SRF', 7, 13),
      line('SRF->SystemAgent', 3, 6),
      line('SystemAgent->ACN', 5, 10),
    ],
  },
  computeSandbox: {
    color: '#fbbf24',
    lines: [
      line('RobotDog->gNB', 4, 8),
      line('gNB->SRF', 7, 13),
      line('SRF->SystemAgent', 3, 6),
      line('SystemAgent->Computing', 6, 12),
    ],
  },
  dogVision: {
    color: '#22f5ff',
    lines: [
      line('RobotDog->gNB', 4, 8),
      line('UE->gNB', 3, 7),
      line('gNB->UPF', 8, 14, 'below'),
      line('UPF->Gateway', 6, 11, 'below'),
    ],
  },
}

const secureDomainSustainLines = [
  line('RobotDog->gNB', 4, 8),
  line('UE->gNB', 3, 7),
  line('gNB->UPF', 8, 14, 'below'),
]

const stageConfigs: Record<StageKey, { kicker: string; title: string; coreFunctions: string[]; defaultFlow?: keyof typeof flowConfigs; phases: Phase[]; timing: number[] }> = {
  INIT: {
    kicker: 'STAGE 1',
    title: '核心网：系统初始待机',
    coreFunctions: ['统一数字身份管理', '可信接入控制', '智能体发布发现'],
    phases: [
      {
        key: 'init',
        summary: '',
        highlightedNodes: [],
        topologyLines: [],
      },
    ],
    timing: [1800],
  },
  ACN_NETWORKING: {
    kicker: 'STAGE 2',
    title: '核心网：生成式网络',
    coreFunctions: ['L3按需组网', '安全接入控制', '域内连接最优选路', '用户体验保障'],
    phases: [
      {
        key: 'stage4_source',
        summary: '创建安全域',
        topologyLines: [line('UE->gNB', 5, 9), line('gNB->SRF', 7, 12), line('SRF->SystemAgent', 3, 6)],
        highlightedNodes: ['UE'],
        systemAgentBubble: voiceBubble('UE', ['Create Secure Domain'], 'above', 8),
      },
      {
        key: 'stage4_intent',
        summary: '创建安全域',
        highlightedNodes: ['SystemAgent'],
        systemAgentBubble: simpleBubble('SystemAgent', ['收到意图：', 'Create Secure Domain'], 'cpSystemBubble'),
      },
      {
        key: 'stage4_plan',
        summary: '创建安全域',
        highlightedNodes: ['SystemAgent'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'working' },
          { label: 'Connection Agent：下发物理组网配置', status: 'pending' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
      },
      {
        key: 'stage4_acn_dispatch',
        summary: '创建安全域',
        highlightedNodes: ['SystemAgent', 'ACN'],
        activeConnections: ['SystemAgent->ACN'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'working' },
          { label: 'Connection Agent：下发物理组网配置', status: 'pending' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('ACN', ['收到任务：创建安全域凭证'], 'left')],
      },
      {
        key: 'stage4_udm',
        summary: '更新签约数据',
        highlightedNodes: ['ACN'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'working' },
          { label: 'Connection Agent：下发物理组网配置', status: 'pending' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('ACN', ['调用UDM Tool', '更新签约数据'], 'left'), toolBubble('ACN', ['UDM Tool'])],
      },
      {
        key: 'stage4_idm',
        summary: '下发域接入凭证',
        highlightedNodes: ['ACN'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'working' },
          { label: 'Connection Agent：下发物理组网配置', status: 'pending' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('ACN', ['调用IDM Tool', '下发域接入凭证'], 'left'), toolBubble('ACN', ['IDM Tool'])],
      },
      {
        key: 'stage4_connection_dispatch',
        summary: '下发物理组网配置',
        highlightedNodes: ['SystemAgent', 'ConnectionAgent'],
        activeConnections: ['SystemAgent->ConnectionAgent'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'success' },
          { label: 'Connection Agent：下发物理组网配置', status: 'working' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['收到任务：下发物理组网配置'], 'left')],
      },
      {
        key: 'stage4_connection_sm',
        summary: '下发物理组网配置',
        highlightedNodes: ['ConnectionAgent'],
        activeConnections: ['ConnectionAgent->UPF'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'success' },
          { label: 'Connection Agent：下发物理组网配置', status: 'working' },
          { label: 'Connection Agent：L1级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['调用SM Tool', '下发物理组网配置'], 'left'), toolBubble('ConnectionAgent', ['SM Tool'])],
      },
      {
        key: 'stage4_policy',
        summary: 'L1级通信保障',
        highlightedNodes: ['ConnectionAgent'],
        systemAgentBubble: planBubble('Create Secure Domain', [
          { label: 'ACN Agent：创建安全域凭证', status: 'success' },
          { label: 'Connection Agent：下发物理组网配置', status: 'success' },
          { label: 'Connection Agent：L1级通信保障', status: 'working' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['调用Policy Tool', '下发保障策略'], 'left'), toolBubble('ConnectionAgent', ['Policy Tool'])],
      },
      {
        key: 'stage4_done',
        summary: '创建安全域',
        highlightedNodes: ['SystemAgent', 'UE'],
        activeConnections: [
          { key: 'SystemAgent->SRF', pathKey: 'SRF->SystemAgent', reverse: true },
          { key: 'SRF->gNB', pathKey: 'gNB->SRF', reverse: true },
          { key: 'gNB->UE', pathKey: 'UE->gNB', reverse: true },
        ],
        systemAgentBubble: simpleBubble('SystemAgent', ['Task Finished'], 'cpSystemBubble', 'success'),
      },
    ],
    timing: [1200, 2000, 2000, 420, 420, 420, 520, 520, 520, 1600],
  },
  COMPUTING: {
    kicker: 'STAGE 3',
    title: '核心网：分配算力资源',
    coreFunctions: ['网络提供强大算力', '算力随路卸载', '传输低时延'],
    phases: [
      {
        key: 'stage7_source_ar',
        summary: '申请网内算力',
        topologyLines: [line('UE->gNB', 5, 9), line('RobotDog->gNB', 4, 8), line('gNB->UPF', 8, 14, 'below')],
        highlightedNodes: ['UE', 'RobotDog'],
      },
      {
        key: 'stage7_source_robotdog',
        summary: '申请网内算力',
        topologyLines: [line('UE->gNB', 5, 9), line('RobotDog->gNB', 4, 8), line('gNB->UPF', 8, 14, 'below')],
        highlightedNodes: ['UE', 'RobotDog'],
        agentBubbles: [voiceBubble('RobotDog', ['Compute offloading for object recognition'], 'above', 8)],
      },
      {
        key: 'stage7_source_intent',
        summary: '申请网内算力',
        topologyLines: [line('RobotDog->gNB', 4, 8), line('gNB->SRF', 7, 13), line('SRF->SystemAgent', 3, 6)],
        highlightedNodes: ['RobotDog'],
        agentBubbles: [voiceBubble('RobotDog', ['Compute offloading for object recognition'], 'above', 8)],
      },
      {
        key: 'stage7_intent',
        summary: '申请网内算力',
        highlightedNodes: ['SystemAgent'],
        systemAgentBubble: simpleBubble('SystemAgent', ['收到意图：', 'Compute offloading for object recognition'], 'cpSystemBubble'),
      },
      {
        key: 'stage7_plan',
        summary: '申请网内算力',
        highlightedNodes: ['SystemAgent'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'working' },
          { label: 'Computing Agent：分配算力资源', status: 'pending' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
      },
      {
        key: 'stage7_match',
        summary: '申请网内算力',
        highlightedNodes: ['SystemAgent'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'working' },
          { label: 'Computing Agent：分配算力资源', status: 'pending' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
      },
      {
        key: 'stage7_dispatch',
        summary: '创建算力会话',
        highlightedNodes: ['SystemAgent', 'Computing'],
        activeConnections: ['SystemAgent->Computing'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'working' },
          { label: 'Computing Agent：分配算力资源', status: 'pending' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('Computing', ['收到任务：创建算力会话', '收到任务：分配算力资源'], 'left')],
      },
      {
        key: 'stage7_cmf_session',
        summary: '创建算力会话',
        highlightedNodes: ['Computing'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'working' },
          { label: 'Computing Agent：分配算力资源', status: 'pending' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('Computing', ['调用CMF Tool', '创建算力会话'], 'left'), toolBubble('Computing', ['CMF Tool'])],
      },
      {
        key: 'stage7_cmf_resource',
        summary: '分配算力资源',
        highlightedNodes: ['Computing'],
        activeConnections: ['Computing->Gateway'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'success' },
          { label: 'Computing Agent：分配算力资源', status: 'working' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('Computing', ['调用CMF Tool', '分配算力资源'], 'left'), toolBubble('Computing', ['CMF Tool'])],
      },
      {
        key: 'stage7_compute_done',
        summary: '分配算力资源',
        highlightedNodes: ['SystemAgent', 'Computing'],
        activeConnections: [{ key: 'Computing->SystemAgent', pathKey: 'SystemAgent->Computing', reverse: true }],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'success' },
          { label: 'Computing Agent：分配算力资源', status: 'success' },
          { label: 'Connection Agent：L3级通信保障', status: 'pending' },
        ]),
        agentBubbles: [simpleBubble('Computing', ['完成任务：创建算力会话', '完成任务：分配算力资源'], 'left', 'success')],
      },
      {
        key: 'stage7_policy_dispatch',
        summary: 'L3级通信保障',
        highlightedNodes: ['SystemAgent', 'ConnectionAgent'],
        activeConnections: ['SystemAgent->ConnectionAgent'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'success' },
          { label: 'Computing Agent：分配算力资源', status: 'success' },
          { label: 'Connection Agent：L3级通信保障', status: 'working' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['收到任务：L3级通信保障'], 'left')],
      },
      {
        key: 'stage7_policy',
        summary: '网络算力节点识别标注',
        highlightedNodes: ['ConnectionAgent'],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'success' },
          { label: 'Computing Agent：分配算力资源', status: 'success' },
          { label: 'Connection Agent：L3级通信保障', status: 'working' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['调用Policy Tool', '下发AI推理通信保障策略'], 'left'), toolBubble('ConnectionAgent', ['Policy Tool'])],
      },
      {
        key: 'stage7_policy_done',
        summary: 'L3级通信保障',
        highlightedNodes: ['SystemAgent', 'ConnectionAgent'],
        activeConnections: [{ key: 'ConnectionAgent->SystemAgent', pathKey: 'SystemAgent->ConnectionAgent', reverse: true }],
        systemAgentBubble: planBubble('Compute offloading for object recognition', [
          { label: 'Computing Agent：创建算力会话', status: 'success' },
          { label: 'Computing Agent：分配算力资源', status: 'success' },
          { label: 'Connection Agent：L3级通信保障', status: 'success' },
        ]),
        agentBubbles: [simpleBubble('ConnectionAgent', ['完成L3级通信保障'], 'left', 'success')],
      },
      {
        key: 'stage7_done',
        summary: '算力资源分配完成',
        highlightedNodes: ['SystemAgent', 'Computing', 'ConnectionAgent'],
        systemAgentBubble: simpleBubble('SystemAgent', ['Task Finished'], 'cpSystemBubble', 'success'),
      },
    ],
    timing: [1500, 1700, 1600, 2000, 2000, 350, 350, 350, 350, 350, 350, 350, 550, 1600],
  },
  MEDIA_ESTABLISHED: {
    kicker: 'STAGE 4',
    title: '核心网：算力卸载',
    coreFunctions: ['算力入网实际应用', '网络算力节点识别标注', '标注结果回传AR眼镜'],
    defaultFlow: 'dogVision',
    phases: [
      {
        key: 'stage8_sustained_labeling',
        summary: '网络算力节点标注',
        activeFlowType: 'dogVision',
        highlightedNodes: ['RobotDog', 'UE', 'gNB', 'UPF', 'Gateway'],
        agentBubbles: [
          textBubble('Gateway', ['网络算力节点标注'], 'above'),
          textBubble('UE', ['标注结果已回传'], 'above'),
        ],
      },
    ],
    timing: [1800],
  },
}

const activeConfig = computed(() => stageConfigs[currentStage.value])
const activePhase = computed(() => activeConfig.value.phases[phaseIndex.value] || activeConfig.value.phases[0])
const identityApplicationPhases = computed(() => identityApplicationTarget.value ? buildIdentityApplicationPhases(identityApplicationTarget.value) : [])
const activeIdentityApplicationPhase = computed(() => identityApplicationTarget.value ? identityApplicationPhases.value[identityApplicationPhaseIndex.value] || null : null)
const displayedPhase = computed(() => activeIdentityApplicationPhase.value || activePhase.value)
const activeFlowType = computed(() => displayedPhase.value.activeFlowType || activeConfig.value.defaultFlow)
const activeFlow = computed(() => {
  const type = activeFlowType.value
  if (!type) return { color: '#22f5ff', lines: [] as LineConfig[] }
  return flowConfigs[type]
})
const activeFlowColor = computed(() => activeIdentityApplicationPhase.value ? '#0ea5e9' : activeFlow.value.color)
const isFinalCompletionPhase = computed(() => activeConfig.value.phases.length > 1 && phaseIndex.value === activeConfig.value.phases.length - 1 && currentStage.value !== 'INIT')
const isStage2FinalPhase = computed(() => currentStage.value === 'ACN_NETWORKING' && activePhase.value.key === 'stage4_done')
const isStage3FinalPhase = computed(() => currentStage.value === 'COMPUTING' && activePhase.value.key === 'stage7_done')
const isStage2SustainedFinal = computed(() => isStage2FinalPhase.value && !finalFlashActive.value)
const isStage3SustainedFinal = computed(() => isStage3FinalPhase.value && !finalFlashActive.value)
const isSecureDomainSustainedFinal = computed(() => isStage2SustainedFinal.value || isStage3SustainedFinal.value)
const shouldHideFinalFlash = computed(() => isFinalCompletionPhase.value && !finalFlashActive.value && !isStage2FinalPhase.value && !isStage3FinalPhase.value)
const activeLines = computed(() => {
  if (activeIdentityApplicationPhase.value) {
    return Object.prototype.hasOwnProperty.call(activeIdentityApplicationPhase.value, 'topologyLines')
      ? activeIdentityApplicationPhase.value.topologyLines || []
      : []
  }
  if (isSecureDomainSustainedFinal.value) return secureDomainSustainLines
  if (shouldHideFinalFlash.value) return []
  if (Object.prototype.hasOwnProperty.call(activePhase.value, 'topologyLines')) return activePhase.value.topologyLines || []
  if (activePhase.value.activeFlowType || activeConfig.value.defaultFlow) return activeFlow.value.lines
  return []
})
const activeLineByKey = computed(() => Object.fromEntries(activeLines.value.map((item) => [item.key, item])))
const highlightedSet = computed(() => new Set(activeIdentityApplicationPhase.value ? activeIdentityApplicationPhase.value.highlightedNodes || [] : isSecureDomainSustainedFinal.value ? ['RobotDog', 'UE', 'gNB', 'UPF'] : shouldHideFinalFlash.value ? [] : activePhase.value.highlightedNodes || []))
const taskSummary = computed(() => displayedPhase.value.summary)
const stageCaption = computed(() => `${activeConfig.value.kicker} · ${currentStage.value}`)
const showSecureDomain = computed(() => isStage2FinalPhase.value || currentStage.value === 'COMPUTING' || currentStage.value === 'MEDIA_ESTABLISHED')
const showSandboxInfo = computed(() => (currentStage.value === 'COMPUTING' && activePhase.value.key === 'stage7_done') || currentStage.value === 'MEDIA_ESTABLISHED')
const sandboxInfo = [
  { label: 'Sandbox ID', value: '7ec15b' },
  { label: 'Endpoint', value: 'https://7ec15b:8087.corenetwork.cmcc' },
  { label: 'Model', value: 'yolo8' },
  { label: 'Resource Spec', value: '4 vCPU / 16GB RAM / 1x A10 GPU' },
  { label: 'Compute Scale', value: '~125 TFLOPS (FP16 Tensor)' },
]
const positionedBubbles = computed(() => {
  if (activeIdentityApplicationPhase.value) {
    const bubbles = [
      activeIdentityApplicationPhase.value.systemAgentBubble,
      ...(activeIdentityApplicationPhase.value.agentBubbles || []),
    ].filter(Boolean) as Bubble[]
    return bubbles
      .filter((bubble) => !bubble.activeTools?.length)
      .map(positionBubble)
  }
  if (isSecureDomainSustainedFinal.value) return []
  if (shouldHideFinalFlash.value) return []
  const bubbles = [
    activePhase.value.systemAgentBubble,
    ...(activePhase.value.agentBubbles || []),
  ].filter(Boolean) as Bubble[]
  return bubbles
    .filter((bubble) => !bubble.activeTools?.length)
    .map(positionBubble)
})
const toolStates = computed<Record<string, 'idle' | 'working'>>(() => {
  const states: Record<string, 'idle' | 'working'> = {}
  if (activeIdentityApplicationPhase.value) {
    for (const bubble of activeIdentityApplicationPhase.value.agentBubbles || []) {
      for (const tool of bubble.activeTools || []) {
        states[tool] = 'working'
      }
    }
    return states
  }
  if (isSecureDomainSustainedFinal.value) return states
  if (shouldHideFinalFlash.value) return states
  for (const bubble of activePhase.value.agentBubbles || []) {
    for (const tool of bubble.activeTools || []) {
      states[tool] = 'working'
    }
  }
  return states
})
const normalizedActiveConnections = computed(() => {
  if (activeIdentityApplicationPhase.value) {
    return (activeIdentityApplicationPhase.value.activeConnections || []).map(normalizeActiveConnection)
  }
  if (isSecureDomainSustainedFinal.value) return []
  if (shouldHideFinalFlash.value) return []
  return (activePhase.value.activeConnections || []).map(normalizeActiveConnection)
})
const latencyLabels = computed(() => activeLines.value.map((item) => {
  latencyTick.value
  const connection = item.key.split('->') as ConnectionTuple
  const point = pathPoint(connection, 0.52)
  return {
    key: item.key,
    x: point.x,
    y: point.y,
    below: item.labelPosition === 'below',
    value: randomLatency(item.latencyMs),
  }
}))

function normalizeActiveConnection(item: ActiveConnection) {
  if (typeof item === 'string') {
    return { key: item, path: item.split('->') as ConnectionTuple, reverse: false }
  }
  return {
    key: item.key,
    path: (item.pathKey || item.key).split('->') as ConnectionTuple,
    reverse: Boolean(item.reverse),
  }
}

function buildIdentityApplicationPhases(target: IdentityNodeId): Phase[] {
  const sourceLine = target === 'UE' ? line('UE->gNB', 5, 9) : line('RobotDog->gNB', 4, 8)
  const sourceBubbleOffset = 8
  const sourceName = target === 'UE' ? 'AR Glasses' : 'Robot Dog'
  return [
    {
      key: `identity_${target}_source`,
      summary: '数字身份申请',
      topologyLines: [sourceLine, line('gNB->SRF', 7, 12), line('SRF->SystemAgent', 3, 6)],
      highlightedNodes: [target],
      agentBubbles: [voiceBubble(target, ['Apply for the Digital ID'], 'above', sourceBubbleOffset)],
    },
    {
      key: `identity_${target}_intent`,
      summary: '数字身份申请',
      highlightedNodes: ['SystemAgent', target],
      systemAgentBubble: simpleBubble('SystemAgent', ['收到意图：', 'Apply for the Digital ID'], 'cpSystemBubble'),
      agentBubbles: [voiceBubble(target, ['Apply for the Digital ID'], 'above', sourceBubbleOffset)],
    },
    {
      key: `identity_${target}_plan`,
      summary: '数字身份申请',
      highlightedNodes: ['SystemAgent'],
      systemAgentBubble: buildIdentityPlanBubble('working', 'pending'),
    },
    {
      key: `identity_${target}_acn_dispatch`,
      summary: '数字身份申请',
      highlightedNodes: ['SystemAgent', 'ACN'],
      activeConnections: ['SystemAgent->ACN'],
      systemAgentBubble: buildIdentityPlanBubble('working', 'pending'),
      agentBubbles: [simpleBubble('ACN', [`收到任务：${sourceName}签发数字身份`], 'left')],
    },
    {
      key: `identity_${target}_idm`,
      summary: 'IDM Tool颁发数字身份',
      highlightedNodes: ['ACN'],
      systemAgentBubble: buildIdentityPlanBubble('working', 'pending'),
      agentBubbles: [simpleBubble('ACN', ['调用IDM Tool', '颁发数字身份'], 'left'), toolBubble('ACN', ['IDM Tool'])],
    },
    {
      key: `identity_${target}_arf`,
      summary: '能力注册',
      highlightedNodes: ['ACN'],
      systemAgentBubble: buildIdentityPlanBubble('working', 'pending'),
      agentBubbles: [simpleBubble('ACN', ['调用ARF Tool', '发布能力卡片'], 'left'), toolBubble('ACN', ['ARF Tool'])],
    },
    {
      key: `identity_${target}_acn_done`,
      summary: '能力注册',
      highlightedNodes: ['SystemAgent', 'ACN'],
      activeConnections: [{ key: 'ACN->SystemAgent', pathKey: 'SystemAgent->ACN', reverse: true }],
      systemAgentBubble: buildIdentityPlanBubble('success', 'pending'),
      agentBubbles: [simpleBubble('ACN', ['完成任务：签发数字身份'], 'left', 'success')],
    },
    {
      key: `identity_${target}_connection_dispatch`,
      summary: '接入网络',
      highlightedNodes: ['SystemAgent', 'ConnectionAgent'],
      activeConnections: ['SystemAgent->ConnectionAgent'],
      systemAgentBubble: buildIdentityPlanBubble('success', 'working'),
      agentBubbles: [simpleBubble('ConnectionAgent', ['收到任务：接入网络'], 'left')],
    },
    {
      key: `identity_${target}_am`,
      summary: '接入网络',
      highlightedNodes: ['ConnectionAgent'],
      systemAgentBubble: buildIdentityPlanBubble('success', 'working'),
      agentBubbles: [simpleBubble('ConnectionAgent', ['调用AM Tool', '注册'], 'left'), toolBubble('ConnectionAgent', ['AM Tool'])],
    },
    {
      key: `identity_${target}_sm`,
      summary: '接入网络',
      highlightedNodes: ['ConnectionAgent'],
      systemAgentBubble: buildIdentityPlanBubble('success', 'working'),
      agentBubbles: [simpleBubble('ConnectionAgent', ['调用SM Tool', '建立PDU Session'], 'left'), toolBubble('ConnectionAgent', ['SM Tool'])],
    },
    {
      key: `identity_${target}_connection_done`,
      summary: '接入网络',
      highlightedNodes: ['SystemAgent', 'ConnectionAgent'],
      activeConnections: [{ key: 'ConnectionAgent->SystemAgent', pathKey: 'SystemAgent->ConnectionAgent', reverse: true }],
      systemAgentBubble: buildIdentityPlanBubble('success', 'success'),
      agentBubbles: [simpleBubble('ConnectionAgent', ['完成任务：接入网络'], 'left', 'success')],
    },
    {
      key: `identity_${target}_done`,
      summary: '数字身份申请完成',
      highlightedNodes: ['SystemAgent', target],
      activeConnections: [
        { key: 'SystemAgent->SRF', pathKey: 'SRF->SystemAgent', reverse: true },
        { key: 'SRF->gNB', pathKey: 'gNB->SRF', reverse: true },
        { key: `gNB->${target}`, pathKey: `${target}->gNB`, reverse: true },
      ],
      systemAgentBubble: simpleBubble('SystemAgent', ['Task Finished'], 'cpSystemBubble', 'success'),
    },
  ]
}

function buildIdentityPlanBubble(acnStatus: TaskStatus, connectionStatus: TaskStatus): Bubble {
  return planBubble('Apply for the Digital ID', [
    { label: 'ACN Agent：\n签发数字身份', status: acnStatus },
    { label: 'Connection Agent：\n接入网络', status: connectionStatus },
  ])
}

function line(key: string, min: number, max: number, labelPosition?: 'below'): LineConfig {
  return { key, latencyMs: { min, max }, labelPosition }
}

function randomLatency({ min, max }: LatencyRange): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function simpleBubble(targetNode: NodeId, lines: string[], placement: Bubble['placement'] = 'above', status: TaskStatus = 'working'): Bubble {
  return { targetNode, lines, placement, status }
}

function textBubble(targetNode: NodeId, lines: string[], placement: Bubble['placement'] = 'above'): Bubble {
  return { targetNode, lines, placement, status: 'success', noIcon: true }
}

function voiceBubble(targetNode: NodeId, lines: string[], placement: Bubble['placement'] = 'above', offsetX = 0): Bubble {
  return { targetNode, lines, placement, offsetX, status: 'success', variant: 'voice' }
}

function toolBubble(targetNode: NodeId, activeTools: string[]): Bubble {
  return { targetNode, activeTools, status: 'working' }
}

function planBubble(title: string, tasks: { label: string; status: TaskStatus }[]): Bubble {
  return {
    targetNode: 'SystemAgent',
    placement: 'cpPlanBox',
    variant: 'plan',
    title,
    tasks,
  }
}

function positionBubble(bubble: Bubble): Bubble {
  if (bubble.placement === 'cpPlanBox') {
    return {
      ...bubble,
      arrow: 'cp',
      style: {
        left: bubble.title?.startsWith('Compute') ? '38%' : '36%',
        top: bubble.title?.startsWith('Compute') ? '7%' : '7.5%',
        transform: 'scale(1.08)',
        transformOrigin: '0 0',
      },
    }
  }
  if (bubble.placement === 'cpSystemBubble') {
    return {
      ...bubble,
      arrow: 'cp',
      style: { left: '41%', top: '22%', transform: 'translate(0, 0)' },
    }
  }

  const target = bubble.targetNode ? nodeById[bubble.targetNode] : null
  if (!target) return bubble
  const offsetX = bubble.offsetX || 0
  const offsetY = bubble.offsetY || 0
  const base = { left: `${target.x + offsetX}%`, top: `${target.y + offsetY}%` }
  const placement = aboveIconBubbleNodes.has(target.id) && !bubble.activeTools?.length ? 'above' : bubble.placement
  if (placement === 'right') {
    return { ...bubble, style: { ...base, top: `${target.y - 5 + offsetY}%`, transform: 'translate(24%, -50%)' } }
  }
  if (placement === 'left') {
    return { ...bubble, arrow: 'right', style: { ...base, transform: 'translate(-108%, -50%)' } }
  }
  return { ...bubble, arrow: 'down', style: { ...base, top: `${target.y - 6 + offsetY}%`, transform: 'translate(-50%, -100%)' } }
}

function toolIcon(tool: string) {
  return computingToolIcons.has(tool) ? BrainCircuit : Cpu
}

function connectionKey(connection: ConnectionTuple): string {
  return `${connection[0]}->${connection[1]}`
}

function geometry([from, to]: ConnectionTuple) {
  const a = nodeById[from]
  const b = nodeById[to]
  const isArToRan = from === 'UE' && to === 'gNB'
  const start = from === 'RobotDog' && to === 'gNB'
    ? { x: a.x + 6, y: a.y - 2 }
    : isArToRan
      ? { x: a.x + 3.7, y: a.y - 6.9 }
      : { x: a.x, y: a.y }
  const end = isArToRan ? { x: b.x - 2.4, y: b.y + 2.9 } : { x: b.x, y: b.y }
  const cx = (start.x + end.x) / 2
  const cy = isArToRan ? start.y - 8 : Math.min(start.y, end.y) - 10
  return { start, control: { x: cx, y: cy }, end }
}

function pathFor(connection: ConnectionTuple): string {
  const { start, control, end } = geometry(connection)
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`
}

function pathPoint(connection: ConnectionTuple, t = 0.5) {
  const { start, control, end } = geometry(connection)
  const inverse = 1 - t
  return {
    x: (inverse ** 2 * start.x) + (2 * inverse * t * control.x) + (t ** 2 * end.x),
    y: (inverse ** 2 * start.y) + (2 * inverse * t * control.y) + (t ** 2 * end.y),
  }
}

function normalizeStage(value: string): StageKey {
  if (value === 'ACN_COMPLETE') return 'ACN_NETWORKING'
  if (value === 'SANDBOX_UP') return 'COMPUTING'
  if (value === 'ACN_NETWORKING' || value === 'COMPUTING' || value === 'MEDIA_ESTABLISHED') return value
  return 'INIT'
}

function enqueueIdentityApplication(target: IdentityNodeId) {
  if (identityApplicationTarget.value === target || identityApplicationQueue.includes(target)) return
  identityApplicationQueue.push(target)
  if (!identityApplicationTarget.value) {
    startNextIdentityApplication()
  }
}

function startNextIdentityApplication() {
  const target = identityApplicationQueue.shift()
  if (!target) {
    identityApplicationTarget.value = null
    identityApplicationPhaseIndex.value = 0
    return
  }

  identityApplicationTarget.value = target
  identityApplicationPhaseIndex.value = 0
  scheduleNextIdentityApplicationPhase()
}

function scheduleNextIdentityApplicationPhase() {
  if (identityApplicationTimer) clearTimeout(identityApplicationTimer)
  if (!identityApplicationTarget.value) return

  const timing = [1200, 2000, 2000, 350, 300, 300, 300, 350, 300, 300, 300, 1200]
  const phases = identityApplicationPhases.value
  const delay = timing[identityApplicationPhaseIndex.value] || 900

  identityApplicationTimer = setTimeout(() => {
    if (identityApplicationPhaseIndex.value >= phases.length - 1) {
      const completedTarget = identityApplicationTarget.value
      if (completedTarget && digitalIdentityVisibility.value[completedTarget]) {
        digitalIdentityDisplayReady.value = {
          ...digitalIdentityDisplayReady.value,
          [completedTarget]: true,
        }
      }
      identityApplicationTarget.value = null
      identityApplicationPhaseIndex.value = 0
      startNextIdentityApplication()
      return
    }

    identityApplicationPhaseIndex.value += 1
    scheduleNextIdentityApplicationPhase()
  }, delay)
}

function cancelIdentityApplication(target?: IdentityNodeId) {
  for (let index = identityApplicationQueue.length - 1; index >= 0; index -= 1) {
    if (!target || identityApplicationQueue[index] === target) {
      identityApplicationQueue.splice(index, 1)
    }
  }

  if (!target || identityApplicationTarget.value === target) {
    if (identityApplicationTimer) clearTimeout(identityApplicationTimer)
    identityApplicationTimer = null
    identityApplicationTarget.value = null
    identityApplicationPhaseIndex.value = 0
    startNextIdentityApplication()
  }
}

async function pollDigitalIdentityVisibility() {
  try {
    const url = backendUrl('/api/v1/digital-identity/visibility')
    const data = await $fetch<{
      status: string
      digital_identity_visibility?: Record<string, boolean>
    }>(url)
    if (data?.status !== 'SUCCESS') return
    const nextVisibility: Record<IdentityNodeId, boolean> = {
      RobotDog: Boolean(data.digital_identity_visibility?.RobotDog),
      UE: Boolean(data.digital_identity_visibility?.UE),
    }

    if (identityVisibilityInitialized.value) {
      for (const nodeId of identityNodeIds) {
        if (!previousIdentityVisibility.value[nodeId] && nextVisibility[nodeId]) {
          digitalIdentityDisplayReady.value = {
            ...digitalIdentityDisplayReady.value,
            [nodeId]: false,
          }
          enqueueIdentityApplication(nodeId)
        }
        if (previousIdentityVisibility.value[nodeId] && !nextVisibility[nodeId]) {
          digitalIdentityDisplayReady.value = {
            ...digitalIdentityDisplayReady.value,
            [nodeId]: false,
          }
          cancelIdentityApplication(nodeId)
        }
      }
    } else {
      digitalIdentityDisplayReady.value = { ...nextVisibility }
      identityVisibilityInitialized.value = true
    }

    digitalIdentityVisibility.value = nextVisibility
    previousIdentityVisibility.value = { ...nextVisibility }

    if (hoveredIdentityNode.value && !isDigitalIdentityVisible(hoveredIdentityNode.value)) {
      hoveredIdentityNode.value = null
    }
  } catch {
    digitalIdentityVisibility.value = { RobotDog: false, UE: false }
    digitalIdentityDisplayReady.value = { RobotDog: false, UE: false }
    previousIdentityVisibility.value = { RobotDog: false, UE: false }
    identityVisibilityInitialized.value = false
    cancelIdentityApplication()
    hoveredIdentityNode.value = null
  }
}

async function pollStage() {
  try {
    const url = backendUrl('/api/v1/system/topology/stage')
    const data = await traceCall('stage', url, () =>
      $fetch<{ status: string; current_stage: string }>(url)
    )
    if (data?.status !== 'SUCCESS') return
    const next = normalizeStage(data.current_stage)
    sharedSystemStage.value = next
    if (next !== currentStage.value) {
      currentStage.value = next
      phaseIndex.value = 0
    }
  } catch {
    // keep last known visual state
  }
}

function scheduleNextPhase() {
  if (phaseTimer) clearTimeout(phaseTimer)
  const phases = activeConfig.value.phases
  if (phases.length <= 1) return
  if (phaseIndex.value >= phases.length - 1) return
  const delay = activeConfig.value.timing[phaseIndex.value] || 1300
  phaseTimer = setTimeout(() => {
    phaseIndex.value = Math.min(phaseIndex.value + 1, phases.length - 1)
  }, delay)
}

function scheduleFinalFlash() {
  if (finalFlashTimer) clearTimeout(finalFlashTimer)
  finalFlashActive.value = true
  if (!isFinalCompletionPhase.value) return
  finalFlashTimer = setTimeout(() => {
    finalFlashActive.value = false
  }, 1000)
}

watch([currentStage, phaseIndex], () => {
  scheduleNextPhase()
  scheduleFinalFlash()
})

onMounted(() => {
  pollStage()
  pollDigitalIdentityVisibility()
  pollTimer = setInterval(pollStage, 2000)
  identityVisibilityTimer = setInterval(pollDigitalIdentityVisibility, 1000)
  latencyTimer = setInterval(() => {
    latencyTick.value += 1
  }, 1200)
  scheduleNextPhase()
  scheduleFinalFlash()
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (identityVisibilityTimer) clearInterval(identityVisibilityTimer)
  if (phaseTimer) clearTimeout(phaseTimer)
  if (latencyTimer) clearInterval(latencyTimer)
  if (finalFlashTimer) clearTimeout(finalFlashTimer)
  if (identityApplicationTimer) clearTimeout(identityApplicationTimer)
})
</script>

<style scoped>
.mbbf-panel {
  background: #07111f;
  border-color: rgba(59, 130, 246, 0.35);
  color: #dbeafe;
}

.mbbf-header {
  background: rgba(2, 6, 23, 0.82);
  border-color: rgba(59, 130, 246, 0.28);
  color: #dbeafe;
}

.mbbf-stage-chip {
  border: 1px solid rgba(125, 211, 252, 0.34);
  border-radius: 999px;
  padding: 4px 10px;
  color: #a5f3fc;
  font-family: "IBM Plex Mono", monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  background: rgba(8, 47, 73, 0.44);
}

.mbbf-shell {
  position: relative;
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 8px;
  margin: 12px;
  padding: 14px;
  background: #07111f;
  box-shadow: 0 0 22px rgba(0, 0, 0, 0.35);
}

.mbbf-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: #60a5fa;
  pointer-events: none;
}

.top-left { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; }
.top-right { top: 0; right: 0; border-top: 2px solid; border-right: 2px solid; }
.bottom-left { bottom: 0; left: 0; border-bottom: 2px solid; border-left: 2px solid; }
.bottom-right { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; }

.mbbf-title {
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 6px;
}

.mbbf-title-kicker {
  color: #67e8f9;
  font-family: "IBM Plex Mono", monospace;
  font-size: 11px;
  font-weight: 900;
}

.mbbf-title h2 {
  margin: 0;
  color: #dbeafe;
  font-size: 19px;
  font-weight: 900;
  letter-spacing: 0;
}

.mbbf-canvas {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid rgba(30, 64, 175, 0.32);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.28);
}

.mbbf-zone {
  position: absolute;
  z-index: 1;
  border: 2px dashed;
  border-radius: 8px;
  pointer-events: none;
}

.mbbf-zone span {
  position: absolute;
  border: 1px solid;
  border-radius: 6px;
  padding: 4px 10px;
  background: rgba(2, 6, 23, 0.92);
  font-size: 16px;
  font-weight: 900;
  line-height: 1;
}

.zone-cp {
  left: 32%;
  top: 1%;
  width: 66%;
  height: 60%;
  border-color: rgba(253, 186, 116, 0.9);
  background: rgba(249, 115, 22, 0.08);
  box-shadow: 0 0 22px rgba(251, 146, 60, 0.28);
}
.zone-cp span {
  left: 8px;
  top: 8px;
  color: #ffedd5;
  border-color: rgba(254, 215, 170, 0.8);
}
.zone-up {
  left: 32%;
  top: 63%;
  width: 39%;
  height: 36%;
  border-color: rgba(110, 231, 183, 0.9);
  background: rgba(16, 185, 129, 0.08);
  box-shadow: 0 0 22px rgba(16, 185, 129, 0.25);
}
.zone-up span {
  bottom: 8px;
  left: 8px;
  color: #d1fae5;
  border-color: rgba(167, 243, 208, 0.8);
}

.secure-domain-box {
  pointer-events: none;
  position: absolute;
  left: 1.2%;
  top: 15.5%;
  z-index: 14;
  width: 15.6%;
  height: 74%;
  border: 2px dashed rgba(52, 211, 153, 0.82);
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.08);
  box-shadow: inset 0 0 20px rgba(52, 211, 153, 0.12), 0 0 18px rgba(52, 211, 153, 0.14);
}

.secure-domain-box span {
  position: absolute;
  left: 50%;
  top: -14px;
  transform: translateX(-50%);
  border: 1px solid rgba(52, 211, 153, 0.52);
  border-radius: 6px;
  padding: 5px 11px;
  background: rgba(2, 6, 23, 0.9);
  color: #bbf7d0;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.18);
}
.zone-ott {
  left: 73%;
  top: 63%;
  width: 25%;
  height: 36%;
  border-color: rgba(125, 211, 252, 0.85);
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.18);
}
.zone-ott span {
  right: 8px;
  bottom: 8px;
  color: #e0f2fe;
  border-color: rgba(186, 230, 253, 0.7);
}

.task-summary {
  position: absolute;
  left: 2%;
  top: 2%;
  z-index: 28;
  display: flex;
  align-items: stretch;
  max-width: 28%;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.84);
  color: #ecfeff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.16);
}

.task-summary-bar {
  width: 4px;
  background: #67e8f9;
}

.task-summary span:last-child {
  padding: 8px 10px;
}

.sandbox-info-panel {
  position: absolute;
  left: 73%;
  top: 63%;
  z-index: 27;
  box-sizing: border-box;
  width: 25%;
  height: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 8px;
  padding: 12px 12px 10px;
  background: rgba(2, 6, 23, 0.88);
  color: #ecfeff;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.22), inset 0 0 16px rgba(14, 165, 233, 0.08);
}

.sandbox-info-border {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.sandbox-info-border-line {
  fill: none;
  stroke: rgba(125, 211, 252, 0.76);
  stroke-width: 0.62;
  stroke-dasharray: 3 3;
  stroke-linecap: round;
  animation: sandbox-border-flow 5.2s linear infinite;
  filter: drop-shadow(0 0 3px rgba(14, 165, 233, 0.22));
}

.sandbox-info-title {
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
  color: #bae6fd;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
}

.sandbox-info-grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  border-top: 1px solid rgba(125, 211, 252, 0.16);
}

.sandbox-info-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-height: 24px;
  border-bottom: 1px solid rgba(125, 211, 252, 0.12);
  font-size: 11.5px;
  line-height: 1.28;
}

.sandbox-info-row span {
  color: rgba(186, 230, 253, 0.72);
  font-weight: 700;
  white-space: nowrap;
}

.sandbox-info-row strong {
  min-width: 0;
  color: #f8fafc;
  font-family: "IBM Plex Mono", monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.mbbf-lines,
.active-lines {
  position: absolute;
  inset: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.active-lines {
  z-index: 19;
  pointer-events: none;
}

.latency-layer {
  position: absolute;
  inset: 0;
  z-index: 18;
  pointer-events: none;
}

.latency-badge {
  position: absolute;
  border: 1px solid rgba(186, 230, 253, 0.7);
  border-radius: 4px;
  padding: 4px 7px;
  background: rgba(2, 6, 23, 0.95);
  color: #ecfeff;
  font-family: "IBM Plex Mono", monospace;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
  transform: translateX(-50%);
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.34);
}

.latency-badge.above {
  transform: translate(-50%, -100%);
}

.tool-panel {
  position: absolute;
  left: 77.2%;
  top: 2%;
  z-index: 26;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 20.2%;
  height: 57.5%;
  overflow: hidden;
  border: 1px solid rgba(186, 230, 253, 0.28);
  border-radius: 8px;
  padding: 8px;
  background: rgba(2, 6, 23, 0.42);
  color: #dbeafe;
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 22px rgba(34, 211, 238, 0.06), 0 0 22px rgba(15, 23, 42, 0.32);
}

.tool-group {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.tool-group:first-child {
  flex: 6 1 0;
}

.tool-group:last-child {
  flex: 2.2 1 0;
}

.tool-group + .tool-group {
  border-top: 1px solid rgba(186, 230, 253, 0.16);
  padding-top: 8px;
}

.tool-group-title {
  padding: 0 6px 6px;
  color: #ecfeff;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
}

.tool-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 5px;
}

.tool-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
  font-size: 14px;
  line-height: 1;
}

.tool-name {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border: 1px solid rgba(186, 230, 253, 0.18);
  border-radius: 6px;
  padding: 5px 7px;
  background: rgba(15, 23, 42, 0.2);
  color: rgba(239, 246, 255, 0.95);
  font-weight: 900;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tool-row.working .tool-name {
  border-color: rgba(253, 230, 138, 0.58);
  background: rgba(252, 211, 77, 0.16);
  color: #fef3c7;
  font-weight: 900;
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.24);
}

.tool-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: rgba(165, 243, 252, 0.85);
}

.tool-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #bfdbfe;
  font-family: "IBM Plex Mono", monospace;
  font-size: 10px;
  font-weight: 800;
}

.tool-row.working .tool-state {
  color: #fde68a;
}

.tool-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.75);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.35);
}

.tool-row.working .tool-dot {
  background: #fcd34d;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.85);
}

.node-layer {
  position: absolute;
  inset: 0;
  z-index: 20;
}

.topology-node {
  position: absolute;
  transform: translate(-50%, -50%);
  user-select: none;
}

.topology-node.identity-hovered {
  z-index: 45;
}

.node-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-glow {
  position: absolute;
  top: 64%;
  width: 80px;
  height: 20px;
  border-radius: 999px;
  opacity: 0.34;
  filter: blur(12px);
}

.node-image {
  position: relative;
  z-index: 10;
  object-fit: contain;
  transform: translateY(-4px);
  filter: drop-shadow(0 12px 14px rgba(14, 116, 144, 0.18));
}

.node-sm { width: 61px; }
.node-md { width: 69px; }
.node-lg { width: 83px; }
.node-xl { width: 94px; }

.node-label {
  position: relative;
  z-index: 20;
  margin-top: 4px;
  border: 1px solid rgba(100, 116, 139, 0.45);
  border-radius: 4px;
  padding: 4px 9px;
  background: rgba(2, 6, 23, 0.85);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.12;
  text-align: center;
  white-space: pre-line;
  backdrop-filter: blur(8px);
}

.node-label.tight-label {
  margin-top: 2px;
}

.node-label.low-label {
  position: absolute;
  top: calc(100% + 2px);
  margin-top: 0;
}

.node-label.highlighted {
  border-color: rgba(186, 230, 253, 0.8);
  background: rgba(8, 145, 178, 0.32);
  color: #ecfeff;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.32);
}

.digital-identity-card {
  pointer-events: none;
  position: absolute;
  left: calc(100% + 10px);
  top: -76px;
  z-index: 50;
  width: 214px;
}

.digital-identity-card.ar-identity-card {
  top: -54px;
}

.identity-card-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(14, 165, 233, 0.28);
  border-radius: 8px;
  padding: 10px 11px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12), inset 0 0 16px rgba(14, 165, 233, 0.05);
  backdrop-filter: blur(10px);
}

.identity-card-panel::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  pointer-events: none;
  background: linear-gradient(180deg, #0ea5e9, #10b981);
}

.identity-title {
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(14, 165, 233, 0.14);
  padding-bottom: 5px;
  color: #075985;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.identity-did {
  margin-bottom: 7px;
  color: #0f172a;
  font-family: "IBM Plex Mono", monospace;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.identity-detail {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 6px;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.2;
}

.identity-detail span,
.identity-status span {
  color: #0369a1;
}

.identity-detail strong {
  color: #0f766e;
  font-weight: 900;
}

.identity-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
}

.identity-status strong {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #047857;
  font-weight: 900;
}

.identity-status i {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
}

.agent-bubble {
  position: absolute;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 205px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(2, 6, 23, 0.88);
  color: #dbeafe;
  font-size: 10px;
  font-weight: 900;
  line-height: 1.15;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.18);
}

.agent-bubble.voice-bubble {
  border-color: rgba(186, 230, 253, 0.86);
  background: rgba(8, 51, 68, 0.96);
  color: #ecfeff;
  box-shadow: 0 0 26px rgba(34, 211, 238, 0.42), inset 0 0 16px rgba(34, 211, 238, 0.16);
}

.agent-bubble.plan-bubble {
  display: block;
  width: 190px;
  border-radius: 8px;
  border-color: rgba(186, 230, 253, 0.78);
  background: rgba(2, 6, 23, 0.96);
  color: #eff6ff;
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.28), inset 0 0 18px rgba(34, 211, 238, 0.12);
}

.bubble-lines {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.bubble-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.success-icon {
  color: #6ee7b7;
}

.pending-icon {
  color: rgba(148, 163, 184, 0.8);
}

.spin-icon {
  color: #dbeafe;
  animation: spin 0.9s linear infinite;
}

.pulse-icon {
  color: #ecfeff;
  animation: pulse 1.1s ease-in-out infinite;
}

.plan-heading {
  color: rgba(165, 243, 252, 0.86);
  font-size: 10px;
  font-weight: 900;
}

.plan-divider {
  margin: 7px 0;
  border-top: 1px dashed rgba(103, 232, 249, 0.55);
}

.plan-tasks {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 6px;
}

.plan-task {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  line-height: 1.12;
}

.bubble-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(2, 6, 23, 0.88);
}

.bubble-arrow.left {
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-bottom: 1px solid rgba(34, 211, 238, 0.45);
  border-left: 1px solid rgba(34, 211, 238, 0.45);
}

.bubble-arrow.right {
  right: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-top: 1px solid rgba(34, 211, 238, 0.45);
  border-right: 1px solid rgba(34, 211, 238, 0.45);
}

.bubble-arrow.down,
.bubble-arrow.cp {
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%) rotate(45deg);
  border-bottom: 1px solid rgba(34, 211, 238, 0.45);
  border-right: 1px solid rgba(34, 211, 238, 0.45);
}

.core-functions {
  flex-shrink: 0;
  margin-top: 8px;
  border-top: 1px solid rgba(59, 130, 246, 0.25);
  padding-top: 8px;
}

.core-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.core-heading h3 {
  margin: 0;
  color: #dbeafe;
  font-size: 15px;
  font-weight: 900;
}

.core-heading span {
  color: #67e8f9;
  font-family: "IBM Plex Mono", monospace;
  font-size: 10px;
  font-weight: 800;
}

.core-grid {
  display: grid;
  gap: 8px;
}

.core-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 4px;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.22);
  color: rgba(219, 234, 254, 0.92);
  font-size: 13px;
  font-weight: 800;
}

.core-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: #67e8f9;
}

.line-pulse {
  animation: topology-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.flow-line {
  animation: topology-flow 1.3s linear infinite;
}

.flow-line-fast {
  animation: topology-flow 1.05s linear infinite;
}

.flow-line-fast.reverse {
  animation-direction: reverse;
}

@keyframes topology-flow {
  0% { stroke-dashoffset: 12; }
  100% { stroke-dashoffset: 0; }
}

@keyframes topology-pulse {
  50% { opacity: 0.5; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes sandbox-border-flow {
  to { stroke-dashoffset: -72; }
}

@media (max-width: 1280px) {
  .node-sm { width: 53px; }
  .node-md { width: 59px; }
  .node-lg { width: 70px; }
  .node-xl { width: 82px; }
  .tool-group-title { font-size: 12px; }
  .tool-row { font-size: 12px; }
  .tool-state { font-size: 9.5px; }
  .core-item { font-size: 12px; padding: 7px 8px; }
}

/* CMCC light theme adaptation */
.mbbf-panel {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.mbbf-header {
  background: rgba(255, 255, 255, 0.88);
  border-color: #e2e8f0;
  color: #0f172a;
}

.mbbf-stage-chip {
  border-color: rgba(0, 133, 208, 0.24);
  color: #0369a1;
  background: rgba(224, 242, 254, 0.72);
}

.mbbf-shell {
  border-color: rgba(148, 163, 184, 0.34);
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.82), 0 10px 24px rgba(15, 23, 42, 0.08);
}

.mbbf-corner {
  border-color: #0ea5e9;
}

.mbbf-title-kicker {
  color: #0284c7;
}

.mbbf-title h2 {
  color: #0f172a;
}

.mbbf-canvas {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.72);
}

.zone-cp {
  border-color: rgba(251, 146, 60, 0.68);
  background: rgba(255, 247, 237, 0.7);
  box-shadow: 0 0 18px rgba(251, 146, 60, 0.16);
}

.zone-cp span {
  color: #9a3412;
  border-color: rgba(251, 146, 60, 0.42);
  background: rgba(255, 255, 255, 0.94);
}

.zone-up {
  border-color: rgba(16, 185, 129, 0.58);
  background: rgba(236, 253, 245, 0.72);
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.14);
}

.zone-up span {
  color: #047857;
  border-color: rgba(16, 185, 129, 0.38);
  background: rgba(255, 255, 255, 0.94);
}

.secure-domain-box {
  border-color: rgba(16, 185, 129, 0.72);
  background: rgba(236, 253, 245, 0.58);
  box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.12), 0 8px 18px rgba(16, 185, 129, 0.12);
}

.secure-domain-box span {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(255, 255, 255, 0.96);
  color: #047857;
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.14);
}

.task-summary {
  border-color: rgba(14, 165, 233, 0.28);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.12);
}

.task-summary-bar {
  background: #0ea5e9;
}

.sandbox-info-panel {
  border-color: rgba(14, 165, 233, 0.16);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.1), inset 0 0 18px rgba(14, 165, 233, 0.06);
}

.sandbox-info-title {
  color: #075985;
  font-weight: 800;
}

.sandbox-info-border-line {
  stroke: rgba(14, 165, 233, 0.68);
  filter: drop-shadow(0 0 3px rgba(14, 165, 233, 0.18));
}

.sandbox-info-grid {
  border-top-color: rgba(14, 165, 233, 0.16);
}

.sandbox-info-row {
  border-bottom-color: rgba(14, 165, 233, 0.12);
}

.sandbox-info-row span {
  color: #0369a1;
  font-weight: 700;
}

.sandbox-info-row strong {
  color: #0f172a;
  font-weight: 700;
}

.latency-badge {
  border-color: rgba(14, 165, 233, 0.32);
  background: rgba(255, 255, 255, 0.96);
  color: #0369a1;
  box-shadow: 0 6px 14px rgba(14, 165, 233, 0.16);
}

.tool-panel {
  border-color: rgba(14, 165, 233, 0.18);
  background: rgba(255, 255, 255, 0.78);
  color: #0f172a;
  box-shadow: inset 0 0 18px rgba(14, 165, 233, 0.04), 0 10px 22px rgba(15, 23, 42, 0.08);
}

.tool-group + .tool-group {
  border-top-color: rgba(14, 165, 233, 0.14);
}

.tool-group-title {
  color: #075985;
  font-size: 14px;
  font-weight: 900;
}

.tool-name {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(248, 250, 252, 0.82);
  color: #0f172a;
  font-weight: 900;
}

.tool-row.working .tool-name {
  border-color: rgba(245, 158, 11, 0.42);
  background: rgba(254, 243, 199, 0.76);
  color: #92400e;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.14);
}

.tool-icon {
  color: #0284c7;
}

.tool-state {
  color: #475569;
}

.tool-row.working .tool-state {
  color: #b45309;
}

.tool-dot {
  background: #38bdf8;
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.3);
}

.tool-row.working .tool-dot {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.45);
}

.node-label {
  border-color: rgba(148, 163, 184, 0.34);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-weight: 800;
  box-shadow: 0 8px 14px rgba(15, 23, 42, 0.08);
}

.node-label.highlighted {
  border-color: rgba(14, 165, 233, 0.54);
  background: rgba(224, 242, 254, 0.9);
  color: #075985;
  box-shadow: 0 0 14px rgba(14, 165, 233, 0.2);
}

.agent-bubble {
  border-color: rgba(14, 165, 233, 0.28);
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.12);
}

.agent-bubble.voice-bubble {
  border-color: rgba(14, 165, 233, 0.48);
  background: rgba(240, 249, 255, 0.96);
  color: #075985;
  box-shadow: 0 10px 22px rgba(14, 165, 233, 0.16), inset 0 0 14px rgba(14, 165, 233, 0.08);
}

.agent-bubble.plan-bubble {
  border-color: rgba(14, 165, 233, 0.36);
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  box-shadow: 0 12px 28px rgba(14, 165, 233, 0.14), inset 0 0 16px rgba(14, 165, 233, 0.05);
}

.plan-heading {
  color: #0369a1;
}

.plan-divider {
  border-top-color: rgba(14, 165, 233, 0.28);
}

.spin-icon {
  color: #0284c7;
}

.pulse-icon {
  color: #0284c7;
}

.bubble-arrow {
  background: rgba(255, 255, 255, 0.94);
}

.bubble-arrow.left,
.bubble-arrow.right,
.bubble-arrow.down,
.bubble-arrow.cp {
  border-color: rgba(14, 165, 233, 0.28);
}

.core-functions {
  border-top-color: rgba(148, 163, 184, 0.24);
}

.core-heading h3 {
  color: #0f172a;
}

.core-heading span {
  color: #0284c7;
}

.core-item {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.76);
  color: #1e293b;
}

.core-icon {
  color: #0284c7;
}
</style>
