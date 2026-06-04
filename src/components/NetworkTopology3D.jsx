import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, CircleDot, Cpu, Hourglass, LoaderCircle, Radio } from 'lucide-react';
import { getTopologyFlowConfig } from '../topologyFlowConfig';
import { AGENT_TOOL_SETS, formatSystemAgentBubbleLabel, normalizeWorkflowLabel } from '../config/stageConfig.jsx';
import acnImage from '../ACN.png';
import computingImage from '../Computing.png';
import computingNodeImage from '../Computing_Node.png';
import connectionImage from '../Connetction.png';
import marketImage from '../Market.png';
import srfImage from '../SRF.png';
import upfImage from '../upfnew.png';

const AgentSpeechBubble = ({ bubble }) => {
  if (!bubble) {
    return null;
  }

  const items = Array.isArray(bubble.items) ? bubble.items : null;
  const lines = (Array.isArray(bubble.lines) ? bubble.lines : [bubble.text]).filter(Boolean);
  const formatBubbleText = (text) => String(text).replace(/\s*Tool\b/g, "").replace(/Tool：/g, "：");
  const isVoiceIntent = bubble.variant === "voiceIntent";
  const isStage2SystemPlan = bubble.variant === "stage2SystemPlan";
  const tools = bubble.variant === "toolPanel" && !items && !isVoiceIntent ? AGENT_TOOL_SETS[bubble.targetNode] : null;
  const activeTools = new Set(Array.isArray(bubble.activeTools) ? bubble.activeTools : []);
  const hasToolPanel = Array.isArray(tools) && tools.length > 0;
  const isSystemAgentBubble = bubble.targetNode === "SystemAgent";
  const isLargeAgentBubble = ["ConnectionAgent", "ACN", "Computing", "AgentGW", "OttAgentGW"].includes(bubble.targetNode) && !items && !hasToolPanel;
  const isPrimaryAgentBubble = ["ConnectionAgent", "ACN", "Computing"].includes(bubble.targetNode) && !items && !hasToolPanel;
  const baseTextSizeClass = isStage2SystemPlan ? "text-[11px]" : isPrimaryAgentBubble ? "text-[12px]" : isLargeAgentBubble ? "text-[11px]" : isSystemAgentBubble ? "text-[10px]" : "text-[9px]";
  const positionClassName = bubble.style ? (bubble.className || "") : (bubble.className || "left-[83%] top-[36%]");
  const arrowClassName = bubble.arrow === "down-right"
    ? "absolute bottom-[-5px] right-6 h-2 w-2 rotate-45 border-b border-r border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "cp-plan-arrow"
    ? "absolute bottom-[-5px] right-[16%] h-2 w-2 rotate-45 border-b border-r border-cyan-400/55 bg-slate-950/96"
    : bubble.arrow === "down-left-corner"
    ? "absolute bottom-[-5px] left-1 h-2 w-2 -translate-x-1/2 rotate-[20deg] border-b border-l border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "down-left"
    ? "absolute bottom-[-5px] left-[72%] h-2 w-2 -translate-x-1/2 rotate-[28deg] border-b border-r border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "down"
      ? "absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-cyan-400/45 bg-slate-950/86"
      : bubble.arrow === "right"
        ? "absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-cyan-400/45 bg-slate-950/86"
      : "absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-cyan-400/45 bg-slate-950/86";
  const bubbleClassName = isStage2SystemPlan
    ? "border-cyan-200/78 bg-slate-950/96 text-blue-50 shadow-[0_0_30px_rgba(34,211,238,0.32),inset_0_0_18px_rgba(34,211,238,0.12)]"
    : isVoiceIntent
      ? "border-cyan-200/85 bg-cyan-950/96 text-cyan-50 shadow-[0_0_26px_rgba(34,211,238,0.48),inset_0_0_16px_rgba(34,211,238,0.16)] ring-1 ring-cyan-300/45"
      : "border-cyan-400/45 bg-slate-950/86 text-blue-50 shadow-[0_0_18px_rgba(34,211,238,0.18)]";
  const bubbleScale = bubble.scale || (isStage2SystemPlan ? 1.6 : isVoiceIntent ? 1.22 : bubble.focusScale ? 1.18 : 1);
  const shouldScaleBubble = bubbleScale !== 1;
  const bubbleStyle = shouldScaleBubble
    ? {
        ...(bubble.style || {}),
        transform: `${bubble.style?.transform || ""} scale(${bubbleScale})`,
        transformOrigin: bubble.transformOrigin || (isStage2SystemPlan ? "78% 100%" : "50% 100%"),
      }
    : bubble.style;

  return (
    <div
      className={`absolute z-30 flex transition-transform duration-500 ease-out ${isStage2SystemPlan ? "w-[165px] flex-col items-stretch rounded-lg" : items ? "w-[175px] flex-col items-stretch gap-1 rounded-lg" : hasToolPanel ? "w-[150px] flex-col items-stretch rounded-md border-dashed" : isLargeAgentBubble ? "max-w-[205px] items-center gap-2 rounded-full" : "max-w-[175px] items-center gap-1.5 rounded-full"} border ${hasToolPanel ? "px-0 py-0" : isLargeAgentBubble ? "px-3 py-2" : "px-2.5 py-1.5"} ${baseTextSizeClass} font-bold backdrop-blur-md ${shouldScaleBubble ? "ring-1 ring-cyan-200/45 shadow-[0_0_26px_rgba(34,211,238,0.28)]" : ""} ${bubbleClassName} ${positionClassName}`}
      style={bubbleStyle}
    >
      {isStage2SystemPlan ? (
        <>
          <div className="leading-tight">
            <span className="block text-[11px] font-bold tracking-wide text-cyan-200/80">用户意图：</span>
            <span className="block text-[12px] font-black text-cyan-50">{bubble.title}</span>
          </div>
          <div className="my-1.5 border-t border-dashed border-cyan-300/55" />
          <div className="mb-1 text-[11px] font-bold leading-tight text-cyan-200/85">
            网络任务规划：
          </div>
          <div className="flex flex-col gap-1.5">
            {(bubble.tasks || []).map((task) => (
              <div key={task.label} className="flex min-w-0 items-center gap-1.5 leading-tight">
                {task.status === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                ) : task.status === "working" ? (
                  <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-100" />
                ) : (
                  <Hourglass className="h-3.5 w-3.5 shrink-0 text-slate-400/75" />
                )}
                <span className={`min-w-0 flex-1 whitespace-normal break-words ${task.status === "pending" ? "text-blue-100/65" : ""}`}>
                  {String(task.label).split("\n").map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : items ? (
        items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-1.5 leading-tight">
            {item.status === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
            ) : item.status === "working" ? (
              <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-100" />
            ) : (
              <CircleDot className="h-3.5 w-3.5 shrink-0 text-slate-400/75" />
            )}
            <span className={`min-w-0 flex-1 whitespace-normal break-words ${item.status === "pending" ? "text-blue-100/60" : ""}`}>
              {(item.isSystemAgentItem ? formatSystemAgentBubbleLabel(item.label) : normalizeWorkflowLabel(item.label))
                .split("\n")
                .map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
            </span>
          </div>
        ))
      ) : hasToolPanel ? (
        <>
          <div className="flex flex-col gap-1.5 px-3 py-2">
            {tools.map((tool) => {
              const isWorking = activeTools.has(tool) && bubble.status === "working";

              return (
                <div key={tool} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[10px] leading-tight">
                  <span className="truncate text-blue-50">{tool}</span>
                  <span className={isWorking ? "text-amber-200" : "text-blue-300"}>
                    {isWorking ? "working" : "idle"}
                  </span>
                </div>
              );
            })}
          </div>
          {lines.length > 0 && (
            <div className="border-t border-dashed border-cyan-300/50 px-3 py-2 text-[10px] leading-tight text-cyan-50">
              {lines.map((line) => (
                <span key={line} className="block whitespace-normal break-words">
                  {formatBubbleText(normalizeWorkflowLabel(line))}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {isVoiceIntent ? (
            <Radio className="h-3.5 w-3.5 shrink-0 animate-pulse text-cyan-100" />
          ) : bubble.status === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
          ) : (
            <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-300" />
          )}
          <span className={`flex min-w-0 flex-col leading-tight ${isVoiceIntent ? "whitespace-normal break-words" : "whitespace-normal break-words"}`}>
            {lines.map((line) => (
              <span key={line}>{formatBubbleText(line)}</span>
            ))}
          </span>
        </>
      )}
      {!hasToolPanel && <span className={arrowClassName} />}
    </div>
  );
};

const randomLatency = ({ min, max }) => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const offsetPercentValue = (value, delta) => {
  if (typeof value !== "string" || !value.endsWith("%")) {
    return value;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isFinite(numericValue) ? `${numericValue + delta}%` : value;
};

const TOPOLOGY_NODES = {
  UE: { name: "AR Glasses", x: 7, y: 78, color: "#22f5ff", image: "/topology/glasses_transparent.png", size: "w-16 md:w-20" },
  RobotDog: { name: "Robot Dog", x: 7, y: 32, color: "#22e6b8", image: "/topology/robotdog_transparent.png", size: "w-20 md:w-24" },
  gNB: { name: "6G RAN", x: 22, y: 55, color: "#60a5fa", image: "/topology/ran_transparent.png", size: "w-24 md:w-28" },
  SRF: { name: "SRF", x: 36, y: 43, color: "#38bdf8", image: srfImage, size: "w-20 md:w-24" },
  SystemAgent: { name: "SystemAgent", x: 53.5, y: 40, color: "#c084fc", image: "/topology/systemagent_transparent.png", size: "w-20 md:w-24" },
  UPF: { name: "UPF", x: 36, y: 82, color: "#34d399", image: upfImage, size: "w-20 md:w-24" },
  ConnectionAgent: { name: "Connection Agent", x: 69, y: 13, color: "#22d3ee", image: connectionImage, size: "w-16 md:w-20" },
  ACN: { name: "ACN Agent", x: 69, y: 32, color: "#f472b6", image: acnImage, size: "w-16 md:w-20" },
  Computing: {
    name: "Computing Agent",
    x: 69,
    y: 50,
    color: "#fbbf24",
    image: computingImage,
    size: "w-16 md:w-20",
    labelClassName: "absolute top-[80%]",
    labelStyle: { whiteSpace: "nowrap", width: "max-content", minWidth: "max-content" },
  },
  AgentGW: { name: "Agent GW", x: 62.5, y: 91, color: "#38bdf8", image: "/topology/gw.png", size: "w-16 md:w-20" },
  OttAgentGW: { name: "Agent GW", x: 78.5, y: 82, color: "#38bdf8", image: "/topology/gw.png", size: "w-16 md:w-20" },
  MarketAgent: { name: "Market Agent", x: 89, y: 81, color: "#38bdf8", image: marketImage, size: "w-16 md:w-20" },
  Gateway: { name: "Computing Node", x: 62.5, y: 72, color: "#38bdf8", image: computingNodeImage, size: "w-16 md:w-20" },
};

const TOPOLOGY_CONNECTOR_POINTS = {};

const TOPOLOGY_CONNECTIONS = [
  ["UE", "gNB"],
  ["RobotDog", "gNB"],
  ["gNB", "SRF"],
  ["SRF", "SystemAgent"],
  ["gNB", "UPF"],
  ["UPF", "Gateway"],
  ["UPF", "AgentGW"],
  ["AgentGW", "OttAgentGW"],
  ["OttAgentGW", "MarketAgent"],
  ["SystemAgent", "ConnectionAgent"],
  ["SystemAgent", "ACN"],
  ["SystemAgent", "Computing"],
];

const TOOL_PANEL_GROUPS = [
  {
    title: "Agentic Base",
    items: [
      "6G AM",
      "6G SM",
      "6G Policy",
      "6G UDM",
      "IDM",
      "ARF",
    ],
  },
  {
    title: "Beyond Connectivity",
    items: [
      "CMF",
      "CSPF",
    ],
  },
];

const TOOL_ICON_BY_NAME = {
  "6G AM": Cpu,
  "6G SM": Cpu,
  "6G Policy": Cpu,
  "6G UDM": Cpu,
  IDM: Cpu,
  ARF: Cpu,
  CMF: BrainCircuit,
  CSPF: BrainCircuit,
};

const TOPOLOGY_ZONES = [
  {
    key: "cp",
    label: "CP",
    className: "left-[32%] top-[1%] h-[60%] w-[66%] border-orange-300/90 bg-orange-500/[0.08] shadow-[0_0_22px_rgba(251,146,60,0.28)]",
    labelClassName: "left-2 top-2 border-orange-200/80 text-orange-100 shadow-[0_0_18px_rgba(251,146,60,0.35)]",
  },
  {
    key: "up",
    label: "UP",
    className: "left-[32%] top-[63%] h-[36%] w-[39%] border-emerald-300/90 bg-emerald-500/[0.08] shadow-[0_0_22px_rgba(16,185,129,0.25)]",
    labelClassName: "bottom-2 left-2 border-emerald-200/80 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.32)]",
  },
  {
    key: "ott",
    label: "OTT",
    className: "left-[73%] top-[63%] h-[36%] w-[25%] border-sky-300/85 bg-sky-500/[0.08] shadow-[0_0_18px_rgba(56,189,248,0.18)]",
    labelClassName: "bottom-2 right-2 border-sky-200/70 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.22)]",
  },
];

const UnifiedToolPanel = ({ toolStates }) => (
  <div className="absolute left-[77.2%] top-[2%] z-[26] flex h-[57.5%] w-[20.2%] flex-col overflow-hidden rounded-xl border border-cyan-200/28 bg-slate-950/38 p-2 text-blue-50 shadow-[inset_0_0_22px_rgba(34,211,238,0.06),0_0_22px_rgba(15,23,42,0.32)] backdrop-blur-md">
    {TOOL_PANEL_GROUPS.map((group, groupIndex) => (
      <div
        key={group.title}
        className={`flex min-h-0 flex-col ${groupIndex > 0 ? "border-t border-cyan-200/16 pt-2" : ""}`}
        style={{ flex: `${group.items.length} 1 0%` }}
      >
        <div className="px-1.5 pb-1.5">
          <div className="max-w-full whitespace-nowrap px-0.5 text-[14px] font-bold leading-tight tracking-wide text-cyan-50">
            {group.title}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-around gap-1.5 px-1.5 pb-2">
          {group.items.map((item) => {
            const name = typeof item === "string" ? item : item.name;
            const inactive = typeof item === "object" && item.inactive;
            const state = inactive ? "inactive" : toolStates[name] || "idle";
            const ToolIcon = TOOL_ICON_BY_NAME[name] || BrainCircuit;
            const shouldWrapName = name.length > 17;
            const stateClassName = state === "working"
              ? "text-amber-200"
              : state === "inactive"
                ? "text-blue-100/55"
                : "text-blue-100/90";
            const dotClassName = state === "working"
              ? "bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.85)]"
              : state === "inactive"
                ? "bg-slate-500/70"
                : "bg-cyan-300/75 shadow-[0_0_8px_rgba(34,211,238,0.35)]";

            return (
              <div
                key={name}
                className={`group/tool flex min-h-[32px] items-center justify-between gap-2 rounded-md px-0 py-0.5 text-[14px] leading-tight transition ${
                  state === "working"
                    ? "animate-pulse"
                    : ""
                }`}
              >
                <span className={`flex min-h-[30px] min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1.5 shadow-[inset_0_0_10px_rgba(15,23,42,0.18)] transition ${shouldWrapName ? "whitespace-normal leading-[1.05]" : "overflow-visible whitespace-nowrap"} ${
                  state === "working"
                    ? "border-amber-200/58 bg-amber-300/16 font-bold text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.24)]"
                    : "border-cyan-200/18 bg-slate-900/18 text-blue-50/95"
                }`}>
                  <ToolIcon className={`h-4 w-4 shrink-0 ${state === "working" ? "text-amber-200" : "text-cyan-200/80"}`} />
                  <span className="min-w-0 truncate">{name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
                  <span className={`font-mono text-[11px] leading-tight ${stateClassName}`}>
                    {state === "working" ? "work" : state === "inactive" ? "Inactive" : state}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

export const NetworkTopology3D = ({
  stage,
  activeFlowType,
  agentBubble,
  agentBubbles = [],
  arSpeechText = "",
  hideRobotDogSpeech = false,
  title = "6G 核心网：数字身份申请",
  topologyLines = null,
  highlightedNodes = [],
  activeConnections = [],
  stagePhaseKey = null,
  language = "zh",
}) => {
  const nodes = useMemo(() => (
    language === "en"
      ? {
          ...TOPOLOGY_NODES,
          SRF: {
            ...TOPOLOGY_NODES.SRF,
            y: TOPOLOGY_NODES.SRF.y + 3,
          },
          SystemAgent: {
            ...TOPOLOGY_NODES.SystemAgent,
            y: TOPOLOGY_NODES.SystemAgent.y + 8,
          },
        }
      : TOPOLOGY_NODES
  ), [language]);
  const connections = TOPOLOGY_CONNECTIONS;
  const activeFlowConfig = topologyLines
    ? { color: "#22f5ff", lines: topologyLines }
    : getTopologyFlowConfig(stage, activeFlowType);
  const highlightedNodeSet = useMemo(() => new Set(highlightedNodes), [highlightedNodes]);
  const [stage9BlinkActive, setStage9BlinkActive] = useState(false);
  const resolveAgentBubblePosition = (bubble) => {
    if (!bubble?.targetNode) {
      return bubble;
    }

    const target = nodes[bubble.targetNode];

    if (!target) {
      return bubble;
    }

    const offsetX = bubble.offsetX || 0;
    const offsetY = bubble.offsetY || 0;
    const aboveImageBubbleNodes = new Set(["ConnectionAgent", "ACN", "Computing"]);
    const requestedPlacement = bubble.placement || "above";
    const placement = aboveImageBubbleNodes.has(bubble.targetNode) ? "above" : requestedPlacement;
    const basePosition = {
      left: `${target.x + offsetX}%`,
      top: `${target.y + offsetY}%`,
    };
    const hasToolPanel = Boolean(AGENT_TOOL_SETS[bubble.targetNode]);
    const placementStyle = placement === "cpPlanBox"
      ? { left: "35%", top: "6.5%", transform: "" }
      : placement === "cpSystemBubble"
      ? { left: "40.5%", top: "18%", transform: "" }
      : placement === "right"
      ? {
          ...basePosition,
          top: hasToolPanel && bubble.targetNode === "ConnectionAgent"
            ? `${target.y - 9 + offsetY}%`
            : `${target.y - 5 + offsetY}%`,
          transform: hasToolPanel && bubble.targetNode === "ConnectionAgent"
            ? "translate(30%, 0)"
            : hasToolPanel
              ? "translate(30%, -50%)"
              : "translate(22%, -50%)",
        }
      : placement === "left"
        ? { ...basePosition, transform: "translate(-108%, -50%)" }
      : placement === "upperLeft"
        ? { left: `${target.x + 4 + offsetX}%`, top: `${target.y - 15 + offsetY}%`, transform: "translate(-100%, -100%)" }
        : { ...basePosition, top: `${target.y - 6 + offsetY}%`, transform: "translate(-50%, -100%)" };

    const defaultArrow = placement === "right"
      ? undefined
      : placement === "left"
        ? "right"
      : placement === "cpPlanBox" || placement === "cpSystemBubble"
        ? "cp-plan-arrow"
      : bubble.targetNode === "RobotDog"
        ? "down-left-corner"
        : "down";

    const shouldLowerSystemStatusBubble = language === "en"
      && bubble.targetNode === "SystemAgent"
      && (
        bubble.lines?.some((line) => String(line).includes("收到意图"))
        || bubble.lines?.some((line) => String(line).includes("Task Finished"))
      );
    const mergedStyle = {
      ...placementStyle,
      ...(bubble.style || {}),
    };

    if (bubble.targetNode === "SystemAgent") {
      mergedStyle.left = offsetPercentValue(mergedStyle.left, 5);
    }

    if (shouldLowerSystemStatusBubble) {
      mergedStyle.top = offsetPercentValue(mergedStyle.top, 5);
    }

    if (
      language === "en"
      && bubble.variant === "stage2SystemPlan"
      && bubble.title === "Apply for the Digital ID"
    ) {
      mergedStyle.top = offsetPercentValue(mergedStyle.top, 3);
    }

    return {
      ...bubble,
      arrow: bubble.arrow || defaultArrow,
      style: mergedStyle,
    };
  };

  const arSpeechBubble = arSpeechText
      ? {
        lines: [arSpeechText],
        status: "success",
        variant: "voiceIntent",
        className: "left-[13%] top-[74%] w-[13.5em]",
      }
    : null;
  const robotDogSpeechBubble = !hideRobotDogSpeech && stage === 2 && (!stagePhaseKey || stagePhaseKey === "stage2_source")
    ? {
        lines: ["Apply for the Digital ID"],
        status: "success",
        variant: "voiceIntent",
        arrow: "down-left-corner",
        className: "left-[11.5%] top-[18%] w-[12em]",
      }
    : null;
  const activeToolBubbleByTarget = Object.fromEntries(
    agentBubbles
      .filter((bubble) => bubble?.targetNode && AGENT_TOOL_SETS[bubble.targetNode])
      .map((bubble) => [bubble.targetNode, bubble])
  );
  const toolStates = Object.values(activeToolBubbleByTarget).reduce((states, bubble) => {
    const status = bubble.status === "working" ? "working" : "idle";
    (bubble.activeTools || []).forEach((tool) => {
      states[tool] = status;
    });
    return states;
  }, {});
  const isToolStateBubble = (bubble) => (
    bubble?.targetNode
    && AGENT_TOOL_SETS[bubble.targetNode]
    && Array.isArray(bubble.activeTools)
    && bubble.activeTools.length > 0
  );
  const nonToolAgentBubbles = agentBubbles.filter((bubble) => (
    !isToolStateBubble(bubble)
  ));
  const positionedAgentBubbles = [agentBubble, ...nonToolAgentBubbles]
    .filter(Boolean)
    .map((bubble) => resolveAgentBubblePosition(bubble));
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

  useEffect(() => {
    if (stage !== 9 || !activeFlowConfig.lines.length) {
      setStage9BlinkActive(false);
      return undefined;
    }

    setStage9BlinkActive(true);
    const timer = window.setTimeout(() => {
      setStage9BlinkActive(false);
    }, 5000);

    return () => window.clearTimeout(timer);
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
    const a = nodes[from] || TOPOLOGY_CONNECTOR_POINTS[from];
    const b = nodes[to] || TOPOLOGY_CONNECTOR_POINTS[to];
    const start = from === "RobotDog" && to === "gNB"
      ? { x: a.x + 6, y: a.y - 2 }
      : { x: a.x, y: a.y };
    const end = { x: b.x, y: b.y };
    const cx = (start.x + end.x) / 2;
    const cy = Math.min(start.y, end.y) - 10;
    return { start, control: { x: cx, y: cy }, end };
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

  const renderActiveConnection = (connectionConfig) => {
    const key = typeof connectionConfig === "string" ? connectionConfig : connectionConfig.key;
    const pathKey = typeof connectionConfig === "string" ? connectionConfig : connectionConfig.pathKey || connectionConfig.key;
    const connection = pathKey.split("->");
    const path = buildPath(connection);
    const reverse = typeof connectionConfig === "object" && connectionConfig.reverse;

    return (
      <g key={`active-${key}`}>
        <path
          d={path}
          fill="none"
          stroke="#67e8f9"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.82"
          filter="url(#topology-active-line-glow)"
          className="animate-pulse"
        />
        <path
          d={path}
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="0.9"
          strokeDasharray="4 8"
          strokeLinecap="round"
          opacity="0.95"
          className={reverse ? "[animation:topology-flow_1.05s_linear_infinite_reverse]" : "[animation:topology-flow_1.05s_linear_infinite]"}
        />
      </g>
    );
  };

  return (
    <div className="border border-blue-500/35 rounded-xl p-5 bg-slate-900/25 backdrop-blur-md flex h-[900px] flex-col relative shadow-[0_0_22px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />

      <div className="relative flex items-center justify-center gap-3 mb-1">
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold text-blue-100 tracking-wider">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative w-full min-h-0 flex-1 overflow-hidden rounded-lg border border-blue-900/30 bg-slate-950/20">
        <div className="absolute inset-0 z-[1]">
          {TOPOLOGY_ZONES.map((zone) => (
            <div
              key={zone.key}
              className={`pointer-events-none absolute rounded-lg border-2 border-dashed ${zone.className}`}
            >
              <div className={`absolute rounded-md border bg-slate-950/92 px-3 py-1 text-xl font-black leading-none tracking-tight ${zone.labelClassName}`}>
                {zone.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0">
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
            const active = isActive(key) && (stage !== 9 || stage9BlinkActive);
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
            const lineConfig = stage !== 9 || stage9BlinkActive ? activeLineConfigByKey[key] : null;

            if (!lineConfig) {
              return null;
            }

            const point = getPathPoint(connection, 0.52);
            const isBelowLine = lineConfig.labelPosition === "below";

            return (
              <div
                key={`${key}-latency`}
                className={`absolute -translate-x-1/2 rounded border border-cyan-200/70 bg-slate-950/95 px-2 py-1 font-mono text-[10px] font-black leading-none text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.34)] backdrop-blur-md ${
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

        <svg className="pointer-events-none absolute inset-0 z-[19] h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="topology-active-line-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {activeConnections.map(renderActiveConnection)}
        </svg>

        <UnifiedToolPanel toolStates={toolStates} />

        <div className="absolute inset-0 z-20">
          {Object.entries(nodes).map(([key, value]) => {
            const highlighted = highlightedNodeSet.has(key);
            return (
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
                  <div
                    className={`${value.labelClassName || "relative -mt-1"} z-20 rounded border px-2.5 py-1 ${value.labelTextClassName || "text-[10px] sm:text-[11px]"} font-bold tracking-wide whitespace-nowrap backdrop-blur-md ${highlighted ? "border-cyan-200/80 bg-cyan-950/80 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.32)]" : "border-slate-500/45 bg-slate-950/85 text-gray-100"}`}
                    style={value.labelStyle}
                  >
                    {value.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {positionedAgentBubbles.map((bubble, index) => (
          <AgentSpeechBubble
            key={`${bubble.targetNode || "agent"}-${bubble.placement || "bubble"}-${index}`}
            bubble={bubble}
          />
        ))}
        <AgentSpeechBubble bubble={robotDogSpeechBubble} />
        <AgentSpeechBubble bubble={arSpeechBubble} />
        </div>
      </div>

    </div>
  );
};
