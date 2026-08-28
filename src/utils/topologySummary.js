import { getStoryScenarioText } from "../config/storyScenario.js";

export const PHASE_TASK_SUMMARY = {
  stage2_source: "数字身份申请",
  stage2_1: "数字身份申请",
  stage2_2: "数字身份申请",
  stage2_3: "数字身份申请",
  stage2_4_dispatch: "IDM颁发数字身份",
  stage2_4_idm: "IDM颁发数字身份",
  stage2_4_arf: "ACF能力注册",
  stage2_5_dispatch: "接入网络",
  stage2_5_am: "接入网络",
  stage2_5_sm: "接入网络",

  stage4_source: "创建家庭域",
  stage4_1: "创建家庭域",
  stage4_2: "创建家庭域",
  stage4_3: "创建家庭域",
  stage4_4_dispatch: "创建家庭域",
  stage4_4_subscription: "更新签约数据",
  stage4_4_subnet_context: "创建或更新子网上下文",
  stage4_4_issue_token: "签发接入令牌",
  stage4_4_validate_token: "校验接入令牌",
  stage4_5_dispatch: "下发物理组网配置",
  stage4_5_sm: "下发物理组网配置",
  stage4_6_dispatch: "L1级通信保障",
  stage4_6_skill: "L1级通信保障",
  stage4_6_analytic: "L1级通信保障",
  stage4_6_decision: "L1级通信保障",

  stage5_source: "视频传输保障",
  stage5_1: "视频传输保障",
  stage5_2: "视频传输保障",
  stage5_ccf_dispatch: "拉起沙箱用于清晰视频",
  stage5_sandbox_skill: "拉起沙箱用于清晰视频",
  stage5_sandbox_images: "选择沙箱镜像",
  stage5_sandbox_site: "选择算力站点",
  stage5_sandbox_resources: "选择算力资源",
  stage5_sandbox_template: "生成沙箱模板",
  stage5_sandbox_validate: "校验沙箱模板",
  stage5_sandbox_service: "创建沙箱服务",
  stage5_sandbox_done: "拉起沙箱用于清晰视频",
  stage5_connection_dispatch: "视频传输保障",
  stage5_qoe_skill: "视频传输保障",
  stage5_qoe_analytic: "视频传输保障",
  stage5_qoe_decision: "视频传输保障",
  stage5_qoe_done: "视频传输保障",

  stage7_source_ar: "申请网内算力",
  stage7_source_robotdog: "申请网内算力",
  stage7_source_intent: "申请网内算力",
  stage7_1: "申请网内算力",
  stage7_2: "申请网内算力",
  stage7_3: "申请网内算力",
  stage7_4_dispatch: "创建算力会话",
  stage7_4_sandbox_skill: "创建算力会话",
  stage7_4_sandbox_images: "选择沙箱镜像",
  stage7_4_sandbox_site: "选择算力站点",
  stage7_4_sandbox_resources: "分配算力资源",
  stage7_4_sandbox_template: "生成沙箱模板",
  stage7_4_sandbox_validate: "校验沙箱模板",
  stage7_4_sandbox_service: "创建沙箱服务",
  stage7_4_done: "分配算力资源",
  stage7_5_policy_dispatch: "网络算力节点识别标注",
  stage7_5_qoe_skill: "网络算力节点识别标注",
  stage7_5_qoe_analytic: "网络算力节点识别标注",
  stage7_5_qoe_decision: "网络算力节点识别标注",
  stage7_5_policy_done: "标注结果回传AR眼镜",

  stage9_qos_uplink: "随路QoS保障用户体验",
  stage9_qos_downlink_compute: "随路QoS保障用户体验",
  stage9_qos_policy_decision: "随路QoS保障用户体验",
};

export const FLOW_TASK_SUMMARY = {
  a2aGateway: "获取超市智能体数字身份",
  a2aTrust: "机器狗和AR眼镜分别与超市智能体双向认证",
  dogVision: "网络算力节点识别标注",
  handoff: "机器狗与超市智能体交接物品",
};

export const WORKFLOW_TASK_SUMMARY = {
  "ID寻址路由:": "获取超市智能体数字身份",
  "身份可信认证:": "机器狗和AR眼镜分别与超市智能体双向认证",
  "Agent协议转换:": "机器狗和AR眼镜分别与超市智能体双向认证",
  "算力入网实际应用:": "网络算力节点识别标注",
  "物品交接:": "机器狗与超市智能体交接物品",
};

export const TASK_SUMMARY_CLASSNAME = "pointer-events-none absolute left-8 top-8 z-[25] max-w-[24%] rounded-md border border-cyan-200/45 bg-slate-950/92 text-[13px] font-black leading-snug tracking-wide text-cyan-50 shadow-[0_10px_24px_rgba(0,0,0,0.38)] backdrop-blur-md";
export const TASK_SUMMARY_BAR_CLASSNAME = "min-h-10 w-1.5 shrink-0 bg-cyan-300";
export const TASK_SUMMARY_TEXT_CLASSNAME = "min-w-0 whitespace-normal break-words px-4 py-3";

export const shouldShowTaskSummary = ({
  activeConnections = [],
  highlightedNodes = [],
  topologyLines = [],
  stage10BlinkActive = false,
} = {}) => Boolean(
  stage10BlinkActive
  || activeConnections.length
  || highlightedNodes.length
  || topologyLines.length
);

export const getTaskSummaryText = ({
  stage,
  stagePhaseKey,
  activeFlowType,
  workflow = [],
  stage10BlinkActive = false,
} = {}) => {
  if (stage === 10 && !stage10BlinkActive) {
    return "";
  }

  if (stagePhaseKey && PHASE_TASK_SUMMARY[stagePhaseKey]) {
    return getStoryScenarioText(PHASE_TASK_SUMMARY[stagePhaseKey]);
  }

  const activeWorkflow = workflow.find((item) => item.status === "working")
    || [...workflow].reverse().find((item) => item.status === "success");
  const workflowSummary = WORKFLOW_TASK_SUMMARY[activeWorkflow?.label]
    || Object.entries(WORKFLOW_TASK_SUMMARY).find(
      ([label]) => getStoryScenarioText(label) === activeWorkflow?.label,
    )?.[1];

  if (workflowSummary) {
    return getStoryScenarioText(workflowSummary);
  }

  return getStoryScenarioText(FLOW_TASK_SUMMARY[activeFlowType] || "");
};
