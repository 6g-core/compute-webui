import { Cloud, Cpu, Globe, Share2, ShieldCheck } from 'lucide-react';

const STAGE4_WORKFLOW = [
  { label: "签约数据更新:", value: "Pending", status: "pending" },
  { label: "下发域接入凭证:", value: "Pending", status: "pending" },
  { label: "下发UPF配置:", value: "Pending", status: "pending" },
];

const STAGE4_TOOL_BUBBLES = {
  "签约数据更新:": {
    lines: ["调用UDM", "更新签约数据"],
    targetNode: "ACN",
    placement: "right",
    activeTools: ["6G UDM"],
  },
  "下发域接入凭证:": {
    lines: ["调用IDM", "下发域接入凭证"],
    targetNode: "ACN",
    placement: "right",
    activeTools: ["IDM"],
  },
  "下发UPF配置:": {
    lines: ["调用SMF", "下发物理组网配置"],
    targetNode: "ConnectionAgent",
    placement: "right",
    activeTools: ["6G SM"],
  },
};

const STAGE6_WORKFLOW = [
  {
    label: "ID寻址路由:",
    flowType: "a2aGateway",
    bubble: {
      lines: ["ID寻址路由"],
      targetNode: "AgentGW",
      placement: "above",
      offsetY: -3,
      activeTools: ["A2A GW Tool"],
    },
  },
  {
    label: "身份可信认证:",
    flowType: "a2aTrust",
    bubble: {
      lines: ["身份可信认证"],
      targetNode: "ACN",
      placement: "right",
      activeTools: ["IDM"],
    },
  },
  {
    label: "Agent协议转换:",
    flowType: "a2aGateway",
    bubble: {
      lines: ["Agent协议转换"],
      targetNode: "AgentGW",
      placement: "above",
      offsetY: -3,
      activeTools: ["A2A GW Tool"],
    },
  },
];

const STAGE7_WORKFLOW = [
  {
    label: "创建算力会话:",
    flowType: "computeSandbox",
    bubble: {
      lines: ["调用CMF", "创建算力会话"],
      targetNode: "Computing",
      placement: "right",
      activeTools: ["CMF"],
    },
  },
  {
    label: "分配算力资源:",
    flowType: "computeSandbox",
    bubble: {
      lines: ["调用CMF", "分配算力资源"],
      targetNode: "Computing",
      placement: "right",
      activeTools: ["CMF"],
    },
  },
];

const STAGE9_WORKFLOW = [
  { label: "数字身份申请:", value: "IDM颁发数字身份；能力注册；接入网络", status: "success", stacked: true },
  { label: "生成式网络:", value: "创建家庭域；更新签约数据；下发域接入凭证；下发物理组网配置", status: "success", stacked: true },
  { label: "机器狗实时视野:", value: "机器狗抵达商店并回传实时视野", status: "success", stacked: true },
  { label: "跨域智能体认证交互:", value: "获取超市智能体数字身份；AR眼镜、机器狗与超市智能体双向认证", status: "success", stacked: true },
  { label: "分配算力资源:", value: "创建算力会话；分配算力资源", status: "success", stacked: true },
  { label: "算力卸载:", value: "机器狗感知输入；网络算力节点识别标注；结果回传AR眼镜", status: "success", stacked: true },
  { label: "物品交接:", value: "机器狗与超市智能体交接物品；算力卸载已完成", status: "success", stacked: true },
];

const STAGE9_COMPLETED_TASKS = [
  {
    title: "数字身份申请",
    tasks: ["IDM颁发数字身份", "能力注册", "接入网络"],
  },
  {
    title: "生成式网络",
    tasks: ["创建家庭域", "更新签约数据", "下发域接入凭证", "下发物理组网配置"],
  },
  {
    title: "跨域智能体认证交互",
    tasks: ["获取超市智能体数字身份", "AR眼镜与超市智能体双向认证", "机器狗与超市智能体双向认证"],
  },
  {
    title: "分配算力资源",
    tasks: ["创建算力会话", "分配算力资源"],
  },
  {
    title: "算力卸载",
    tasks: ["机器狗感知设备输入", "网络算力节点识别标注", "标注结果回传AR眼镜"],
  },
];

const STAGE2_WORKFLOW = [
  {
    label: "IDM颁发数字身份:",
    bubble: {
      lines: ["调用IDM：", "颁发数字身份"],
      targetNode: "ACN",
      placement: "right",
      activeTools: ["IDM"],
    },
  },
  {
    label: "能力注册:",
    bubble: {
      lines: ["调用ARF", "发布能力卡片"],
      targetNode: "ACN",
      placement: "right",
      activeTools: ["ARF"],
    },
  },
  {
    label: "接入网络:",
    bubble: {
      lines: ["机器狗接入网络"],
      targetNode: "ConnectionAgent",
      placement: "right",
      activeTools: ["6G AM", "6G SM", "6G Policy"],
    },
  },
];

const STAGE2_PHASE_TIMING = [1200, 2000, 2000, 350, 300, 300, 300, 350, 300, 300, 300, 600, 1600];

const STAGE2_INTENT_SUMMARY = [
  { id: "intent-received", label: "意图", lines: ["System Agent收到意图：Apply for the Digital ID"] },
  { id: "intent-decomposed", label: "拆解", lines: ["SystemAgent将意图拆解为两个子任务", "（1）签发数字身份", "（2）接入网络"] },
  {
    id: "agent-matched",
    label: "匹配",
    lines: [
      "SystemAgent为签发数字身份任务匹配处理Agent -> ACN Agent",
      "SystemAgent为接入网络任务匹配处理Agent -> Connection Agent",
    ],
  },
  { id: "acn-received", label: "任务", lines: ["ACN Agent收到任务：签发数字身份"] },
  { id: "acn-tools", label: "Skill", lines: ["ACN Agent调用IDM签发数字身份"] },
  { id: "acn-complete", label: "确认", lines: ["System Agent确认完成签发数字身份任务"] },
  { id: "connection-received", label: "任务", lines: ["Connection Agent收到任务：接入网络"] },
  { id: "connection-tools", label: "Skill", lines: ["Connection Agent调用6G AM注册"] },
  { id: "connection-complete", label: "确认", lines: ["System Agent确认完成接入网络任务"] },
  { id: "stage2-finished", label: "完成", lines: ["System Agent任务完成"] },
];

const buildStage2SystemPlanBubble = ({ acnStatus = "pending", connectionStatus = "pending" } = {}) => ({
  variant: "stage2SystemPlan",
  planSize: "boxed",
  placement: "cpPlanBox",
  scale: 1.3,
  style: { left: "33.5%", top: "9.5%" },
  transformOrigin: "0 0",
  title: "Apply for the Digital ID",
  tasks: [
    { label: "ACN Agent：\n签发数字身份", status: acnStatus },
    { label: "Connection Agent：\n接入网络", status: connectionStatus },
  ],
});

const STAGE2_PHASES = [
  {
    key: "stage2_source",
    topologyLines: [
      { key: "RobotDog->gNB", latencyMs: { min: 4, max: 8 } },
      { key: "gNB->SRF", latencyMs: { min: 7, max: 12 } },
      { key: "SRF->SystemAgent", latencyMs: { min: 3, max: 6 } },
    ],
    highlightedNodes: ["RobotDog"],
    intentSummaryCount: 0,
  },
  {
    key: "stage2_1",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: {
      lines: ["收到意图：", "Apply for the Digital ID"],
      focusScale: true,
      style: { left: "36.5%", top: "24%" },
    },
    intentSummaryCount: 1,
  },
  {
    key: "stage2_2",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: { ...buildStage2SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }), focusScale: true },
    intentSummaryCount: 2,
  },
  {
    key: "stage2_3",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    intentSummaryCount: 3,
  },
  {
    key: "stage2_4_dispatch",
    highlightedNodes: ["SystemAgent", "ACN"],
    activeConnections: ["SystemAgent->ACN"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [{ targetNode: "ACN", placement: "left", lines: ["收到任务：签发数字身份"] }],
    intentSummaryCount: 4,
  },
  {
    key: "stage2_4_idm",
    highlightedNodes: ["ACN"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [
      { targetNode: "ACN", placement: "left", lines: ["调用IDM", "颁发数字身份"] },
      { targetNode: "ACN", activeTools: ["IDM"], status: "working" },
    ],
    intentSummaryCount: 5,
  },
  {
    key: "stage2_4_arf",
    highlightedNodes: ["ACN"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [
      { targetNode: "ACN", placement: "left", lines: ["调用ARF", "发布能力卡片"] },
      { targetNode: "ACN", activeTools: ["ARF"], status: "working" },
    ],
    intentSummaryCount: 5,
    appendIntentSummary: { targetId: "acn-tools", line: "ACN Agent调用ARF发布能力卡片" },
  },
  {
    key: "stage2_4_done",
    highlightedNodes: ["SystemAgent", "ACN"],
    activeConnections: ["ACN->SystemAgent"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "success", connectionStatus: "pending" }),
    agentBubbles: [{ targetNode: "ACN", placement: "left", lines: ["完成签发数字身份任务"], status: "success" }],
    intentSummaryCount: 6,
  },
  {
    key: "stage2_5_dispatch",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["SystemAgent->ConnectionAgent"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "success", connectionStatus: "working" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["收到任务：接入网络"] }],
    intentSummaryCount: 7,
  },
  {
    key: "stage2_5_am",
    highlightedNodes: ["ConnectionAgent"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "success", connectionStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G AM", "注册"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G AM"], status: "working" },
    ],
    intentSummaryCount: 8,
  },
  {
    key: "stage2_5_sm",
    highlightedNodes: ["ConnectionAgent"],
    activeConnections: ["ConnectionAgent->UPF"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "success", connectionStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G SM", "创建会话"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G SM"], status: "working" },
    ],
    intentSummaryCount: 8,
    appendIntentSummary: { targetId: "connection-tools", line: "Connection Agent调用6G SM创建会话" },
  },
  {
    key: "stage2_5_done",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["ConnectionAgent->SystemAgent"],
    systemAgentBubble: buildStage2SystemPlanBubble({ acnStatus: "success", connectionStatus: "success" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["完成接入网络"], status: "success" }],
    intentSummaryCount: 9,
  },
  {
    key: "stage2_6",
    highlightedNodes: ["SystemAgent", "RobotDog"],
    activeConnections: [
      { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
      { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
      { key: "gNB->RobotDog", pathKey: "RobotDog->gNB", reverse: true },
    ],
    systemAgentBubble: {
      lines: ["Task Finished"],
      status: "success",
      style: { left: "36.5%", top: "28%", fontSize: "14px" },
    },
    intentSummaryCount: 10,
  },
];

const STAGE4_PHASE_TIMING = [1200, 2000, 2000, 300, 260, 260, 260, 260, 260, 260, 260, 260, 260, 400, 1600];

const STAGE4_INTENT_SUMMARY = [
  { id: "stage4-intent", label: "意图", lines: ["System Agent收到意图：Create Home Domain"] },
  { id: "stage4-decomposed", label: "拆解", lines: ["SystemAgent将意图拆解为三个子任务", "（1）创建家庭域凭证", "（2）下发物理组网配置", "（3）L1级通信保障"] },
  {
    id: "stage4-matched",
    label: "匹配",
    lines: [
      "SystemAgent为创建家庭域凭证任务匹配处理Agent -> ACN Agent",
      "SystemAgent为下发物理组网配置任务匹配处理Agent -> Connection Agent",
      "SystemAgent为L1级通信保障任务匹配处理Agent -> Connection Agent",
    ],
  },
  { id: "stage4-acn-received", label: "任务", lines: ["ACN Agent收到任务：创建家庭域凭证"] },
  { id: "stage4-acn-tools", label: "Skill", lines: ["ACN Agent调用6G UDM更新签约数据"] },
  { id: "stage4-acn-complete", label: "确认", lines: ["System Agent确认完成家庭域凭证任务"] },
  { id: "stage4-connection-received", label: "任务", lines: ["Connection Agent收到任务：下发物理组网配置"] },
  { id: "stage4-connection-tools", label: "Skill", lines: ["Connection Agent调用6G SM下发物理组网配置"] },
  { id: "stage4-connection-complete", label: "确认", lines: ["System Agent确认完成物理组网配置任务"] },
  { id: "stage4-policy-received", label: "任务", lines: ["Connection Agent收到任务：L1级通信保障"] },
  { id: "stage4-policy-tools", label: "Skill", lines: ["Connection Agent调用6G Policy下发保障策略"] },
  { id: "stage4-policy-complete", label: "确认", lines: ["System Agent确认完成L1级通信保障任务"] },
  { id: "stage4-finished", label: "完成", lines: ["System Agent任务完成"] },
];

const buildStage4SystemPlanBubble = ({ acnStatus = "pending", connectionStatus = "pending", policyStatus = "pending" } = {}) => ({
  variant: "stage2SystemPlan",
  planSize: "boxed",
  placement: "cpPlanBox",
  className: "stage-plan-en-compact",
  planTextBoost: true,
  scale: 1.16,
  style: { top: "7.5%" },
  transformOrigin: "0 0",
  title: "Create Home Domain",
  tasks: [
    { label: "ACN Agent：\n创建家庭域凭证", status: acnStatus },
    { label: "Connection Agent：\n下发物理组网配置", status: connectionStatus },
    { label: "Connection Agent：\nL1级通信保障", status: policyStatus },
  ],
});

const STAGE4_PHASES = [
  {
    key: "stage4_source",
    topologyLines: [
      { key: "UE->gNB", latencyMs: { min: 5, max: 9 } },
      { key: "gNB->SRF", latencyMs: { min: 7, max: 12 } },
      { key: "SRF->SystemAgent", latencyMs: { min: 3, max: 6 } },
    ],
    highlightedNodes: ["UE"],
    intentSummaryCount: 0,
  },
  {
    key: "stage4_1",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: {
      lines: ["收到意图：", "Create Home Domain"],
      focusScale: true,
      style: { left: "36.5%", top: "24%" },
    },
    intentSummaryCount: 1,
  },
  {
    key: "stage4_2",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: { ...buildStage4SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }), focusScale: true },
    intentSummaryCount: 2,
  },
  {
    key: "stage4_3",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    intentSummaryCount: 3,
  },
  {
    key: "stage4_4_dispatch",
    highlightedNodes: ["SystemAgent", "ACN"],
    activeConnections: ["SystemAgent->ACN"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [{ targetNode: "ACN", placement: "left", lines: ["收到任务：创建家庭域凭证"] }],
    intentSummaryCount: 4,
  },
  {
    key: "stage4_4_udm",
    highlightedNodes: ["ACN"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [
      { targetNode: "ACN", placement: "left", lines: ["调用6G UDM", "更新签约数据"] },
      { targetNode: "ACN", activeTools: ["6G UDM"], status: "working" },
    ],
    intentSummaryCount: 5,
  },
  {
    key: "stage4_4_idm",
    highlightedNodes: ["ACN"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "working", connectionStatus: "pending" }),
    agentBubbles: [
      { targetNode: "ACN", placement: "left", lines: ["调用IDM", "下发域接入凭证"] },
      { targetNode: "ACN", activeTools: ["IDM"], status: "working" },
    ],
    intentSummaryCount: 5,
    appendIntentSummary: { targetId: "stage4-acn-tools", line: "ACN Agent调用IDM下发域接入凭证" },
  },
  {
    key: "stage4_4_done",
    highlightedNodes: ["SystemAgent", "ACN"],
    activeConnections: [{ key: "ACN->SystemAgent", pathKey: "SystemAgent->ACN", reverse: true }],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "pending" }),
    agentBubbles: [{ targetNode: "ACN", placement: "left", lines: ["完成家庭域凭证任务"], status: "success" }],
    intentSummaryCount: 6,
  },
  {
    key: "stage4_5_dispatch",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["SystemAgent->ConnectionAgent"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "working" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["收到任务：下发物理组网配置"] }],
    intentSummaryCount: 7,
  },
  {
    key: "stage4_5_sm",
    highlightedNodes: ["ConnectionAgent"],
    activeConnections: ["ConnectionAgent->UPF"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G SM", "下发物理组网配置"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G SM"], status: "working" },
    ],
    intentSummaryCount: 8,
  },
  {
    key: "stage4_5_done",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: [{ key: "ConnectionAgent->SystemAgent", pathKey: "SystemAgent->ConnectionAgent", reverse: true }],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "success" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["完成物理组网配置"], status: "success" }],
    intentSummaryCount: 9,
  },
  {
    key: "stage4_6_dispatch",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["SystemAgent->ConnectionAgent"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "success", policyStatus: "working" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["收到任务：L1级通信保障"] }],
    intentSummaryCount: 10,
  },
  {
    key: "stage4_6_policy",
    highlightedNodes: ["ConnectionAgent"],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "success", policyStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G Policy", "下发保障策略"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G Policy"], status: "working" },
    ],
    intentSummaryCount: 11,
  },
  {
    key: "stage4_6_done",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: [{ key: "ConnectionAgent->SystemAgent", pathKey: "SystemAgent->ConnectionAgent", reverse: true }],
    systemAgentBubble: buildStage4SystemPlanBubble({ acnStatus: "success", connectionStatus: "success", policyStatus: "success" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["完成L1级通信保障"], status: "success" }],
    intentSummaryCount: 12,
  },
  {
    key: "stage4_6",
    highlightedNodes: ["SystemAgent", "UE"],
    activeConnections: [
      { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
      { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
      { key: "gNB->UE", pathKey: "UE->gNB", reverse: true },
    ],
    systemAgentBubble: {
      lines: ["Task Finished"],
      status: "success",
      style: { left: "36.5%", top: "28%", fontSize: "14px" },
    },
    intentSummaryCount: 13,
  },
];

const STAGE7_PHASE_TIMING = [1500, 1700, 1600, 2000, 2000, 350, 350, 350, 350, 350, 350, 350, 550, 1600];

const STAGE7_INTENT_SUMMARY = [
  { id: "stage7-intent", label: "意图", lines: ["System Agent收到意图：Compute offloading for object recognition"] },
  { id: "stage7-decomposed", label: "拆解", lines: ["SystemAgent将意图拆解为三个子任务", "（1）创建算力会话", "（2）分配算力资源", "（3）L3级通信保障"] },
  { id: "stage7-matched", label: "匹配", lines: ["SystemAgent为算力资源编排任务匹配处理Agent -> Computing Agent", "SystemAgent为L3级通信保障任务匹配处理Agent -> Connection Agent"] },
  { id: "stage7-computing-received", label: "任务", lines: ["Computing Agent收到任务：创建算力会话", "Computing Agent收到任务：分配算力资源"] },
  { id: "stage7-computing-tools", label: "Skill", lines: ["Computing Agent调用CMF创建算力会话"] },
  { id: "stage7-computing-complete", label: "确认", lines: ["System Agent确认完成创建算力会话任务", "System Agent确认完成分配算力资源任务"] },
  { id: "stage7-policy-received", label: "任务", lines: ["Connection Agent收到任务：L3级通信保障"] },
  { id: "stage7-policy-tools", label: "Skill", lines: ["Connection Agent调用6G Policy下发AI推理通信保障策略"] },
  { id: "stage7-policy-complete", label: "确认", lines: ["System Agent确认完成L3级通信保障任务"] },
  { id: "stage7-finished", label: "完成", lines: ["System Agent任务完成"] },
];

const buildStage7SystemPlanBubble = ({ computingStatus = "pending", policyStatus = "pending" } = {}) => ({
  variant: "stage2SystemPlan",
  planSize: "boxed",
  placement: "cpPlanBox",
  className: "stage-plan-en-compact",
  planTextBoost: true,
  scale: 1.16,
  transformOrigin: "0 0",
  title: "Compute offloading for object recognition",
  tasks: [
    { label: "Computing Agent：\n创建算力会话", status: computingStatus },
    { label: "Computing Agent：\n分配算力资源", status: computingStatus },
    { label: "Connection Agent：\nL3级通信保障", status: policyStatus },
  ],
});

const STAGE7_PHASES = [
  {
    key: "stage7_source_ar",
    topologyLines: [
      { key: "UE->gNB", latencyMs: { min: 5, max: 9 } },
      { key: "RobotDog->gNB", latencyMs: { min: 4, max: 8 } },
      { key: "gNB->UPF", latencyMs: { min: 8, max: 14 }, labelPosition: "below" },
    ],
    highlightedNodes: ["UE", "RobotDog"],
    agentBubbles: [],
    intentSummaryCount: 0,
  },
  {
    key: "stage7_source_robotdog",
    topologyLines: [
      { key: "UE->gNB", latencyMs: { min: 5, max: 9 } },
      { key: "RobotDog->gNB", latencyMs: { min: 4, max: 8 } },
      { key: "gNB->UPF", latencyMs: { min: 8, max: 14 }, labelPosition: "below" },
    ],
    highlightedNodes: ["UE", "RobotDog"],
    agentBubbles: [
      { targetNode: "RobotDog", placement: "above", offsetX: 8, lines: ["Compute offloading for object recognition"], variant: "voiceIntent", status: "success", className: "w-[12em]" },
    ],
    intentSummaryCount: 0,
  },
  {
    key: "stage7_source_intent",
    topologyLines: [
      { key: "RobotDog->gNB", latencyMs: { min: 4, max: 8 } },
      { key: "gNB->SRF", latencyMs: { min: 7, max: 13 } },
      { key: "SRF->SystemAgent", latencyMs: { min: 3, max: 6 } },
    ],
    highlightedNodes: ["RobotDog"],
    agentBubbles: [
      { targetNode: "RobotDog", placement: "above", offsetX: 8, lines: ["Compute offloading for object recognition"], variant: "voiceIntent", status: "success", className: "w-[12em]" },
    ],
    intentSummaryCount: 0,
  },
  {
    key: "stage7_1",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: {
      lines: ["收到意图：", "Compute offloading for object recognition"],
      focusScale: true,
      style: { left: "36.5%", top: "24%" },
    },
    intentSummaryCount: 1,
  },
  {
    key: "stage7_2",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: { ...buildStage7SystemPlanBubble({ computingStatus: "working" }), focusScale: true },
    intentSummaryCount: 2,
  },
  {
    key: "stage7_3",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "working" }),
    intentSummaryCount: 3,
  },
  {
    key: "stage7_4_dispatch",
    highlightedNodes: ["SystemAgent", "Computing"],
    activeConnections: ["SystemAgent->Computing"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "working" }),
    agentBubbles: [{ targetNode: "Computing", placement: "left", lines: ["收到任务：创建算力会话", "收到任务：分配算力资源"] }],
    intentSummaryCount: 4,
  },
  {
    key: "stage7_4_cmf_session",
    highlightedNodes: ["Computing"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "working" }),
    agentBubbles: [
      { targetNode: "Computing", placement: "left", lines: ["调用CMF", "创建算力会话"] },
      { targetNode: "Computing", activeTools: ["CMF"], status: "working" },
    ],
    intentSummaryCount: 5,
  },
  {
    key: "stage7_4_cmf_resource",
    highlightedNodes: ["Computing"],
    activeConnections: ["Computing->Gateway"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "working" }),
    agentBubbles: [
      { targetNode: "Computing", placement: "left", lines: ["调用CMF", "分配算力资源"] },
      { targetNode: "Computing", activeTools: ["CMF"], status: "working" },
    ],
    intentSummaryCount: 5,
    appendIntentSummary: { targetId: "stage7-computing-tools", line: "Computing Agent调用CMF分配算力资源" },
  },
  {
    key: "stage7_4_done",
    highlightedNodes: ["SystemAgent", "Computing"],
    activeConnections: [{ key: "Computing->SystemAgent", pathKey: "SystemAgent->Computing", reverse: true }],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "success" }),
    agentBubbles: [{ targetNode: "Computing", placement: "left", lines: ["完成任务：创建算力会话", "完成任务：分配算力资源"], status: "success" }],
    intentSummaryCount: 6,
  },
  {
    key: "stage7_5_policy_dispatch",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["SystemAgent->ConnectionAgent"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "success", policyStatus: "working" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["收到任务：L3级通信保障"] }],
    intentSummaryCount: 7,
  },
  {
    key: "stage7_5_policy",
    highlightedNodes: ["ConnectionAgent"],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "success", policyStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G Policy", "下发AI推理通信保障策略"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G Policy"], status: "working" },
    ],
    intentSummaryCount: 8,
  },
  {
    key: "stage7_5_policy_done",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: [{ key: "ConnectionAgent->SystemAgent", pathKey: "SystemAgent->ConnectionAgent", reverse: true }],
    systemAgentBubble: buildStage7SystemPlanBubble({ computingStatus: "success", policyStatus: "success" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["完成L3级通信保障"], status: "success" }],
    intentSummaryCount: 9,
  },
  {
    key: "stage7_5",
    highlightedNodes: ["SystemAgent", "RobotDog"],
    activeConnections: [
      { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
      { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
      { key: "gNB->RobotDog", pathKey: "RobotDog->gNB", reverse: true },
    ],
    systemAgentBubble: {
      lines: ["Task Finished"],
      status: "success",
      style: { left: "36.5%", top: "28%", fontSize: "14px" },
    },
    intentSummaryCount: 10,
  },
];

const AGENT_TOOL_SETS = {
  ACN: ["IDM", "ARF", "6G UDM"],
  ConnectionAgent: ["6G AM", "6G SM", "6G Policy"],
  Computing: ["CMF"],
};

const BASE_AGENT_LOGS = [
  ["10:31:00", "业务目标", "建立机器狗与AR眼镜之间的可信协作入口"],
  ["10:31:01", "系统决策", "识别当前演示处于接入准备阶段，等待数字身份和网络能力就绪"],
  ["10:31:02", "核心网能力", "数字身份、可信接入、智能体发现能力处于待编排状态"],
  ["10:31:03", "当前结果", "机器狗、AR眼镜、核心网智能体已进入协同准备态"],
];

const STAGE2_COMPLETION_LOGS = [
  ["10:31:10", "核心网能力", "机器狗数字身份完成签发，接入凭证进入可用状态"],
  ["10:31:11", "系统决策", "将机器狗能力注册为可发现服务，开放给后续网络编排使用"],
  ["10:31:12", "当前结果", "机器狗身份、能力卡片和接入路径已完成准备"],
  ["10:31:13", "业务目标", "数字身份申请阶段完成，可以进入家庭域网络创建"],
];

const STAGE6_LOGS = [
  ["10:31:16", "业务目标", "建立跨域智能体协作链路，让眼镜意图可被远端能力承接"],
  ["10:31:17", "系统决策", "通过Agent GW完成跨域寻址，并由ACN确认对端身份可信"],
  ["10:31:18", "核心网能力", "跨域认证、任务级会话和协议转换能力已生效"],
  ["10:31:19", "当前结果", "跨域A2A链路已建立，后续视觉任务可进入算力资源编排"],
];

const STAGE7_LOGS = [
  ["10:31:21", "业务目标", "将机器狗实时视野接入视觉识别任务，响应用户寻找目标物的意图"],
  ["10:31:22", "系统决策", "判断当前视频链路稳定，触发算力资源分配"],
  ["10:31:23", "核心网能力", "为视觉识别任务分配低时延算力资源和推理会话"],
  ["10:31:24", "当前结果", "识别任务进入运行态，视频流开始进入算力节点处理"],
];

const STAGE5_LOGS = [
  ["10:31:14", "业务目标", "把机器狗第一视角视频接入家庭域，形成可用实时视野"],
  ["10:31:15", "系统决策", "选择低时延视频路径，优先保障眼镜端观看体验"],
  ["10:31:16", "核心网能力", "家庭域连接、UPF路径和视频通道已完成联动"],
  ["10:31:17", "当前结果", "机器狗原始视野已稳定输出，等待后续增强识别任务"],
];

const STAGE5_PHASE_TIMING = [1200, 2000, 2000, 450, 500, 450, 1600];

const STAGE5_INTENT_SUMMARY = [
  { id: "stage5-intent", label: "意图", lines: ["System Agent收到意图：Share Video"] },
  { id: "stage5-decomposed", label: "拆解", lines: ["SystemAgent将意图拆解为一个子任务", "（1）L2级通信保障"] },
  { id: "stage5-matched", label: "匹配", lines: ["SystemAgent为L2级通信保障任务匹配处理Agent -> Connection Agent"] },
  { id: "stage5-connection-received", label: "任务", lines: ["Connection Agent收到任务：L2级通信保障"] },
  { id: "stage5-pcf-tools", label: "Skill", lines: ["Connection Agent调用6G Policy下发保障策略"] },
  { id: "stage5-complete", label: "确认", lines: ["System Agent确认完成L2级通信保障任务"] },
  { id: "stage5-finished", label: "完成", lines: ["System Agent任务完成"] },
];

const buildStage5SystemPlanBubble = ({ connectionStatus = "pending" } = {}) => ({
  variant: "stage2SystemPlan",
  planSize: "boxed",
  placement: "cpPlanBox",
  scale: 1.3,
  style: { left: "33.5%", top: "15%" },
  transformOrigin: "0 0",
  title: "Share Video",
  tasks: [
    { label: "Connection Agent：\nL2级通信保障", status: connectionStatus },
  ],
});

const STAGE5_PHASES = [
  {
    key: "stage5_source",
    topologyLines: [
      { key: "UE->gNB", latencyMs: { min: 4, max: 7 } },
      { key: "gNB->SRF", latencyMs: { min: 7, max: 12 } },
      { key: "SRF->SystemAgent", latencyMs: { min: 3, max: 6 } },
    ],
    highlightedNodes: ["UE"],
    intentSummaryCount: 0,
  },
  {
    key: "stage5_1",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: {
      lines: ["收到意图：", "Share Video"],
      focusScale: true,
      style: { left: "36.5%", top: "24%" },
    },
    intentSummaryCount: 1,
  },
  {
    key: "stage5_2",
    highlightedNodes: ["SystemAgent"],
    systemAgentBubble: { ...buildStage5SystemPlanBubble({ connectionStatus: "working" }), focusScale: true },
    intentSummaryCount: 2,
  },
  {
    key: "stage5_dispatch",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: ["SystemAgent->ConnectionAgent"],
    systemAgentBubble: buildStage5SystemPlanBubble({ connectionStatus: "working" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["收到任务：L2级通信保障"] }],
    intentSummaryCount: 4,
  },
  {
    key: "stage5_pcf",
    highlightedNodes: ["ConnectionAgent"],
    systemAgentBubble: buildStage5SystemPlanBubble({ connectionStatus: "working" }),
    agentBubbles: [
      { targetNode: "ConnectionAgent", placement: "left", lines: ["调用6G Policy", "下发保障策略"] },
      { targetNode: "ConnectionAgent", activeTools: ["6G Policy"], status: "working" },
    ],
    intentSummaryCount: 5,
  },
  {
    key: "stage5_done",
    highlightedNodes: ["SystemAgent", "ConnectionAgent"],
    activeConnections: [{ key: "ConnectionAgent->SystemAgent", pathKey: "SystemAgent->ConnectionAgent", reverse: true }],
    systemAgentBubble: buildStage5SystemPlanBubble({ connectionStatus: "success" }),
    agentBubbles: [{ targetNode: "ConnectionAgent", placement: "left", lines: ["完成L2级通信保障"], status: "success" }],
    intentSummaryCount: 6,
  },
  {
    key: "stage5_6",
    highlightedNodes: ["SystemAgent", "UE"],
    activeConnections: [
      { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
      { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
      { key: "gNB->UE", pathKey: "UE->gNB", reverse: true },
    ],
    systemAgentBubble: {
      lines: ["Task Finished"],
      status: "success",
      style: { left: "36.5%", top: "28%", fontSize: "14px" },
    },
    intentSummaryCount: 7,
  },
];

const STAGE_ANIMATION_TIMING = {
  2: { workingMs: 560, successMs: 180 },
  4: { workingMs: 500, successMs: 150 },
  6: { workingMs: 800, successMs: 180 },
  7: { workingMs: 1280, successMs: 180 },
};

const SYSTEM_AGENT_BUBBLE_ANCHOR = {
  targetNode: "SystemAgent",
  placement: "cpSystemBubble",
  offsetX: -3,
  offsetY: 4,
};

const normalizeWorkflowLabel = (label = "") => label.replace(/:$/, "");

const formatSystemAgentBubbleLabel = (label = "") => (
  normalizeWorkflowLabel(label).replace(/(Agent[:：])/, "$1\n")
);

const getCombinedWorkflowStatus = (items = []) => {
  if (items.some((item) => item?.status === "working")) {
    return "working";
  }

  if (items.length && items.every((item) => item?.status === "success")) {
    return "success";
  }

  return items.some((item) => item?.status === "success") ? "working" : "pending";
};

const STAGE_STORY_LINES = {
  1: "机器狗开箱，申请数字身份。",
  2: "机器狗上传基础信息，获得网络签发数字身份，完成接入。",
  4: "AR眼镜指示机器狗前往商店，网络为其创建家庭域。",
  5: "机器狗抵达商店门口，回传实时视野。",
  6: "机器狗、AR眼镜与商店智能体完成双向认证。",
  7: "机器狗寻找目标物品，算力不足无法识别，申请算力卸载到网络。",
  8: "网络算力节点识别商品并回传标注结果。",
  9: "机器狗与超市智能体完成商品交接。",
};

const STAGE_CONFIG = {
  1: {
    leftPanelTitle: "AR眼镜已接入",
    activeFlowType: null,
    showArRegistration: true,
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
      { label: "IDM颁发数字身份:", value: "Pending", status: "pending" },
      { label: "能力注册:", value: "Pending", status: "pending" },
      { label: "接入网络:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "数字身份申请", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "02", icon: Globe, title: "生成式网络", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "03", icon: Share2, title: "跨域智能体认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "分配算力资源", subtitle: "即将开始 / Upcoming", status: "pending" },
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
      ["10:31:06", "业务目标", "为机器狗申请可验证数字身份，建立后续网络接入前提"],
      ["10:31:07", "系统决策", "将用户意图拆分为身份签发、能力注册和网络接入准备"],
      ["10:31:08", "核心网能力", "启用统一数字身份管理和可信接入控制能力"],
      ["10:31:09", "当前结果", "数字身份申请正在处理，机器狗能力等待发布"],
    ],
    workflow: [
      { label: "IDM颁发数字身份:", value: "Pending", status: "pending" },
      { label: "能力注册:", value: "Pending", status: "pending" },
      { label: "接入网络:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "数字身份申请", subtitle: "进行中 / Working", status: "working" },
      { id: "02", icon: Globe, title: "生成式网络", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "03", icon: Share2, title: "跨域智能体认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "分配算力资源", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "05", icon: Cloud, title: "算力卸载", subtitle: "即将开始 / Upcoming", status: "pending" },
    ],
  },
  4: {
    leftPanelTitle: "家庭域创建",
    topologyTitle: "6G核心网：生成式网络",
    activeFlowType: "domain",
    showRegisteredDevice: true,
    hideDeviceArrow: true,
    showHomeDomainDevice: true,
    coreFunctions: [
      "L3按需组网",
      "安全接入控制",
      "域内连接最优选路",
      "用户体验保障",
    ],
    statusTitle: "端侧状态：L1级通信保障",
    statusRows: [
      { label: "端侧带宽:", value: "1Mbps", status: "success" },
      { label: "平均时延:", value: "25ms", status: "success" },
      { label: "保障效果:", value: "连接无中断", status: "success" },
    ],
    logs: [
      ...BASE_AGENT_LOGS,
      ["10:31:06", "业务目标", "创建家庭域连接，让AR眼镜能够低时延访问机器狗"],
      ["10:31:07", "系统决策", "将家庭域创建拆分为域管理、接入凭证和物理组网配置"],
      ["10:31:08", "核心网能力", "生成式网络开始为家庭域计算接入路径"],
      ["10:31:09", "当前结果", "家庭域网络正在创建，端侧连接参数开始生效"],
      ["10:31:10", "核心网能力", "签约数据和接入凭证已进入家庭域管理流程"],
      ["10:31:11", "系统决策", "优先选择低时延路径承载机器狗视频能力"],
      ["10:31:12", "当前结果", "机器狗能力已在家庭域内可发现"],
      ["10:31:13", "核心网能力", "UPF路径配置开始下发，视频流量进入专用转发路径"],
      ["10:31:14", "当前结果", "家庭域连接建立中，端侧带宽和时延进入目标范围"],
    ],
    workflow: [
      { label: "签约数据更新:", value: "Working", status: "working" },
      { label: "下发域接入凭证:", value: "Pending", status: "pending" },
      { label: "下发UPF配置:", value: "Pending", status: "pending" },
      { label: "下发保障策略:", value: "Pending", status: "pending" },
    ],
    steps: [
      { id: "01", icon: ShieldCheck, title: "数字身份申请", subtitle: "已完成 / Completed", status: "success" },
      { id: "02", icon: Globe, title: "生成式网络", subtitle: "进行中 / Working", status: "working" },
      { id: "03", icon: Share2, title: "跨域智能体认证交互", subtitle: "即将开始 / Upcoming", status: "pending" },
      { id: "04", icon: Cpu, title: "分配算力资源", subtitle: "即将开始 / Upcoming", status: "pending" },
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
  statusTitle: "端侧状态：L2级通信保障",
  statusRows: [
    { label: "端侧带宽:", value: "5Mbps", status: "success" },
    { label: "平均时延:", value: "20ms", status: "success" },
    { label: "保障效果:", value: "视频传输流畅", status: "success" },
  ],
  logs: [
    ...STAGE_CONFIG[4].logs,
    ...STAGE5_LOGS,
  ],
  workflow: [
    { label: "签约数据更新:", value: "Done", status: "success" },
    { label: "下发域接入凭证:", value: "Done", status: "success" },
    { label: "下发UPF配置:", value: "Done", status: "success" },
    { label: "下发保障策略:", value: "Done", status: "success" },
    { label: "L2级通信保障:", value: "Done", status: "success" },
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
  topologyTitle: "6G核心网：分配算力资源",
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
  statusTitle: "端侧状态：L3级通信保障",
  statusRows: [
    { label: "端侧带宽:", value: "5Mbps", status: "success" },
    { label: "平均时延:", value: "70ms", status: "success" },
    { label: "保障效果:", value: "AI推理链路稳定，结果回传抖动低于5ms", status: "success", stacked: true, valueClassName: "break-words" },
  ],
  workflow: [
    { label: "创建算力会话:", value: "Working", status: "working" },
    { label: "分配算力资源:", value: "Pending", status: "pending" },
    { label: "L3级通信保障:", value: "Pending", status: "pending" },
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
  topologyTitle: "6G核心网：算力卸载",
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

STAGE_CONFIG[9] = {
  ...STAGE_CONFIG[8],
  leftPanelTitle: "物品交接",
  topologyTitle: "6G核心网：算力卸载",
  activeFlowType: "handoff",
  showBackgroundVideo: false,
  showHandoff: true,
  showEnhancedDogVision: false,
  showDogVision: false,
  showHomeDomainDevice: false,
  showRegisteredDevice: false,
  showArRegistration: false,
  statusTitle: "已完成任务",
  statusRows: [
    {
      label: "数字身份申请:",
      value: "IDM颁发数字身份；能力注册；接入网络",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "生成式网络:",
      value: "创建家庭域；更新签约数据；下发域接入凭证；下发物理组网配置",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "机器狗实时视野:",
      value: "机器狗抵达商店并回传实时视野",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "跨域智能体认证交互:",
      value: "获取超市智能体数字身份；AR眼镜、机器狗与超市智能体双向认证",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "分配算力资源:",
      value: "创建算力会话；分配算力资源",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "算力卸载:",
      value: "机器狗感知输入；网络算力节点识别标注；结果回传AR眼镜",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
    {
      label: "物品交接:",
      value: "机器狗与超市智能体交接物品；算力卸载已完成",
      status: "success",
      stacked: true,
      valueClassName: "break-words",
    },
  ],
  userStatus: {
    credential: { value: "已完成", status: "success" },
    robotDogId: { value: "1saR84Q2Z@market.com", status: "success", isMono: true },
  },
  logs: [
    ...STAGE_CONFIG[8].logs,
    ["10:31:25", "业务目标", "机器狗与超市智能体完成商品取件交接动作"],
    ["10:31:26", "系统决策", "将识别结果与交接任务结果同步回系统门户"],
    ["10:31:27", "核心网能力", "RAN->UPF->Agent GW->Market Agent 任务链路完成调度"],
    ["10:31:28", "当前结果", "阶段9任务完成，整条作业闭环成功"],
  ],
  workflow: STAGE9_WORKFLOW,
  steps: STAGE_CONFIG[8].steps.map((step) => (
    { ...step, subtitle: "已完成 / Completed", status: "success" }
  )),
};

const getWorkflowBubbleFromRows = (workflow = [], stage) => {
  if (!workflow.length) {
    return null;
  }

  if (stage === 1) {
    return null;
  }

  if (stage === 2) {
    const acnRows = workflow.filter((item) => (
      item.label === "IDM颁发数字身份:" || item.label === "能力注册:"
    ));
    const connectionRow = workflow.find((item) => item.label === "接入网络:");
    const items = [
      acnRows.length
        ? {
            label: "ACN Agent:签发数字身份",
            status: getCombinedWorkflowStatus(acnRows),
          }
        : null,
      connectionRow
        ? {
            label: "Connection Agent:接入网络",
            status: connectionRow.status,
          }
        : null,
    ].filter(Boolean);

    return {
      items,
      status: getCombinedWorkflowStatus(items),
    };
  }

  if (stage === 4 || stage === 5) {
    const acnRows = workflow.filter((item) => (
      item.label === "签约数据更新:" || item.label === "下发域接入凭证:"
    ));
    const connectionRow = workflow.find((item) => item.label === "下发UPF配置:");
    const items = [
      acnRows.length
        ? {
            label: "ACN Agent:创建管理家庭域",
            status: getCombinedWorkflowStatus(acnRows),
          }
        : null,
      connectionRow
        ? {
            label: "Connection Agent：下发物理组网配置",
            status: connectionRow.status,
          }
        : null,
    ].filter(Boolean);

    return {
      items,
      status: getCombinedWorkflowStatus(items),
    };
  }

  if (stage === 6) {
    return null;
  }

  if (stage === 7) {
    const computingRows = workflow.filter((item) => (
      item.label === "创建算力会话:" || item.label === "分配算力资源:"
    ));
    const items = computingRows.length
      ? [
          {
            label: "Computing Agent:创建算力会话\n分配算力资源",
            status: getCombinedWorkflowStatus(computingRows),
          },
        ]
      : [];

    return {
      items,
      status: getCombinedWorkflowStatus(items),
    };
  }

  if (stage === 8) {
    return null;
  }

  return {
    items: workflow.map((item) => ({
      label: item.label,
      status: item.status,
    })),
    status: workflow.some((item) => item.status === "working") ? "working" : "success",
  };
};

const pinBubbleToSystemAgent = (bubble) => (
  bubble
    ? {
        ...bubble,
        items: bubble.items?.map((item) => ({
          ...item,
          isSystemAgentItem: true,
        })),
        ...SYSTEM_AGENT_BUBBLE_ANCHOR,
        placement: bubble.placement || SYSTEM_AGENT_BUBBLE_ANCHOR.placement,
        offsetX: typeof bubble.offsetX === "number" ? bubble.offsetX : SYSTEM_AGENT_BUBBLE_ANCHOR.offsetX,
        offsetY: typeof bubble.offsetY === "number" ? bubble.offsetY : SYSTEM_AGENT_BUBBLE_ANCHOR.offsetY,
        className: bubble.variant === "stage2SystemPlan"
          ? bubble.planSize === "boxed" ? "w-[162px]" : bubble.planSize === "wide" ? "w-[185px]" : "w-[155px]"
          : "w-[185px]",
      }
    : null
);


export {
  AGENT_TOOL_SETS,
  BASE_AGENT_LOGS,
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
  STAGE5_LOGS,
  STAGE6_LOGS,
  STAGE6_WORKFLOW,
  STAGE7_INTENT_SUMMARY,
  STAGE7_PHASE_TIMING,
  STAGE7_PHASES,
  STAGE7_LOGS,
  STAGE7_WORKFLOW,
  STAGE9_COMPLETED_TASKS,
  STAGE_ANIMATION_TIMING,
  STAGE_CONFIG,
  STAGE_STORY_LINES,
  formatSystemAgentBubbleLabel,
  getCombinedWorkflowStatus,
  getWorkflowBubbleFromRows,
  normalizeWorkflowLabel,
  pinBubbleToSystemAgent,
};
