import React, { useEffect, useRef, useState } from 'react';
import { 
  Wifi, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Shield, 
  FileBadge, 
  Link as LinkIcon, 
  RadioReceiver, 
  Database, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Network, 
  ArrowRightCircle, 
  Cloud, 
  Globe, 
  Box,
  Share2,
  Radio,
  RadioTower,
  CircleDot,
  RotateCcw,
  Zap,
  Cpu
} from 'lucide-react';

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
        {status === 'pending' && <CircleDot className="w-3.5 h-3.5 text-blue-500" />}
      </div>
    </div>
  );
};

const NetworkTopology3D = ({ activeFlowType, onSelectFlow }) => {
  const nodes = {
    UE: { name: "AR Glasses (6G终端)", x: 14, y: 74, color: "#22f5ff", image: "/topology/glasses_transparent.png", size: "w-20 md:w-24" },
    RobotDog: { name: "Robot Dog", x: 14, y: 27, color: "#22e6b8", image: "/topology/robotdog_transparent.png", size: "w-24 md:w-28" },
    gNB: { name: "6G RAN", x: 33, y: 50, color: "#60a5fa", image: "/topology/ran_transparent.png", size: "w-28 md:w-32" },
    SRF: { name: "SystemAgent", x: 55, y: 37, color: "#c084fc", image: "/topology/systemagent_transparent.png", size: "w-24 md:w-28" },
    UPF: { name: "UPF", x: 55, y: 76, color: "#34d399", image: "/topology/switch_transparent.png", size: "w-24 md:w-28" },
    AgentGW: { name: "Agent GW", x: 79, y: 76, color: "#38bdf8", image: "/topology/gw.png", size: "w-24 md:w-28" },
    ACN: { name: "ACN Agent", x: 82, y: 50, color: "#f472b6", image: "/topology/acn_transparent.png", size: "w-24 md:w-28", labelClassName: "absolute left-[78%] top-[32%]" },
    Computing: { name: "Computing Agent", x: 80, y: 22, color: "#fbbf24", image: "/topology/computing_transparent.png", size: "w-24 md:w-28", labelClassName: "absolute left-[78%] top-[32%]" },
  };

  const connections = [
    ["UE", "gNB"],
    ["RobotDog", "gNB"],
    ["gNB", "SRF"],
    ["gNB", "UPF"],
    ["UPF", "AgentGW"],
    ["SRF", "ACN"],
    ["SRF", "Computing"],
  ];

  const flowPaths = {
    auth: ["RobotDog->gNB", "gNB->SRF", "SRF->ACN"],
    compute: ["UE->gNB", "gNB->UPF", "UPF->AgentGW"],
    collab: ["SRF->ACN", "SRF->Computing"],
  };

  const flowColor = {
    auth: "#22f5ff",
    compute: "#ffb020",
    collab: "#ff4fd8",
  };

  const buildPath = ([from, to]) => {
    const a = nodes[from];
    const b = nodes[to];
    const start = from === "RobotDog" && to === "gNB"
      ? { x: a.x + 6, y: a.y - 2 }
      : { x: a.x, y: a.y };
    const cx = (start.x + b.x) / 2;
    const cy = Math.min(start.y, b.y) - 10;
    return `M ${start.x} ${start.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  };

  const isActive = (key) => flowPaths[activeFlowType]?.includes(key);

  return (
    <div className="border border-blue-500/35 rounded-xl p-5 bg-slate-900/25 backdrop-blur-md flex flex-col h-full relative shadow-[0_0_22px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />

      <div className="relative flex items-center justify-center gap-3 mb-4">
        <div className="w-full text-center">
          <h2 className="text-base font-bold text-blue-100 tracking-wider">
            6G 核心智能网：数字身份申请
          </h2>
        </div>
        <button
          onClick={() => onSelectFlow("auth")}
          className="absolute right-0 hidden sm:flex items-center gap-1.5 border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1.5 rounded text-[10px] font-bold text-cyan-200"
        >
          <Zap className="w-3.5 h-3.5" />
          注册链路
        </button>
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
            const color = flowColor[activeFlowType] || "#22f5ff";
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

        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap justify-between gap-2">
          <div className="flex gap-1.5">
            {[
              ["auth", "注册认证流", "cyan"],
              ["compute", "算力卸载流", "amber"],
              ["collab", "智能体协同", "pink"],
            ].map(([key, label, tone]) => (
              <button
                key={key}
                onClick={() => onSelectFlow(key)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all border ${
                  activeFlowType === key
                    ? tone === "amber"
                      ? "bg-amber-500/20 text-amber-100 border-amber-400/70"
                      : tone === "pink"
                        ? "bg-pink-500/20 text-pink-100 border-pink-400/70"
                        : "bg-cyan-500/20 text-cyan-100 border-cyan-400/70"
                    : "bg-slate-950/75 text-gray-300 border-blue-500/20 hover:border-cyan-500/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => onSelectFlow(null)}
            className="p-1.5 rounded bg-slate-950/75 hover:bg-slate-900 border border-blue-500/20 hover:border-blue-500 text-blue-300"
            title="重置网络活动"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-blue-500/25 pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-blue-100 tracking-wide">6G核心网作用</h3>
          <span className="text-[10px] text-cyan-300 font-mono">Core Network Functions</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            "统一数字身份管理",
            "通信凭证签发",
            "可信接入控制",
            "智能体发布发现",
          ].map((item) => (
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
  const configuredUrl = import.meta.env.VITE_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:28450/offer`;
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
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitForIceGathering(pc);

        const response = await fetch(getWebRtcOfferUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pc.localDescription),
        });

        if (!response.ok) {
          throw new Error(`WebRTC offer failed: ${response.status}`);
        }

        const answer = await response.json();
        if (!disposed) {
          await pc.setRemoteDescription(answer);
        }
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

export default function App() {
  const [activeFlowType, setActiveFlowType] = useState("auth");

  return (
    <div className="video-backed-ui min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden flex items-center justify-center relative isolate">
      <WebRtcBackground />
      <div className="video-dim-overlay fixed inset-0 -z-10 bg-black/35 pointer-events-none" />
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
        @keyframes agent-log-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-48%); }
        }
        .animate-agent-log-scroll {
          animation: agent-log-scroll 12s linear infinite;
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
                  机器狗接入
                </h2>
                
                <div className="flex flex-col flex-1 gap-2">
                  
                  {/* === 未注册设备 (红色全息光锥投影) === */}
                  <div className="border border-red-500/30 bg-red-950/10 backdrop-blur-md flex-1 flex flex-col h-[180px] lg:h-[210px] overflow-hidden rounded-xl p-3 relative">
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

                  <div className="flex justify-center text-blue-500 my-[-10px] z-10">
                    <ChevronRight className="w-8 h-8 rotate-90 bg-slate-900 border border-blue-500/30 rounded-full" />
                  </div>

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

                </div>

                <div className="flex justify-between text-[10px] lg:text-xs text-blue-200 mt-4 px-1 font-medium">
                  <span>① 身份申请</span>
                  <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                  <span>② 业务授权</span>
                  <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                  <span>③ 能力发布</span>
                </div>
              </div>
            </SciFiPanel>
          </div>

          {/* 中间列：6G核心网 3D 拓扑与平面网元、上方弧线数据流 */}
          <div className="md:col-span-6">
            <NetworkTopology3D
              activeFlowType={activeFlowType}
              onSelectFlow={(flow) => setActiveFlowType(flow)}
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
                  {/* 子栏目 1: 用户状态 */}
                  <div className="border border-blue-500/30 rounded-lg p-2.5 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">用户状态</h3>
                    </div>
                    <div className="flex flex-col">
                      <StatusRow label="Credential:" value="Issued" status="success" />
                      <StatusRow label="Robot Dog ID:" value="DID:2168nLB3G@CMCC.org" status="success" isMono valueClassName="leading-tight text-right break-all" />
                    </div>
                  </div>

                  {/* 子栏目 2: 智能体日志 */}
                  <div className="border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                        <Network className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">智能体日志</h3>
                    </div>
                    <div className="h-[128px] overflow-hidden rounded border border-blue-500/20 bg-slate-950/35 px-2 py-1.5">
                      <div className="animate-agent-log-scroll flex flex-col gap-1 text-[10px] lg:text-xs font-mono leading-snug text-blue-100/90">
                        {[
                          ["10:31:02", "ACN", "接收 DID 身份申请"],
                          ["10:31:03", "SystemAgent", "校验终端能力描述"],
                          ["10:31:05", "Agent GW", "同步接入上下文"],
                          ["10:31:07", "ACN", "完成策略匹配"],
                          ["10:31:10", "Computing", "发布可用算力画像"],
                          ["10:31:13", "SystemAgent", "广播智能体发现事件"],
                          ["10:31:16", "Agent GW", "刷新服务路由表"],
                          ["10:31:19", "ACN", "业务授权状态更新"],
                        ].map(([time, agent, message]) => (
                          <div key={`${time}-${agent}`} className="flex items-start gap-1.5 whitespace-nowrap">
                            <span className="text-cyan-300/90">{time}</span>
                            <span className="text-emerald-300">[{agent}]</span>
                            <span className="text-blue-100/80">{message}</span>
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
                      <StatusRow label="System Agent路由请求:" value="Done" status="success" />
                      <StatusRow label="IDM颁发数字身份:" value="Done" status="success" />
                      <StatusRow label="接入网络:" value="Ready" status="pending" />
                      <StatusRow label="能力注册:" value="Pending" status="pending" />
                    </div>
                  </div>
                </div>
              </div>
            </SciFiPanel>
          </div>
        </div>

        {/* 底部步骤条 - 升级为精致高对比度毛玻璃条 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
          {/* Active Step */}
          <div className="border border-emerald-500/80 bg-slate-900/30 backdrop-blur-md rounded-lg p-3 flex items-center gap-3 relative overflow-hidden shadow-[0_0_18px_rgba(16,185,129,0.25)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            <span className="text-emerald-400 font-mono font-bold text-lg opacity-90">01</span>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">Digital ID</span>
              <span className="text-emerald-400 text-xs font-semibold">已完成 / Completed</span>
            </div>
          </div>

          {/* Pending Steps */}
          {[
            { id: "02", icon: Share2, title: "A2A", subtitle: "即将开始 / Upcoming" },
            { id: "03", icon: Globe, title: "L3 Networking", subtitle: "即将开始 / Upcoming" },
            { id: "04", icon: Radio, title: "Massive Uplink", subtitle: "即将开始 / Upcoming" },
            { id: "05", icon: Cloud, title: "Compute Offload", subtitle: "即将开始 / Upcoming" },
          ].map((step, idx) => (
            <div key={idx} className="border border-blue-500/30 bg-slate-900/30 backdrop-blur-md rounded-lg p-3 flex items-center gap-3 shadow-md">
              <span className="text-blue-300 font-mono font-bold text-lg opacity-60">{step.id}</span>
              <step.icon className="w-6 h-6 text-blue-300/80" />
              <div className="flex flex-col">
                <span className="text-blue-100 font-bold text-sm">{step.title}</span>
                <span className="text-blue-300/70 text-xs font-semibold">{step.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 底部反光效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/10 to-transparent -z-10 pointer-events-none transform scale-y-[-1] opacity-50 blur-xl"></div>
    </div>
  );
}
