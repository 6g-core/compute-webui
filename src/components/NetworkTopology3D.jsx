import { useMemo } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Cpu,
  Database,
  LoaderCircle,
  Radio,
} from 'lucide-react';
import { getTopologyFlowConfig } from '../topologyFlowConfig';
import { formatSystemAgentBubbleLabel, normalizeWorkflowLabel } from '../config/stageConfig.jsx';
import { applyStoryProfileToValue } from '../config/storyScenario.js';
import { isQosExperienceStage, shouldShowTokenTunnel } from '../utils/topologyStageVisibility.js';
import acnImage from '../ACN.png';
import computingImage from '../Computing.png';

const DAP_GROUP_BY_NODE = {
  SRF: 'intelligent',
  SystemAgent: 'intelligent',
  ConnectionAgent: 'intelligent',
  ACN: 'intelligent',
  DCF: 'data',
  DSF: 'data',
  IDM: 'data',
  Computing: 'computing',
};

const UP_NODE_KEYS = new Set(['UPF', 'Gateway', 'AgentGW', 'OttAgentGW']);
const CP_TOOL_NAMES = new Set(['AM Tool', 'SM Tool', 'Policy Tool', 'UDM Tool']);

const LOGICAL_ANCHORS = {
  RobotDog: { x: 15, y: 88 },
  UE: { x: 38, y: 88 },
  MarketAgent: { x: 62, y: 88 },
  MechanicalArm: { x: 85, y: 88 },
  AIPC: { x: 27, y: 82 },
  gNB: { x: 50, y: 56.5 },
  SRF: { x: 34, y: 25 },
  SystemAgent: { x: 34, y: 25 },
  ConnectionAgent: { x: 34, y: 25 },
  ACN: { x: 34, y: 25 },
  DCF: { x: 50, y: 25 },
  DSF: { x: 50, y: 25 },
  IDM: { x: 50, y: 25 },
  Computing: { x: 66, y: 25 },
  UPF: { x: 50, y: 43.5 },
  Gateway: { x: 62, y: 43.5 },
  AgentGW: { x: 68, y: 43.5 },
  OttAgentGW: { x: 75, y: 43.5 },
};

const ENDPOINTS = [
  {
    key: 'RobotDog', label: '机器狗', eyebrow: 'PHYSICAL AI', accent: '#2dd4bf',
  },
  {
    key: 'UE', label: 'AR 眼镜', eyebrow: 'PHYSICAL AI', accent: '#22d3ee',
  },
  {
    key: 'MarketAgent', label: '超市智能体', eyebrow: 'DIGITAL AGENT', accent: '#818cf8',
  },
  {
    key: 'MechanicalArm', label: '机械臂', eyebrow: 'PHYSICAL AI', accent: '#f59e0b',
  },
  {
    key: 'AIPC', label: 'AI PC', eyebrow: 'AI TERMINAL', accent: '#60a5fa',
  },
];

const CAROUSEL_SLOTS = [
  { key: 'front', x: 50, y: 89, scale: 1.3, opacity: 1, zIndex: 48 },
  { key: 'right', x: 72, y: 81.5, scale: 0.94, opacity: 0.9, zIndex: 36 },
  { key: 'back', x: 63, y: 71.5, scale: 0.84, opacity: 0.74, zIndex: 24 },
  { key: 'back-left', x: 37, y: 71.5, scale: 0.84, opacity: 0.74, zIndex: 24 },
  { key: 'left', x: 28, y: 81.5, scale: 0.94, opacity: 0.9, zIndex: 36 },
];

const DEFAULT_INTENT_SOURCE_BY_STAGE = {
  1: 'RobotDog',
  2: 'RobotDog',
  3: 'RobotDog',
  4: 'UE',
  5: 'RobotDog',
  6: 'UE',
  7: 'RobotDog',
  8: 'RobotDog',
  9: 'UE',
  10: 'MarketAgent',
  21: 'UE',
  22: 'UE',
};

const DAP_CAPABILITIES = [
  { key: 'intelligent', label: '智能网元', english: 'INTELLIGENT NFs', icon: BrainCircuit, color: '#a78bfa' },
  { key: 'data', label: '数据网元', english: 'DATA NFs', icon: Database, color: '#22d3ee' },
  { key: 'computing', label: '算力网元', english: 'COMPUTING NFs', icon: Cpu, color: '#fbbf24' },
];

const BUBBLE_SLOTS = {
  intelligent: { left: '32.5%', top: '20.6%', width: '18%' },
  data: { left: '32.5%', top: '20.6%', width: '18%' },
  computing: { left: '76.5%', top: '20.6%', width: '17%' },
  up: { left: '37%', top: '40%', width: '26%' },
};

const INTENT_VALIDATION_SLOT = { left: '32.5%', top: '20.6%', width: '18%' };

const getBubbleGroup = (targetNode) => (
  DAP_GROUP_BY_NODE[targetNode] || (UP_NODE_KEYS.has(targetNode) ? 'up' : null)
);

const buildRanAvoidingTerminalPath = (start, end) => {
  const routeOnRight = ((start.x + end.x) / 2) >= 50;
  const sideDirection = routeOnRight ? 1 : -1;
  const startIsCloserToRan = Math.abs(start.x - 50) <= Math.abs(end.x - 50);
  const firstControlX = startIsCloserToRan
    ? start.x + (sideDirection * 10)
    : start.x - (sideDirection * 4);
  const secondControlX = startIsCloserToRan
    ? end.x - (sideDirection * 4)
    : end.x + (sideDirection * 10);
  const controlY = 34.5;

  return {
    side: routeOnRight ? 'right' : 'left',
    path: `M ${start.x} ${start.y} C ${firstControlX} ${controlY}, ${secondControlX} ${controlY}, ${end.x} ${end.y}`,
  };
};

const ProgressIcon = ({ status, className = 'h-3.5 w-3.5' }) => {
  if (status === 'success') return <CheckCircle2 className={`${className} shrink-0 text-emerald-300`} />;
  if (status === 'working') return <LoaderCircle className={`${className} shrink-0 animate-spin text-cyan-100`} />;
  return <CircleDot className={`${className} shrink-0 text-slate-500`} />;
};

const WorkflowBubble = ({ bubble }) => {
  if (!bubble) return null;

  const lines = (Array.isArray(bubble.lines) ? bubble.lines : [bubble.text]).filter(Boolean);
  const items = Array.isArray(bubble.items) ? bubble.items : [];
  const tasks = Array.isArray(bubble.tasks) ? bubble.tasks : [];
  const isVoiceIntent = bubble.variant === 'voiceIntent';
  const isIntentValidation = bubble.variant === 'intentValidation';
  const isPlan = bubble.variant === 'stage2SystemPlan';
  const isCompactPlan = isPlan && bubble.compact;
  const isVerticalPlan = isPlan && bubble.orientation === 'vertical';
  const isDapGlassPlan = isPlan && bubble.tone === 'dapGlass';
  const hasLongPlanTitle = isVerticalPlan && String(bubble.title || '').length > 18;
  const isIntentTone = isVoiceIntent && bubble.tone === 'intent';
  const isSandbox = bubble.variant === 'sandboxServices';
  const suppressDarkShadow = Boolean(bubble.suppressDarkShadow);
  const sandboxTools = isSandbox ? items.filter((item) => !item.acceptance) : [];
  const activeSandboxItem = isSandbox && bubble.sandboxFocusIndex >= 0
    ? sandboxTools[Math.min(bubble.sandboxFocusIndex, sandboxTools.length - 1)]
    : null;
  const sandboxComplete = isSandbox && bubble.sandboxFocusIndex >= sandboxTools.length;

  return (
    <div
      className={`stage-motion-bubble absolute z-50 rounded-xl border backdrop-blur-xl transition-[opacity,transform,border-color,box-shadow] duration-200 ${isVerticalPlan ? 'overflow-visible' : 'overflow-hidden'} ${
        isVoiceIntent
          ? isIntentTone
            ? 'border-[#b9964e]/80 bg-[#171207]/95 shadow-[0_0_26px_rgba(185,150,78,0.34)]'
            : 'border-cyan-200/80 bg-cyan-950/95 shadow-[0_0_26px_rgba(34,211,238,0.42)]'
          : isDapGlassPlan
            ? suppressDarkShadow
              ? 'border-violet-300/60 bg-[linear-gradient(145deg,rgba(76,29,149,0.48),rgba(15,23,42,0.58)_52%,rgba(91,33,182,0.3))] shadow-[0_0_24px_rgba(139,92,246,0.3)]'
              : 'border-violet-300/60 bg-[linear-gradient(145deg,rgba(76,29,149,0.48),rgba(15,23,42,0.58)_52%,rgba(91,33,182,0.3))] shadow-[0_14px_34px_rgba(0,0,0,0.46),0_0_24px_rgba(139,92,246,0.3)]'
          : suppressDarkShadow
            ? 'border-cyan-300/45 bg-[#050e1d]/95 shadow-[0_0_22px_rgba(34,211,238,0.2)]'
            : 'border-cyan-300/45 bg-[#050e1d]/95 shadow-[0_12px_30px_rgba(0,0,0,0.46),0_0_22px_rgba(34,211,238,0.16)]'
      } ${bubble.className || ''}`}
      style={bubble.style || {}}
      data-workflow-bubble={bubble.targetNode || 'planning'}
      data-planning-reference={isPlan ? 'stage22' : undefined}
    >
      {isVerticalPlan && !suppressDarkShadow && (
        <div
          className={`pointer-events-none absolute -bottom-[8px] left-1/2 z-[-1] h-[12px] w-[88%] rounded-[50%] border ${isDapGlassPlan ? 'border-violet-200/40 bg-violet-300/15 shadow-[0_0_18px_rgba(139,92,246,0.34)]' : 'border-cyan-200/35 bg-cyan-300/10 shadow-[0_0_18px_rgba(34,211,238,0.28)]'}`}
          style={{ transform: 'translateX(-50%) perspective(120px) rotateX(64deg)' }}
          aria-hidden="true"
        />
      )}
      {isDapGlassPlan && <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.12] via-violet-300/[0.035] to-transparent" />}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${isIntentTone ? 'via-[#ead79b]/80' : isDapGlassPlan ? 'via-violet-200/85' : 'via-cyan-200/80'}`} />
      <div className={`${isVerticalPlan ? 'h-full px-2.5 py-1.5 text-[11px]' : isCompactPlan ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'} font-bold leading-[1.22] text-blue-50`}>
        {isVoiceIntent ? (
          <div className="flex items-start gap-2">
            <Radio className={`mt-0.5 h-4 w-4 shrink-0 animate-pulse ${isIntentTone ? 'text-[#ead79b]' : 'text-cyan-100'}`} />
            <div className={`min-w-0 break-words ${isIntentTone ? 'text-[#ead79b]' : ''}`}>{lines.map((line) => <div key={line}>{line}</div>)}</div>
          </div>
        ) : isIntentValidation ? (
          <div className="flex flex-col gap-1.5">
            {lines.map((line) => (
              <div key={line} className="flex min-w-0 items-start gap-1.5 text-[12px] font-black">
                <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span className="min-w-0 break-words">{line}</span>
              </div>
            ))}
          </div>
        ) : isPlan ? (
          <>
            <div className={`${isVerticalPlan ? 'mb-0.5 whitespace-nowrap text-[8px] tracking-[0.06em]' : isCompactPlan ? 'mb-0.5 text-[8px]' : 'mb-1 text-[9px]'} font-black uppercase ${isDapGlassPlan ? 'text-violet-200/90' : 'text-cyan-300/80'}`}>{bubble.heading || '网络任务规划'}</div>
            <div className={`${isVerticalPlan ? hasLongPlanTitle ? 'mb-1 text-[11px] leading-[1.08]' : 'mb-1 text-[13px] leading-tight' : isCompactPlan ? 'mb-1 text-[12px] leading-tight' : 'mb-2 text-[13px] leading-tight'} font-black text-white`}>{bubble.title}</div>
            <div className={`grid ${isVerticalPlan ? 'grid-cols-1 gap-[1px]' : 'grid-cols-3 gap-1'}`}>
              {tasks.map((task) => (
                <div key={task.label} className={`${isVerticalPlan ? 'grid grid-cols-[14px_minmax(0,1fr)] grid-rows-2 items-center gap-x-1.5 px-1.5 py-1' : `flex min-w-0 flex-col items-start ${isCompactPlan ? 'gap-0.5 px-1 py-1' : 'gap-1 px-1.5 py-1.5'}`} min-w-0 rounded-md border ${isDapGlassPlan ? 'border-violet-200/20 bg-violet-200/[0.07]' : 'border-white/10 bg-white/[0.035]'}`}>
                  <ProgressIcon status={task.status} className={`${isVerticalPlan ? 'row-span-2 self-center' : ''} h-3.5 w-3.5`} />
                  {task.owner && (
                    <span className={`${isVerticalPlan ? 'col-start-2 row-start-1' : ''} w-full truncate text-[9px] font-bold leading-none ${isDapGlassPlan ? 'text-violet-200/80' : 'text-cyan-300/70'}`} title={task.owner}>
                      {task.owner}
                    </span>
                  )}
                  <span className={`${isVerticalPlan ? 'col-start-2 row-start-2 whitespace-pre-line break-words text-[10px]' : isCompactPlan ? 'whitespace-nowrap text-[9px]' : 'whitespace-pre-line break-words text-[10px]'} min-w-0 leading-[1.12] text-blue-50`}>
                    {formatSystemAgentBubbleLabel(task.label)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : isSandbox ? (
          <>
            <div className="text-[12px] font-black text-cyan-50">{bubble.title}</div>
            <div className="my-1.5 grid grid-cols-6 gap-1" aria-label="Sandbox Tool progress">
              {sandboxTools.map((item) => (
                <span key={item.label} className="flex justify-center" title={normalizeWorkflowLabel(item.label)}>
                  <ProgressIcon status={item.status} className="h-3 w-3" />
                </span>
              ))}
            </div>
            <div className="break-words border-t border-dashed border-cyan-300/25 pt-1.5 text-[12px] font-bold leading-[1.15] text-blue-50">
              {sandboxComplete
                ? normalizeWorkflowLabel(items.find((item) => item.acceptance)?.label || '编排结果验收通过')
                : activeSandboxItem
                  ? normalizeWorkflowLabel(activeSandboxItem.label)
                  : '准备按序调用 6 项 Tool'}
            </div>
          </>
        ) : items.length ? (
          <>
            {bubble.title && <div className="mb-1.5 text-[12px] font-black text-cyan-50">{bubble.title}</div>}
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <div
                  key={item.label}
                  className={`flex min-w-0 items-start gap-1.5 text-[11px] leading-[1.16] ${
                    item.acceptance
                      ? 'mt-0.5 border-t border-dashed border-emerald-300/30 pt-1.5 text-emerald-100'
                      : 'text-blue-50'
                  }`}
                >
                  <ProgressIcon status={item.status} />
                  <span className="min-w-0 break-words">{normalizeWorkflowLabel(item.label)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-start gap-2">
            <ProgressIcon status={bubble.status || 'working'} />
            <div className="min-w-0 break-words">{lines.map((line) => <div key={line}>{line}</div>)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const QosMetricsChart = ({ metrics = [] }) => {
  const chartWidth = 240;
  const chartHeight = 122;
  const padding = { top: 14, right: 14, bottom: 28, left: 46 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const latestPoint = metrics[metrics.length - 1];
  const values = metrics.flatMap((point) => [point.sendrate_kbps, point.gbr_kbps]);
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1000;
  const minValue = Math.max(0, Math.floor(rawMin - 200));
  const maxValue = Math.max(minValue + 500, Math.ceil(rawMax + 200));

  const chartPoints = metrics.map((point, index) => {
    const x = padding.left + (metrics.length <= 1 ? 0 : (index / (metrics.length - 1)) * plotWidth);
    const sendrateY = padding.top + ((maxValue - point.sendrate_kbps) / (maxValue - minValue)) * plotHeight;
    const gbrY = padding.top + ((maxValue - point.gbr_kbps) / (maxValue - minValue)) * plotHeight;
    return { ...point, x, sendrateY, gbrY };
  });

  const buildLinePath = (key) => chartPoints.map((point, index) => (
    `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point[key].toFixed(1)}`
  )).join(' ');
  const sendratePath = buildLinePath('sendrateY');
  const gbrPath = buildLinePath('gbrY');
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('zh-CN', {
    minute: '2-digit',
    second: '2-digit',
  });
  const startLabel = metrics[0] ? formatTime(metrics[0].timestamp) : '--:--';
  const endLabel = latestPoint ? formatTime(latestPoint.timestamp) : '--:--';

  return (
    <section
      className="qos-metrics-chart pointer-events-none absolute left-[76%] top-[55%] z-[45] flex h-[31%] w-[19%] flex-col overflow-hidden rounded-lg border border-cyan-200/45 bg-[#030914]/92 px-2.5 py-2.5 text-cyan-50 shadow-[0_0_0_1px_rgba(8,47,73,0.45),0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md"
      aria-label="QoS metrics table"
      data-qos-metrics-count={metrics.length}
    >
      <header className="mb-1.5 flex shrink-0 items-end justify-between gap-2 border-b border-cyan-200/20 pb-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-black leading-none tracking-[0.02em] text-cyan-50">QoS保障曲线</h3>
          <p className="mt-1 font-mono text-[9px] leading-none text-blue-100/60">sendrate / GBR</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1 font-mono leading-none">
          <span className="text-[18px] font-black text-emerald-200">Q{latestPoint ? latestPoint.q_lvl : '--'}</span>
          <span className="text-[9px] text-blue-100/55">q_lvl</span>
        </div>
      </header>

      <svg className="min-h-0 flex-1 overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="QoS metrics chart">
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.42)" strokeWidth="0.8" />
        <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.42)" strokeWidth="0.8" />
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + ratio * plotHeight;
          const label = Math.round(maxValue - ratio * (maxValue - minValue));
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="rgba(125,211,252,0.13)" strokeWidth="0.6" />
              <text x={padding.left - 5} y={y + 4} textAnchor="end" className="fill-blue-100/65 text-[10px] font-mono">{label}</text>
            </g>
          );
        })}
        {metrics.length ? (
          <>
            <path d={gbrPath} fill="none" stroke="#fbbf24" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d={sendratePath} fill="none" stroke="#22d3ee" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <text x="50%" y="50%" textAnchor="middle" className="fill-blue-100/65 text-[13px] font-bold">等待QoS推送</text>
        )}
        <text x={padding.left} y={chartHeight - 5} className="fill-blue-100/55 text-[9px] font-mono">{startLabel}</text>
        <text x={padding.left + plotWidth} y={chartHeight - 5} textAnchor="end" className="fill-blue-100/55 text-[9px] font-mono">{endLabel}</text>
        <text x="7" y={padding.top + plotHeight / 2} transform={`rotate(-90 7 ${padding.top + plotHeight / 2})`} textAnchor="middle" className="fill-cyan-100/60 text-[9px] font-mono">kbps</text>
      </svg>

      <footer className="mt-1.5 flex shrink-0 items-center justify-between gap-2 font-mono text-[10px] leading-none text-blue-100/70">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />sendrate</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" />GBR</span>
      </footer>
    </section>
  );
};

const PlaneShell = ({ code, title, english, className, color, active = false, children, ariaLabel }) => {
  const isDap = code === 'DAP';
  const clipPath = isDap
    ? 'polygon(12.3% 0,87.7% 0,100% 100%,0 100%)'
    : 'polygon(9% 0,91% 0,100% 100%,0 100%)';

  return (
    <div className={`pointer-events-none absolute z-20 ${className}`} aria-label={ariaLabel || `${code} ${title}`}>
      <div
        className={`absolute inset-0 opacity-55 blur-[0.4px] ${isDap ? 'translate-y-[16px]' : 'translate-y-[10px]'}`}
        style={{
          background: `linear-gradient(180deg, ${color}20, rgba(2,6,23,0.8))`,
          clipPath,
        }}
      />
      <div
        className={`network-plane-surface relative h-full overflow-hidden border transition-all duration-500 ${active ? 'network-plane-active' : ''}`}
        style={{
          '--plane-color': color,
          borderColor: `${color}${active ? 'c8' : '78'}`,
          background: `linear-gradient(118deg, rgba(3,10,24,0.97) 0%, ${color}22 48%, rgba(4,13,29,0.96) 100%)`,
          clipPath,
          boxShadow: active
            ? `0 14px 30px rgba(0,0,0,0.45), 0 0 28px ${color}66, inset 0 0 30px ${color}20`
            : `0 14px 30px rgba(0,0,0,0.4), 0 0 18px ${color}28, inset 0 0 24px ${color}14`,
        }}
      >
        <div className="absolute inset-x-[2%] top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        {!isDap && (
          <div className="network-plane-label absolute left-1/2 top-1/2 z-20 flex items-center gap-3 whitespace-nowrap" data-plane-label={code}>
            <span className="network-plane-code text-[27px] font-black leading-none tracking-[-0.04em] text-white [text-shadow:0_2px_0_rgba(15,23,42,1),0_0_14px_var(--plane-color)]">
              <span className="network-plane-code-primary">{code}</span>
              <span className="network-plane-code-reflection-window" aria-hidden="true">
                <span className="network-plane-code-reflection">{code}</span>
              </span>
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-[14px] font-normal tracking-[0.08em] text-blue-50">{title}</span>
              <span className="text-[8px] font-normal tracking-[0.16em] text-slate-300">{english}</span>
            </span>
          </div>
        )}
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  );
};

const MetallicDefs = ({ id, accent }) => (
  <defs>
    <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f8fafc" />
      <stop offset="0.34" stopColor="#94a3b8" />
      <stop offset="0.7" stopColor="#334155" />
      <stop offset="1" stopColor="#0f172a" />
    </linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={accent} stopOpacity="0.72" />
      <stop offset="1" stopColor="#020617" stopOpacity="0.92" />
    </linearGradient>
    <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.8" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

const GlassesGlyph = ({ accent }) => (
  <svg viewBox="0 0 112 78" className="h-[66px] w-[98px] overflow-visible" aria-hidden="true">
    <MetallicDefs id="glasses" accent={accent} />
    <path d="M14 29 Q30 21 50 27 L47 51 Q25 58 17 43 Z" fill="url(#glasses-glass)" stroke={accent} strokeWidth="2" />
    <path d="M62 27 Q82 21 98 29 L95 43 Q87 58 65 51 Z" fill="url(#glasses-glass)" stroke={accent} strokeWidth="2" />
    <path d="M49 31 Q56 26 63 31" fill="none" stroke="url(#glasses-metal)" strokeWidth="5" strokeLinecap="round" />
    <path d="M16 30 L5 24 M98 30 L108 23" fill="none" stroke="url(#glasses-metal)" strokeWidth="5" strokeLinecap="round" />
    <path d="M23 32 L42 28 M70 28 L90 32" stroke="#e0fbff" strokeWidth="1" opacity="0.8" filter="url(#glasses-glow)" />
    <circle cx="56" cy="36" r="2" fill="#e0fbff" filter="url(#glasses-glow)" />
  </svg>
);

const MarketAgentImage = () => (
  <img
    src={acnImage}
    alt=""
    aria-hidden="true"
    className="h-[82px] w-[98px] object-contain drop-shadow-[0_0_14px_rgba(129,140,248,0.42)]"
    draggable="false"
  />
);

const AIPCImage = () => (
  <img
    src={computingImage}
    alt=""
    aria-hidden="true"
    className="h-[82px] w-[98px] object-contain drop-shadow-[0_0_14px_rgba(96,165,250,0.45)]"
    draggable="false"
  />
);

const MechanicalArmGlyph = ({ accent }) => (
  <svg viewBox="0 0 112 78" className="h-[66px] w-[98px] overflow-visible" aria-hidden="true">
    <MetallicDefs id="arm" accent={accent} />
    <ellipse cx="56" cy="70" rx="29" ry="5" fill="#020617" stroke={accent} strokeOpacity="0.7" />
    <path d="M39 67 L46 57 L65 57 L73 67 Z" fill="url(#arm-metal)" stroke={accent} />
    <path d="M56 57 L56 46 L39 33 L46 25 L64 40 L73 19" fill="none" stroke="url(#arm-metal)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="56" cy="46" r="6" fill="#0f172a" stroke={accent} strokeWidth="2" /><circle cx="43" cy="29" r="5" fill="#0f172a" stroke={accent} strokeWidth="2" /><circle cx="73" cy="19" r="5" fill="#0f172a" stroke={accent} strokeWidth="2" />
    <path d="M73 15 L67 6 M76 15 L84 7" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" filter="url(#arm-glow)" />
  </svg>
);

const BaseStationGlyph = ({ accent = '#38bdf8' }) => (
  <svg viewBox="0 0 112 96" className="h-[82px] w-[102px] overflow-visible" aria-hidden="true">
    <MetallicDefs id="ran" accent={accent} />
    <path d="M56 14 L31 82 H81 Z" fill="none" stroke="url(#ran-metal)" strokeWidth="6" strokeLinejoin="round" />
    <path d="M40 59 H72 M35 72 H77 M47 40 H65" stroke={accent} strokeWidth="1.5" opacity="0.82" />
    <path d="M56 15 V6" stroke={accent} strokeWidth="3" strokeLinecap="round" filter="url(#ran-glow)" />
    <path d="M44 19 Q33 29 44 39 M68 19 Q79 29 68 39" fill="none" stroke={accent} strokeWidth="2" opacity="0.9" filter="url(#ran-glow)" />
    <path d="M36 12 Q18 29 36 47 M76 12 Q94 29 76 47" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.55" />
    <ellipse cx="56" cy="84" rx="31" ry="6" fill="#020617" stroke={accent} strokeOpacity="0.7" />
  </svg>
);

const ENDPOINT_GLYPHS = {
  UE: GlassesGlyph,
  MarketAgent: MarketAgentImage,
  MechanicalArm: MechanicalArmGlyph,
  AIPC: AIPCImage,
};

const EndpointNode = ({ endpoint, highlighted, slot, isFront, robotDogVisual: RobotDogVisual }) => {
  const Glyph = ENDPOINT_GLYPHS[endpoint.key];

  return (
    <div
      className={`absolute transition-[left,top,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${highlighted ? 'stage-motion-node-active' : ''}`}
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        zIndex: slot.zIndex,
        opacity: slot.opacity,
        transform: `translate(-50%, -50%) scale(${slot.scale * (highlighted ? 1.06 : 1)})`,
      }}
      data-endpoint={endpoint.key}
      data-carousel-position={slot.key}
    >
      <div className="relative flex w-[150px] flex-col items-center">
        <div
          className={`absolute left-1/2 top-[61px] h-4 -translate-x-1/2 rounded-[50%] border transition-all duration-500 ${isFront ? 'w-[116px] opacity-100' : 'w-[100px] opacity-70'}`}
          style={{ borderColor: isFront ? '#fbbf24' : endpoint.accent, background: `radial-gradient(ellipse, ${isFront ? '#f59e0b' : endpoint.accent}4d 0%, transparent 72%)`, boxShadow: `0 0 ${isFront ? 30 : 16}px ${isFront ? '#f59e0b' : endpoint.accent}88` }}
        />
        <div className="absolute left-1/2 top-[14px] h-[52px] w-px -translate-x-1/2 opacity-35" style={{ background: `linear-gradient(transparent, ${endpoint.accent})` }} />
        {endpoint.key === 'RobotDog' && RobotDogVisual ? (
          <RobotDogVisual className="h-[72px] w-[112px]" status="neutral" />
        ) : (
          <Glyph accent={endpoint.accent} />
        )}
        <div className="relative z-20 -mt-1 min-w-[120px] text-center [text-shadow:0_2px_5px_rgba(2,6,23,1),0_0_10px_rgba(34,211,238,0.28)]">
          <div className="text-[14px] font-black leading-none tracking-[0.06em] text-blue-50">{endpoint.label}</div>
          <div className={`mt-1.5 text-[7px] font-bold tracking-[0.16em] ${isFront ? 'text-amber-100' : 'text-slate-300'}`}>{endpoint.eyebrow}</div>
        </div>
      </div>
    </div>
  );
};

const RANNode = ({ highlighted }) => (
  <div className="absolute left-1/2 top-[56.5%] z-[35] -translate-x-1/2 -translate-y-1/2 transition-all duration-500" data-network-node="RAN">
    <div className={`relative flex w-[150px] flex-col items-center transition-transform duration-500 ${highlighted ? 'scale-110' : ''}`}>
      <div className={`absolute left-1/2 top-[45px] h-12 w-32 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(34,211,238,0.18)_0%,rgba(14,165,233,0.07)_45%,transparent_72%)] blur-[2px] ${highlighted ? 'opacity-90' : 'opacity-60'}`} />
      <div className={`absolute left-1/2 top-[46px] h-12 w-32 -translate-x-1/2 rounded-[50%] border border-cyan-200/20 ${highlighted ? 'opacity-90' : 'opacity-55'}`} />
      <div className="absolute left-1/2 top-[50px] h-8 w-24 -translate-x-1/2 rounded-[50%] border border-cyan-100/25 opacity-70" />
      <BaseStationGlyph />
      <div className="relative z-20 -mt-3 px-4 py-1 text-center [text-shadow:0_2px_5px_rgba(2,6,23,1),0_0_10px_rgba(34,211,238,0.34)]">
        <div className="text-[12px] font-black leading-none text-blue-50">基站</div>
        <div className="mt-1 text-[7px] font-bold tracking-[0.24em] text-cyan-300/70">RAN ACCESS</div>
      </div>
    </div>
  </div>
);

export const NetworkTopology3D = ({
  stage,
  activeFlowType,
  agentBubble,
  agentBubbles = [],
  arSpeechText = '',
  hideRobotDogSpeech = false,
  title = '数字身份申请',
  topologyLines = null,
  highlightedNodes = [],
  stagePhaseKey = null,
  qosMetrics = [],
  robotDogVisual,
}) => {
  const storyEndpoints = useMemo(() => applyStoryProfileToValue(ENDPOINTS), []);
  const activeFlowConfig = topologyLines
    ? { color: '#22f5ff', lines: topologyLines }
    : getTopologyFlowConfig(stage, activeFlowType);
  const showQosExperience = isQosExperienceStage(stage);
  const showTokenTunnel = shouldShowTokenTunnel(stage);
  const numericStage = Number(stage);
  const videoTransportPhase = String(stagePhaseKey || '');
  const showStage22Transport = numericStage === 22
    || numericStage === 24
    || numericStage === 8
    || (numericStage === 5 && videoTransportPhase !== 'stage5_preheating')
    || numericStage === 7;
  const isStage23CleanView = Number(stage) === 23;
  const isStage9FinalView = showQosExperience
    && ['stage9_qos_done', 'stage9_qos_clear'].includes(stagePhaseKey);
  const showStage9Sm = isStage9FinalView && !isStage23CleanView;
  const tokenTunnelTargetX = isStage9FinalView ? 76.1 : 80.8;
  const tokenTunnelPath = `M 56.5 89 L 95.6 89 Q 97 89 97 87.6 L 97 22.1 Q 97 20.7 95.6 20.7 L ${tokenTunnelTargetX} 20.7`;
  const stage9ArQosBubble = showQosExperience && !isStage23CleanView
    ? {
        targetNode: 'UE',
        lines: [Number(stage) === 24 ? '保障机器狗回传视频清晰流畅' : '增强机器狗回传的视频'],
        status: 'working',
        variant: 'voiceIntent',
        tone: 'intent',
        positionKey: 'stage9-ar-qos',
      }
    : null;
  const hasPlanningSlotSubAgentBubble = agentBubbles.some((bubble) => ['intelligent', 'data'].includes(getBubbleGroup(bubble.targetNode)));
  const planningBubbleIsConfigured = agentBubble?.variant === 'stage2SystemPlan';
  const visibleAgentBubble = hasPlanningSlotSubAgentBubble && planningBubbleIsConfigured ? null : agentBubble;
  const allBubbles = [visibleAgentBubble, ...agentBubbles, stage9ArQosBubble].filter(Boolean);
  const hasPlanningBubble = planningBubbleIsConfigured || allBubbles.some((bubble) => (
    ['stage2SystemPlan', 'intentValidation'].includes(bubble.variant)
  ));
  const hasComputingBubble = allBubbles.some((bubble) => getBubbleGroup(bubble.targetNode) === 'computing');
  const bubbleTargetNodes = allBubbles
    .map((bubble) => bubble.targetNode)
    .filter(Boolean);
  const bubbleTargetKey = bubbleTargetNodes.join('|');
  const highlightedNodeSet = useMemo(
    () => new Set([...highlightedNodes, ...bubbleTargetNodes]),
    [highlightedNodes, bubbleTargetKey],
  );
  const bubbleIntentSource = allBubbles.find((bubble) => (
    bubble.variant === 'voiceIntent' && storyEndpoints.some((endpoint) => endpoint.key === bubble.targetNode)
  ))?.targetNode;
  const highlightedIntentSource = String(stagePhaseKey || '').includes('source')
    ? highlightedNodes.find((node) => storyEndpoints.some((endpoint) => endpoint.key === node))
    : null;
  const routedIntentSource = String(stagePhaseKey || '').includes('source')
    ? activeFlowConfig.lines
        .map((line) => line.key.split('->')[0])
        .find((node) => storyEndpoints.some((endpoint) => endpoint.key === node))
    : null;
  const intentSourceKey = showQosExperience
    ? 'UE'
    : bubbleIntentSource
      || highlightedIntentSource
      || routedIntentSource
      || DEFAULT_INTENT_SOURCE_BY_STAGE[Number(stage)]
      || 'RobotDog';
  const frontEndpointIndex = Math.max(0, storyEndpoints.findIndex((endpoint) => endpoint.key === intentSourceKey));
  const carouselEndpoints = storyEndpoints.map((endpoint, index) => ({
    endpoint,
    slot: CAROUSEL_SLOTS[(index - frontEndpointIndex + storyEndpoints.length) % storyEndpoints.length],
  }));
  const displayAnchors = {
    ...LOGICAL_ANCHORS,
    ...Object.fromEntries(carouselEndpoints.map(({ endpoint, slot }) => [endpoint.key, { x: slot.x, y: slot.y }])),
  };
  const getEndpointIntentStyle = (targetNode) => {
    const anchor = displayAnchors[targetNode] || displayAnchors.RobotDog;

    return {
      left: `${anchor.x}%`,
      top: `${Math.max(64, anchor.y - 11.5)}%`,
      width: 'max-content',
      maxWidth: '24%',
      transform: 'translateX(-50%)',
      animationDelay: '620ms',
    };
  };
  const transportStart = {
    x: displayAnchors.RobotDog.x,
    y: displayAnchors.RobotDog.y - 8,
  };
  const transportEnd = {
    x: displayAnchors.UE.x,
    y: displayAnchors.UE.y - 7,
  };
  // A single high cubic arch follows the red reference in 66.png. It crosses
  // the center line above the RAN safety zone instead of intersecting the gNB.
  const stage22TransportRoute = buildRanAvoidingTerminalPath(transportStart, transportEnd);
  const stage22TransportPath = stage22TransportRoute.path;
  const toolStates = allBubbles.flatMap((bubble) => bubble.activeTools || []);
  const cpActive = toolStates.some((tool) => CP_TOOL_NAMES.has(tool));
  const shouldHideCpToolBubble = (bubble) => (
    Array.isArray(bubble.activeTools)
    && bubble.activeTools.some((tool) => CP_TOOL_NAMES.has(tool))
    && !['qoeAssurance', 'acnSkillProgress', 'sandboxServices', 'taskProgress'].includes(bubble.variant)
  );

  const groupedBubbles = allBubbles.reduce((result, bubble) => {
    if (shouldHideCpToolBubble(bubble)) return result;
    if (bubble.positionKey) {
      result[bubble.positionKey] = bubble;
      return result;
    }
    const group = getBubbleGroup(bubble.targetNode);
    if (group) result[group] = bubble;
    else result[`free-${Object.keys(result).length}`] = bubble;
    return result;
  }, {});

  const positionedBubbles = Object.values(groupedBubbles).map((bubble) => {
    if (bubble.positionKey === 'stage9-ar-qos') {
      return {
        ...bubble,
        className: '',
        style: {
          left: '50%',
          top: '77.5%',
          width: 'max-content',
          maxWidth: '32%',
          transform: 'translateX(-50%)',
        },
      };
    }

    if (bubble.positionKey === 'stage22-planning' || bubble.variant === 'stage2SystemPlan') {
      const planningTitleLength = String(bubble.title || '').length;
      const planningFrameHeight = planningTitleLength > 28
        ? '20.5%'
        : planningTitleLength > 18
          ? '18.5%'
          : '16.5%';
      return {
        ...bubble,
        compact: true,
        orientation: 'vertical',
        tone: 'dapGlass',
        suppressDarkShadow: true,
        className: 'origin-bottom',
        style: {
          left: '32.5%',
          width: '18%',
          top: '20.3%',
          height: planningFrameHeight,
          maxWidth: 'none',
          transform: 'perspective(780px) rotateY(4deg)',
        },
      };
    }

    if (bubble.variant === 'intentValidation' && getBubbleGroup(bubble.targetNode) === 'intelligent') {
      return {
        ...bubble,
        dapGroup: 'intelligent',
        suppressDarkShadow: true,
        className: '',
        style: {
          ...INTENT_VALIDATION_SLOT,
          maxWidth: 'none',
        },
      };
    }

    const group = getBubbleGroup(bubble.targetNode);
    if (group) {
      return {
        ...bubble,
        dapGroup: group,
        suppressDarkShadow: ['intelligent', 'computing'].includes(group),
        className: '',
        style: {
          ...BUBBLE_SLOTS[group],
          maxWidth: 'none',
        },
      };
    }

    const endpointIntentBubble = bubble.variant === 'voiceIntent'
      && storyEndpoints.some((endpoint) => endpoint.key === bubble.targetNode);
    if (endpointIntentBubble) {
      return {
        ...bubble,
        tone: 'intent',
        style: getEndpointIntentStyle(bubble.targetNode),
      };
    }

    const anchor = displayAnchors[bubble.targetNode] || displayAnchors.RobotDog;
    return {
      ...bubble,
      style: {
        left: `${Math.max(3, Math.min(82, anchor.x - 8))}%`,
        top: `${Math.max(62, anchor.y - 18)}%`,
        width: bubble.targetNode === 'RobotDog' ? '22%' : '18%',
      },
    };
  });

  const robotDogSpeechBubble = !hideRobotDogSpeech && stage === 2 && (!stagePhaseKey || stagePhaseKey === 'stage2_source')
    ? {
        targetNode: 'RobotDog', lines: ['Apply for the Digital ID'], status: 'success', variant: 'voiceIntent',
        tone: 'intent',
        style: getEndpointIntentStyle('RobotDog'),
      }
    : null;
  const arSpeechBubble = arSpeechText
    ? {
        targetNode: 'UE', lines: [arSpeechText], status: 'success', variant: 'voiceIntent',
        tone: 'intent',
        style: getEndpointIntentStyle('UE'),
      }
    : null;

  const categoryIsActive = (category) => [...highlightedNodeSet].some((node) => DAP_GROUP_BY_NODE[node] === category);
  const upIsActive = [...highlightedNodeSet].some((node) => UP_NODE_KEYS.has(node));
  const ranIsActive = highlightedNodeSet.has('gNB');

  return (
    <div
      className="network-static-topology relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-blue-500/35 bg-slate-900/25 p-4 shadow-[0_0_22px_rgba(0,0,0,0.35)] backdrop-blur-md"
      data-stage={stage}
      data-stage-phase={stagePhaseKey || ''}
      data-topology-layout="vertical-planes"
      data-animation-reference="stage22"
    >
      <div className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-blue-400" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-blue-400" />

      <div className="relative mb-1 flex shrink-0 items-center justify-center">
        <h2 className="text-xl font-bold tracking-wider text-blue-100">{title}</h2>
      </div>

      <div className="network-vertical-stage relative min-h-0 flex-1 overflow-hidden rounded-lg border border-blue-900/35 bg-[#020711]/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(8,47,73,0.2),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(6,78,118,0.2),transparent_48%),linear-gradient(180deg,#020611_0%,#020711_48%,#01040a_100%)]" />

        <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ran-cone-outer-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae6fd" stopOpacity="0.16" />
              <stop offset="0.3" stopColor="#38bdf8" stopOpacity="0.11" />
              <stop offset="0.72" stopColor="#0284c7" stopOpacity="0.055" />
              <stop offset="1" stopColor="#020617" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ran-cone-inner-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.17" />
              <stop offset="0.42" stopColor="#0ea5e9" stopOpacity="0.07" />
              <stop offset="1" stopColor="#0369a1" stopOpacity="0.015" />
            </linearGradient>
            <linearGradient id="ran-ray-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.54" />
              <stop offset="0.35" stopColor="#38bdf8" stopOpacity="0.32" />
              <stop offset="1" stopColor="#0284c7" stopOpacity="0.04" />
            </linearGradient>
            <pattern id="ground-dot-grid" width="2.2" height="1.8" patternUnits="userSpaceOnUse">
              <circle cx="0.35" cy="0.35" r="0.07" fill="#7dd3fc" fillOpacity="0.28" />
            </pattern>
            <clipPath id="ran-light-cone-clip">
              <path d="M 50 55.5 C 43 65, 27 82, 10 100 L 90 100 C 73 82, 57 65, 50 55.5 Z" />
            </clipPath>
            <filter id="ran-cone-soft-glow" x="-30%" y="-20%" width="160%" height="150%">
              <feGaussianBlur stdDeviation="1.45" />
            </filter>
            <filter id="background-node-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="0.45" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M 50 55.5 C 43 65, 27 82, 10 100 L 90 100 C 73 82, 57 65, 50 55.5 Z" fill="url(#ran-cone-outer-fill)" filter="url(#ran-cone-soft-glow)" opacity="0.78" />
          <path d="M 50 56 C 46 67, 37 84, 29 100 L 71 100 C 63 84, 54 67, 50 56 Z" fill="url(#ran-cone-inner-fill)" opacity="0.82" />
          <path d="M 50 55.5 C 43 65, 27 82, 10 100 L 90 100 C 73 82, 57 65, 50 55.5 Z" fill="url(#ground-dot-grid)" opacity="0.42" />
          {[18, 26, 34, 42, 50, 58, 66, 74, 82].map((x) => (
            <path key={`ground-ray-${x}`} d={`M 50 56.2 L ${x} 100`} fill="none" stroke="url(#ran-ray-gradient)" strokeWidth="0.07" opacity="0.72" />
          ))}
          <g clipPath="url(#ran-light-cone-clip)" fill="none" stroke="#38bdf8" strokeWidth="0.075" opacity="0.2">
            <path d="M 8 73 Q 50 61 92 73" />
            <path d="M 4 82 Q 50 67 96 82" />
            <path d="M 0 91 Q 50 73 100 91" />
            <path d="M -4 98 Q 50 79 104 98" />
          </g>
          <ellipse cx="50" cy="57.5" rx="5.8" ry="2.3" fill="#7dd3fc" fillOpacity="0.13" filter="url(#ran-cone-soft-glow)" />
          <g fill="none" stroke="#0ea5e9" strokeWidth="0.1" opacity="0.3">
            <path d="M 0 7 L 6 11 L 13 5 L 19 13 M 2 19 L 6 11 L 15 20" />
            <path d="M 82 0 L 87 7 L 94 3 L 100 11 M 87 7 L 92 15 L 100 11" />
          </g>
          <g fill="#38bdf8" filter="url(#background-node-glow)" opacity="0.65">
            <circle cx="6" cy="11" r="0.35" /><circle cx="13" cy="5" r="0.28" /><circle cx="15" cy="20" r="0.23" />
            <circle cx="87" cy="7" r="0.35" /><circle cx="94" cy="3" r="0.28" /><circle cx="92" cy="15" r="0.23" />
          </g>
        </svg>

        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="端侧到DAP意图NAS链路">
          <defs>
            <filter id="architecture-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g aria-label="端侧终端虚线环">
            <ellipse cx="50" cy="83.5" rx="42" ry="14.5" fill="rgba(3,105,161,0.025)" stroke="#38d8f8" strokeWidth="0.42" strokeDasharray="1.45 1.55" opacity="0.78" filter="url(#architecture-glow)" />
            <ellipse cx="50" cy="83.5" rx="36" ry="11.5" fill="none" stroke="#0ea5e9" strokeWidth="0.12" opacity="0.22" />
          </g>

        </svg>

        {showStage22Transport && (
          <svg
            className="pointer-events-none absolute inset-0 z-[23] h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-label="机器狗经UP到AR眼镜的视频传输链路"
            data-stage22-transport="RobotDog-UP-UE"
            data-stage22-layer="above-UP-below-bubble"
            data-ran-avoidance-side={stage22TransportRoute.side}
          >
            <defs>
              <filter id="stage22-transport-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.1" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path
              d={stage22TransportPath}
              fill="none"
              stroke="#3fae9f"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.68"
              filter="url(#stage22-transport-glow)"
            />
            <path
              d={stage22TransportPath}
              fill="none"
              stroke="#baf7e8"
              strokeWidth="0.58"
              strokeDasharray="1.8 4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.96"
              className="stage22-transport-flow"
              filter="url(#stage22-transport-glow)"
            />
          </svg>
        )}

        <PlaneShell code="CP" title="控制平面" english="CONTROL PLANE" color="#38bdf8" active={cpActive} className="left-[24%] top-[5%] h-[7.8%] w-[52%]" />

        <PlaneShell
          code="DAP"
          title="数据与智能平面"
          english="DATA & AI PLANE"
          color="#8b5cf6"
          active={DAP_CAPABILITIES.some(({ key }) => categoryIsActive(key))}
          className="left-[9%] top-[17.5%] h-[16.8%] w-[82%]"
        >
          <div className={`absolute inset-x-[12%] top-[7%] grid h-[42%] translate-x-[5%] ${isStage9FinalView ? 'grid-cols-[1fr_0.9fr_1fr_1.8fr] gap-[3%]' : showQosExperience ? 'grid-cols-[1fr_1.7fr_1fr_1fr] gap-[3%]' : 'grid-cols-3 gap-[8%]'}`}>
            {DAP_CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              const active = categoryIsActive(capability.key);
              const capabilityHasBubble = allBubbles.some((bubble) => getBubbleGroup(bubble.targetNode) === capability.key);
              const suppressCapabilityShadow = capability.key === 'intelligent'
                || (capabilityHasBubble && capability.key === 'computing');
              return (
                <div
                  key={capability.key}
                  className={`relative flex flex-col items-center justify-center gap-1 transition-[transform,filter] duration-[260ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${capability.key === 'computing' && hasComputingBubble ? '-translate-x-[12%]' : capability.key === 'computing' && hasPlanningBubble && !showQosExperience ? 'translate-x-[30%]' : capability.key === 'intelligent' && hasPlanningBubble && !showQosExperience ? '-translate-x-[22%]' : capability.key === 'data' && hasPlanningBubble && !showQosExperience ? 'translate-x-[30%]' : ''} ${active ? 'stage-motion-capability-active scale-110' : ''}`}
                  style={{
                    gridColumn: showQosExperience
                      ? { intelligent: '1', data: '3', computing: '4' }[capability.key]
                      : undefined,
                    translate: capability.key === 'data'
                      ? '-23% 0'
                      : capability.key === 'computing'
                        ? '-46% 0'
                        : undefined,
                    boxShadow: active && !suppressCapabilityShadow
                      ? `0 0 24px ${capability.color}44`
                      : 'none',
                  }}
                  data-dap-capability={capability.key}
                  data-bubble-offset={capability.key === 'computing' && hasComputingBubble ? 'left' : 'rest'}
                >
                  <Icon className="h-8 w-8 shrink-0 drop-shadow-[0_0_8px_currentColor]" style={{ color: capability.color }} />
                  <div className="min-w-0 text-center">
                    <div className="whitespace-nowrap text-[15px] font-black leading-none text-blue-50 [text-shadow:0_2px_4px_rgba(2,6,23,1)]">{capability.label}</div>
                    <div className="mt-1.5 whitespace-nowrap text-[8px] font-bold tracking-[0.12em] text-slate-200">{capability.english}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`network-plane-label absolute left-[14%] ${showQosExperience ? 'top-[86%]' : 'top-[83%]'} z-20 flex items-center gap-3 whitespace-nowrap`} data-plane-label="DAP">
            <span className="network-plane-code text-[27px] font-black leading-none tracking-[-0.04em] text-white [text-shadow:0_2px_0_rgba(15,23,42,1),0_0_16px_#8b5cf6]">
              <span className="network-plane-code-primary">DAP</span>
              <span className="network-plane-code-reflection-window" aria-hidden="true">
                <span className="network-plane-code-reflection">DAP</span>
              </span>
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-[14px] font-normal tracking-[0.08em] text-blue-50">数据与智能平面</span>
              <span className="text-[8px] font-normal tracking-[0.16em] text-slate-200">DATA &amp; AI PLANE</span>
            </span>
          </div>
        </PlaneShell>

        {showStage9Sm && (
          <>
            <svg
              className="pointer-events-none absolute inset-0 z-[34] h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="智能网元调用控制平面SM"
              data-stage9-sm-invocation="final"
            >
              <defs>
                <filter id="stage9-sm-call-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="0.65" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path
                d="M 25 18.8 C 26.8 16.1, 31.6 13.1, 34.4 10.2"
                fill="none"
                stroke="#4f9fc9"
                strokeWidth="0.35"
                strokeDasharray="1.2 1.1"
                strokeLinecap="round"
                opacity="0.42"
              />
              <path
                d="M 25 18.8 C 26.8 16.1, 31.6 13.1, 34.4 10.2"
                fill="none"
                stroke="#c9efff"
                strokeWidth="0.68"
                strokeDasharray="1.8 4.6"
                strokeLinecap="round"
                opacity="0.95"
                className="sm-tool-call-flow"
                filter="url(#stage9-sm-call-glow)"
              />
            </svg>
            <div className="pointer-events-none absolute left-[34.5%] top-[9%] z-[42] -translate-x-1/2 -translate-y-1/2" data-stage9-sm-badge="final">
              <div
                className="stage9-sm-tool-call-flash h-[40px] w-[120px] bg-cyan-100 p-px"
                style={{ clipPath: 'polygon(32px 0, calc(100% - 32px) 0, 100% 100%, 0 100%)' }}
              >
                <div
                  className="relative h-full w-full bg-[linear-gradient(118deg,rgba(3,10,24,0.98),rgba(14,116,144,0.4),rgba(4,13,29,0.98))]"
                  style={{ clipPath: 'polygon(31px 0, calc(100% - 31px) 0, 100% 100%, 0 100%)' }}
                >
                  <span className="absolute left-1/2 top-[38%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap text-cyan-50">
                    <Cpu className="h-3.5 w-3.5 text-cyan-200" />
                    <span className="text-[12px] font-black leading-none">SM</span>
                  </span>
                  <span className="absolute bottom-1.5 left-3 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(125,211,252,0.85)]" />
                    <span className="font-mono text-[8px] leading-none text-cyan-200">work</span>
                  </span>
                  <span className="absolute bottom-1.5 right-3 rounded-sm border border-cyan-100/80 bg-slate-950/88 px-1 py-px font-mono text-[7px] font-black uppercase leading-none tracking-[0.08em] text-cyan-100">
                    Tool
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <svg
          className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-label="正前方终端经左侧接入智能网元意图NAS链路"
          data-intent-target="intelligent"
          data-intent-routing="token-tunnel-mirror"
        >
          <defs>
            <filter id="intent-nas-around-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M 43.5 89 L 4.4 89 Q 3 89 3 87.6 L 3 22.1 Q 3 20.7 4.4 20.7 L 25.6 20.7" fill="none" stroke="#c9a34e" strokeWidth="0.35" strokeDasharray="1.2 1.1" strokeLinecap="round" opacity="0.42" />
          <path d="M 43.5 89 L 4.4 89 Q 3 89 3 87.6 L 3 22.1 Q 3 20.7 4.4 20.7 L 25.6 20.7" fill="none" stroke="#ead79b" strokeWidth="0.68" strokeDasharray="1.8 4.6" strokeLinecap="round" opacity="0.95" className="intent-nas-flow" filter="url(#intent-nas-around-glow)" />
        </svg>

        {showTokenTunnel && (
          <>
            <svg
              className="pointer-events-none absolute inset-0 z-[32] h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="AR眼镜到算力网元Token Tunnel链路"
              data-token-tunnel="stage-9"
            >
              <defs>
                <filter id="token-tunnel-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path d={tokenTunnelPath} fill="none" stroke="#63b5df" strokeWidth="1.25" strokeLinecap="round" opacity="0.82" filter="url(#token-tunnel-glow)" />
              <path d={tokenTunnelPath} fill="none" stroke="#d6f1ff" strokeWidth="0.68" strokeDasharray="1.8 4.6" strokeLinecap="round" opacity="0.95" className="token-tunnel-flow" filter="url(#token-tunnel-glow)" />
            </svg>
            <div className="token-tunnel-label pointer-events-none absolute left-[88.5%] top-[50.5%] z-[60] -translate-x-1/2 whitespace-nowrap rounded-md border border-[#73b8dc]/75 bg-[#050b14] px-3 py-1.5 text-[12px] font-black tracking-[0.08em] text-[#d6f1ff] shadow-[0_0_18px_rgba(99,181,223,0.3)]">
              Token Tunnel
            </div>
          </>
        )}

        {numericStage === 9 && <QosMetricsChart metrics={qosMetrics} />}

        <PlaneShell code="UP" title="用户平面" english="USER PLANE" color="#10b981" active={upIsActive} className="left-[18%] top-[39.5%] h-[7.8%] w-[64%]" />

        <div
          className="intent-nas-label pointer-events-none absolute left-[10.5%] top-[49%] z-[60] w-[168px] -translate-x-1/2 rounded-lg border border-[#b9964e]/70 bg-[linear-gradient(145deg,rgba(42,31,9,0.94),rgba(5,11,20,0.97)_58%)] px-3 py-2.5 text-[#ead79b] shadow-[0_10px_24px_rgba(0,0,0,0.46),0_0_18px_rgba(185,150,78,0.24)] backdrop-blur-xl"
          data-intent-nas-detail="expanded"
        >
          <div className="border-b border-[#b9964e]/35 pb-2 text-[14px] font-black tracking-[0.12em]">意图 NAS</div>
          <div className="relative mt-2 flex flex-col gap-1.5 pl-3 text-[10px] font-bold leading-[1.2] tracking-[0.03em] text-[#f0e3b8]">
            <span className="absolute bottom-1 left-[3px] top-1 w-px bg-gradient-to-b from-[#ead79b]/75 via-[#b9964e]/55 to-transparent" />
            {['原生意图入口', '端网协同', '丰富的业务需求表达'].map((item) => (
              <span key={item} className="relative whitespace-nowrap">
                <span className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[#ead79b]/80 bg-[#171207] shadow-[0_0_7px_rgba(234,215,155,0.45)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <RANNode highlighted={ranIsActive} />
        {carouselEndpoints.map(({ endpoint, slot }) => (
          <EndpointNode
            key={endpoint.key}
            endpoint={endpoint}
            slot={slot}
            highlighted={highlightedNodeSet.has(endpoint.key)}
            isFront={slot.key === 'front'}
            robotDogVisual={robotDogVisual}
          />
        ))}

        {positionedBubbles.map((bubble, index) => <WorkflowBubble key={`${bubble.targetNode || 'bubble'}-${index}`} bubble={bubble} />)}
        <WorkflowBubble bubble={robotDogSpeechBubble} />
        <WorkflowBubble bubble={arSpeechBubble} />
      </div>
    </div>
  );
};
