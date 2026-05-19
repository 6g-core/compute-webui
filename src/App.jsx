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
const StatusRow = ({ label, value, status = "success", isMono = false }) => {
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
      <div className="flex items-center gap-1.5">
        <span className={`${getStatusColor()} ${isMono ? 'font-mono' : ''}`}>{value}</span>
        {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        {status === 'pending' && <CircleDot className="w-3.5 h-3.5 text-blue-500" />}
      </div>
    </div>
  );
};

const NetworkTopology3D = ({ activeFlowType, onSelectFlow }) => {
  const mountRef = useRef(null);
  const labelsRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const nodeData = {
    UE: { name: "AR Glasses (6G终端)", pos: [-7.9, 0, -4.1], color: 0x00f0ff, type: "ue", modelUrl: "/models/glasses/scene.gltf", modelSize: 2.1, modelBaseY: -0.85 },
    RobotDog: { name: "Robot Dog", pos: [-7.9, 0, 4.1], color: 0x00ffcc, type: "robot", modelUrl: "/models/robotdog/scene.gltf", modelSize: 1.9, modelBaseY: -0.9 },
    gNB: { name: "6G gNB", pos: [-3.1, 0, 0], color: 0x3b82f6, type: "gnb", modelUrl: "/models/RAN/scene.gltf", modelSize: 3.25, modelBaseY: -0.95, modelTint: 0x9ca3af },
    SRF: { name: "SystemAgent", pos: [2.7, 0, -3.4], color: 0xa855f7, type: "srf", modelUrl: "/models/server/scene.gltf", modelSize: 2.8, modelBaseY: -0.95, modelRotationY: -Math.PI / 2 },
    UPF: { name: "UPF", pos: [2.7, 0, 3.4], color: 0x10b981, type: "upf", modelUrl: "/models/cloudengine/scene.gltf", modelSize: 2.3, modelBaseY: -0.95 },
    ACN: { name: "ACN Agent", pos: [8.2, 0, 3.2], color: 0xec4899, type: "acn", modelUrl: "/models/server/scene.gltf", modelSize: 2.8, modelBaseY: -0.95, modelRotationY: -Math.PI / 2 },
    Computing: { name: "Computing Agent", pos: [8.2, 0, -3.2], color: 0xf59e0b, type: "compute", modelUrl: "/models/server/scene.gltf", modelSize: 2.8, modelBaseY: -0.95, modelRotationY: -Math.PI / 2 },
  };

  const connections = [
    ["UE", "gNB"],
    ["RobotDog", "gNB"],
    ["gNB", "SRF"],
    ["gNB", "UPF"],
    ["SRF", "ACN"],
    ["SRF", "Computing"],
  ];

  useEffect(() => {
    if (window.THREE && window.THREE.GLTFLoader) {
      setThreeLoaded(true);
      return;
    }

    let disposed = false;
    const loadScript = (src, id) =>
      new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          if (window.THREE && (id !== "three-gltf-loader" || window.THREE.GLTFLoader)) {
            resolve();
          }
          return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    Promise.resolve()
      .then(() => (window.THREE ? null : loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "three-core")))
      .then(() => (window.THREE.GLTFLoader ? null : loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js", "three-gltf-loader")))
      .then(() => {
        if (!disposed) setThreeLoaded(true);
      })
      .catch(() => {
        if (!disposed) setLoadError(true);
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!threeLoaded || !mountRef.current) return;

    const THREE = window.THREE;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050a, 0.018);
    const tempV = new THREE.Vector3();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    let rotationX = 0.42;
    let rotationY = 0.65;
    const radius = 20.5;

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(rotationY) * Math.cos(rotationX);
      camera.position.z = radius * Math.cos(rotationY) * Math.cos(rotationX);
      camera.position.y = radius * Math.sin(rotationX);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(10, 18, 14);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.45);
    fillLight.position.set(-10, 10, -12);
    scene.add(fillLight);

    let alive = true;
    const loader = new THREE.GLTFLoader();
    const mountGltfModel = (target, data) => {
      if (!data.modelUrl) return;

      loader.load(
        data.modelUrl,
        (gltf) => {
          if (!alive) return;

          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                const tintMaterials = Array.isArray(child.material) ? child.material : [child.material];
                const nextMaterials = tintMaterials.map((material) => {
                  const nextMaterial = material.clone();
                  if (data.modelTint && nextMaterial.color) {
                    nextMaterial.color.multiply(new THREE.Color(data.modelTint));
                  }
                  nextMaterial.transparent = nextMaterial.transparent || false;
                  nextMaterial.needsUpdate = true;
                  return nextMaterial;
                });
                child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
              }
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxAxis = Math.max(size.x, size.y, size.z) || 1;
          model.scale.setScalar((data.modelSize || 2) / maxAxis);
          if (data.modelRotationY) {
            model.rotation.y += data.modelRotationY;
          }
          const scaledBox = new THREE.Box3().setFromObject(model);
          const center = scaledBox.getCenter(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y += (data.modelBaseY ?? -0.9) - scaledBox.min.y;

          target.children.slice().forEach((child) => target.remove(child));
          target.add(model);
        },
        undefined,
        () => {}
      );
    };

    const createNode = (data) => {
      const group = new THREE.Group();
      group.position.set(...data.pos);
      if (data.nodeScale) {
        group.scale.setScalar(data.nodeScale);
      }

      const metal = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.34 });
      const accent = new THREE.MeshStandardMaterial({ color: data.color, metalness: 0.35, roughness: 0.42 });

      if (data.type === "ue") {
        const device = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.35, 0.22), metal);
        device.rotation.x = -0.18;
        group.add(device);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.95, 0.05), accent);
        screen.position.set(0, 0.08, 0.13);
        screen.rotation.x = -0.18;
        group.add(screen);
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), accent);
        antenna.position.set(0.52, 0.9, 0);
        antenna.rotation.z = -0.35;
        group.add(antenna);
        const signal = new THREE.Mesh(
          new THREE.TorusGeometry(0.68, 0.035, 8, 28, Math.PI),
          new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.3 })
        );
        signal.position.set(0.74, 1.08, 0);
        signal.rotation.set(0, Math.PI / 2, -0.35);
        group.add(signal);
        group.userData.signal = signal;
      } else if (data.type === "robot") {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 0.85), metal);
        group.add(body);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.52), metal);
        head.position.set(-0.92, 0.25, 0);
        group.add(head);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.38), accent);
        visor.position.set(-1.25, 0.27, 0);
        group.add(visor);
        for (let i = 0; i < 4; i += 1) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.16), metal);
          leg.position.set(i < 2 ? 0.52 : -0.52, -0.64, i % 2 === 0 ? 0.4 : -0.4);
          leg.rotation.z = 0.22;
          group.add(leg);
        }
      } else if (data.type === "gnb") {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.34, 2.7, 6), metal);
        group.add(tower);
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.43, 20, 20), accent);
        top.position.y = 1.38;
        group.add(top);
        const wave = new THREE.Mesh(
          new THREE.TorusGeometry(1.25, 0.045, 8, 32),
          new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.28 })
        );
        wave.rotation.x = Math.PI / 2;
        wave.position.y = 0.5;
        group.add(wave);
        group.userData.wave = wave;
      } else if (data.type === "srf") {
        for (let i = 0; i < 3; i += 1) {
          const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.28, 18), accent);
          slice.position.y = (i - 1) * 0.62;
          group.add(slice);
        }
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48), new THREE.MeshBasicMaterial({ color: 0xe9d5ff }));
        core.position.y = 1.05;
        group.add(core);
        group.userData.core = core;
      } else if (data.type === "upf") {
        for (let i = 0; i < 2; i += 1) {
          const server = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.45, 1.55), metal);
          server.position.y = (i - 0.5) * 0.72;
          group.add(server);
          const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 1.62), accent);
          light.position.set(0.78, server.position.y, 0);
          group.add(light);
        }
      } else if (data.type === "acn") {
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), accent);
        group.add(core);
        const wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.18, 1)),
          new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.5 })
        );
        group.add(wire);
        group.userData.core = core;
        group.userData.wire = wire;
      } else {
        for (let i = 0; i < 4; i += 1) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.24, 1.45), i % 2 ? accent : metal);
          slab.position.y = (i - 1.5) * 0.45;
          group.add(slab);
        }
      }

      mountGltfModel(group, data);
      scene.add(group);
      return group;
    };

    const nodes = Object.fromEntries(
      Object.entries(nodeData).map(([key, value]) => [key, createNode(value)])
    );

    const lineObjects = connections.map(([from, to]) => {
      const p1 = new THREE.Vector3(...nodeData[from].pos);
      const p2 = new THREE.Vector3(...nodeData[to].pos);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const curve = new THREE.QuadraticBezierCurve3(
        p1,
        mid.clone().add(new THREE.Vector3(0, Math.max(2.2, p1.distanceTo(p2) * 0.34), 0)),
        p2
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
      const line = new THREE.Line(
        geometry,
        new THREE.LineDashedMaterial({
          color: 0xcbd5e1,
          dashSize: 0.34,
          gapSize: 0.22,
          transparent: true,
          opacity: 0.28,
          depthTest: false,
        })
      );
      line.computeLineDistances();
      const glowLine = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 44, 0.075, 8, false),
        new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
        })
      );
      const flowBlocks = Array.from({ length: 3 }, () => {
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.18, 0.18),
          new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0,
            depthTest: false,
            depthWrite: false,
          })
        );
        block.visible = false;
        scene.add(block);
        return block;
      });
      scene.add(line);
      scene.add(glowLine);
      return { key: `${from}->${to}`, curve, line, glowLine, flowBlocks };
    });

    let dragging = false;
    let last = { x: 0, y: 0 };
    const onMouseDown = (event) => {
      dragging = true;
      last = { x: event.clientX, y: event.clientY };
    };
    const onMouseMove = (event) => {
      if (!dragging) return;
      rotationY += (event.clientX - last.x) * 0.005;
      rotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotationX + (event.clientY - last.y) * 0.005));
      last = { x: event.clientX, y: event.clientY };
      updateCamera();
    };
    const onMouseUp = () => {
      dragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (nodes.gNB?.userData.wave) nodes.gNB.userData.wave.rotation.z += 0.015;
      if (nodes.ACN?.userData.core) {
        nodes.ACN.userData.core.rotation.x += 0.012;
        nodes.ACN.userData.core.rotation.y += 0.014;
        nodes.ACN.userData.wire.rotation.y -= 0.004;
      }

      lineObjects.forEach(({ key, curve, line, glowLine, flowBlocks }) => {
        const auth = ["RobotDog->gNB", "gNB->SRF", "SRF->ACN"];
        const compute = ["UE->gNB", "gNB->UPF"];
        const collab = ["SRF->ACN", "SRF->Computing"];
        const active =
          (activeFlowType === "auth" && auth.includes(key)) ||
          (activeFlowType === "compute" && compute.includes(key)) ||
          (activeFlowType === "collab" && collab.includes(key));
        const activeColor = activeFlowType === "compute" ? 0xffb020 : activeFlowType === "collab" ? 0xff4fd8 : 0x22f5ff;
        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(time * 9));
        line.material.color.setHex(active ? activeColor : 0xcbd5e1);
        line.material.opacity = active ? 0.55 + 0.4 * pulse : 0.28;
        glowLine.material.color.setHex(activeColor);
        glowLine.material.opacity = active ? 0.22 + 0.32 * pulse : 0;
        flowBlocks.forEach((block, index) => {
          block.visible = active;
          block.material.color.setHex(activeColor);
          block.material.opacity = active ? 0.55 + 0.35 * pulse : 0;
          if (!active) return;

          const progress = (time * 0.42 + index / flowBlocks.length) % 1;
          const point = curve.getPoint(progress);
          const tangent = curve.getTangent(progress).normalize();
          block.position.copy(point);
          block.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
          block.scale.setScalar(0.85 + 0.28 * pulse);
        });
      });

      renderer.render(scene, camera);

      if (labelsRef.current) {
        const containerRect = container.getBoundingClientRect();
        Object.entries(nodeData).forEach(([key, value]) => {
          const el = document.getElementById(`overlay-label-${key}`);
          if (!el) return;

          tempV.set(value.pos[0], value.pos[1] + 1.85, value.pos[2]);
          tempV.project(camera);

          if (tempV.z > 1) {
            el.style.display = "none";
            return;
          }

          const x = (tempV.x * 0.5 + 0.5) * containerRect.width;
          const y = (tempV.y * -0.5 + 0.5) * containerRect.height;
          el.style.display = "block";
          el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        });
      }
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [threeLoaded, activeFlowType]);

  return (
    <div className="border border-blue-500/35 rounded-xl p-5 bg-slate-900/25 backdrop-blur-md flex flex-col h-full relative shadow-[0_0_22px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />

      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-blue-100 tracking-wider">
            6G 核心智能网：3D 数字孪生拓扑
          </h2>
          <p className="text-[10px] text-blue-300">按住左键拖拽可旋转视角，观察拓扑网元与空中链路</p>
        </div>
        <button
          onClick={() => onSelectFlow("auth")}
          className="hidden sm:flex items-center gap-1.5 border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1.5 rounded text-[10px] font-bold text-cyan-200"
        >
          <Zap className="w-3.5 h-3.5" />
          注册链路
        </button>
      </div>

      <div className="flex-[1.55] w-full min-h-[300px] lg:min-h-[340px] relative rounded-lg overflow-hidden border border-blue-900/30 bg-slate-950/20">
        {(!threeLoaded || loadError) && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70">
            <Cpu className="w-9 h-9 text-cyan-400 animate-spin" />
            <p className="mt-2 text-xs text-blue-300 font-mono">
              {loadError ? "3D 渲染引擎加载失败" : "加载 3D 渲染引擎..."}
            </p>
          </div>
        )}
        <div ref={labelsRef} className="absolute inset-0 pointer-events-none z-30 overflow-hidden font-sans">
          {Object.entries(nodeData).map(([key, value]) => (
            <div
              key={key}
              id={`overlay-label-${key}`}
              className="absolute left-0 top-0 pointer-events-none transition-all duration-75 select-none"
              style={{ display: "none" }}
            >
              <div className="bg-slate-950/85 border border-slate-500/45 px-2.5 py-1 rounded text-[9px] sm:text-[10px] text-gray-100 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: `#${value.color.toString(16).padStart(6, "0")}` }}
                />
                <span className="font-bold tracking-wide">{value.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div ref={mountRef} className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing" />

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
            "A2A与算力调度基础",
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
              6G智能体网络：数字身份申请
            </h1>
            <p className="text-blue-200 font-medium text-sm md:text-base">
              6G Agentic Network: Digital Identity Application<br/>
              <span className="text-blue-300/90 text-xs md:text-sm">机器狗先获得可信通信凭证，再参与后续组网、授权与算力卸载</span>
            </p>
          </div>
          <div className="w-24"></div>
        </header>

        {/* 核心内容区 (三列布局) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 relative z-10">
          
          {/* 左列：场景入口 / 机器狗接入 */}
          <div className="md:col-span-3">
            <SciFiPanel className="h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-blue-200 text-base lg:text-lg font-bold text-center mb-4 pb-3 border-b border-blue-500/30">
                  场景入口 / 机器狗接入
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
                        <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-xs">
                          RobotDog-8731
                        </div>
                        <div className="flex flex-col gap-0.5 text-[8px] sm:text-[9px] font-medium">
                          <div className="flex justify-between items-center">
                            <span className="opacity-75">Trust:</span>
                            <span className="font-bold text-cyan-300">Verified</span>
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
                  <span>① 上电接入</span>
                  <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                  <span>② 身份申请</span>
                  <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                  <span>③ 凭证签发</span>
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
                  {/* 子栏目 1: Digital Identity */}
                  <div className="border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">Digital Identity</h3>
                    </div>
                    <div className="flex flex-col">
                      <StatusRow label="Application:" value="Submitted" status="success" />
                      <StatusRow label="Credential:" value="Issued" status="success" />
                      <StatusRow label="Robot Dog ID:" value="RobotDog-8731" status="success" isMono />
                      <StatusRow label="Trust Status:" value="Verified" status="success" />
                    </div>
                  </div>

                  {/* 子栏目 2: Core Network */}
                  <div className="border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                        <Network className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">Core Network</h3>
                    </div>
                    <div className="flex flex-col">
                      <StatusRow label="Authentication:" value="Completed" status="success" />
                      <StatusRow label="Policy Check:" value="Passed" status="success" />
                      <StatusRow label="Session Ready:" value="Yes" status="success" />
                    </div>
                  </div>

                  {/* 子栏目 3: Next Steps */}
                  <div className="border border-blue-500/30 rounded-lg p-3 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                    <div className="flex items-center gap-2.5 mb-2 opacity-80">
                      <div className="w-7 h-7 rounded bg-blue-900/15 border border-blue-500/20 flex items-center justify-center">
                        <ArrowRightCircle className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">Next Steps</h3>
                    </div>
                    <div className="flex flex-col">
                      <StatusRow label="A2A Discovery:" value="Pending" status="pending" />
                      <StatusRow label="L3 Networking:" value="Pending" status="pending" />
                      <StatusRow label="Compute Offload:" value="Available" status="pending" />
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
