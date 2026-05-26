import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Wifi, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Network, 
  ArrowRightCircle, 
  Cloud, 
  Globe, 
  Share2,
  LoaderCircle,
  CircleDot,
  Cpu
} from 'lucide-react';
import { getTopologyFlowConfig } from './topologyFlowConfig';
import computingNodeImage from './Computing_Node.png';
import upfImage from './upfnew.png';

const STAGE4_WORKFLOW = [
  { label: "签约数据更新:", value: "Pending", status: "pending" },
  { label: "下发域接入凭证:", value: "Pending", status: "pending" },
  { label: "下发UPF配置:", value: "Pending", status: "pending" },
];

const STAGE6_WORKFLOW = [
  {
    label: "ID寻址路由:",
    flowType: "a2aGateway",
    bubble: {
      lines: ["ID寻址路由"],
      className: "left-[84%] top-[55%]",
    },
  },
  {
    label: "身份可信认证:",
    flowType: "a2aTrust",
    bubble: {
      lines: ["身份可信认证"],
    },
  },
  {
    label: "Agent协议转换:",
    flowType: "a2aGateway",
    bubble: {
      lines: ["Agent协议转换"],
      className: "left-[84%] top-[55%]",
    },
  },
];

const STAGE7_WORKFLOW = [
  {
    label: "创建算力会话:",
    flowType: "computeSandbox",
    bubble: {
      lines: ["创建算力会话"],
      className: "left-[82%] top-[13%]",
    },
  },
  {
    label: "分配算力资源:",
    flowType: "computeSandbox",
    bubble: {
      lines: ["分配算力资源"],
      className: "left-[82%] top-[13%]",
    },
  },
];

const STAGE2_WORKFLOW = [
  {
    label: "System Agent路由请求:",
    bubble: {
      lines: ["解析用户意图", "路由请求"],
      className: "left-[40%] top-[13%]",
      arrow: "down",
    },
  },
  {
    label: "IDM颁发数字身份:",
    bubble: {
      lines: ["调用IDM Tool:", "颁发数字身份"],
    },
  },
  {
    label: "能力注册:",
    bubble: {
      lines: ["调用ARF Tool", "发布能力卡片"],
    },
  },
  {
    label: "接入网络:",
    bubble: {
      lines: ["接入网络"],
      className: "left-[8%] top-[3%]",
      arrow: "down",
    },
  },
];

const BASE_AGENT_LOGS = [
  ["10:31:00", "System Agent", "初始化完成"],
  ["10:31:01", "System Agent", "Skill加载完成"],
  ["10:31:02", "Computing Agent", "初始化完成"],
  ["10:31:03", "Computing Agent", "Skill加载完成"],
  ["10:31:04", "ACN Agent", "初始化完成"],
  ["10:31:05", "ACN Agent", "加载完成"],
];

const STAGE2_COMPLETION_LOGS = [
  ["10:31:10", "ACN Agent", "调用IDMTool鉴权6G接入权限"],
  ["10:31:11", "ACN Agent", "调用ARF完成智能体三方能力认证"],
  ["10:31:12", "ACN Agent", "发布智能体卡片"],
];

const STAGE6_LOGS = [
  ["10:31:16", "Agent GW", "根据ID寻址商家机器人"],
  ["10:31:17", "ACN Agent", "校验对端身份凭证"],
  ["10:31:18", "Agent GW", "建立任务级会话"],
  ["10:31:19", "Agent GW", "转换对端Agent协议"],
];

const STAGE7_LOGS = [
  ["10:31:20", "Computing Agent", "创建算力会话"],
  ["10:31:21", "Computing Agent", "分配算力资源"],
];

const STAGE_ANIMATION_TIMING = {
  2: { workingMs: 560, successMs: 180 },
  4: { workingMs: 500, successMs: 150 },
  6: { workingMs: 800, successMs: 180 },
  7: { workingMs: 1280, successMs: 180 },
};

const STAGE_CONFIG = {
  1: {
    leftPanelTitle: "机器狗接入",
    activeFlowType: null,
    showRegisteredDevice: false,
    coreFunctions: [
      "统一数字身份管理",
      "通信凭证签发",
      "可信接入控制",
      "智能体发布发现",
    ],
    statusTitle: "用户状态",
    statusRows: [
      { label: "凭证:", value: "未颁发", status: "pending" },
      { label: "机器狗ID:", value: "None", status: "pending", isMono: true },
    ],
    userStatus: {
      credential: { value: "未颁发", status: "pending" },
      robotDogId: { value: "None", status: "pending" },
    },
    logs: BASE_AGENT_LOGS,
    workflow: [
      { label: "System Agent路由请求:", value: "Pending", status: "pending" },
      { label: "IDM颁发数字身份:", value: "Pending", status: "pending" },
      { label: "接入网络:", value: "Pending", status: "pending" },
      { label: "能力注册:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "申请Digital ID", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "02", icon: Globe, title: "L3Networking", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "03", icon: Share2, title: "A2A认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "创建智算沙箱", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "05", icon: Cloud, title: "算力卸载", subtitle: "即将开始 / Upcoming", status: "pending" },
    ],
  },
  2: {
    leftPanelTitle: "机器狗接入",
    activeFlowType: "auth",
    showRegisteredDevice: false,
    coreFunctions: [
      "统一数字身份管理",
      "通信凭证签发",
      "可信接入控制",
      "智能体发布发现",
    ],
    statusTitle: "用户状态",
    statusRows: [
      { label: "凭证:", value: "未颁发", status: "pending" },
      { label: "机器狗ID:", value: "None", status: "pending", isMono: true },
    ],
    userStatus: {
      credential: { value: "未颁发", status: "pending" },
      robotDogId: { value: "None", status: "pending" },
    },
    logs: [
      ...BASE_AGENT_LOGS,
      ["10:31:06", "System Agent", "解析用户意图"],
      ["10:31:07", "System Agent", "请求路由至ACN Agent"],
      ["10:31:08", "ACN Agent", "接受用户请求"],
      ["10:31:09", "ACN Agent", "调用IDMTool生成DigitalID"],
    ],
    workflow: [
      { label: "System Agent路由请求:", value: "Working", status: "working" },
      { label: "IDM颁发数字身份:", value: "Pending", status: "pending" },
      { label: "能力注册:", value: "Pending", status: "pending" },
      { label: "接入网络:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "申请Digital ID", subtitle: "进行中 / Working", status: "working" },
      { id: "02", icon: Globe, title: "L3Networking", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "03", icon: Share2, title: "A2A认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "创建智算沙箱", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "05", icon: Cloud, title: "算力卸载", subtitle: "即将开始 / Upcoming", status: "pending" },
    ],
  },
  4: {
    leftPanelTitle: "家庭域创建",
    topologyTitle: "6G核心网：L3动态组网",
    activeFlowType: "domain",
    showRegisteredDevice: true,
    hideDeviceArrow: true,
    showHomeDomainDevice: true,
    coreFunctions: [
      "L3按需组网",
      "安全接入控制",
      "域内连接最优选路",
    ],
    statusTitle: "端侧状态",
    statusRows: [
      { label: "端侧带宽:", value: "5Mbps", status: "success" },
      { label: "平均时延:", value: "10ms", status: "success" },
    ],
    logs: [
      ...BASE_AGENT_LOGS,
      ["10:31:06", "System Agent", "解析用户意图"],
      ["10:31:07", "System Agent", "请求路由至ACN Agent"],
      ["10:31:08", "ACN Agent", "接受用户请求"],
      ["10:31:09", "ACN Agent", "调用IDMTool生成DigitalID"],
      ["10:31:10", "ACN Agent", "调用IDMTool鉴权6G接入权限"],
      ["10:31:11", "ACN Agent", "调用ARF完成智能体三方能力认证"],
      ["10:31:12", "ACN Agent", "发布智能体卡片"],
      ["10:31:13", "ACN Agent", "调用IDM Tool下发域接入凭证"],
      ["10:31:14", "ACN Agent", "调用SMTool下发UPF配置"],
      ["10:31:15", "ACN Agent", "实时探测最优路径"],
    ],
    workflow: [
      { label: "签约数据更新:", value: "Working", status: "working" },
      { label: "下发域接入凭证:", value: "Pending", status: "pending" },
      { label: "下发UPF配置:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "申请Digital ID", subtitle: "已完成 / Completed", status: "success" },
      { id: "02", icon: Globe, title: "L3Networking", subtitle: "进行中 / Working", status: "working" },
      { id: "03", icon: Share2, title: "A2A认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "创建智算沙箱", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "05", icon: Cloud, title: "算力卸载", subtitle: "即将开始 / Upcoming", status: "pending" },
    ],
  },
};

STAGE_CONFIG[5] = {
  ...STAGE_CONFIG[4],
  leftPanelTitle: "机器狗共享实时视野",
  activeFlowType: "dogVision",
  showDogVision: true,
  showHomeDomainDevice: false,
  showRegisteredDevice: false,
  workflow: [
    { label: "签约数据更新:", value: "Done", status: "success" },
    { label: "下发域接入凭证:", value: "Done", status: "success" },
    { label: "下发UPF配置:", value: "Done", status: "success" },
  ],
  steps: STAGE_CONFIG[4].steps.map((step) => (
    step.id === "02"
      ? { ...step, subtitle: "已完成 / Completed", status: "success" }
      : step
  )),
};

STAGE_CONFIG[6] = {
  ...STAGE_CONFIG[5],
  topologyTitle: "6G核心网：Agent GW跨域互联",
  activeFlowType: "a2aGateway",
  coreFunctions: [
    "ID寻址路由",
    "可信身份背书",
    "Agent协议转换",
  ],
  logs: [
    ...STAGE_CONFIG[5].logs,
    ...STAGE6_LOGS,
  ],
  workflow: [
    { label: "ID寻址路由:", value: "Working", status: "working" },
    { label: "身份可信认证:", value: "Pending", status: "pending" },
    { label: "Agent协议转换:", value: "Pending", status: "pending" },
  ],
  steps: STAGE_CONFIG[5].steps.map((step) => (
    step.id === "03"
      ? { ...step, subtitle: "进行中 / Working", status: "working" }
      : step
  )),
};

STAGE_CONFIG[7] = {
  ...STAGE_CONFIG[6],
  topologyTitle: "6G核心网：算力入网",
  activeFlowType: "computeSandbox",
  coreFunctions: [
    "网络提供强大算力",
    "算力随路卸载",
    "传输低时延",
  ],
  logs: [
    ...STAGE_CONFIG[6].logs,
    ...STAGE7_LOGS,
  ],
  workflow: [
    { label: "创建算力会话:", value: "Working", status: "working" },
    { label: "分配算力资源:", value: "Pending", status: "pending" },
  ],
  steps: STAGE_CONFIG[6].steps.map((step) => {
    if (step.id === "03") {
      return { ...step, subtitle: "已完成 / Completed", status: "success" };
    }

    if (step.id === "04") {
      return { ...step, subtitle: "进行中 / Working", status: "working" };
    }

    return step;
  }),
};

STAGE_CONFIG[8] = {
  ...STAGE_CONFIG[7],
  leftPanelTitle: "机器狗视野增强",
  activeFlowType: "dogVision",
  showDogVision: false,
  showEnhancedDogVision: true,
  workflow: [
    { label: "算力入网实际应用:", value: "Working", status: "working" },
  ],
  steps: STAGE_CONFIG[7].steps.map((step) => {
    if (step.id === "04") {
      return { ...step, subtitle: "已完成 / Completed", status: "success" };
    }

    if (step.id === "05") {
      return { ...step, subtitle: "进行中 / Working", status: "working" };
    }

    return step;
  }),
};

const getRuntimeConfig = () => window.__RUNTIME_CONFIG__ || {};

const buildHttpUrl = (port, path, host) => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${host || window.location.hostname}:${port}${path}`;
};

const buildRuntimeBackendUrl = (baseKey, portKey, defaultPort, path, hostKey = "backendHost") => {
  const runtimeConfig = getRuntimeConfig();
  const configuredBase = runtimeConfig[baseKey];
  if (configuredBase) {
    return `${String(configuredBase).replace(/\/$/, "")}${path}`;
  }
  return buildHttpUrl(runtimeConfig[portKey] || defaultPort, path, runtimeConfig[hostKey]);
};

const getStageApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.stageApiUrl
    || import.meta.env.VITE_STAGE_API_URL
    || buildRuntimeBackendUrl("sysAgentApiUrl", "sysAgentPort", 8000, "/api/stage");
};

const getLatencyApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.latencyApiUrl
    || import.meta.env.VITE_LATENCY_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/latency", "sandboxHost");
};

const sleep = (delay) => new Promise((resolve) => {
  window.setTimeout(resolve, delay);
});

const normalizeStage = (value) => {
  const parsed = Number(value);
  if (parsed === 3) {
    return 2;
  }
  return STAGE_CONFIG[parsed] ? parsed : null;
};

// 宇树 (Unitree Go2) 仿生机器狗高保真矢量重绘（完美修正：关节一致朝右弯折，背部扁平无隆起）
const UnitreeGo2Vector = ({ className = "", status = "neutral", colors }) => {
  return (
    <svg 
      viewBox="0 0 120 100" 
      className={`transition-all duration-300 ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 金属机身与装甲渐变 */}
        <linearGradient id="unitree-silver" x1="20" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9" /> {/* 亮部银白 */}
          <stop offset="50%" stopColor="#cbd5e1" /> {/* 金属银灰 */}
          <stop offset="100%" stopColor="#64748b" /> {/* 暗部枪灰 */}
        </linearGradient>

        <linearGradient id="unitree-dark-metal" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* 状态相关的霓虹发光滤镜 */}
        <filter id={`unitree-glow-svg-${status}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 科技足底感应光圈 (投影) */}
      <ellipse cx="60" cy="86" rx="36" ry="6" fill={colors.glow} opacity="0.25" filter={`url(#unitree-glow-svg-${status})`} />

      {/* === 后肢（背景侧 - 关节一致向右弯折） === */}
      <g opacity="0.45">
        <circle cx="82" cy="36" r="4" fill="url(#unitree-dark-metal)" stroke="#334155" />
        {/* 关节折向右侧(92, 54)，足端踩在左侧(74, 76) */}
        <path d="M 82 36 L 92 54 L 74 76" stroke="url(#unitree-dark-metal)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="74" cy="76" r="2.5" fill="#1e293b" />
      </g>

      {/* === 前肢（背景侧 - 关节一致向右弯折） === */}
      <g opacity="0.45">
        <circle cx="48" cy="40" r="4" fill="url(#unitree-dark-metal)" stroke="#334155" />
        {/* 关节折向右侧(58, 56)，足端踩在左侧(38, 78) */}
        <path d="M 48 40 L 58 56 L 38 78" stroke="url(#unitree-dark-metal)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="78" r="2.5" fill="#1e293b" />
      </g>

      {/* === 主躯干（扁平流线型背甲，无隆起驼峰） === */}
      {/* 躯干底座底盘 */}
      <path d="M 40 44 L 84 41 L 86 31 L 42 33 Z" fill="url(#unitree-dark-metal)" />
      {/* 极简扁平银色背甲 */}
      <path d="M 42 33 C 42 33, 55 30.5, 68 30 C 81 29.5, 86 31, 88 31.5 C 90 32, 90 35, 87 36 L 82 40 L 42 35 Z" fill="url(#unitree-silver)" stroke="#94a3b8" strokeWidth="0.5" />

      {/* 侧部特征：白色“Unitree”艺术标志 */}
      <text 
        x="54" 
        y="36" 
        fill="#ffffff" 
        fontSize="4.5" 
        fontWeight="bold" 
        fontFamily="sans-serif" 
        letterSpacing="0.1"
        transform="rotate(-1.5 54 36)"
        opacity="0.9"
      >
        Unitree
      </text>

      {/* 侧部特征：状态三点式 LED 呼吸指示灯 */}
      <circle cx="74" cy="36" r="1" fill={colors.led} filter={`url(#unitree-glow-svg-${status})`} />
      <circle cx="77" cy="36" r="1" fill={colors.led} filter={`url(#unitree-glow-svg-${status})`} />
      <circle cx="80" cy="36" r="1" fill={colors.led} filter={`url(#unitree-glow-svg-${status})`} />

      {/* 尾部天线座 */}
      <path d="M 88 31 L 94 23" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <circle cx="94" cy="23" r="1.5" fill={colors.accent} filter={`url(#unitree-glow-svg-${status})`} />

      {/* === 前肢（前景侧 - 关节一致向右弯折） === */}
      <g>
        {/* 前左肩部同心圆金属盖帽 */}
        <circle cx="38" cy="38" r="7.5" fill="url(#unitree-silver)" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="38" cy="38" r="4" fill="url(#unitree-dark-metal)" />
        <circle cx="38" cy="38" r="1.5" fill="#e2e8f0" />
        
        {/* 关节折向右侧(50, 56)，足端在左侧(30, 80) */}
        <path d="M 38 38 L 50 56 L 30 80" stroke="url(#unitree-silver)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 38 38 L 50 56 L 30 80" stroke="url(#unitree-dark-metal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        
        {/* 膝关节盖帽饰片 */}
        <circle cx="50" cy="56" r="1.5" fill="#475569" />
        
        {/* 黑色防滑蹄 */}
        <path d="M 28 80 C 28 78, 32 78, 32 80 L 31 83 L 29 83 Z" fill="#0f172a" />
        <circle cx="30" cy="81" r="2.5" fill="#1e293b" />
      </g>

      {/* === 后肢（前景侧 - 关节一致向右弯折） === */}
      <g>
        {/* 后左髋部同心圆金属盖帽 */}
        <circle cx="86" cy="33" r="7.5" fill="url(#unitree-silver)" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="86" cy="33" r="4" fill="url(#unitree-dark-metal)" />
        <circle cx="86" cy="33" r="1.5" fill="#e2e8f0" />
        
        {/* 关节折向右侧(96, 51)，足端在左侧(78, 80) */}
        <path d="M 86 33 L 96 51 L 78 80" stroke="url(#unitree-silver)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 86 33 L 96 51 L 78 80" stroke="url(#unitree-dark-metal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        
        {/* 后膝关节盖帽饰片 */}
        <circle cx="96" cy="51" r="1.5" fill="#475569" />
        
        {/* 黑色防滑蹄 */}
        <path d="M 76 80 C 76 78, 80 78, 80 80 L 79 83 L 77 83 Z" fill="#0f172a" />
        <circle cx="78" cy="81" r="2.5" fill="#1e293b" />
      </g>

      {/* === 头部与前哨传感器舱 === */}
      <g>
        {/* 颈部连接件 */}
        <path d="M 42 34 L 30 36 L 28 42 L 38 41 Z" fill="url(#unitree-dark-metal)" />

        {/* 精美的前倾面罩/额头 */}
        <path d="M 30 33 L 20 40 C 18 41.5, 18 44.5, 20 46 L 28 50 L 34 40 Z" fill="url(#unitree-silver)" stroke="#94a3b8" strokeWidth="0.5" />

        {/* 原图标志性侧面“02”图腾喷漆 */}
        <text 
          x="24" 
          y="44" 
          fill="#334155" 
          fontSize="4" 
          fontWeight="bold" 
          fontFamily="monospace"
          transform="rotate(6 24 44)"
          opacity="0.85"
        >
          02
        </text>

        {/* 头部顶端圆钮按钮 */}
        <ellipse cx="27" cy="35" rx="2.5" ry="1.2" fill="url(#unitree-dark-metal)" />

        {/* 悬挂式前置光学相机/主视觉雷达 */}
        <path d="M 19 44 L 17 56 L 23 54 L 24 44 Z" fill="#020617" />
        {/* 镜头玻璃反光面 */}
        <circle cx="19.5" cy="50" r="2" fill={colors.accent} filter={`url(#unitree-glow-svg-${status})`} />
        
        {/* 前端防撞保护格栅 */}
        <path d="M 15 52 C 15 52, 16 59, 21 58 C 24 57, 24 53, 24 53" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="18" y1="50" x2="16" y2="56" stroke="#0f172a" strokeWidth="1" />
        <line x1="21" y1="49" x2="20" y2="56" stroke="#0f172a" strokeWidth="1" />
      </g>
    </svg>
  );
};

// 支持自适应检测和全息渲染的智能机器狗组件
const RobotDog = ({ className = "", status = "neutral" }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // 针对白底灰色实物图的高级全息滤镜算法
  const getFilterStyle = () => {
    switch (status) {
      case 'unregistered':
        return {
          filter: 'invert(1) sepia(1) saturate(8) hue-rotate(315deg) brightness(1.1) contrast(1.3)',
        };
      case 'registered':
        return {
          filter: 'invert(1) sepia(1) saturate(6) hue-rotate(95deg) brightness(1.2) contrast(1.2)',
        };
      case 'neutral':
      default:
        return {
          filter: 'invert(1) sepia(1) saturate(5) hue-rotate(170deg) brightness(1.2) contrast(1.2)',
        };
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case 'unregistered': return 'bg-red-500 shadow-[0_0_15px_#ef4444]';
      case 'registered': return 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
      default: return 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]';
    }
  };

  const statusColors = {
    unregistered: {
      glow: "#ef4444",
      led: "#f87171",
      accent: "#ef4444",
    },
    registered: {
      glow: "#10b981",
      led: "#34d399",
      accent: "#10b981",
    },
    neutral: {
      glow: "#06b6d4",
      led: "#22d3ee",
      accent: "#06b6d4",
    }
  }[status];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 科技底盘感应发光圈 */}
      <div className={`absolute w-3/4 h-2 bottom-3 rounded-full blur-md opacity-45 transition-all duration-300 ${getGlowColor()}`} />
      
      {imgFailed ? (
        // 图片加载失败时，渲染精确修正了关节弯折和扁平背部的 3D 风格矢量图
        <UnitreeGo2Vector className="w-full h-full" status={status} colors={statusColors} />
      ) : (
        // 机器狗实物图片层 (过滤去除白色背景色)
        <img 
          src="image_c2f288.png" 
          alt="Unitree Go2"
          style={getFilterStyle()} 
          className="w-full h-full object-contain mix-blend-screen transition-all duration-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
};

// 通用科技感面板组件 (外层大框 - 升级为高透高对比度毛玻璃面板)
const SciFiPanel = ({ children, className = "", title = "" }) => (
  <div className={`relative border border-blue-500/30 bg-slate-900/25 backdrop-blur-md rounded-xl overflow-hidden shadow-[0_0_18px_rgba(0,0,0,0.35)] ${className}`}>
    {/* 边角装饰 */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400"></div>
    
    {title && (
      <div className="bg-gradient-to-r from-blue-950/60 to-transparent py-2 px-4 border-b border-blue-500/30">
        <h3 className="text-blue-100 font-medium text-sm md:text-base">{title}</h3>
      </div>
    )}
    <div className="p-4 h-full">
      {children}
    </div>
  </div>
);

// 状态行组件
const StatusRow = ({ label, value, status = "success", isMono = false, valueClassName = "" }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-400';
      case 'working': return 'text-amber-300';
      case 'pending': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex justify-between items-center py-1.5 border-b border-blue-950/40 last:border-0 text-xs lg:text-sm">
      <span className="text-blue-200/90">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`${getStatusColor()} ${isMono ? 'font-mono' : ''} ${valueClassName}`}>{value}</span>
        {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        {status === 'working' && <CircleDot className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
        {status === 'pending' && <CircleDot className="w-3.5 h-3.5 text-blue-500" />}
      </div>
    </div>
  );
};

const ARGlasses = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-3/4 h-2 bottom-3 rounded-full blur-md opacity-45 bg-cyan-500 shadow-[0_0_15px_#06b6d4]" />
    <img
      src="/topology/glasses_transparent.png"
      alt="AR Glasses"
      className="w-full h-full object-contain transition-all duration-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]"
      draggable="false"
    />
  </div>
);

const AgentSpeechBubble = ({ bubble }) => {
  if (!bubble) {
    return null;
  }

  const lines = Array.isArray(bubble.lines) ? bubble.lines : [bubble.text];
  const arrowClassName = bubble.arrow === "down"
    ? "absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-cyan-400/45 bg-slate-950/86"
    : "absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-cyan-400/45 bg-slate-950/86";

  return (
    <div className={`absolute z-30 flex max-w-[175px] items-center gap-1.5 rounded-full border border-cyan-400/45 bg-slate-950/86 px-2.5 py-1.5 text-[9px] font-bold text-blue-50 shadow-[0_0_18px_rgba(34,211,238,0.18)] backdrop-blur-md ${bubble.className || "left-[83%] top-[36%]"}`}>
      {bubble.status === "success" ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
      ) : (
        <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-300" />
      )}
      <span className="flex min-w-0 flex-col whitespace-nowrap leading-tight">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      <span className={arrowClassName} />
    </div>
  );
};

const randomLatency = ({ min, max }) => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const NetworkTopology3D = ({ stage, activeFlowType, coreFunctions, agentBubble, title = "6G 核心网：数字身份申请" }) => {
  const nodes = {
    UE: { name: "AR Glasses (6G终端)", x: 12, y: 74, color: "#22f5ff", image: "/topology/glasses_transparent.png", size: "w-16 md:w-20" },
    RobotDog: { name: "Robot Dog", x: 12, y: 28, color: "#22e6b8", image: "/topology/robotdog_transparent.png", size: "w-20 md:w-24" },
    gNB: { name: "6G RAN", x: 28, y: 51, color: "#60a5fa", image: "/topology/ran_transparent.png", size: "w-24 md:w-28" },
    SRF: { name: "SystemAgent", x: 47, y: 36, color: "#c084fc", image: "/topology/systemagent_transparent.png", size: "w-20 md:w-24" },
    UPF: { name: "UPF", x: 47, y: 76, color: "#34d399", image: upfImage, size: "w-20 md:w-24" },
    Computing: { name: "Computing Agent", x: 78, y: 18, color: "#fbbf24", image: "/topology/computing_transparent.png", size: "w-16 md:w-20", labelClassName: "absolute left-[76%] top-[68%]" },
    ACN: { name: "ACN Agent", x: 78, y: 41, color: "#f472b6", image: "/topology/acn_transparent.png", size: "w-16 md:w-20", labelClassName: "absolute left-[76%] top-[68%]" },
    AgentGW: { name: "Agent GW", x: 78, y: 63, color: "#38bdf8", image: "/topology/gw.png", size: "w-16 md:w-20", labelClassName: "absolute left-[76%] top-[68%]" },
    Gateway: { name: "Computing Node", x: 78, y: 84, color: "#38bdf8", image: computingNodeImage, size: "w-16 md:w-20", labelClassName: "absolute left-[76%] top-[68%]" },
  };

  const connections = [
    ["UE", "gNB"],
    ["RobotDog", "gNB"],
    ["gNB", "SRF"],
    ["gNB", "UPF"],
    ["UPF", "Gateway"],
    ["UPF", "AgentGW"],
    ["SRF", "ACN"],
    ["SRF", "Computing"],
  ];

  const activeFlowConfig = getTopologyFlowConfig(stage, activeFlowType);
  const [latencySampleTick, setLatencySampleTick] = useState(0);

  useEffect(() => {
    setLatencySampleTick(0);

    if (!activeFlowConfig.lines.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setLatencySampleTick((tick) => tick + 1);
    }, 1200);

    return () => window.clearInterval(timer);
  }, [stage, activeFlowType, activeFlowConfig.lines.length]);

  const activeLineConfigByKey = useMemo(() => (
    Object.fromEntries(
      activeFlowConfig.lines.map((line) => [
        line.key,
        {
          ...line,
          displayLatencyMs: randomLatency(line.latencyMs),
        },
      ])
    )
  ), [stage, activeFlowType, latencySampleTick]);

  const getPathGeometry = ([from, to]) => {
    const a = nodes[from];
    const b = nodes[to];
    const start = from === "RobotDog" && to === "gNB"
      ? { x: a.x + 6, y: a.y - 2 }
      : { x: a.x, y: a.y };
    const cx = (start.x + b.x) / 2;
    const cy = Math.min(start.y, b.y) - 10;
    return { start, control: { x: cx, y: cy }, end: { x: b.x, y: b.y } };
  };

  const buildPath = (connection) => {
    const { start, control, end } = getPathGeometry(connection);
    return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  };

  const getPathPoint = (connection, t = 0.5) => {
    const { start, control, end } = getPathGeometry(connection);
    const inverse = 1 - t;
    return {
      x: (inverse ** 2 * start.x) + (2 * inverse * t * control.x) + (t ** 2 * end.x),
      y: (inverse ** 2 * start.y) + (2 * inverse * t * control.y) + (t ** 2 * end.y),
    };
  };

  const isActive = (key) => Boolean(activeLineConfigByKey[key]);

  return (
    <div className="border border-blue-500/35 rounded-xl p-5 bg-slate-900/25 backdrop-blur-md flex flex-col h-full relative shadow-[0_0_22px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />

      <div className="relative flex items-center justify-center gap-3 mb-4">
        <div className="w-full text-center">
          <h2 className="text-base font-bold text-blue-100 tracking-wider">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex-[1.55] w-full min-h-[300px] lg:min-h-[340px] relative rounded-lg overflow-hidden border border-blue-900/30 bg-slate-950/20">
        <svg className="absolute inset-0 z-10 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="topology-line-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {connections.map((connection) => {
            const key = `${connection[0]}->${connection[1]}`;
            const active = isActive(key);
            const color = activeFlowConfig.color || "#22f5ff";
            const path = buildPath(connection);

            return (
              <g key={key}>
                <path
                  d={path}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1.1"
                  strokeLinecap="round"
                  opacity="0.42"
                />
                {active && (
                  <>
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.15"
                      strokeLinecap="round"
                      opacity="0.78"
                      filter="url(#topology-line-glow)"
                      className="animate-pulse"
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.9"
                      strokeDasharray="4 8"
                      strokeLinecap="round"
                      opacity="0.95"
                      className="[animation:topology-flow_1.3s_linear_infinite]"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 z-[18]">
          {connections.map((connection) => {
            const key = `${connection[0]}->${connection[1]}`;
            const lineConfig = activeLineConfigByKey[key];

            if (!lineConfig) {
              return null;
            }

            const point = getPathPoint(connection, 0.52);
            const isBelowLine = lineConfig.labelPosition === "below";

            return (
              <div
                key={`${key}-latency`}
                className={`absolute -translate-x-1/2 rounded border border-cyan-200/70 bg-slate-950/95 px-2 py-1 font-mono text-[9px] font-black leading-none text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.34)] backdrop-blur-md ${
                  isBelowLine ? "translate-y-0" : "-translate-y-full"
                }`}
                style={{
                  left: `${point.x}%`,
                  top: isBelowLine ? `calc(${point.y}% + 8px)` : `calc(${point.y}% - 8px)`,
                }}
              >
                {lineConfig.displayLatencyMs}ms
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 z-20">
          {Object.entries(nodes).map(([key, value]) => (
            <div
              key={key}
              className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ left: `${value.x}%`, top: `${value.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className="absolute top-[64%] h-5 w-20 rounded-full blur-md opacity-45"
                  style={{ backgroundColor: value.color }}
                />
                <img
                  src={value.image}
                  alt={value.name}
                  className={`${value.size} relative z-10 object-contain [transform:perspective(720px)_rotateX(10deg)_rotateY(-10deg)_translateY(-4px)] drop-shadow-[0_18px_18px_rgba(0,0,0,0.58)]`}
                  draggable="false"
                />
                <div className={`${value.labelClassName || "relative -mt-1"} z-20 rounded border border-slate-500/45 bg-slate-950/85 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-wide text-gray-100 whitespace-nowrap backdrop-blur-md`}>
                  {value.name}
                </div>
              </div>
            </div>
          ))}
        </div>
        <AgentSpeechBubble bubble={agentBubble} />

      </div>

      <div className="mt-4 border-t border-blue-500/25 pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-blue-100 tracking-wide">6G核心网作用</h3>
          <span className="text-[10px] text-cyan-300 font-mono">Core Network Functions</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {coreFunctions.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded border border-blue-500/25 bg-slate-900/20 px-3 py-2 text-xs text-blue-100/90 backdrop-blur-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const waitForIceGathering = (pc) => {
  if (pc.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      pc.removeEventListener("icegatheringstatechange", onStateChange);
      resolve();
    }, 3000);

    const onStateChange = () => {
      if (pc.iceGatheringState === "complete") {
        window.clearTimeout(timeout);
        pc.removeEventListener("icegatheringstatechange", onStateChange);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", onStateChange);
  });
};

const getWebRtcOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.webRtcSignalUrl || import.meta.env.VITE_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/v1/web/sdp/offer", "sandboxHost");
};

const getDogVisionOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.dogWebRtcSignalUrl || import.meta.env.VITE_DOG_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return getWebRtcOfferUrl();
};

const getDogEnhancedOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.dogEnhancedWebRtcSignalUrl || import.meta.env.VITE_DOG_ENHANCED_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return getWebRtcOfferUrl();
};

const getWebRtcIceServers = () => {
  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  if (isLocalHost) {
    return [];
  }

  return [
    {
      urls: [
        "stun:101.245.78.174:28002",
        "turn:101.245.78.174:28002?transport=udp",
        "turn:101.245.78.174:28002?transport=tcp",
      ],
      username: "cloudproxy",
      credential: "f41bd6b00f9fe5b5980197d793699aea",
    },
  ];
};

const connectBackendVideoPeer = async (pc, offerUrl, clientId, streamType) => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceGathering(pc);

  const localDescription = pc.localDescription || offer;
  const response = await fetch(offerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      ...(streamType ? { streamType } : {}),
      sdp_offer: {
        type: localDescription.type,
        sdp: localDescription.sdp,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WebRTC offer failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.sdp_answer) {
    throw new Error("WebRTC answer missing sdp_answer");
  }

  await pc.setRemoteDescription(payload.sdp_answer);
};

const WebRtcBackground = () => {
  const videoRef = useRef(null);
  const [state, setState] = useState("connecting");

  useEffect(() => {
    let disposed = false;
    const iceServers = getWebRtcIceServers();
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: iceServers.length ? "relay" : "all",
    });

    pc.addTransceiver("video", { direction: "recvonly" });

    pc.onconnectionstatechange = () => {
      if (!disposed) {
        setState(pc.connectionState);
      }
    };

    pc.ontrack = (event) => {
      if (!disposed && videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setState("receiving");
      }
    };

    const connect = async () => {
      try {
        await connectBackendVideoPeer(pc, getWebRtcOfferUrl(), "react-background");
      } catch (error) {
        console.error("WebRTC background connection failed", error);
        if (!disposed) {
          setState("failed");
        }
        pc.close();
      }
    };

    connect();

    return () => {
      disposed = true;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      pc.close();
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="fixed inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      {state !== "connected" && state !== "receiving" && (
        <div className="fixed bottom-3 left-3 z-50 rounded border border-cyan-400/40 bg-slate-950/55 px-3 py-2 text-xs text-cyan-100 backdrop-blur-md">
          WebRTC background: {state}
        </div>
      )}
    </>
  );
};

const DogVisionStream = () => {
  const videoRef = useRef(null);
  const [state, setState] = useState("connecting");

  useEffect(() => {
    let disposed = false;
    const iceServers = getWebRtcIceServers();
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: iceServers.length ? "relay" : "all",
    });

    pc.addTransceiver("video", { direction: "recvonly" });

    pc.onconnectionstatechange = () => {
      if (!disposed) {
        setState(pc.connectionState);
      }
    };

    pc.ontrack = (event) => {
      if (!disposed && videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setState("receiving");
      }
    };

    const connect = async () => {
      try {
        await connectBackendVideoPeer(pc, getDogVisionOfferUrl(), "react-dog-vision", "raw");
      } catch (error) {
        console.error("Dog vision WebRTC connection failed", error);
        if (!disposed) {
          setState("failed");
        }
        pc.close();
      }
    };

    connect();

    return () => {
      disposed = true;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      pc.close();
    };
  }, []);

  return (
    <div className="relative h-[220px] shrink-0 overflow-hidden rounded-xl border border-emerald-400/35 bg-slate-950/45 shadow-[inset_0_0_24px_rgba(16,185,129,0.12),0_0_18px_rgba(34,211,238,0.14)] lg:h-[240px]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:22px_22px] mix-blend-screen" />
      <div className="absolute inset-0 border border-cyan-300/20" />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded border border-emerald-400/45 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${state === "receiving" || state === "connected" ? "bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]"}`} />
        {state === "receiving" || state === "connected" ? "Live" : state}
      </div>
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 text-[10px] font-mono text-cyan-100/90">
        {["DOG-CAM", "MOQT", "6G UPLINK"].map((item) => (
          <div key={item} className="rounded border border-cyan-400/25 bg-slate-950/62 px-2 py-1 text-center backdrop-blur-md">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const SyncedDogVisionStream = () => {
  const rawVideoRef = useRef(null);
  const enhancedVideoRef = useRef(null);
  const [rawState, setRawState] = useState("connecting");
  const [enhancedState, setEnhancedState] = useState("connecting");

  useEffect(() => {
    let disposed = false;
    const iceServers = getWebRtcIceServers();

    const createPeer = (videoRef, setState) => {
      const pc = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: iceServers.length ? "relay" : "all",
      });

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.onconnectionstatechange = () => {
        if (!disposed) {
          setState(pc.connectionState);
        }
      };
      pc.ontrack = (event) => {
        if (!disposed && videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setState("receiving");
        }
      };

      return pc;
    };

    const rawPeer = createPeer(rawVideoRef, setRawState);
    const enhancedPeer = createPeer(enhancedVideoRef, setEnhancedState);

    const connectPeer = async (pc, offerUrl, clientId, streamType) => {
      await connectBackendVideoPeer(pc, offerUrl, clientId, streamType);
    };

    const connectBoth = async () => {
      try {
        await Promise.all([
          connectPeer(rawPeer, getDogVisionOfferUrl(), "react-dog-raw", "raw"),
          connectPeer(enhancedPeer, getDogEnhancedOfferUrl(), "react-dog-enhanced", "enhanced"),
        ]);
      } catch (error) {
        console.error("Synced dog vision WebRTC connection failed", error);
        if (!disposed) {
          setRawState((state) => (state === "receiving" ? state : "failed"));
          setEnhancedState((state) => (state === "receiving" ? state : "failed"));
        }
        rawPeer.close();
        enhancedPeer.close();
      }
    };

    connectBoth();

    return () => {
      disposed = true;
      [rawVideoRef, enhancedVideoRef].forEach((videoRef) => {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      });
      rawPeer.close();
      enhancedPeer.close();
    };
  }, []);

  const panels = [
    { label: "机器狗原始视野", state: rawState, ref: rawVideoRef },
    { label: "机器狗增强后的视野", state: enhancedState, ref: enhancedVideoRef },
  ];

  return (
    <div className="flex flex-1 min-h-[424px] flex-col gap-2">
      {panels.map((panel) => {
        const live = panel.state === "receiving" || panel.state === "connected";

        return (
          <div key={panel.label} className="relative flex-1 overflow-hidden rounded-xl border border-emerald-400/35 bg-slate-950/45 shadow-[inset_0_0_24px_rgba(16,185,129,0.12),0_0_18px_rgba(34,211,238,0.14)]">
            <video
              ref={panel.ref}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:22px_22px] mix-blend-screen" />
            <div className="absolute inset-0 border border-cyan-300/20" />
            <div className="absolute left-2 top-2 flex items-center gap-2 rounded border border-emerald-400/45 bg-slate-950/70 px-2 py-1 text-[10px] font-bold tracking-wider text-emerald-200 backdrop-blur-md">
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]"}`} />
              {panel.label}
            </div>
            <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-2 text-[9px] font-mono text-cyan-100/90">
              {["DOG-CAM", "MOQT", live ? "SYNCED" : panel.state].map((item) => (
                <div key={item} className="rounded border border-cyan-400/25 bg-slate-950/62 px-2 py-1 text-center backdrop-blur-md">
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const useStagePolling = () => {
  const [stage, setStage] = useState(1);
  const [connectionState, setConnectionState] = useState("connecting");
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    const pollStage = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        const response = await fetch(getStageApiUrl(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Stage API failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Stage API did not return JSON");
        }

        const payload = await response.json();
        const nextStage = normalizeStage(payload.stage);

        if (!nextStage) {
          throw new Error(`Unknown stage: ${payload.stage}`);
        }

        if (!disposed) {
          setStage(nextStage);
          setConnectionState("connected");
          setError(null);
        }
      } catch (stageError) {
        if (!disposed) {
          setConnectionState("error");
          setError(stageError.message);
        }
      } finally {
        isPolling = false;
      }
    };

    pollStage();
    const interval = window.setInterval(pollStage, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  return { stage, connectionState, error };
};

const useLatencySeries = (enabled) => {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    if (!enabled) {
      setPoints([]);
      setError(null);
      return undefined;
    }

    const pollLatency = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        const response = await fetch(getLatencyApiUrl(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Latency API failed: ${response.status}`);
        }

        const payload = await response.json();
        const latencyMs = Number(payload.latencyMs);

        if (!Number.isFinite(latencyMs)) {
          throw new Error("Latency API returned invalid latency");
        }

        const timestamp = Number(payload.timestamp) || Date.now();

        if (!disposed) {
          setPoints((current) => [
            ...current.slice(-23),
            { timestamp, latencyMs },
          ]);
          setError(null);
        }
      } catch (latencyError) {
        if (!disposed) {
          setError(latencyError.message);
        }
      } finally {
        isPolling = false;
      }
    };

    pollLatency();
    const interval = window.setInterval(pollLatency, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  return { points, error };
};

const LatencyChart = ({ points, error }) => {
  const chartWidth = 220;
  const chartHeight = 92;
  const padding = { top: 10, right: 10, bottom: 20, left: 26 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const latestPoint = points[points.length - 1];
  const values = points.map((point) => point.latencyMs);
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 30;
  const minValue = Math.max(0, Math.floor(rawMin - 4));
  const maxValue = Math.max(minValue + 10, Math.ceil(rawMax + 4));

  const chartPoints = points.map((point, index) => {
    const x = padding.left + (points.length <= 1 ? 0 : (index / (points.length - 1)) * plotWidth);
    const y = padding.top + ((maxValue - point.latencyMs) / (maxValue - minValue)) * plotHeight;
    return { x, y, ...point };
  });

  const linePath = chartPoints.map((point, index) => (
    `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  )).join(" ");
  const areaPath = chartPoints.length
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} ${padding.top + plotHeight} L ${padding.left} ${padding.top + plotHeight} Z`
    : "";
  const startLabel = points[0]
    ? new Date(points[0].timestamp).toLocaleTimeString("zh-CN", { minute: "2-digit", second: "2-digit" })
    : "--:--";
  const endLabel = latestPoint
    ? new Date(latestPoint.timestamp).toLocaleTimeString("zh-CN", { minute: "2-digit", second: "2-digit" })
    : "--:--";

  return (
    <div className="rounded-lg border border-cyan-400/25 bg-slate-950/35 p-2.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-cyan-100">端到端时延</div>
          <div className="text-[10px] font-mono text-blue-200/75">Latency / Time</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-black leading-none text-cyan-200">
            {latestPoint ? latestPoint.latencyMs : "--"}ms
          </div>
          <div className="text-[9px] text-blue-200/70">当前</div>
        </div>
      </div>

      <svg className="h-[108px] w-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Stage8 实时时延图表">
        <defs>
          <linearGradient id="latency-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
          </linearGradient>
        </defs>
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.38)" strokeWidth="0.8" />
        <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.38)" strokeWidth="0.8" />
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + ratio * plotHeight;
          const label = Math.round(maxValue - ratio * (maxValue - minValue));
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="rgba(125,211,252,0.12)" strokeWidth="0.6" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" className="fill-blue-100/65 text-[7px] font-mono">{label}</text>
            </g>
          );
        })}
        {areaPath && <path d={areaPath} fill="url(#latency-chart-fill)" />}
        {linePath && <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
        {chartPoints.map((point) => (
          <circle key={`${point.timestamp}-${point.latencyMs}`} cx={point.x} cy={point.y} r="1.8" fill="#e0f2fe" stroke="#0891b2" strokeWidth="0.8" />
        ))}
        <text x={padding.left} y={chartHeight - 4} className="fill-blue-100/65 text-[7px] font-mono">{startLabel}</text>
        <text x={padding.left + plotWidth} y={chartHeight - 4} textAnchor="end" className="fill-blue-100/65 text-[7px] font-mono">{endLabel}</text>
        <text x="2" y={padding.top + plotHeight / 2} transform={`rotate(-90 2 ${padding.top + plotHeight / 2})`} textAnchor="middle" className="fill-cyan-100/70 text-[7px] font-mono">ms</text>
      </svg>

      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-blue-100/70">
        <span>时间窗口: 最近 {points.length || 0}s</span>
        <span className={error ? "text-rose-300" : "text-emerald-300"}>
          {error ? "API error" : "Live"}
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const { stage, connectionState, error } = useStagePolling();
  const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG[1];
  const latencySeries = useLatencySeries(stage === 8);
  const [stage2Progress, setStage2Progress] = useState({
    activeTask: 0,
    completedCount: 0,
    bubbleStatus: "working",
  });
  const [stage4Progress, setStage4Progress] = useState({
    activeTask: 0,
    completedCount: 0,
    bubbleStatus: "working",
  });
  const [stage6Progress, setStage6Progress] = useState({
    activeTask: 0,
    completedCount: 0,
    bubbleStatus: "working",
  });
  const [stage7Progress, setStage7Progress] = useState({
    activeTask: 0,
    completedCount: 0,
    bubbleStatus: "working",
  });

  useEffect(() => {
    if (stage !== 2) {
      setStage2Progress({
        activeTask: 0,
        completedCount: 0,
        bubbleStatus: "working",
      });
      return;
    }

    setStage2Progress({
      activeTask: 0,
      completedCount: 0,
      bubbleStatus: "working",
    });
  }, [stage]);

  useEffect(() => {
    if (stage !== 2 || stage2Progress.completedCount >= STAGE2_WORKFLOW.length) {
      return undefined;
    }

    const currentTask = stage2Progress.activeTask;
    const timer = window.setTimeout(() => {
      if (stage2Progress.bubbleStatus === "working") {
        setStage2Progress((progress) => ({
          ...progress,
          bubbleStatus: "success",
        }));
        return;
      }

      setStage2Progress((progress) => {
        const nextCompletedCount = Math.min(progress.completedCount + 1, STAGE2_WORKFLOW.length);
        const nextTask = Math.min(currentTask + 1, STAGE2_WORKFLOW.length - 1);

        return {
          activeTask: nextTask,
          completedCount: nextCompletedCount,
          bubbleStatus: nextCompletedCount >= STAGE2_WORKFLOW.length ? "success" : "working",
        };
      });
    }, stage2Progress.bubbleStatus === "working"
      ? STAGE_ANIMATION_TIMING[2].workingMs
      : STAGE_ANIMATION_TIMING[2].successMs);

    return () => window.clearTimeout(timer);
  }, [stage, stage2Progress.activeTask, stage2Progress.bubbleStatus, stage2Progress.completedCount]);

  useEffect(() => {
    if (stage !== 4) {
      setStage4Progress({
        activeTask: 0,
        completedCount: 0,
        bubbleStatus: "working",
      });
      return;
    }

    setStage4Progress({
      activeTask: 0,
      completedCount: 0,
      bubbleStatus: "working",
    });
  }, [stage]);

  useEffect(() => {
    if (stage !== 6) {
      setStage6Progress({
        activeTask: 0,
        completedCount: 0,
        bubbleStatus: "working",
      });
      return;
    }

    setStage6Progress({
      activeTask: 0,
      completedCount: 0,
      bubbleStatus: "working",
    });
  }, [stage]);

  useEffect(() => {
    if (stage !== 7) {
      setStage7Progress({
        activeTask: 0,
        completedCount: 0,
        bubbleStatus: "working",
      });
      return;
    }

    setStage7Progress({
      activeTask: 0,
      completedCount: 0,
      bubbleStatus: "working",
    });
  }, [stage]);

  useEffect(() => {
    if (stage !== 4 || stage4Progress.completedCount >= STAGE4_WORKFLOW.length) {
      return undefined;
    }

    const currentTask = stage4Progress.activeTask;
    const timer = window.setTimeout(() => {
      if (stage4Progress.bubbleStatus === "working") {
        setStage4Progress((progress) => ({
          ...progress,
          bubbleStatus: "success",
        }));
        return;
      }

      setStage4Progress((progress) => {
        const nextCompletedCount = Math.min(progress.completedCount + 1, STAGE4_WORKFLOW.length);
        const nextTask = Math.min(currentTask + 1, STAGE4_WORKFLOW.length - 1);

        return {
          activeTask: nextTask,
          completedCount: nextCompletedCount,
          bubbleStatus: nextCompletedCount >= STAGE4_WORKFLOW.length ? "success" : "working",
        };
      });
    }, stage4Progress.bubbleStatus === "working"
      ? STAGE_ANIMATION_TIMING[4].workingMs
      : STAGE_ANIMATION_TIMING[4].successMs);

    return () => window.clearTimeout(timer);
  }, [stage, stage4Progress.activeTask, stage4Progress.bubbleStatus, stage4Progress.completedCount]);

  useEffect(() => {
    if (stage !== 6 || stage6Progress.completedCount >= STAGE6_WORKFLOW.length) {
      return undefined;
    }

    const currentTask = stage6Progress.activeTask;
    const timer = window.setTimeout(() => {
      if (stage6Progress.bubbleStatus === "working") {
        setStage6Progress((progress) => ({
          ...progress,
          bubbleStatus: "success",
        }));
        return;
      }

      setStage6Progress((progress) => {
        const nextCompletedCount = Math.min(progress.completedCount + 1, STAGE6_WORKFLOW.length);
        const nextTask = Math.min(currentTask + 1, STAGE6_WORKFLOW.length - 1);

        return {
          activeTask: nextTask,
          completedCount: nextCompletedCount,
          bubbleStatus: nextCompletedCount >= STAGE6_WORKFLOW.length ? "success" : "working",
        };
      });
    }, stage6Progress.bubbleStatus === "working"
      ? STAGE_ANIMATION_TIMING[6].workingMs
      : STAGE_ANIMATION_TIMING[6].successMs);

    return () => window.clearTimeout(timer);
  }, [stage, stage6Progress.activeTask, stage6Progress.bubbleStatus, stage6Progress.completedCount]);

  useEffect(() => {
    if (stage !== 7 || stage7Progress.completedCount >= STAGE7_WORKFLOW.length) {
      return undefined;
    }

    const currentTask = stage7Progress.activeTask;
    const timer = window.setTimeout(() => {
      if (stage7Progress.bubbleStatus === "working") {
        setStage7Progress((progress) => ({
          ...progress,
          bubbleStatus: "success",
        }));
        return;
      }

      setStage7Progress((progress) => {
        const nextCompletedCount = Math.min(progress.completedCount + 1, STAGE7_WORKFLOW.length);
        const nextTask = Math.min(currentTask + 1, STAGE7_WORKFLOW.length - 1);

        return {
          activeTask: nextTask,
          completedCount: nextCompletedCount,
          bubbleStatus: nextCompletedCount >= STAGE7_WORKFLOW.length ? "success" : "working",
        };
      });
    }, stage7Progress.bubbleStatus === "working"
      ? STAGE_ANIMATION_TIMING[7].workingMs
      : STAGE_ANIMATION_TIMING[7].successMs);

    return () => window.clearTimeout(timer);
  }, [stage, stage7Progress.activeTask, stage7Progress.bubbleStatus, stage7Progress.completedCount]);

  const effectiveStageConfig = (() => {
    if (stage === 2) {
      const workflow = STAGE2_WORKFLOW.map((item, index) => {
        if (index < stage2Progress.completedCount) {
          return { label: item.label, value: "Done", status: "success" };
        }

        if (index === stage2Progress.activeTask && stage2Progress.completedCount < STAGE2_WORKFLOW.length) {
          return {
            label: item.label,
            value: stage2Progress.bubbleStatus === "success" ? "Done" : "Working",
            status: stage2Progress.bubbleStatus === "success" ? "success" : "working",
          };
        }

        return { label: item.label, value: "Pending", status: "pending" };
      });

      const allDone = stage2Progress.completedCount >= STAGE2_WORKFLOW.length;
      const activeWorkflow = allDone ? null : STAGE2_WORKFLOW[stage2Progress.activeTask];
      const completionLogCount = Math.max(0, Math.min(stage2Progress.completedCount - 1, STAGE2_COMPLETION_LOGS.length));
      const logs = [
        ...stageConfig.logs,
        ...STAGE2_COMPLETION_LOGS.slice(0, completionLogCount),
      ];

      return {
        ...stageConfig,
        showRegisteredDevice: allDone,
        statusRows: [
          {
            label: "凭证:",
            value: stage2Progress.completedCount >= 2 ? "已颁发" : "未颁发",
            status: stage2Progress.completedCount >= 2 ? "success" : "pending",
          },
          {
            label: "机器狗ID:",
            value: allDone ? "DID:2168nLB3G@CMCC.org" : "None",
            status: allDone ? "success" : "pending",
            isMono: true,
          },
        ],
        userStatus: {
          credential: {
            value: stage2Progress.completedCount >= 2 ? "已颁发" : "未颁发",
            status: stage2Progress.completedCount >= 2 ? "success" : "pending",
          },
          robotDogId: {
            value: allDone ? "DID:2168nLB3G@CMCC.org" : "None",
            status: allDone ? "success" : "pending",
          },
        },
        logs,
        workflow,
        steps: stageConfig.steps.map((step) => (
          step.id === "01"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: activeWorkflow
          ? {
              ...activeWorkflow.bubble,
              status: stage2Progress.bubbleStatus,
            }
          : null,
      };
    }

    if (stage === 6) {
      const workflow = STAGE6_WORKFLOW.map((item, index) => {
        if (index < stage6Progress.completedCount) {
          return { label: item.label, value: "Done", status: "success" };
        }

        if (index === stage6Progress.activeTask && stage6Progress.completedCount < STAGE6_WORKFLOW.length) {
          return {
            label: item.label,
            value: stage6Progress.bubbleStatus === "success" ? "Done" : "Working",
            status: stage6Progress.bubbleStatus === "success" ? "success" : "working",
          };
        }

        return { label: item.label, value: "Pending", status: "pending" };
      });

      const allDone = stage6Progress.completedCount >= STAGE6_WORKFLOW.length;
      const activeWorkflow = allDone ? null : STAGE6_WORKFLOW[stage6Progress.activeTask];
      const visibleLogs = [
        ...STAGE_CONFIG[5].logs,
        ...STAGE6_LOGS.slice(0, Math.min(stage6Progress.completedCount + 1, STAGE6_LOGS.length)),
      ];

      return {
        ...stageConfig,
        activeFlowType: activeWorkflow?.flowType || "a2aGateway",
        logs: visibleLogs,
        workflow,
        steps: stageConfig.steps.map((step) => (
          step.id === "03"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: activeWorkflow
          ? {
              ...activeWorkflow.bubble,
              status: stage6Progress.bubbleStatus,
            }
          : null,
      };
    }

    if (stage === 7) {
      const workflow = STAGE7_WORKFLOW.map((item, index) => {
        if (index < stage7Progress.completedCount) {
          return { label: item.label, value: "Done", status: "success" };
        }

        if (index === stage7Progress.activeTask && stage7Progress.completedCount < STAGE7_WORKFLOW.length) {
          return {
            label: item.label,
            value: stage7Progress.bubbleStatus === "success" ? "Done" : "Working",
            status: stage7Progress.bubbleStatus === "success" ? "success" : "working",
          };
        }

        return { label: item.label, value: "Pending", status: "pending" };
      });

      const allDone = stage7Progress.completedCount >= STAGE7_WORKFLOW.length;
      const activeWorkflow = allDone ? null : STAGE7_WORKFLOW[stage7Progress.activeTask];
      const visibleLogs = [
        ...STAGE_CONFIG[6].logs,
        ...STAGE7_LOGS.slice(0, Math.min(stage7Progress.completedCount + 1, STAGE7_LOGS.length)),
      ];

      return {
        ...stageConfig,
        activeFlowType: activeWorkflow?.flowType || "computeSandbox",
        logs: visibleLogs,
        workflow,
        steps: stageConfig.steps.map((step) => (
          step.id === "04"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: activeWorkflow
          ? {
              ...activeWorkflow.bubble,
              status: stage7Progress.bubbleStatus,
            }
          : null,
      };
    }

    if (stage !== 4) {
      return stageConfig;
    }

    const workflow = STAGE4_WORKFLOW.map((item, index) => {
      if (index < stage4Progress.completedCount) {
        return { ...item, value: "Done", status: "success" };
      }

      if (index === stage4Progress.activeTask && stage4Progress.completedCount < STAGE4_WORKFLOW.length) {
        return {
          ...item,
          value: stage4Progress.bubbleStatus === "success" ? "Done" : "Working",
          status: stage4Progress.bubbleStatus === "success" ? "success" : "working",
        };
      }

      return item;
    });

    const allDone = stage4Progress.completedCount >= STAGE4_WORKFLOW.length;
    const steps = stageConfig.steps.map((step) => (
      step.id === "02"
        ? {
            ...step,
            subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
            status: allDone ? "success" : "working",
          }
        : step
    ));

    const activeWorkflow = allDone ? null : workflow[stage4Progress.activeTask];

    return {
      ...stageConfig,
      homeDomainDevicesReady: allDone,
      showRegisteredDevice: allDone,
      workflow,
      steps,
      agentBubble: activeWorkflow
        ? {
            text: activeWorkflow.label.replace(/:$/, ""),
            status: stage4Progress.bubbleStatus,
          }
        : null,
    };
  })();

  return (
    <div className="video-backed-ui min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden flex items-center justify-center relative isolate">
      <WebRtcBackground />
      <div className="video-dim-overlay fixed inset-0 -z-10 bg-black/35 pointer-events-none" />
      {connectionState !== "connected" && (
        <div className="fixed bottom-3 right-3 z-50 max-w-[280px] rounded border border-amber-400/40 bg-slate-950/65 px-3 py-2 text-xs text-amber-100 backdrop-blur-md">
          Stage API: {connectionState}
          {error && <span className="block truncate text-amber-200/70">{error}</span>}
        </div>
      )}
      {/* 动画样式定义 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .scan-line {
          animation: scan 3s linear infinite;
        }
        @keyframes hologram-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.4)) brightness(1); }
          50% { filter: drop-shadow(0 0 18px rgba(52, 211, 153, 0.7)) brightness(1.1); }
        }
        @keyframes hologram-glow-red {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4)) brightness(1); }
          50% { filter: drop-shadow(0 0 18px rgba(239, 68, 68, 0.7)) brightness(1.1); }
        }
        .animate-hologram {
          animation: hologram-glow 3s ease-in-out infinite;
        }
        .animate-hologram-red {
          animation: hologram-glow-red 3s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 12px rgba(59,130,246,0.9);
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes topology-flow {
          0% { stroke-dashoffset: 12; }
          100% { stroke-dashoffset: 0; }
        }
        .agent-log-scroll {
          overflow-x: hidden;
          scrollbar-color: transparent transparent;
          scrollbar-width: thin;
        }
        .agent-log-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .agent-log-scroll::-webkit-scrollbar-track,
        .agent-log-scroll::-webkit-scrollbar-thumb {
          background: transparent;
        }
        .agent-log-module:hover .agent-log-scroll {
          scrollbar-color: rgba(34,211,238,0.65) rgba(15,23,42,0.7);
        }
        .agent-log-module:hover .agent-log-scroll::-webkit-scrollbar-track {
          background: rgba(15,23,42,0.7);
        }
        .agent-log-module:hover .agent-log-scroll::-webkit-scrollbar-thumb {
          background: rgba(34,211,238,0.65);
          border-radius: 999px;
        }
      `}} />

      {/* 主屏幕容器 - 整体升级为全毛玻璃HUD悬浮舱 */}
      <div className="w-full max-w-[1600px] bg-slate-950/38 backdrop-blur-xl rounded-3xl border-2 border-cyan-300/55 shadow-[0_0_0_1px_rgba(15,23,42,0.85),0_0_34px_rgba(34,211,238,0.18),0_28px_90px_rgba(0,0,0,0.72)] relative overflow-hidden flex flex-col p-6 md:p-8 ring-1 ring-white/10">
        <div className="absolute inset-0 rounded-3xl border border-slate-950/80 pointer-events-none" />
        <div className="absolute inset-[3px] rounded-[1.35rem] border border-blue-200/15 pointer-events-none" />
        
        {/* 顶部 Header */}
        <header className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-4xl font-black italic tracking-tighter">6G</span>
            <Wifi className="w-8 h-8 animate-pulse" />
          </div>
          <div className="text-center absolute left-1/2 -translate-x-1/2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-widest text-white glow-text mb-2">
              6G智能体网络
            </h1>
            <p className="text-blue-200 font-medium text-sm md:text-base">
              6G Agentic Network
            </p>
          </div>
          <div className="w-24"></div>
        </header>

        {/* 核心内容区 (三列布局) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 relative z-10">
          
          {/* 左列：机器狗接入 */}
          <div className="md:col-span-3">
            <SciFiPanel className="h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-blue-200 text-base lg:text-lg font-bold text-center mb-4 pb-3 border-b border-blue-500/30">
                  {effectiveStageConfig.leftPanelTitle}
                </h2>
                
                <div className="flex flex-col flex-1 gap-2">
                  {effectiveStageConfig.showEnhancedDogVision ? (
                    <SyncedDogVisionStream />
                  ) : effectiveStageConfig.showDogVision ? (
                    <DogVisionStream />
                  ) : effectiveStageConfig.showHomeDomainDevice && effectiveStageConfig.homeDomainDevicesReady === false ? (
                    <div className="flex-1 min-h-[424px] rounded-xl border border-emerald-500/20 bg-slate-950/10 backdrop-blur-md" aria-hidden="true" />
                  ) : effectiveStageConfig.showHomeDomainDevice ? (
                    <div className={`border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                      effectiveStageConfig.showRegisteredDevice
                        ? "flex-1 h-[180px] lg:h-[210px]"
                        : "h-[220px] lg:h-[240px]"
                    }`}>
                      <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                        <ShieldCheck className="w-5 h-5 animate-pulse" />
                        <div>
                          <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                          <div className="text-[10px] opacity-70">Registered Device</div>
                        </div>
                      </div>

                      <div className="flex-1 w-full relative mt-1">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="ar-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.35)" stopOpacity="0.7" />
                              <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polygon points="34,65 65,15 95,50" fill="url(#ar-cone-beam)" className="opacity-40 animate-pulse" />
                          <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <circle cx="34" cy="65" r="1.5" fill="#22d3ee" className="animate-ping" />
                        </svg>

                        <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                          <ARGlasses className="w-full h-full object-contain" />
                        </div>

                        <div className="absolute top-1 right-1 w-[52%] max-w-[150px] bg-emerald-950/80 border border-cyan-400/50 p-1.5 sm:p-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)] leading-tight text-emerald-300">
                          <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[8px] sm:text-[9px]">
                            Digital ID
                          </div>
                          <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[9px] sm:text-[10px]">
                            3lt1zY73G@CMCC.org
                          </div>
                          <div className="flex flex-col gap-0.5 text-[8px] sm:text-[9px] font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span className="opacity-75">Capabilities:</span>
                              <span className="font-bold text-cyan-300 leading-tight break-words">
                                [Device-Network Synergy, AR]
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="opacity-75">Status:</span>
                              <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                Active <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping inline-block"></span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* === 未注册设备 (红色全息光锥投影) === */}
                      <div className={`border border-red-500/30 bg-red-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                        effectiveStageConfig.showRegisteredDevice
                          ? "flex-1 h-[180px] lg:h-[210px]"
                          : "h-[220px] lg:h-[240px]"
                      }`}>
                        <div className="flex items-center gap-2 text-red-400 mb-2 relative z-20">
                          <ShieldAlert className="w-5 h-5 animate-bounce" />
                          <div>
                            <div className="font-bold text-xs lg:text-sm">未注册设备</div>
                            <div className="text-[10px] opacity-70">Unknown Device</div>
                          </div>
                        </div>

                        <div className="flex-1 w-full relative mt-1">
                          {/* 红色发散全息光锥层 */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="unreg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.35)" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* 雷达源到全息面板的扩散半透明光锥 */}
                            <polygon points="34,65 65,15 95,50" fill="url(#unreg-cone-beam)" className="opacity-40 animate-pulse" />
                            <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(248, 113, 113, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                            <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(248, 113, 113, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                            {/* 发射微点 */}
                            <circle cx="34" cy="65" r="1.5" fill="#ef4444" className="animate-ping" />
                          </svg>

                          {/* 机器狗本体 (靠左下坐立) */}
                          <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                            <RobotDog className="w-full h-full object-contain" status="unregistered" />
                          </div>

                          {/* 3D 悬浮红色警示全息牌 (靠右侧，朝狗身侧上方倾斜) */}
                          <div className="absolute top-1 right-1 w-[52%] max-w-[150px] bg-red-950/80 border border-red-500/50 p-1.5 sm:p-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.25)] z-20 animate-hologram-red [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)] text-red-300 leading-tight">
                            <div className="text-red-400 font-black mb-1 border-b border-red-500/20 pb-1 uppercase tracking-wide text-[8px] sm:text-[9px]">
                              Device Warning
                            </div>
                            <div className="font-mono font-bold text-[10px] sm:text-xs truncate mb-1">
                              Robot Dog
                            </div>
                            <div className="opacity-80 text-[8px] sm:text-[9px] mb-1">
                              待注册 / Unregistered
                            </div>
                            <div className="mt-1 flex justify-between text-[8px] sm:text-[9px] font-bold">
                              <span>Status:</span>
                              <span className="text-red-400 animate-pulse">Blocked</span>
                            </div>
                          </div>
                        </div>
                      </div>

                  {effectiveStageConfig.showRegisteredDevice && (
                    <>
                      {!effectiveStageConfig.hideDeviceArrow && (
                        <div className="flex justify-center text-blue-500 my-[-10px] z-10">
                          <ChevronRight className="w-8 h-8 rotate-90 bg-slate-900 border border-blue-500/30 rounded-full" />
                        </div>
                      )}
                      {effectiveStageConfig.hideDeviceArrow && (
                        <div className="h-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true" />
                      )}

                      {/* === 已注册设备 (绿色3D全息投影面板) === */}
                      <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex-1 flex flex-col h-[180px] lg:h-[210px] overflow-hidden rounded-xl p-3 relative">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                          <ShieldCheck className="w-5 h-5 animate-pulse" />
                          <div>
                            <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                            <div className="text-[10px] opacity-70">Registered Device</div>
                          </div>
                        </div>

                        <div className="flex-1 w-full relative mt-1">
                          {/* 全息透视光锥 (激光散射线) */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="reg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* 光罩 */}
                            <polygon points="34,65 65,15 95,50" fill="url(#reg-cone-beam)" className="opacity-40 animate-pulse" />
                            <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                            <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                            {/* 激光雷达发射核心 */}
                            <circle cx="34" cy="65" r="1.5" fill="#10b981" className="animate-ping" />
                          </svg>

                          {/* 机器狗本体 (靠左下安稳站立) */}
                          <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                            <RobotDog className="w-full h-full object-contain" status="registered" />
                          </div>

                          {/* 3D 浮空倾斜全息卡片 (跟在机器狗身侧上部，带透视翻折) */}
                          <div className="absolute top-1 right-1 w-[52%] max-w-[150px] bg-emerald-950/80 border border-cyan-400/50 p-1.5 sm:p-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)] leading-tight text-emerald-300">
                            <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[8px] sm:text-[9px]">
                              Digital ID
                            </div>
                            <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[9px] sm:text-[10px]">
                              DID:2168nLB3G@CMCC.org
                            </div>
                            <div className="flex flex-col gap-0.5 text-[8px] sm:text-[9px] font-medium">
                              <div className="flex flex-col gap-0.5">
                                <span className="opacity-75">Capabilities:</span>
                                <span className="font-bold text-cyan-300 leading-tight break-words">
                                  [4 Legs, Camera, Payload:10KG/10KM]
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-75">Status:</span>
                                <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                  Active <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping inline-block"></span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                    </>
                  )}
                  {effectiveStageConfig.showHomeDomainDevice && effectiveStageConfig.showRegisteredDevice && (
                    <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex-1 flex flex-col h-[180px] lg:h-[210px] overflow-hidden rounded-xl p-3 relative">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                        <ShieldCheck className="w-5 h-5 animate-pulse" />
                        <div>
                          <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                          <div className="text-[10px] opacity-70">Registered Device</div>
                        </div>
                      </div>

                      <div className="flex-1 w-full relative mt-1">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="stage4-reg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" stopOpacity="0.7" />
                              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polygon points="34,65 65,15 95,50" fill="url(#stage4-reg-cone-beam)" className="opacity-40 animate-pulse" />
                          <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <circle cx="34" cy="65" r="1.5" fill="#10b981" className="animate-ping" />
                        </svg>

                        <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                          <RobotDog className="w-full h-full object-contain" status="registered" />
                        </div>

                        <div className="absolute top-1 right-1 w-[52%] max-w-[150px] bg-emerald-950/80 border border-cyan-400/50 p-1.5 sm:p-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)] leading-tight text-emerald-300">
                          <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[8px] sm:text-[9px]">
                            Digital ID
                          </div>
                          <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[9px] sm:text-[10px]">
                            DID:2168nLB3G@CMCC.org
                          </div>
                          <div className="flex flex-col gap-0.5 text-[8px] sm:text-[9px] font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span className="opacity-75">Capabilities:</span>
                              <span className="font-bold text-cyan-300 leading-tight break-words">
                                [4 Legs, Camera, Payload:10KG/10KM]
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="opacity-75">Status:</span>
                              <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                Active <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping inline-block"></span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {effectiveStageConfig.showRegisteredDevice && !effectiveStageConfig.hideDeviceArrow && (
                  <div className="flex justify-between text-[10px] lg:text-xs text-blue-200 mt-4 px-1 font-medium">
                    <span>① 身份申请</span>
                    <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                    <span>② 业务授权</span>
                    <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                    <span>③ 能力发布</span>
                  </div>
                )}
                {effectiveStageConfig.showRegisteredDevice && effectiveStageConfig.hideDeviceArrow && (
                  <div className="mt-4 h-[18px] opacity-0 pointer-events-none" aria-hidden="true" />
                )}
              </div>
            </SciFiPanel>
          </div>

          {/* 中间列：6G核心网 3D 拓扑与平面网元、上方弧线数据流 */}
          <div className="md:col-span-6">
            <NetworkTopology3D
              stage={stage}
              activeFlowType={effectiveStageConfig.activeFlowType}
              coreFunctions={effectiveStageConfig.coreFunctions}
              agentBubble={effectiveStageConfig.agentBubble}
              title={effectiveStageConfig.topologyTitle}
            />
          </div>

          {/* 右列：实时状态 */}
          <div className="md:col-span-3">
            <SciFiPanel className="h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-blue-200 text-base lg:text-lg font-bold text-center mb-4 pb-3 border-b border-blue-500/30">
                  实时状态
                </h2>
                
                <div className="flex flex-col flex-1 gap-4 justify-between">
                  {/* 子栏目 1: 实时状态 */}
                  <div className="border border-blue-500/30 rounded-lg p-2.5 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    {stage === 8 ? (
                      <LatencyChart points={latencySeries.points} error={latencySeries.error} />
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-300" />
                          </div>
                          <h3 className="text-white font-bold text-sm lg:text-base">{effectiveStageConfig.statusTitle}</h3>
                        </div>
                        <div className="flex flex-col">
                          {effectiveStageConfig.statusRows.map((item) => (
                            <StatusRow
                              key={item.label}
                              label={item.label}
                              value={item.value}
                              status={item.status}
                              isMono={item.isMono}
                              valueClassName={item.isMono ? "leading-tight text-right break-all" : ""}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 子栏目 2: 智能体日志 */}
                  <div className="agent-log-module border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                        <Network className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">智能体日志</h3>
                    </div>
                    <div className="agent-log-scroll h-[128px] overflow-auto rounded border border-blue-500/20 bg-slate-950/35 px-2 py-1.5">
                      <div className="flex min-w-full flex-col gap-1 text-[10px] lg:text-xs font-mono leading-snug text-blue-100/90">
                        {effectiveStageConfig.logs.map(([time, agent, message]) => (
                          <div key={`${time}-${agent}-${message}`} className="flex items-start gap-1.5 whitespace-normal break-words">
                            <span className="shrink-0 text-cyan-300/90">{time}</span>
                            <span className="shrink-0 text-emerald-300">[{agent}]</span>
                            <span className="min-w-0 text-blue-100/80">{message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 子栏目 3: 工作流 */}
                  <div className="border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    <div className="flex items-center gap-2.5 mb-2 opacity-80">
                      <div className="w-7 h-7 rounded bg-blue-900/15 border border-blue-500/20 flex items-center justify-center">
                        <ArrowRightCircle className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">工作流</h3>
                    </div>
                    <div className="flex flex-col">
                      {effectiveStageConfig.workflow.map((item) => (
                        <StatusRow key={item.label} label={item.label} value={item.value} status={item.status} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SciFiPanel>
          </div>
        </div>

        {/* 底部步骤条 - 升级为精致高对比度毛玻璃条 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
          {effectiveStageConfig.steps.map((step) => {
            const StepIcon = step.icon;
            const isDone = step.status === "success";
            const isWorking = step.status === "working";

            return (
              <div
                key={step.id}
                className={`border bg-slate-900/30 backdrop-blur-md rounded-lg p-3 flex items-center gap-3 relative overflow-hidden shadow-md ${
                  isDone
                    ? "border-emerald-500/80 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                    : isWorking
                      ? "border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                      : "border-blue-500/30"
                }`}
              >
                {(isDone || isWorking) && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isDone
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
                      : "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                  }`} />
                )}
                <span className={`font-mono font-bold text-lg ${
                  isDone ? "text-emerald-400 opacity-90" : isWorking ? "text-amber-300 opacity-90" : "text-blue-300 opacity-60"
                }`}>
                  {step.id}
                </span>
                <StepIcon className={`w-6 h-6 ${
                  isDone ? "text-emerald-400" : isWorking ? "text-amber-300 animate-pulse" : "text-blue-300/80"
                }`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-blue-100 font-bold text-sm leading-tight">{step.title}</span>
                  <span className={`text-xs font-semibold ${isDone ? "text-emerald-400" : isWorking ? "text-amber-300" : "text-blue-300/70"}`}>
                    {step.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 底部反光效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/10 to-transparent -z-10 pointer-events-none transform scale-y-[-1] opacity-50 blur-xl"></div>
    </div>
  );
}
