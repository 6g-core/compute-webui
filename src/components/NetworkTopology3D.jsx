import { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Cpu,
  Hourglass,
  LoaderCircle,
  Radio,
} from 'lucide-react';
import { getTopologyFlowConfig } from '../topologyFlowConfig';
import { AGENT_TOOL_SETS, formatSystemAgentBubbleLabel, normalizeWorkflowLabel } from '../config/stageConfig.jsx';
import {
  getTaskSummaryText,
  shouldShowTaskSummary,
  TASK_SUMMARY_BAR_CLASSNAME,
  TASK_SUMMARY_CLASSNAME,
  TASK_SUMMARY_TEXT_CLASSNAME,
} from '../utils/topologySummary';
import {
  shouldShowOttDomain,
  shouldShowQosMetricsChart,
  shouldShowTokenTunnel,
  shouldShowTopologyConnection,
  shouldShowTopologyNode,
} from '../utils/topologyStageVisibility.js';
import acnImage from '../ACN.png';
import computingImage from '../Computing.png';
import computingNodeImage from '../Computing_Node.png';
import connectionImage from '../Connetction.png';
import dcfImage from '../../DCF.png';
import dsfImage from '../../DSF.png';
import idmImage from '../../IDM.png';
import marketImage from '../Market.png';
import srfImage from '../SRF.png';
import upfImage from '../upfnew.png';

const AgentSpeechBubble = ({ bubble }) => {
  if (!bubble) {
    return null;
  }

  const items = Array.isArray(bubble.items) ? bubble.items : null;
  const lines = (Array.isArray(bubble.lines) ? bubble.lines : [bubble.text]).filter(Boolean);
  const formatBubbleText = (text) => String(text);
  const isVoiceIntent = bubble.variant === "voiceIntent";
  const isStage2SystemPlan = bubble.variant === "stage2SystemPlan";
  const isIntentValidationBubble = bubble.variant === "intentValidation";
  const isSkillProgressBubble = ["qoeAssurance", "acnSkillProgress", "sandboxServices"].includes(bubble.variant);
  const isSandboxServicesBubble = bubble.variant === "sandboxServices";
  const isTaskProgressBubble = bubble.variant === "taskProgress";
  const isBelowSystemPlan = isStage2SystemPlan && bubble.placement === "below";
  const hasBoostedPlanText = isStage2SystemPlan && bubble.planTextBoost;
  const tools = bubble.variant === "toolPanel" && !items && !isVoiceIntent ? AGENT_TOOL_SETS[bubble.targetNode] : null;
  const activeTools = new Set(Array.isArray(bubble.activeTools) ? bubble.activeTools : []);
  const hasToolPanel = Array.isArray(tools) && tools.length > 0;
  const isSystemAgentBubble = bubble.targetNode === "SystemAgent";
  const isSystemIntentBubble = isSystemAgentBubble && lines.some((line) => String(line).includes("收到意图"));
  const isDapSharedBubble = Boolean(bubble.dapGroup);
  const isLargeAgentBubble = ["ConnectionAgent", "ACN", "Computing", "DCF", "DSF", "IDM", "AgentGW", "OttAgentGW"].includes(bubble.targetNode) && !items && !hasToolPanel;
  const isPrimaryAgentBubble = ["ConnectionAgent", "ACN", "Computing", "DCF", "DSF", "IDM"].includes(bubble.targetNode) && !items && !hasToolPanel;
  const sandboxToolItems = isSandboxServicesBubble ? items.filter((item) => !item.acceptance) : [];
  const sandboxFocusedItem = isSandboxServicesBubble && bubble.sandboxFocusIndex >= 0
    && bubble.sandboxFocusIndex < sandboxToolItems.length
    ? sandboxToolItems[bubble.sandboxFocusIndex]
    : null;
  const sandboxFocusedLines = sandboxFocusedItem
    ? (() => {
        const label = normalizeWorkflowLabel(sandboxFocusedItem.label);
        const prefix = label.startsWith("调用") ? "调用" : label.startsWith("Call ") ? "Call" : "";
        const toolName = label.replace(/^(调用|Call)\s*/, "");
        const parts = toolName.split("_").filter(Boolean);
        const wrappedToolLines = parts.reduce((wrappedLines, part, index) => {
          const token = index < parts.length - 1 ? `${part}_` : part;
          const previousLine = wrappedLines[wrappedLines.length - 1];

          if (previousLine && `${previousLine}${token}`.length <= 22) {
            wrappedLines[wrappedLines.length - 1] = `${previousLine}${token}`;
          } else {
            wrappedLines.push(token);
          }

          return wrappedLines;
        }, []);

        return [
          ...(prefix ? [prefix] : []),
          ...wrappedToolLines,
        ];
      })()
    : [];
  const baseTextSizeClass = isDapSharedBubble
    ? bubble.compactText ? "text-[10px]" : "text-[11px]"
    : isStage2SystemPlan
      ? (hasBoostedPlanText ? "text-[10px]" : "text-[9px]")
      : isPrimaryAgentBubble
        ? "text-[10px]"
        : isLargeAgentBubble
          ? "text-[10px]"
          : isSystemIntentBubble
            ? "text-[9px]"
            : isSystemAgentBubble
              ? "text-[8px]"
              : "text-[7px]";
  const planHeadingTextClass = isBelowSystemPlan ? (isDapSharedBubble ? "text-[9px]" : "text-[8px]") : hasBoostedPlanText ? "text-[10px]" : "text-[9px]";
  const planTitleTextClass = isBelowSystemPlan ? (isDapSharedBubble ? "text-[10px]" : "text-[9px]") : hasBoostedPlanText ? "text-[11px]" : "text-[10px]";
  const positionClassName = bubble.style ? (bubble.className || "") : (bubble.className || "left-[83%] top-[36%]");
  const arrowClassName = bubble.arrow === "down-right"
    ? "absolute bottom-[-5px] right-6 h-2 w-2 rotate-45 border-b border-r border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "cp-plan-arrow"
    ? "absolute bottom-[-5px] right-[16%] h-2 w-2 rotate-45 border-b border-r border-cyan-400/55 bg-slate-950/96"
    : bubble.arrow === "down-left-corner"
    ? "absolute bottom-[-5px] left-1 h-2 w-2 -translate-x-1/2 rotate-[20deg] border-b border-l border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "down-left"
    ? "absolute bottom-[-5px] left-[72%] h-2 w-2 -translate-x-1/2 rotate-[28deg] border-b border-r border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up"
    ? "absolute left-1/2 top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-planning"
    ? "absolute left-[12%] top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-connection"
    ? "absolute left-1/2 top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-acf"
    ? "absolute left-[89%] top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-dcf"
    ? "absolute left-[14%] top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-dsf"
    ? "absolute left-1/2 top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-idm"
    ? "absolute left-[88%] top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
    : bubble.arrow === "up-computing"
    ? "absolute left-[72%] top-[-5px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-cyan-400/45 bg-slate-950/86"
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
  const bubbleScale = isDapSharedBubble
    ? 1
    : bubble.scale || (isStage2SystemPlan ? 1.6 : isVoiceIntent ? 1.22 : bubble.focusScale ? 1.18 : 1);
  const planWidthClass = bubble.planWidthClass || "w-[165px]";
  const shouldScaleBubble = bubbleScale !== 1;
  const bubbleStyle = shouldScaleBubble
    ? {
        ...(bubble.style || {}),
        transform: `${bubble.style?.transform || ""} scale(${bubbleScale})`,
        transformOrigin: bubble.transformOrigin || (isStage2SystemPlan ? "78% 100%" : "50% 100%"),
      }
    : bubble.style;
  const bubbleLayoutClassName = isDapSharedBubble
    ? isStage2SystemPlan || isIntentValidationBubble || isSkillProgressBubble || isTaskProgressBubble
      ? "w-full flex-col items-stretch rounded-xl"
      : "min-h-9 w-full items-center justify-center gap-2 rounded-xl"
    : isStage2SystemPlan
      ? `${planWidthClass} flex-col items-stretch rounded-lg`
      : items
        ? "w-[175px] flex-col items-stretch gap-1 rounded-lg"
        : hasToolPanel
          ? "w-[150px] flex-col items-stretch rounded-md border-dashed"
          : isLargeAgentBubble
            ? "max-w-[205px] items-center gap-2 rounded-full"
            : "max-w-[175px] items-center gap-1.5 rounded-full";
  const bubblePaddingClassName = hasToolPanel
    ? "px-0 py-0"
    : isDapSharedBubble
      ? isStage2SystemPlan
        ? "px-3 py-1.5"
        : isSandboxServicesBubble
          ? "px-2.5 py-1.5"
          : bubble.compactItems
            ? "px-2.5 py-1"
            : "px-3 py-2"
      : isLargeAgentBubble
        ? "px-3 py-2"
        : "px-2.5 py-1.5";

  return (
    <div
      className={`absolute z-30 flex transition-transform duration-500 ease-out ${bubbleLayoutClassName} border ${bubblePaddingClassName} ${baseTextSizeClass} font-bold backdrop-blur-md ${shouldScaleBubble ? "ring-1 ring-cyan-200/45 shadow-[0_0_26px_rgba(34,211,238,0.28)]" : ""} ${bubbleClassName} ${positionClassName}`}
      style={bubbleStyle}
    >
      {isIntentValidationBubble ? (
        <div className="flex min-w-0 flex-col gap-1">
          {lines.map((line, index) => (
            <div key={line} className="flex min-w-0 items-center gap-1.5 text-[11px] font-black leading-tight text-cyan-50">
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${index === 0 ? "text-emerald-300" : "text-cyan-200"}`} />
              <span className="min-w-0 whitespace-nowrap">{formatBubbleText(line)}</span>
            </div>
          ))}
        </div>
      ) : isSandboxServicesBubble ? (
        <>
          <div className="min-w-0 text-[12px] font-black leading-[1.05] text-cyan-50">
            {bubble.title}
          </div>
          <div className="my-0.5 shrink-0 border-t border-dashed border-cyan-300/45" />
          <div className="grid grid-cols-6 place-items-center" aria-label="Sandbox Tool progress">
            {sandboxToolItems.map((item) => (
              <span key={item.label} title={normalizeWorkflowLabel(item.label)}>
                {item.status === "success" ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-300" />
                ) : item.status === "working" ? (
                  <LoaderCircle className="h-2.5 w-2.5 animate-spin text-cyan-100" />
                ) : (
                  <CircleDot className="h-2.5 w-2.5 text-slate-400/75" />
                )}
              </span>
            ))}
          </div>
          <div className="mt-1 min-w-0 text-[13px] font-bold leading-[1.1] tracking-[-0.01em] text-blue-50">
            {bubble.sandboxFocusIndex < 0 ? (
              <span className="whitespace-normal break-words">准备按序调用 6 项 Tool</span>
            ) : bubble.sandboxFocusIndex >= sandboxToolItems.length ? (
              <span className="whitespace-normal break-words">
                {normalizeWorkflowLabel(items.find((item) => item.acceptance)?.label || "编排结果验收通过")}
              </span>
            ) : (
              sandboxFocusedLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">{line}</span>
              ))
            )}
          </div>
        </>
      ) : (isSkillProgressBubble || isTaskProgressBubble) ? (
        <>
          {isSkillProgressBubble && (
            <>
              <div className={`min-w-0 shrink-0 font-black text-cyan-50 ${bubble.compactItems ? "text-[11px] leading-none" : "text-[12px] leading-tight"}`}>
                {bubble.title}
              </div>
              <div className={`${bubble.compactItems ? "my-0.5" : "my-1"} shrink-0 border-t border-dashed border-cyan-300/45`} />
            </>
          )}
          <div>
            <div className={`flex flex-col ${bubble.compactItems ? "gap-0" : "gap-1"}`}>
              {items.map((item) => (
                <div
                  key={item.label}
                  className={`flex min-w-0 items-center ${item.fitOneLine ? "gap-1 text-[9px] leading-none tracking-[-0.035em]" : item.marquee ? "gap-1 text-[9px] leading-none" : bubble.denseItems ? "gap-1 text-[10px] leading-[0.9]" : `gap-1.5 text-[12px] ${bubble.compactItems ? "leading-[0.85]" : "leading-tight"}`} ${item.acceptance ? "mt-0.5 border-t border-dashed border-emerald-300/30 pt-1 text-emerald-100" : ""}`}
                >
                  {item.status === "success" ? (
                    <CheckCircle2 className={`${item.fitOneLine || bubble.denseItems ? "h-2.5 w-2.5" : bubble.compactItems ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 text-emerald-300`} />
                  ) : item.status === "working" ? (
                    <LoaderCircle className={`${item.fitOneLine || bubble.denseItems ? "h-2.5 w-2.5" : bubble.compactItems ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 animate-spin text-cyan-100`} />
                  ) : (
                    <CircleDot className={`${item.fitOneLine || bubble.denseItems ? "h-2.5 w-2.5" : bubble.compactItems ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 text-slate-400/75`} />
                  )}
                  <span className={`min-w-0 flex-1 ${item.fitOneLine ? "overflow-hidden whitespace-nowrap" : "whitespace-normal break-words"} ${item.status === "pending" ? "text-blue-100/60" : ""}`}>
                    {normalizeWorkflowLabel(item.label)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : isStage2SystemPlan ? (
        <>
          {isBelowSystemPlan ? (
            <div className={`${isDapSharedBubble ? "leading-tight" : "text-[8px] leading-tight"} font-black text-cyan-50`}>
              <span className={`${isDapSharedBubble ? "block text-[11px] tracking-wide" : ""} text-cyan-200/75`}>
                用户意图{isDapSharedBubble ? "" : " · "}
              </span>
              <span className={isDapSharedBubble ? "mt-0.5 block text-[14px] leading-tight" : ""}>
                {bubble.title}
              </span>
            </div>
          ) : (
            <div className="leading-tight">
              <span className={`block ${planHeadingTextClass} font-bold tracking-wide text-cyan-200/80`}>用户意图：</span>
              <span className={`block ${planTitleTextClass} font-black text-cyan-50`}>{bubble.title}</span>
            </div>
          )}
          <div className={`${isBelowSystemPlan ? "my-0.5" : "my-1.5"} border-t border-dashed border-cyan-300/55`} />
          {!isBelowSystemPlan && (
            <div className={`mb-1 ${planHeadingTextClass} font-bold leading-tight text-cyan-200/85`}>
              网络任务规划：
            </div>
          )}
          <div className={isBelowSystemPlan && isDapSharedBubble
            ? "flex flex-col gap-0.5"
            : `flex flex-col ${isBelowSystemPlan ? "gap-0.5" : "gap-1.5"}`}>
            {(bubble.tasks || []).map((task) => (
              <div
                key={task.label}
                className={`flex min-w-0 items-center gap-1.5 leading-tight ${isBelowSystemPlan && isDapSharedBubble ? "rounded px-1 py-0.5 odd:bg-cyan-300/[0.035]" : ""}`}
              >
                {task.status === "success" ? (
                  <CheckCircle2 className={`${isBelowSystemPlan ? (isDapSharedBubble ? "h-3.5 w-3.5" : "h-2.5 w-2.5") : "h-3.5 w-3.5"} shrink-0 text-emerald-300`} />
                ) : task.status === "working" ? (
                  <LoaderCircle className={`${isBelowSystemPlan ? (isDapSharedBubble ? "h-3.5 w-3.5" : "h-2.5 w-2.5") : "h-3.5 w-3.5"} shrink-0 animate-spin text-cyan-100`} />
                ) : (
                  <Hourglass className={`${isBelowSystemPlan ? (isDapSharedBubble ? "h-3.5 w-3.5" : "h-2.5 w-2.5") : "h-3.5 w-3.5"} shrink-0 text-slate-400/75`} />
                )}
                <span className={`min-w-0 flex-1 whitespace-normal break-words ${isBelowSystemPlan ? (isDapSharedBubble ? "text-[13px] leading-[1.15]" : "text-[7px] leading-tight") : ""} ${task.status === "pending" ? "text-blue-100/65" : ""}`}>
                  {(isBelowSystemPlan ? [String(task.label).replace(/\n+/g, " ")] : String(task.label).split("\n")).map((line) => (
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
                <div key={tool} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[9px] leading-tight">
                  <span className="truncate text-blue-50">{tool}</span>
                  <span className={isWorking ? "text-amber-200" : "text-blue-300"}>
                    {isWorking ? "working" : "idle"}
                  </span>
                </div>
              );
            })}
          </div>
          {lines.length > 0 && (
            <div className="border-t border-dashed border-cyan-300/50 px-3 py-2 text-[9px] leading-tight text-cyan-50">
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
              <span key={line} className={isSystemIntentBubble || bubble.nowrap ? "whitespace-nowrap" : ""}>
                {formatBubbleText(line)}
              </span>
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
  UE: { name: "AR Glasses\n(Physical AI)", x: 7, y: 78, color: "#22f5ff", image: "/topology/glasses_transparent.png", size: "w-16 md:w-20 2xl:w-24", labelTextClassName: "text-[12px] sm:text-[13px]" },
  RobotDog: { name: "Robot Dog\n(Physical AI)", x: 7, y: 32, color: "#22e6b8", image: "/topology/robotdog_transparent.png", size: "w-20 md:w-24 2xl:w-32", labelTextClassName: "text-[12px] sm:text-[13px]" },
  gNB: { name: "RAN", x: 20, y: 55, color: "#60a5fa", image: "/topology/ran_transparent.png", size: "w-24 md:w-28 2xl:w-36" },
  SRF: { name: "SRF", x: 29.5, y: 49, color: "#38bdf8", image: srfImage, size: "w-16 md:w-20 2xl:w-24", labelClassName: "relative -mt-6" },
  SystemAgent: { name: "Planning\nAgent", x: 42, y: 39, color: "#c084fc", image: "/topology/systemagent_transparent.png", compact: true },
  UPF: { name: "UPF", x: 36, y: 82, color: "#34d399", image: upfImage, size: "w-20 md:w-24 2xl:w-32", labelClassName: "relative -mt-7" },
  ConnectionAgent: { name: "Connection\nAgent", x: 51.3, y: 39, color: "#22d3ee", image: connectionImage, compact: true },
  ACN: { name: "ACF", x: 60.6, y: 39, color: "#f472b6", image: acnImage, compact: true },
  DCF: { name: "DCF", x: 68, y: 39, color: "#38bdf8", image: dcfImage, compact: true },
  DSF: { name: "DSF", x: 75.2, y: 39, color: "#34d399", image: dsfImage, compact: true },
  IDM: { name: "IDM", x: 82.4, y: 39, color: "#a78bfa", image: idmImage, compact: true },
  Computing: {
    name: "CCF",
    x: 91.5,
    y: 39,
    color: "#fbbf24",
    image: computingImage,
    compact: true,
  },
  AgentGW: { name: "Agent GW", x: 62.5, y: 91, color: "#38bdf8", image: "/topology/gw.png", size: "w-16 md:w-20 2xl:w-28", labelClassName: "relative -mt-7" },
  OttAgentGW: { name: "Agent GW", x: 78.5, y: 82, color: "#38bdf8", image: "/topology/gw.png", size: "w-16 md:w-20 2xl:w-28", labelClassName: "relative -mt-7" },
  MarketAgent: { name: "Market Agent\n(Digital AI)", x: 89, y: 81, color: "#38bdf8", image: marketImage, size: "w-16 md:w-20 2xl:w-28", labelClassName: "relative -mt-7" },
  Gateway: { name: "Computing Node", x: 62.5, y: 72, color: "#38bdf8", image: computingNodeImage, size: "w-16 md:w-20 2xl:w-28", labelClassName: "relative -mt-7" },
};

const TOPOLOGY_CONNECTOR_POINTS = {};

const DAP_BUS = { startX: 38.5, endX: 96.5, y: 22.5 };
const DAP_BUBBLE_GROUPS = {
  intelligent: { left: "39.2%", top: "46.5%", width: "24.1%" },
  data: { left: "65.2%", top: "46.5%", width: "19.6%" },
  computing: { left: "78.5%", top: "46.5%", width: "18%" },
};
const DAP_BUBBLE_GROUP_BY_NODE = {
  SystemAgent: "intelligent",
  ConnectionAgent: "intelligent",
  ACN: "intelligent",
  DCF: "data",
  DSF: "data",
  IDM: "data",
  Computing: "computing",
};
const DAP_BUBBLE_ARROW_BY_NODE = {
  SystemAgent: "up-planning",
  ConnectionAgent: "up-connection",
  ACN: "up-acf",
  DCF: "up-dcf",
  DSF: "up-dsf",
  IDM: "up-idm",
  Computing: "up-computing",
};
const DAP_NF_KEYS = new Set(Object.keys(DAP_BUBBLE_GROUP_BY_NODE));
const DAP_BUS_BRANCHES = {
  SRF: { tapX: 38.5, anchorOffsetY: -6 },
  SystemAgent: { tapX: 42, anchorOffsetY: -6 },
  ConnectionAgent: { tapX: 51.3, anchorOffsetY: -6 },
  ACN: { tapX: 60.6, anchorOffsetY: -6 },
  DCF: { tapX: 68, anchorOffsetY: -6 },
  DSF: { tapX: 75.2, anchorOffsetY: -6 },
  IDM: { tapX: 82.4, anchorOffsetY: -6 },
  Computing: { tapX: 91.5, anchorOffsetY: -6 },
};
const DAP_BUS_CONNECTIONS = Object.keys(DAP_BUS_BRANCHES);

const getDapBusPoint = (x) => {
  const clampedX = Math.min(DAP_BUS.endX, Math.max(DAP_BUS.startX, x));

  return {
    x: clampedX,
    y: DAP_BUS.y,
  };
};

const getDapBusBranchAnchor = (nodeKey) => {
  const node = TOPOLOGY_NODES[nodeKey];
  const branch = DAP_BUS_BRANCHES[nodeKey];

  return {
    x: node.x,
    y: node.y + branch.anchorOffsetY,
  };
};

const buildDapBusBranchPath = (nodeKey) => {
  const anchor = getDapBusBranchAnchor(nodeKey);
  const branch = DAP_BUS_BRANCHES[nodeKey];
  const tap = getDapBusPoint(branch.tapX);

  return `M ${anchor.x} ${anchor.y} L ${tap.x} ${tap.y}`;
};

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
  ["SystemAgent", "IDM"],
  ["ACN", "DCF"],
  ["DCF", "DSF"],
  ["ACN", "IDM"],
  ["SystemAgent", "Computing"],
];

const TOKEN_TUNNEL_CONNECTIONS = [
  ["UE", "gNB"],
  ["gNB", "UPF"],
  ["UPF", "Gateway"],
];

const TOKEN_TUNNEL_CONNECTION_KEYS = new Set(
  TOKEN_TUNNEL_CONNECTIONS.map(([from, to]) => `${from}->${to}`),
);

const CP_TOOL_ITEMS = ["AM Tool", "SM Tool", "Policy Tool", "UDM Tool"];
const CP_TOOL_ITEM_SET = new Set(CP_TOOL_ITEMS);

const TOOL_ICON_BY_NAME = {
  "AM Tool": Cpu,
  "SM Tool": Cpu,
  "Policy Tool": Cpu,
  "UDM Tool": Cpu,
};

const TOPOLOGY_ZONES = [
  {
    key: "cp",
    label: "CP",
    className: "left-[37%] top-[1%] h-[11.5%] w-[61%] border-orange-300/90 bg-orange-500/[0.08] shadow-[0_0_22px_rgba(251,146,60,0.28)]",
    labelClassName: "left-2 top-2 border-orange-200/80 text-orange-100 shadow-[0_0_18px_rgba(251,146,60,0.35)]",
  },
  {
    key: "dap",
    label: "DAP",
    className: "left-[37%] top-[14.5%] h-[51.5%] w-[61%] border-violet-300/85 bg-violet-500/[0.07] shadow-[0_0_22px_rgba(167,139,250,0.22)]",
    labelClassName: "left-2 top-2 border-violet-200/75 text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.28)]",
  },
  {
    key: "up",
    label: "UP",
    className: "left-[32%] top-[67%] h-[32%] w-[39%] border-emerald-300/90 bg-emerald-500/[0.08] shadow-[0_0_22px_rgba(16,185,129,0.25)]",
    labelClassName: "bottom-2 left-2 border-emerald-200/80 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.32)]",
  },
  {
    key: "ott",
    label: "OTT",
    className: "left-[73%] top-[67%] h-[32%] w-[25%] border-sky-300/85 bg-sky-500/[0.08] shadow-[0_0_18px_rgba(56,189,248,0.18)]",
    labelClassName: "bottom-2 right-2 border-sky-200/70 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.22)]",
  },
];

const UnifiedToolPanel = ({ toolStates }) => {
  const hasWorkingTool = Object.values(toolStates).some((state) => state === "working");

  return (
    <div className={`absolute left-[42%] top-[2.3%] z-[26] grid h-[7.6%] w-[55%] grid-cols-4 gap-3 text-blue-50 ${hasWorkingTool ? "cp-tool-panel-flash" : ""}`}>
      {CP_TOOL_ITEMS.map((name) => {
        const state = toolStates[name] || "idle";
        const ToolIcon = TOOL_ICON_BY_NAME[name] || BrainCircuit;
        const stateClassName = state === "working" ? "text-amber-200" : "text-blue-100/90";
        const dotClassName = state === "working"
          ? "bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.85)]"
          : "bg-cyan-300/75 shadow-[0_0_8px_rgba(34,211,238,0.35)]";

        return (
        <div
          key={name}
          className={`group/tool relative min-h-0 min-w-0 rounded-md border px-2 leading-none transition ${
            state === "working"
              ? "cp-tool-call-flash border-amber-100 bg-amber-300/20 shadow-[0_0_18px_rgba(251,191,36,0.38)]"
              : "border-orange-100/24 bg-slate-950/32 shadow-[inset_0_0_14px_rgba(251,146,60,0.05)]"
          }`}
        >
          <span className={`absolute bottom-1.5 right-1.5 rounded border bg-slate-950/88 px-2 py-0.5 font-mono text-[10px] font-black uppercase leading-none tracking-[0.08em] shadow-[0_0_7px_rgba(34,211,238,0.16)] ${state === "working" ? "border-amber-100/90 text-amber-100" : "border-cyan-200/50 text-cyan-100/90"}`}>
            Tool
          </span>
          <span className="absolute left-1/2 top-[43%] flex min-w-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 whitespace-nowrap text-[14px] font-black leading-none text-blue-50/95">
            <ToolIcon className={`h-4 w-4 shrink-0 ${state === "working" ? "text-amber-200" : "text-cyan-200/80"}`} />
            <span>{name.replace(/\s+Tool$/, "")}</span>
          </span>
          <span className="absolute bottom-1.5 left-2 flex shrink-0 items-center justify-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
            <span className={`font-mono text-[10px] leading-none ${stateClassName}`}>
              {state === "working" ? "work" : state}
            </span>
          </span>
        </div>
        );
      })}
    </div>
  );
};

const QosMetricsChart = ({ metrics = [] }) => {
  const chartWidth = 240;
  const chartHeight = 122;
  const padding = { top: 16, right: 16, bottom: 30, left: 48 };
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
    `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point[key].toFixed(1)}`
  )).join(" ");
  const sendratePath = buildLinePath("sendrateY");
  const gbrPath = buildLinePath("gbrY");
  const startLabel = metrics[0]
    ? new Date(metrics[0].timestamp).toLocaleTimeString("zh-CN", { minute: "2-digit", second: "2-digit" })
    : "--:--";
  const endLabel = latestPoint
    ? new Date(latestPoint.timestamp).toLocaleTimeString("zh-CN", { minute: "2-digit", second: "2-digit" })
    : "--:--";

  return (
    <div className="pointer-events-none absolute left-[73%] top-[67%] z-[27] flex h-[32%] w-[25%] flex-col overflow-hidden rounded-lg border border-cyan-200/55 bg-slate-950/88 px-3 py-3 text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.28)] backdrop-blur-md">
      <div className="mb-1.5 flex shrink-0 flex-col gap-0.5">
        <div className="truncate text-[19px] font-black leading-none text-cyan-50">QoS保障曲线</div>
        <div className="flex items-end justify-between gap-2 font-mono text-[13px] leading-none">
          <div className="text-blue-100/70">sendrate/GBR</div>
          <div className="flex shrink-0 items-baseline gap-1">
            <span className="text-[21px] font-black text-emerald-200">
              Q{latestPoint ? latestPoint.q_lvl : "--"}
            </span>
            <span className="text-[14px] text-blue-100/60">q_lvl</span>
          </div>
        </div>
      </div>

      <svg className="min-h-0 flex-1 overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="QoS metrics chart">
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.42)" strokeWidth="0.8" />
        <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="rgba(125,211,252,0.42)" strokeWidth="0.8" />
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + ratio * plotHeight;
          const label = Math.round(maxValue - ratio * (maxValue - minValue));
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="rgba(125,211,252,0.14)" strokeWidth="0.6" />
              <text x={padding.left - 5} y={y + 5} textAnchor="end" className="fill-blue-100/70 text-[12px] font-mono">{label}</text>
            </g>
          );
        })}
        {metrics.length ? (
          <>
            <path d={gbrPath} fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d={sendratePath} fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <text x="50%" y="50%" textAnchor="middle" className="fill-blue-100/70 text-[16px] font-bold">
            等待QoS推送
          </text>
        )}
        <text x={padding.left} y={chartHeight - 5} className="fill-blue-100/65 text-[12px] font-mono">{startLabel}</text>
        <text x={padding.left + plotWidth} y={chartHeight - 5} textAnchor="end" className="fill-blue-100/65 text-[12px] font-mono">{endLabel}</text>
        <text x="8" y={padding.top + plotHeight / 2} transform={`rotate(-90 8 ${padding.top + plotHeight / 2})`} textAnchor="middle" className="fill-cyan-100/70 text-[12px] font-mono">kbps</text>
      </svg>

      <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2 font-mono text-[14px] leading-none text-blue-100/75">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />sendrate</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" />GBR</span>
      </div>
    </div>
  );
};

const CurrentTaskSummaryOverlay = ({
  stage,
  workflow = [],
  activeConnections = [],
  highlightedNodes = [],
  topologyLines = [],
  stage10BlinkActive = false,
  stagePhaseKey = null,
  activeFlowType = null,
}) => {
  if (!shouldShowTaskSummary({
    activeConnections,
    highlightedNodes,
    topologyLines,
    stage10BlinkActive,
  })) {
    return null;
  }

  const summary = getTaskSummaryText({
    stage,
    stagePhaseKey,
    activeFlowType,
    workflow,
    stage10BlinkActive,
  });

  if (!summary) {
    return null;
  }

  return (
    <aside className={TASK_SUMMARY_CLASSNAME}>
      <div className="flex min-w-0 items-stretch">
        <span className={TASK_SUMMARY_BAR_CLASSNAME} />
        <span className={TASK_SUMMARY_TEXT_CLASSNAME}>{summary}</span>
      </div>
    </aside>
  );
};

const IntentEntryArrow = () => (
  <div
    className="pointer-events-none absolute left-[13.5%] top-[31%] z-[19] h-12 w-[23.5%]"
    aria-label="意图入口"
  >
    <span className="absolute bottom-[calc(50%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-amber-300/55 bg-slate-950/92 px-3.5 py-1.5 text-base font-black tracking-[0.1em] text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.32)] backdrop-blur-md">
      意图入口
    </span>
    <span className="absolute left-0 right-4 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-amber-400/45 via-amber-300 to-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.82)]" />
    <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 bg-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] [clip-path:polygon(0_0,100%_50%,0_100%,28%_50%)]" />
  </div>
);

export const NetworkTopology3D = ({
  stage,
  activeFlowType,
  agentBubble,
  agentBubbles = [],
  arSpeechText = "",
  hideRobotDogSpeech = false,
  title = "数字身份申请",
  topologyLines = null,
  workflow = [],
  highlightedNodes = [],
  activeConnections = [],
  stagePhaseKey = null,
  language = "zh",
  qosMetrics = [],
}) => {
  const nodes = TOPOLOGY_NODES;
  const connections = useMemo(() => (
    TOPOLOGY_CONNECTIONS.filter((connection) => shouldShowTopologyConnection(stage, connection))
  ), [stage]);
  const showOttDomain = shouldShowOttDomain(stage);
  const showQosMetricsChart = shouldShowQosMetricsChart(stage);
  const showTokenTunnel = shouldShowTokenTunnel(stage);
  const activeFlowConfig = topologyLines
    ? { color: "#22f5ff", lines: topologyLines }
    : getTopologyFlowConfig(stage, activeFlowType);
  const highlightedNodeSet = useMemo(() => new Set(highlightedNodes), [highlightedNodes]);
  const [stage10BlinkActive, setStage10BlinkActive] = useState(false);
  const resolveAgentBubblePosition = (bubble) => {
    if (!bubble?.targetNode) {
      return bubble;
    }

    const target = nodes[bubble.targetNode];

    if (!target) {
      return bubble;
    }

    const isDapAgentBubble = DAP_NF_KEYS.has(bubble.targetNode);
    const dapGroup = isDapAgentBubble ? DAP_BUBBLE_GROUP_BY_NODE[bubble.targetNode] : null;
    const dapBubbleGroup = dapGroup ? DAP_BUBBLE_GROUPS[dapGroup] : null;
    const offsetX = isDapAgentBubble ? 0 : (bubble.offsetX || 0);
    const offsetY = isDapAgentBubble ? 0 : (bubble.offsetY || 0);
    const requestedPlacement = bubble.placement || "above";
    const placement = isDapAgentBubble ? "below" : requestedPlacement;
    const basePosition = {
      left: `${target.x + offsetX}%`,
      top: `${target.y + offsetY}%`,
    };
    const hasToolPanel = Boolean(AGENT_TOOL_SETS[bubble.targetNode]);
    const placementStyle = isDapAgentBubble
      ? {
          left: dapBubbleGroup.left,
          top: bubble.dapTop || dapBubbleGroup.top,
          width: dapBubbleGroup.width,
          maxWidth: "none",
          transform: "",
        }
      : placement === "cpPlanBox"
      ? { left: "35%", top: "6.5%", transform: "" }
      : placement === "cpSystemBubble"
      ? { left: "40.5%", top: "18%", transform: "" }
      : placement === "right"
      ? {
          ...basePosition,
          top: `${target.y - 5 + offsetY}%`,
          transform: hasToolPanel
            ? "translate(30%, -50%)"
            : "translate(22%, -50%)",
        }
      : placement === "left"
        ? { ...basePosition, transform: "translate(-108%, -50%)" }
      : placement === "below"
        ? { ...basePosition, top: `${target.y + 7 + offsetY}%`, transform: "translate(-50%, 0)" }
      : placement === "upperLeft"
        ? { left: `${target.x + 4 + offsetX}%`, top: `${target.y - 15 + offsetY}%`, transform: "translate(-100%, -100%)" }
        : { ...basePosition, top: `${target.y - 6 + offsetY}%`, transform: "translate(-50%, -100%)" };

    const defaultArrow = isDapAgentBubble
      ? DAP_BUBBLE_ARROW_BY_NODE[bubble.targetNode]
      : placement === "right"
      ? undefined
      : placement === "left"
        ? "right"
      : placement === "below"
        ? "up"
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

    if (isDapAgentBubble) {
      mergedStyle.left = placementStyle.left;
      mergedStyle.top = placementStyle.top;
      mergedStyle.transform = placementStyle.transform;
      mergedStyle.width = placementStyle.width;
      mergedStyle.maxWidth = placementStyle.maxWidth;
    }

    if (shouldLowerSystemStatusBubble) {
      mergedStyle.top = offsetPercentValue(mergedStyle.top, 5);
    }

    return {
      ...bubble,
      dapGroup,
      placement,
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
  const toolStates = agentBubbles.reduce((states, bubble) => {
    const status = bubble.status === "working" ? "working" : "idle";
    (bubble.activeTools || []).forEach((tool) => {
      if (CP_TOOL_ITEM_SET.has(tool)) {
        states[tool] = status;
      }
    });
    return states;
  }, {});
  const isCpToolStateBubble = (bubble) => (
    bubble?.targetNode
    && !["qoeAssurance", "acnSkillProgress", "sandboxServices", "taskProgress"].includes(bubble.variant)
    && Array.isArray(bubble.activeTools)
    && bubble.activeTools.some((tool) => CP_TOOL_ITEM_SET.has(tool))
  );
  const nonToolAgentBubbles = agentBubbles.filter((bubble) => (
    !isCpToolStateBubble(bubble)
  ));
  const visibleAgentBubbles = [agentBubble, ...nonToolAgentBubbles].filter(Boolean);
  const activeDapBubbleByGroup = visibleAgentBubbles.reduce((groups, bubble) => {
    const group = DAP_BUBBLE_GROUP_BY_NODE[bubble.targetNode];

    if (group) {
      groups[group] = bubble;
    }

    return groups;
  }, {});
  const positionedAgentBubbles = visibleAgentBubbles.filter((bubble) => {
    const group = DAP_BUBBLE_GROUP_BY_NODE[bubble.targetNode];

    return !group || activeDapBubbleByGroup[group] === bubble;
  }).map((bubble) => resolveAgentBubblePosition(bubble));
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
    if (stage !== 10 || !activeFlowConfig.lines.length) {
      setStage10BlinkActive(false);
      return undefined;
    }

    setStage10BlinkActive(true);
    const timer = window.setTimeout(() => {
      setStage10BlinkActive(false);
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
  ), [stage, activeFlowType, topologyLines, latencySampleTick]);

  const getPathGeometry = ([from, to]) => {
    const a = nodes[from] || TOPOLOGY_CONNECTOR_POINTS[from];
    const b = nodes[to] || TOPOLOGY_CONNECTOR_POINTS[to];
    const isArToRan = from === "UE" && to === "gNB";
    const isRobotDogToRan = from === "RobotDog" && to === "gNB";
    const start = isRobotDogToRan
      ? { x: a.x + 6, y: a.y - 2 }
      : isArToRan
        ? { x: a.x + 3.7, y: a.y - 6.9 }
        : { x: a.x, y: a.y };
    const end = isArToRan ? { x: b.x - 2.4, y: b.y + 2.9 } : { x: b.x, y: b.y };
    const cx = (start.x + end.x) / 2;
    const cy = isArToRan
      ? start.y - 8
      : isRobotDogToRan
        ? ((start.y + end.y) / 2) - 2.5
        : Math.min(start.y, end.y) - 10;
    return { start, control: { x: cx, y: cy }, end };
  };

  const getBusPathPoints = ([from, to]) => {
    const start = nodes[from] || TOPOLOGY_CONNECTOR_POINTS[from];
    const end = nodes[to] || TOPOLOGY_CONNECTOR_POINTS[to];
    const startsInDap = DAP_NF_KEYS.has(from);
    const endsInDap = DAP_NF_KEYS.has(to);

    if (!start || !end || (!startsInDap && !endsInDap)) {
      return null;
    }

    const startTapX = DAP_BUS_BRANCHES[from]?.tapX ?? start.x;
    const endTapX = DAP_BUS_BRANCHES[to]?.tapX ?? end.x;
    const startAnchor = DAP_BUS_BRANCHES[from]
      ? getDapBusBranchAnchor(from)
      : { x: start.x, y: start.y };
    const endAnchor = DAP_BUS_BRANCHES[to]
      ? getDapBusBranchAnchor(to)
      : { x: end.x, y: end.y };

    return [
      startAnchor,
      getDapBusPoint(startTapX),
      getDapBusPoint(endTapX),
      endAnchor,
    ];
  };

  const buildPath = (connection) => {
    const busPoints = getBusPathPoints(connection);

    if (busPoints) {
      return busPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");
    }

    const { start, control, end } = getPathGeometry(connection);
    return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  };

  const getPathPoint = (connection, t = 0.5) => {
    const busPoints = getBusPathPoints(connection);

    if (busPoints) {
      const segments = busPoints.slice(1).map((point, index) => {
        const previous = busPoints[index];
        return {
          start: previous,
          end: point,
          length: Math.hypot(point.x - previous.x, point.y - previous.y),
        };
      });
      const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
      let remaining = totalLength * t;

      for (const segment of segments) {
        if (remaining <= segment.length || segment === segments.at(-1)) {
          const ratio = segment.length ? Math.min(1, remaining / segment.length) : 0;
          return {
            x: segment.start.x + ((segment.end.x - segment.start.x) * ratio),
            y: segment.start.y + ((segment.end.y - segment.start.y) * ratio),
          };
        }
        remaining -= segment.length;
      }
    }

    const { start, control, end } = getPathGeometry(connection);
    const inverse = 1 - t;
    return {
      x: (inverse ** 2 * start.x) + (2 * inverse * t * control.x) + (t ** 2 * end.x),
      y: (inverse ** 2 * start.y) + (2 * inverse * t * control.y) + (t ** 2 * end.y),
    };
  };

  const isActive = (key) => Boolean(activeLineConfigByKey[key]);

  const activeConnectionPathKeys = new Set(activeConnections.map((connectionConfig) => (
    typeof connectionConfig === "string"
      ? connectionConfig
      : connectionConfig.pathKey || connectionConfig.key
  )));

  const renderActiveConnection = (connectionConfig) => {
    const key = typeof connectionConfig === "string" ? connectionConfig : connectionConfig.key;
    const pathKey = typeof connectionConfig === "string" ? connectionConfig : connectionConfig.pathKey || connectionConfig.key;
    const connection = pathKey.split("->");
    const path = buildPath(connection);
    const reverse = typeof connectionConfig === "object" && connectionConfig.reverse;

    if (showTokenTunnel && TOKEN_TUNNEL_CONNECTION_KEYS.has(pathKey)) {
      return null;
    }

    return (
      <g key={`active-${key}`}>
        <path
          d={path}
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="0.68"
          strokeDasharray="1.8 4.6"
          strokeLinecap="round"
          opacity="0.95"
          filter="url(#topology-active-line-glow)"
          className={reverse ? "[animation:topology-flow_1.05s_linear_infinite_reverse]" : "[animation:topology-flow_1.05s_linear_infinite]"}
        />
      </g>
    );
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-blue-500/35 bg-slate-900/25 p-4 shadow-[0_0_22px_rgba(0,0,0,0.35)] backdrop-blur-md"
      data-stage={stage}
      data-stage-phase={stagePhaseKey || ""}
    >
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />

      <div className="relative mb-1 flex shrink-0 items-center justify-center gap-3">
        <div className="w-full text-center">
          <h2 className="text-xl font-bold text-blue-100 tracking-wider">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative w-full min-h-0 flex-1 overflow-hidden rounded-lg border border-blue-900/30 bg-slate-950/20">
        <div className="absolute inset-0 z-[1]">
          {TOPOLOGY_ZONES.filter((zone) => zone.key !== "ott" || showOttDomain).map((zone) => (
            <div
              key={zone.key}
              className={`pointer-events-none absolute rounded-lg border-2 border-dashed ${zone.className}`}
            >
              <div className={`absolute rounded-md border bg-slate-950/92 px-3 py-1 text-base font-black leading-none tracking-tight ${zone.labelClassName}`}>
                {zone.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0">
        <CurrentTaskSummaryOverlay
          stage={stage}
          workflow={workflow}
          stagePhaseKey={stagePhaseKey}
          activeFlowType={activeFlowType}
          activeConnections={activeConnections}
          highlightedNodes={highlightedNodes}
          topologyLines={stage === 10 && !stage10BlinkActive ? [] : (topologyLines || activeFlowConfig.lines)}
          stage10BlinkActive={stage10BlinkActive}
        />

        <IntentEntryArrow />

        {showQosMetricsChart && <QosMetricsChart metrics={qosMetrics} />}

        {showTokenTunnel && (
          <div className="pointer-events-none absolute left-[40%] top-[68%] z-[18] -translate-x-1/2 rounded-md border border-cyan-200/55 bg-slate-950/92 px-2.5 py-1 text-xs font-black tracking-[0.06em] text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.28)] backdrop-blur-md">
            Token Tunnel
          </div>
        )}

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
          <g aria-label="DAP Bus">
            <path
              d={`M ${DAP_BUS.startX} ${DAP_BUS.y} L ${DAP_BUS.endX} ${DAP_BUS.y}`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.1"
              strokeLinecap="round"
              opacity="0.42"
            />
            {DAP_BUS_CONNECTIONS.map((nodeKey) => (
              <g key={`dap-bus-${nodeKey}`}>
                <path
                  d={buildDapBusBranchPath(nodeKey)}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1.1"
                  strokeLinecap="round"
                  opacity="0.42"
                />
              </g>
            ))}
          </g>
          {showTokenTunnel && TOKEN_TUNNEL_CONNECTIONS.map((connection) => {
            const key = `${connection[0]}->${connection[1]}`;
            const path = buildPath(connection);

            return (
              <g key={`token-tunnel-${key}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="#22f5ff"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  opacity="0.82"
                  filter="url(#topology-line-glow)"
                  className="animate-pulse"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="0.68"
                  strokeDasharray="1.8 4.6"
                  strokeLinecap="round"
                  opacity="0.98"
                  filter="url(#topology-line-glow)"
                  className="[animation:topology-flow_1.05s_linear_infinite_reverse]"
                />
              </g>
            );
          })}
          {connections.map((connection) => {
            const key = `${connection[0]}->${connection[1]}`;
            const active = isActive(key)
              && !activeConnectionPathKeys.has(key)
              && !(showTokenTunnel && TOKEN_TUNNEL_CONNECTION_KEYS.has(key))
              && (stage !== 10 || stage10BlinkActive);
            const color = activeFlowConfig.color || "#22f5ff";
            const path = buildPath(connection);

            const isDapBusConnection = Boolean(
              DAP_BUS_BRANCHES[connection[0]] && DAP_BUS_BRANCHES[connection[1]],
            );

            return (
              <g key={key}>
                {!isDapBusConnection && (
                  <path
                    d={path}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="0.35"
                    strokeDasharray="1.2 1.1"
                    strokeLinecap="round"
                    opacity="0.42"
                  />
                )}
                {active && (
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.68"
                    strokeDasharray="1.8 4.6"
                    strokeLinecap="round"
                    opacity="0.95"
                    filter="url(#topology-line-glow)"
                    className="[animation:topology-flow_1.3s_linear_infinite]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 z-[18]">
          {connections.map((connection) => {
            const key = `${connection[0]}->${connection[1]}`;
            const lineConfig = stage !== 10 || stage10BlinkActive ? activeLineConfigByKey[key] : null;

            if (!lineConfig) {
              return null;
            }

            const point = getPathPoint(connection, 0.52);
            const isBelowLine = lineConfig.labelPosition === "below";

            return (
              <div
                key={`${key}-latency`}
                className={`absolute -translate-x-1/2 rounded border border-cyan-200/70 bg-slate-950/95 px-2 py-1 font-mono text-[8px] font-black leading-none text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.34)] backdrop-blur-md ${
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
          {Object.entries(nodes).filter(([key]) => shouldShowTopologyNode(stage, key)).map(([key, value]) => {
            const highlighted = highlightedNodeSet.has(key);

            if (value.compact) {
              return (
                <div
                  key={key}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 select-none transition-all duration-300 ${highlighted ? "scale-110" : ""}`}
                  style={{ left: `${value.x}%`, top: `${value.y}%` }}
                >
                  <div className="relative flex w-[96px] flex-col items-center px-1 py-1">
                    <div
                      className={`absolute inset-x-2 top-1 h-12 rounded-full blur-xl ${highlighted ? "opacity-70" : "opacity-35"}`}
                      style={{ backgroundColor: value.color }}
                    />
                    <img
                      src={value.image}
                      alt={value.name}
                      className={`relative z-10 h-[72px] w-[88px] object-contain ${highlighted ? "drop-shadow-[0_0_14px_rgba(165,243,252,0.9)]" : "drop-shadow-[0_8px_9px_rgba(0,0,0,0.62)]"}`}
                      draggable="false"
                    />
                    <div className="relative z-10 -mt-2 whitespace-pre-line text-center text-[14px] font-black leading-[1.05] text-blue-50 [text-shadow:0_1px_4px_rgba(2,6,23,1),0_0_8px_rgba(2,6,23,0.9)]">
                      {value.name}
                    </div>
                  </div>
                </div>
              );
            }

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
                    className={`${value.size} relative z-10 object-contain [transform:perspective(720px)_rotateX(10deg)_rotateY(-10deg)_translateY(-4px)_scale(0.8)] drop-shadow-[0_18px_18px_rgba(0,0,0,0.58)]`}
                    draggable="false"
                  />
                  <div
                    className={`${value.labelClassName || "relative -mt-1"} z-20 rounded border px-2.5 py-1 ${value.labelTextClassName || "text-[11px] sm:text-[12px]"} font-bold tracking-wide whitespace-pre-line text-center backdrop-blur-md ${highlighted ? "border-cyan-200/80 bg-cyan-950/80 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.32)]" : "border-slate-500/45 bg-slate-950/85 text-gray-100"}`}
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
