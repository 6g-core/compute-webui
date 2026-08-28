import { useEffect, useState } from 'react';
import {
  STAGE2_COMPLETION_LOGS,
  STAGE2_INTENT_SUMMARY,
  STAGE2_PHASE_TIMING,
  STAGE2_PHASES,
  STAGE2_WORKFLOW,
  STAGE4_INTENT_SUMMARY,
  STAGE4_PHASE_TIMING,
  STAGE4_PHASES,
  STAGE4_TOOL_BUBBLES,
  STAGE4_WORKFLOW,
  STAGE5_INTENT_SUMMARY,
  STAGE5_PHASE_TIMING,
  STAGE5_PHASES,
  STAGE6_LOGS,
  STAGE6_WORKFLOW,
  STAGE7_INTENT_SUMMARY,
  STAGE7_PHASE_TIMING,
  STAGE7_PHASES,
  STAGE7_LOGS,
  STAGE7_WORKFLOW,
  STAGE9_QOS_PHASE_TIMING,
  STAGE9_QOS_PHASES,
  STAGE_ANIMATION_TIMING,
  STAGE_CONFIG,
  normalizeWorkflowLabel,
} from '../config/stageConfig.jsx';
import { isQosExperienceStage } from '../utils/topologyStageVisibility.js';

const buildStageIntentSummary = (summaryItems, phases, phaseIndex) => {
  const phase = phases[phaseIndex] || phases[0];
  const summary = summaryItems
    .slice(0, phase?.intentSummaryCount || 0)
    .map((item) => ({ ...item, lines: [...item.lines] }));

  phases.slice(0, phaseIndex + 1).forEach((seenPhase) => {
    if (!seenPhase.appendIntentSummary) {
      return;
    }

    const target = summary.find((item) => item.id === seenPhase.appendIntentSummary.targetId);

    if (target && !target.lines.includes(seenPhase.appendIntentSummary.line)) {
      target.lines.push(seenPhase.appendIntentSummary.line);
    }
  });

  return summary;
};

const buildCompletedStageIntentSummary = (summaryItems, phases) => (
  buildStageIntentSummary(summaryItems, phases, phases.length - 1)
);

const STAGE10_HANDOFF_FLASH_MS = 5000;

export const useEffectiveStageConfig = (stage, { stage5VideoReady = true } = {}) => {
  const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG[1];
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
  const [stage2PhaseIndex, setStage2PhaseIndex] = useState(0);
  const [stage2FinalFlashActive, setStage2FinalFlashActive] = useState(false);
  const [stage4PhaseIndex, setStage4PhaseIndex] = useState(0);
  const [stage4FinalFlashActive, setStage4FinalFlashActive] = useState(false);
  const [stage5PhaseIndex, setStage5PhaseIndex] = useState(0);
  const [stage5AnimationComplete, setStage5AnimationComplete] = useState(false);
  const [stage7PhaseIndex, setStage7PhaseIndex] = useState(0);
  const [stage7FinalFlashActive, setStage7FinalFlashActive] = useState(false);
  const [stage9QosPhaseIndex, setStage9QosPhaseIndex] = useState(0);
  const [stage10HandoffFlashActive, setStage10HandoffFlashActive] = useState(false);

  useEffect(() => {
    if (stage !== 2) {
      setStage2PhaseIndex(0);
      setStage2FinalFlashActive(false);
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
    setStage2PhaseIndex(0);
    setStage2FinalFlashActive(false);
  }, [stage]);

  useEffect(() => {
    if (stage === 2) {
      return undefined;
    }

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
  }, [
    stage,
    stage2Progress.activeTask,
    stage2Progress.bubbleStatus,
    stage2Progress.completedCount,
  ]);

  useEffect(() => {
    if (stage !== 2 || stage2PhaseIndex >= STAGE2_PHASES.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStage2PhaseIndex((index) => Math.min(index + 1, STAGE2_PHASES.length - 1));
    }, STAGE2_PHASE_TIMING[stage2PhaseIndex] || 1300);

    return () => window.clearTimeout(timer);
  }, [stage, stage2PhaseIndex]);

  useEffect(() => {
    if (stage !== 2 || stage2PhaseIndex !== STAGE2_PHASES.length - 1) {
      setStage2FinalFlashActive(false);
      return undefined;
    }

    setStage2FinalFlashActive(true);
    const timer = window.setTimeout(() => {
      setStage2FinalFlashActive(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [stage, stage2PhaseIndex]);

  useEffect(() => {
    if (stage !== 4) {
      setStage4PhaseIndex(0);
      setStage4FinalFlashActive(false);
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
    setStage4PhaseIndex(0);
    setStage4FinalFlashActive(false);
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
    if (stage !== 5) {
      setStage5PhaseIndex(0);
      setStage5AnimationComplete(false);
      return;
    }

    setStage5PhaseIndex(0);
    setStage5AnimationComplete(false);
  }, [stage]);

  useEffect(() => {
    if (stage !== 7) {
      setStage7PhaseIndex(0);
      setStage7FinalFlashActive(false);
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
    setStage7PhaseIndex(0);
    setStage7FinalFlashActive(false);
  }, [stage]);

  useEffect(() => {
    if (stage !== 9) {
      setStage9QosPhaseIndex(0);
      return undefined;
    }

    setStage9QosPhaseIndex(0);
    return undefined;
  }, [stage]);

  useEffect(() => {
    if (stage !== 9 || stage9QosPhaseIndex >= STAGE9_QOS_PHASES.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStage9QosPhaseIndex((index) => Math.min(index + 1, STAGE9_QOS_PHASES.length - 1));
    }, STAGE9_QOS_PHASE_TIMING[stage9QosPhaseIndex] || 3000);

    return () => window.clearTimeout(timer);
  }, [stage, stage9QosPhaseIndex]);

  useEffect(() => {
    if (stage !== 10) {
      setStage10HandoffFlashActive(false);
      return undefined;
    }

    setStage10HandoffFlashActive(true);
    const timer = window.setTimeout(() => {
      setStage10HandoffFlashActive(false);
    }, STAGE10_HANDOFF_FLASH_MS);

    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 4 || stage4PhaseIndex >= STAGE4_PHASES.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStage4PhaseIndex((index) => Math.min(index + 1, STAGE4_PHASES.length - 1));
    }, STAGE4_PHASE_TIMING[stage4PhaseIndex] || 1300);

    return () => window.clearTimeout(timer);
  }, [stage, stage4PhaseIndex]);

  useEffect(() => {
    if (stage !== 4 || stage4PhaseIndex !== STAGE4_PHASES.length - 1) {
      setStage4FinalFlashActive(false);
      return undefined;
    }

    setStage4FinalFlashActive(true);
    const timer = window.setTimeout(() => {
      setStage4FinalFlashActive(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [stage, stage4PhaseIndex]);

  useEffect(() => {
    if (stage !== 5 || !stage5VideoReady || stage5PhaseIndex >= STAGE5_PHASES.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStage5PhaseIndex((index) => Math.min(index + 1, STAGE5_PHASES.length - 1));
    }, STAGE5_PHASE_TIMING[stage5PhaseIndex] || 1300);

    return () => window.clearTimeout(timer);
  }, [stage, stage5PhaseIndex, stage5VideoReady]);

  useEffect(() => {
    if (stage !== 5 || stage5PhaseIndex !== STAGE5_PHASES.length - 1) {
      setStage5AnimationComplete(false);
      return undefined;
    }

    setStage5AnimationComplete(false);
    const timer = window.setTimeout(() => {
      setStage5AnimationComplete(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [stage, stage5PhaseIndex]);

  useEffect(() => {
    if (stage !== 7 || stage7PhaseIndex >= STAGE7_PHASES.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStage7PhaseIndex((index) => Math.min(index + 1, STAGE7_PHASES.length - 1));
    }, STAGE7_PHASE_TIMING[stage7PhaseIndex] || 1300);

    return () => window.clearTimeout(timer);
  }, [stage, stage7PhaseIndex]);

  useEffect(() => {
    if (stage !== 7 || stage7PhaseIndex !== STAGE7_PHASES.length - 1) {
      setStage7FinalFlashActive(false);
      return undefined;
    }

    setStage7FinalFlashActive(true);
    const timer = window.setTimeout(() => {
      setStage7FinalFlashActive(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [stage, stage7PhaseIndex]);

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

  const buildCumulativeIntentSummary = () => {
    if (stage === 1) {
      return [];
    }

    const summary = stage === 2
      ? buildStageIntentSummary(STAGE2_INTENT_SUMMARY, STAGE2_PHASES, stage2PhaseIndex)
      : buildCompletedStageIntentSummary(STAGE2_INTENT_SUMMARY, STAGE2_PHASES);

    if (stage >= 4) {
      summary.push(...(stage === 4
        ? buildStageIntentSummary(STAGE4_INTENT_SUMMARY, STAGE4_PHASES, stage4PhaseIndex)
        : buildCompletedStageIntentSummary(STAGE4_INTENT_SUMMARY, STAGE4_PHASES)
      ));
    }

    if (stage >= 5) {
      summary.push(...(stage === 5
        ? buildStageIntentSummary(STAGE5_INTENT_SUMMARY, STAGE5_PHASES, stage5PhaseIndex)
        : buildCompletedStageIntentSummary(STAGE5_INTENT_SUMMARY, STAGE5_PHASES)
      ));
    }

    if (stage >= 7) {
      summary.push(...(stage === 7
        ? buildStageIntentSummary(STAGE7_INTENT_SUMMARY, STAGE7_PHASES, stage7PhaseIndex)
        : buildCompletedStageIntentSummary(STAGE7_INTENT_SUMMARY, STAGE7_PHASES)
      ));
    }

    return summary;
  };

  const effectiveStageConfig = (() => {
    if (stage === 2) {
      const phase = STAGE2_PHASES[stage2PhaseIndex] || STAGE2_PHASES[0];
      const allDone = stage2PhaseIndex >= STAGE2_PHASES.length - 1;
      const hideFinalFlash = phase.key === "stage2_6" && !stage2FinalFlashActive;
      const summary = buildCumulativeIntentSummary();

      const logs = [
        ...stageConfig.logs,
        ...(allDone ? STAGE2_COMPLETION_LOGS : []),
      ];
      const credentialIssued = stage2PhaseIndex >= 7;

      return {
        ...stageConfig,
        activeFlowType: null,
        topologyLines: phase.topologyLines || [],
        stagePhaseKey: phase.key,
        highlightedNodes: hideFinalFlash ? [] : phase.highlightedNodes || [],
        activeConnections: hideFinalFlash ? [] : phase.activeConnections || [],
        systemAgentBubble: hideFinalFlash ? null : phase.systemAgentBubble || null,
        agentBubbles: phase.agentBubbles || [],
        showArSpeech: false,
        hideArSpeech: true,
        stageAnimationDone: allDone && !stage2FinalFlashActive,
        hideRobotDogSpeech: Boolean(phase.systemAgentBubble),
        intentSummary: summary,
        showRegisteredDevice: allDone,
        statusRows: [
          {
            label: "凭证:",
            value: credentialIssued ? "已颁发" : "未颁发",
            status: credentialIssued ? "success" : "pending",
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
            value: credentialIssued ? "已颁发" : "未颁发",
            status: credentialIssued ? "success" : "pending",
          },
          robotDogId: {
            value: allDone ? "DID:2168nLB3G@CMCC.org" : "None",
            status: allDone ? "success" : "pending",
          },
        },
        logs,
        workflow: [],
        steps: stageConfig.steps.map((step) => (
          step.id === "01"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: null,
      };
    }

    if (stage === 4) {
      const phase = STAGE4_PHASES[stage4PhaseIndex] || STAGE4_PHASES[0];
      const allDone = stage4PhaseIndex >= STAGE4_PHASES.length - 1;
      const hideFinalFlash = phase.key === "stage4_6" && !stage4FinalFlashActive;
      const l1GuaranteeDone = phase.key === "stage4_6_done" || phase.key === "stage4_6";
      const homeDomainDevicesReady = stage4PhaseIndex >= STAGE4_PHASES.findIndex((stage4Phase) => stage4Phase.key === "stage4_5_done");
      const showArSpeech = phase.key === "stage4_source" && !hideFinalFlash;

      return {
        ...stageConfig,
        activeFlowType: null,
        topologyLines: phase.topologyLines || [],
        stagePhaseKey: phase.key,
        highlightedNodes: hideFinalFlash ? [] : phase.highlightedNodes || [],
        activeConnections: hideFinalFlash ? [] : phase.activeConnections || [],
        systemAgentBubble: hideFinalFlash ? null : phase.systemAgentBubble || null,
        agentBubbles: phase.agentBubbles || [],
        showArSpeech,
        hideArSpeech: !showArSpeech,
        stageAnimationDone: allDone && !stage4FinalFlashActive,
        intentSummary: buildCumulativeIntentSummary(),
        statusTitle: l1GuaranteeDone ? "端侧状态：L1级通信保障" : "端侧状态",
        statusRows: l1GuaranteeDone
          ? [
              { label: "端侧带宽:", value: "1Mbps", status: "success" },
              { label: "平均时延:", value: "25ms", status: "success" },
              { label: "保障效果:", value: "连接无中断", status: "success" },
            ]
          : [
              { label: "端侧带宽:", value: "1Mbps", status: "working" },
              { label: "平均时延:", value: "70ms", status: "working" },
            ],
        homeDomainDevicesReady,
        showRegisteredDevice: homeDomainDevicesReady,
        workflow: [],
        steps: stageConfig.steps.map((step) => (
          step.id === "02"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: null,
      };
    }

    if (stage === 5) {
      const phase = STAGE5_PHASES[stage5PhaseIndex] || STAGE5_PHASES[0];
      const allDone = stage5PhaseIndex >= STAGE5_PHASES.length - 1;
      const hideFinalFlash = phase.key === "stage5_6" && stage5AnimationComplete;
      const l2GuaranteeDone = Boolean(phase.qoeComplete);
      const stage5Prewarming = !stage5VideoReady;
      const showArSpeech = !stage5Prewarming && phase.key === "stage5_source" && !hideFinalFlash;

      return {
        ...stageConfig,
        leftPanelTitle: stage5Prewarming ? STAGE_CONFIG[4].leftPanelTitle : stageConfig.leftPanelTitle,
        showDogVision: stage5Prewarming ? false : stageConfig.showDogVision,
        showEnhancedDogVision: stage5Prewarming ? false : stageConfig.showEnhancedDogVision,
        showHomeDomainDevice: stage5Prewarming ? true : stageConfig.showHomeDomainDevice,
        showRegisteredDevice: stage5Prewarming ? true : stageConfig.showRegisteredDevice,
        hideDeviceArrow: stage5Prewarming ? true : stageConfig.hideDeviceArrow,
        homeDomainDevicesReady: stage5Prewarming ? true : stageConfig.homeDomainDevicesReady,
        activeFlowType: null,
        topologyLines: stage5Prewarming ? [] : phase.topologyLines || [],
        stagePhaseKey: stage5Prewarming ? "stage5_preheating" : phase.key,
        highlightedNodes: stage5Prewarming || hideFinalFlash ? [] : phase.highlightedNodes || [],
        activeConnections: stage5Prewarming || hideFinalFlash ? [] : phase.activeConnections || [],
        systemAgentBubble: stage5Prewarming || hideFinalFlash
          ? null
          : phase.systemAgentBubble || null,
        agentBubbles: stage5Prewarming ? [] : phase.agentBubbles || [],
        showArSpeech,
        hideArSpeech: !showArSpeech,
        stageAnimationDone: allDone && stage5AnimationComplete,
        stage5Prewarming,
        stage5QoeComplete: Boolean(phase.qoeComplete),
        stage5SandboxComplete: Boolean(phase.sandboxComplete),
        intentSummary: buildCumulativeIntentSummary(),
        statusTitle: l2GuaranteeDone ? "端侧状态：L2级通信保障" : "端侧状态：L1级通信保障",
        statusRows: l2GuaranteeDone
          ? [
              { label: "端侧带宽:", value: "5Mbps", status: "success" },
              { label: "平均时延:", value: "20ms", status: "success" },
              { label: "保障效果:", value: "视频传输流畅", status: "success" },
            ]
          : [
              { label: "端侧带宽:", value: "1Mbps", status: "success" },
              { label: "平均时延:", value: "25ms", status: "success" },
              { label: "保障效果:", value: "连接无中断", status: "success" },
            ],
        workflow: [],
        steps: stageConfig.steps.map((step) => (
          step.id === "02"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: null,
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
        intentSummary: buildCumulativeIntentSummary(),
        showArSpeech: false,
        hideArSpeech: true,
        stageAnimationDone: allDone,
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
      const phase = STAGE7_PHASES[stage7PhaseIndex] || STAGE7_PHASES[0];
      const allDone = stage7PhaseIndex >= STAGE7_PHASES.length - 1;
      const hideFinalFlash = phase.key === "stage7_5" && !stage7FinalFlashActive;
      const l3GuaranteeDone = phase.key === "stage7_5_policy_done" || phase.key === "stage7_5";
      const showArSpeech = phase.key === "stage7_source_ar" && !hideFinalFlash && !phase.systemAgentBubble;

      return {
        ...stageConfig,
        activeFlowType: null,
        topologyLines: phase.topologyLines || [],
        stagePhaseKey: phase.key,
        highlightedNodes: hideFinalFlash ? [] : phase.highlightedNodes || [],
        activeConnections: hideFinalFlash ? [] : phase.activeConnections || [],
        systemAgentBubble: hideFinalFlash ? null : phase.systemAgentBubble || null,
        agentBubbles: phase.agentBubbles || [],
        hideRobotDogSpeech: Boolean(phase.systemAgentBubble),
        showArSpeech,
        hideArSpeech: !showArSpeech,
        stageAnimationDone: allDone && !stage7FinalFlashActive,
        intentSummary: buildCumulativeIntentSummary(),
        statusTitle: l3GuaranteeDone ? "端侧状态：L3级通信保障" : "端侧状态：L2级通信保障",
        statusRows: l3GuaranteeDone
          ? [
              { label: "端侧带宽:", value: "5Mbps", status: "success" },
              { label: "平均时延:", value: "70ms", status: "success" },
              { label: "保障效果:", value: "AI推理链路稳定，结果回传抖动低于5ms", status: "success", stacked: true, valueClassName: "break-words" },
            ]
          : [
              { label: "端侧带宽:", value: "5Mbps", status: "success" },
              { label: "平均时延:", value: "20ms", status: "success" },
              { label: "保障效果:", value: "视频传输流畅", status: "success" },
            ],
        workflow: [],
        steps: stageConfig.steps.map((step) => (
          step.id === "04"
            ? {
                ...step,
                subtitle: allDone ? "已完成 / Completed" : "进行中 / Working",
                status: allDone ? "success" : "working",
              }
            : step
        )),
        agentBubble: null,
      };
    }

    if (isQosExperienceStage(stage)) {
      const isFrozenFinalStage = stage === 21 || stage === 22 || stage === 23 || stage === 24;
      const hideStage23Overlays = stage === 23;
      const phaseIndex = isFrozenFinalStage
        ? STAGE9_QOS_PHASES.length - 1
        : stage9QosPhaseIndex;
      const phase = STAGE9_QOS_PHASES[phaseIndex] || STAGE9_QOS_PHASES[0];
      const allDone = isFrozenFinalStage || phaseIndex >= STAGE9_QOS_PHASES.length - 1;
      const planningTaskComplete = phase.key === "stage9_qos_clear";

      return {
        ...stageConfig,
        activeFlowType: null,
        topologyLines: phase.topologyLines || [],
        stagePhaseKey: phase.key,
        highlightedNodes: phase.highlightedNodes || [],
        activeConnections: phase.activeConnections || [],
        systemAgentBubble: hideStage23Overlays || planningTaskComplete ? null : phase.systemAgentBubble || null,
        agentBubbles: hideStage23Overlays ? [] : phase.agentBubbles || [],
        showArSpeech: false,
        hideArSpeech: true,
        hideRobotDogSpeech: true,
        stageAnimationDone: allDone,
        intentSummary: buildCumulativeIntentSummary(),
        workflow: [],
        agentBubble: null,
      };
    }

    if (stage !== 4) {
      return {
        ...stageConfig,
        intentSummary: buildCumulativeIntentSummary(),
        showArSpeech: stage === 8 || (stage === 10 && stage10HandoffFlashActive),
        hideArSpeech: stage === 8 ? false : stage === 10 ? !stage10HandoffFlashActive : true,
        stageAnimationDone: stage === 8 || (stage === 10 && !stage10HandoffFlashActive),
      };
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
    const toolBubble = activeWorkflow ? STAGE4_TOOL_BUBBLES[activeWorkflow.label] : null;

    return {
      ...stageConfig,
      homeDomainDevicesReady: allDone,
      showRegisteredDevice: allDone,
      workflow,
      steps,
      agentBubble: activeWorkflow
        ? {
            ...(toolBubble || { text: normalizeWorkflowLabel(activeWorkflow.label) }),
            status: stage4Progress.bubbleStatus,
          }
        : null,
    };
  })();

  return effectiveStageConfig;
};
