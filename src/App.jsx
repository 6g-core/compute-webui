import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioWaveform,
  ImagePlus,
  SendHorizontal,
  Settings,
  ShieldAlert,
  ShieldCheck,
  CircleDot,
  LoaderCircle,
  UserRound,
} from 'lucide-react';
import {
  STAGE10_COMPLETED_TASKS,
  STAGE_STORY_LINES,
  getWorkflowBubbleFromRows,
  pinBubbleToSystemAgent,
} from './config/stageConfig.jsx';
import { getRuntimeConfig } from './config/runtimeUrls.js';
import { getDogEnhancedOfferUrl, getDogVisionOfferUrl, getWebRtcOfferUrl, useBackendVideoStream, useDogVideoOfferGate } from './hooks/useBackendVideo';
import { useEffectiveStageConfig } from './hooks/useEffectiveStageConfig';
import { useArLastWhisper, useStagePolling } from './hooks/usePolling';
import { useQosFeed } from './hooks/useQosFeed';
import { isQosExperienceStage } from './utils/topologyStageVisibility.js';
import { CoreNetworkValuePanel, LeftPanel, StepBar } from './components/DemoPanels.jsx';
import { NetworkTopology3D } from './components/NetworkTopology3D.jsx';
import WebRtcBackground from './components/WebRtcBackground.jsx';

const LANGUAGE_STORAGE_KEY = "compute-webui-language";

const STAGE9_MOCK_DIALOG_ITEMS = [
  {
    id: "stage9-mock-grape-juice-question",
    dialog: "这是什么饮料",
    image: "/mock/grape-juice.png",
    imageHorizontalPlacement: "left",
    imageVerticalPlacement: "below",
  },
  {
    id: "stage9-mock-grape-juice-answer",
    dialog: "这是葡萄汁",
    image: "/mock/grape-juice-rotate.gif",
    imageHorizontalPlacement: "right",
    imageVerticalPlacement: "below",
  },
];

const UI_TRANSLATIONS = {
  "典型业务&价值": "Typical Scenarios & Value",
  "Token 体验保障": "Token Experience Assurance",
  "分布式算力网络": "Distributed Computing Network",
  "数字身份管理": "Digital Identity Management",
  "安全互信": "Secure Mutual Trust",
  "任务理解&技能路由": "Task Understanding & Skill Routing",
  "匹配度 99%": "99% Match Rate",
  "动态专网建立": "Dynamic Private Network Establishment",
  "协作安全": "Secure Collaboration",
  "任务级体验保障": "Task-level Experience Assurance",
  "端网协同调度": "Device-network Collaborative Scheduling",
  "E2E时延可控": "Controllable E2E Latency",
  "端网协同分布式推理": "Device-network Distributed Inference",
  "算力成本降低30%": "30% Lower Computing Cost",
  "连接+算力协同调度": "Connectivity + Computing Coordination",
  "任务成功率提升30%": "30% Higher Task Success Rate",
  "关键步骤展示": "Key Steps",
  "待完成": "Pending",
  "意图入口": "Intent Entry",
  "意图解析处理摘要": "Intent Parsing Summary",
  "用户意图：": "User Intent:",
  "网络任务规划：": "Network Task Plan:",
  "Planning Agent将意图拆解为三个子任务": "Planning Agent decomposes the intent into three subtasks",
  "Planning Agent将意图拆解为两个子任务": "Planning Agent decomposes the intent into two subtasks",
  "Planning Agent将意图拆解为一个子任务": "Planning Agent decomposes the intent into one subtask",
  "Planning Agent收到意图：Apply for the Digital ID": "Planning Agent receives intent: Apply for the Digital ID",
  "Planning Agent收到意图：Create Home Domain": "Planning Agent receives intent: Create Home Domain",
  "Planning Agent收到意图：Share Video": "Planning Agent receives intent: Share Video",
  "Planning Agent收到意图：Compute offloading for object recognition": "Planning Agent receives intent: Compute offloading for object recognition",
  "Planning Agent将身份签发任务交给IDM": "Planning Agent assigns identity issuance to IDM",
  "Planning Agent将能力注册任务交给ACF": "Planning Agent assigns capability registration to ACF",
  "Planning Agent将网络接入任务交给Connection Agent": "Planning Agent assigns network access to Connection Agent",
  "Planning Agent匹配IDM Agent": "Planning Agent matches IDM Agent",
  "Planning Agent匹配ACF Agent": "Planning Agent matches ACF Agent",
  "Planning Agent匹配Connection Agent": "Planning Agent matches Connection Agent",
  "Planning Agent将家庭域凭证任务交给ACF": "Planning Agent assigns home-domain credentials to ACF",
  "Planning Agent将物理组网配置任务交给Connection Agent": "Planning Agent assigns physical network configuration to Connection Agent",
  "Planning Agent将L1级通信保障任务交给Connection Agent": "Planning Agent assigns L1 communication assurance to Connection Agent",
  "Planning Agent将L2级通信保障任务交给Connection Agent": "Planning Agent assigns L2 communication assurance to Connection Agent",
  "Planning Agent将清晰视频沙箱任务交给CCF": "Planning Agent assigns the clear-video sandbox task to CCF",
  "Planning Agent将算力资源编排任务交给CCF": "Planning Agent assigns compute resource orchestration to CCF",
  "Planning Agent将L3级通信保障任务交给Connection Agent": "Planning Agent assigns L3 communication assurance to Connection Agent",
  "IDM收到任务：签发数字身份": "IDM receives task: issue digital identity",
  "IDM签发数字身份": "IDM issues digital identity",
  "IDM Agent：调用IDM Tool完成数字身份签发": "IDM Agent: calls IDM Tool to complete digital identity issuance",
  "ACF Agent：调用ARF Tool完成能力注册": "ACF Agent: calls ARF Tool to complete capability registration",
  "Connection Agent：调用AM Tool完成接入注册": "Connection Agent: calls AM Tool to complete access registration",
  "Connection Agent：调用SM Tool完成PDU会话创建": "Connection Agent: calls SM Tool to complete PDU session creation",
  "ACF收到任务：创建家庭域凭证": "ACF receives task: create home-domain credentials",
  "ACF融合ARF能力并发布能力卡片": "ACF integrates ARF capability and publishes a capability card",
  "ACF协调DCF调用UDM Tool控制签约数据更新": "ACF coordinates DCF to control subscription updates through UDM Tool",
  "DSF存储更新后的签约数据": "DSF stores the updated subscription data",
  "ACF协调IDM签发域接入凭证": "ACF coordinates IDM to issue domain access credentials",
  "CCF收到任务：创建算力会话": "CCF receives task: create compute session",
  "CCF收到任务：分配算力资源": "CCF receives task: allocate compute resources",
  "CCF创建算力会话": "CCF creates a compute session",
  "CCF分配算力资源": "CCF allocates compute resources",
  "CCF收到任务：拉起沙箱用于清晰视频": "CCF receives task: start a sandbox for clear video",
  "CCF使用Sandbox Services Skill": "CCF uses Sandbox Services Skill",
  "CCF调用Select_Sandbox_Images_tool": "CCF calls Select_Sandbox_Images_tool",
  "CCF调用Select_Computing_Site_tool": "CCF calls Select_Computing_Site_tool",
  "CCF调用Select_Computing_Resources_tool": "CCF calls Select_Computing_Resources_tool",
  "CCF调用Generate_Sandbox_Template_tool": "CCF calls Generate_Sandbox_Template_tool",
  "CCF调用Validate_Sandbox_Template_tool": "CCF calls Validate_Sandbox_Template_tool",
  "CCF调用Create_or_Update_Sandbox_Service_tool": "CCF calls Create_or_Update_Sandbox_Service_tool",
  "拉起沙箱用于清晰视频": "Start a sandbox for clear video",
  "融合ARF能力": "Integrate ARF capability",
  "控制签约数据更新": "Control subscription data update",
  "签发域接入凭证": "Issue domain access credentials",
  "ACF可信认证": "ACF trust authentication",
  "IDM身份校验": "IDM identity verification",
  "能力注册完成": "Capability registration complete",
  "Planning Agent确认身份签发和能力注册完成": "Planning Agent confirms identity issuance and capability registration",
  "Planning Agent确认完成接入网络任务": "Planning Agent confirms network access is complete",
  "Planning Agent确认完成家庭域凭证任务": "Planning Agent confirms home-domain credentials are complete",
  "Planning Agent确认完成物理组网配置任务": "Planning Agent confirms physical network configuration is complete",
  "Planning Agent确认完成L1级通信保障任务": "Planning Agent confirms L1 communication assurance is complete",
  "Planning Agent确认完成L2级通信保障任务": "Planning Agent confirms L2 communication assurance is complete",
  "Planning Agent确认完成L3级通信保障任务": "Planning Agent confirms L3 communication assurance is complete",
  "Planning Agent确认完成创建算力会话任务": "Planning Agent confirms compute session creation is complete",
  "Planning Agent确认完成分配算力资源任务": "Planning Agent confirms compute resource allocation is complete",
  "Planning Agent确认完成清晰视频沙箱任务": "Planning Agent confirms the clear-video sandbox task is complete",
  "Planning Agent任务完成": "Planning Agent task complete",
  "SystemAgent将意图拆解为三个子任务": "System Agent decomposes the intent into three subtasks",
  "SystemAgent将意图拆解为两个子任务": "System Agent decomposes the intent into two subtasks",
  "SystemAgent将意图拆解为一个子任务": "System Agent decomposes the intent into one subtask",
  "SystemAgent为签发数字身份任务匹配处理Agent -> ACN Agent": "System Agent assigns the digital identity issuance task to ACN Agent",
  "SystemAgent为接入网络任务匹配处理Agent -> Connection Agent": "System Agent assigns the network access task to Connection Agent",
  "SystemAgent为创建家庭域凭证任务匹配处理Agent -> ACN Agent": "System Agent assigns the home-domain credential task to ACN Agent",
  "SystemAgent为下发物理组网配置任务匹配处理Agent -> Connection Agent": "System Agent assigns the physical network configuration task to Connection Agent",
  "SystemAgent为L1级通信保障任务匹配处理Agent -> Connection Agent": "System Agent assigns the L1 communication assurance task to Connection Agent",
  "SystemAgent为L2级通信保障任务匹配处理Agent -> Connection Agent": "System Agent assigns the L2 communication assurance task to Connection Agent",
  "SystemAgent为算力资源编排任务匹配处理Agent -> Computing Agent": "System Agent assigns compute resource orchestration to Computing Agent",
  "SystemAgent为L3级通信保障任务匹配处理Agent -> Connection Agent": "System Agent assigns the L3 communication assurance task to Connection Agent",
  "System Agent收到意图：Apply for the Digital ID": "System Agent receives intent: Apply for the Digital ID",
  "System Agent收到意图：Create Home Domain": "System Agent receives intent: Create Home Domain",
  "System Agent收到意图：Share Video": "System Agent receives intent: Share Video",
  "System Agent收到意图：Compute offloading for object recognition": "System Agent receives intent: Compute offloading for object recognition",
  "ACN Agent收到任务：签发数字身份": "ACN Agent receives task: issue digital identity",
  "ACN Agent收到任务：创建家庭域凭证": "ACN Agent receives task: create home-domain credentials",
  "Connection Agent收到任务：接入网络": "Connection Agent receives task: access network",
  "Connection Agent收到任务：下发物理组网配置": "Connection Agent receives task: deliver physical network configuration",
  "Connection Agent收到任务：L1级通信保障": "Connection Agent receives task: L1 communication assurance",
  "Connection Agent收到任务：L2级通信保障": "Connection Agent receives task: L2 communication assurance",
  "Connection Agent收到任务：L3级通信保障": "Connection Agent receives task: L3 communication assurance",
  "Computing Agent收到任务：创建算力会话": "Computing Agent receives task: create compute session",
  "Computing Agent收到任务：分配算力资源": "Computing Agent receives task: allocate compute resources",
  "ACN Agent调用IDM Tool签发数字身份": "ACN Agent calls IDM Tool to issue digital identity",
  "ACN Agent调用ARF Tool发布能力卡片": "ACN Agent calls ARF Tool to publish capability card",
  "ACN Agent调用UDM Tool更新签约数据": "ACN Agent calls UDM Tool to update subscription data",
  "ACN Agent调用IDM Tool下发域接入凭证": "ACN Agent calls IDM Tool to deliver domain access credentials",
  "Connection Agent调用AM Tool注册": "Connection Agent calls AM Tool to register",
  "Connection Agent调用SM Tool创建会话": "Connection Agent calls SM Tool to create a session",
  "Connection Agent调用Policy Tool下发保障策略": "Connection Agent calls Policy Tool to deliver assurance policy",
  "Connection Agent调用Policy Tool下发AI推理通信保障策略": "Connection Agent calls Policy Tool to deliver AI inference communication assurance policy",
  "Computing Agent调用CMF Tool创建算力会话": "Computing Agent calls CMF Tool to create a compute session",
  "Computing Agent调用CMF Tool分配算力资源": "Computing Agent calls CMF Tool to allocate compute resources",
  "System Agent确认完成签发数字身份任务": "System Agent confirms digital identity issuance is complete",
  "System Agent确认完成接入网络任务": "System Agent confirms network access is complete",
  "System Agent确认完成家庭域凭证任务": "System Agent confirms home-domain credentials are complete",
  "System Agent确认完成物理组网配置任务": "System Agent confirms physical network configuration is complete",
  "System Agent确认完成L1级通信保障任务": "System Agent confirms L1 communication assurance is complete",
  "System Agent确认完成L2级通信保障任务": "System Agent confirms L2 communication assurance is complete",
  "System Agent确认完成L3级通信保障任务": "System Agent confirms L3 communication assurance is complete",
  "System Agent确认完成创建算力会话任务": "System Agent confirms compute session creation is complete",
  "System Agent确认完成分配算力资源任务": "System Agent confirms compute resource allocation is complete",
  "System Agent任务完成": "System Agent task complete",
  "收到意图：": "Intent received:",
  "收到意图:": "Intent received: ",
  "意图校验通过": "Intent validation passed",
  "使用QoE_assurance Skill": "Use QoE_assurance Skill",
  "调用QoE_Analytic_tool": "Call QoE_Analytic_tool",
  "调用QoS_Policy_Decision_tool": "Call QoS_Policy_Decision_tool",
  "使用ACN Skill": "Use ACN Skill",
  "调用Subscription_tool": "Call Subscription_tool",
  "调用Create_Or_Update_Subnet_Context_tool": "Call Create_Or_Update_Subnet_Context_tool",
  "调用Issue_Access_Token_tool": "Call Issue_Access_Token_tool",
  "调用Validate_Access_Token_tool": "Call Validate_Access_Token_tool",
  "调用Create_Subnet_PDUSession_tool": "Call Create_Subnet_PDUSession_tool",
  "使用Sandbox Services Skill": "Use Sandbox Services Skill",
  "调用Select_Sandbox_Images_tool": "Call Select_Sandbox_Images_tool",
  "调用Select_Computing_Site_tool": "Call Select_Computing_Site_tool",
  "调用Select_Computing_Resources_tool": "Call Select_Computing_Resources_tool",
  "调用Generate_Sandbox_Template_tool": "Call Generate_Sandbox_Template_tool",
  "调用Validate_Sandbox_Template_tool": "Call Validate_Sandbox_Template_tool",
  "调用Create_or_Update_Sandbox_Service_tool": "Call Create_or_Update_Sandbox_Service_tool",
  "编排结果验收通过": "Orchestration result validation passed",
  "收到任务：": "Task received:",
  "完成任务：": "Task complete:",
  "调用IDM Tool：": "Call IDM Tool:",
  "调用AM Tool": "Call AM Tool",
  "调用SM Tool": "Call SM Tool",
  "调用ARF Tool": "Call ARF Tool",
  "调用CMF Tool": "Call CMF Tool",
  "调用IDM Tool": "Call IDM Tool",
  "调用UDM Tool": "Call UDM Tool",
  "签发数字身份": "Issue Digital Identity",
  "创建家庭域凭证": "Create Home-Domain Credentials",
  "家庭域凭证": "Home-Domain Credentials",
  "创建会话": "Create Session",
  "注册": "Register",
  "任务": "Task",
  "意图": "Intent",
  "拆解": "Decompose",
  "匹配": "Match",
  "确认": "Confirm",
  "执行": "Execute",
  "摘要": "Summary",
  "完成": "Complete",
  "Stage8 实时时延图表": "Stage 8 Real-Time Latency Chart",
  "机器狗能力已在家庭域内可发现": "Robot dog capability is discoverable in the home domain",
  "机器狗寻找目标物品，算力不足无法识别，申请算力卸载到网络。": "The robot dog searches for the target item, cannot identify it locally, and requests compute offload from the network.",
  "机器狗寻找快递包装，算力不足无法识别，申请算力卸载到网络。": "The robot dog searches for the parcel packaging, cannot inspect it locally, and requests compute offload from the network.",
  "机器狗上传基础信息，获得网络签发数字身份，完成接入。": "The robot dog uploads basic information, receives a network-issued digital identity, and completes access.",
  "AR眼镜指示机器狗前往商店，网络为其创建家庭域。": "The AR glasses instruct the robot dog to go to the store, and the network creates a home domain for it.",
  "AR眼镜指示机器狗前往快递站，网络为其创建家庭域。": "The AR glasses instruct the robot dog to go to the pickup station, and the network creates a home domain for it.",
  "机器狗、AR眼镜与商店智能体完成双向认证。": "The robot dog, AR glasses, and store agent complete mutual authentication.",
  "机器狗、AR眼镜与快递站智能体完成双向认证。": "The robot dog, AR glasses, and pickup-station agent complete mutual authentication.",
  "网络算力节点识别商品并回传标注结果。": "The network compute node identifies goods and returns annotated results.",
  "网络算力节点检查快递包装并回传标注结果。": "The network compute node inspects the parcel packaging and returns annotated results.",
  "机器狗与超市智能体完成商品交接。": "The robot dog completes item handover with the supermarket agent.",
  "机器狗与快递站智能体完成快递交接。": "The robot dog completes parcel handover with the pickup-station agent.",
  "机器狗抵达商店门口，回传实时视野。": "The robot dog reaches the store entrance and streams live vision.",
  "机器狗抵达快递站门口，回传实时视野。": "The robot dog reaches the pickup station entrance and streams live vision.",
  "机器狗开箱，申请数字身份。": "The robot dog is powered on and applies for a digital identity.",
  "建立机器狗与AR眼镜之间的可信协作入口": "Establish a trusted collaboration entry between the robot dog and AR glasses",
  "识别当前演示处于接入准备阶段，等待数字身份和网络能力就绪": "Identify the current demo as access preparation and wait for identity and network capabilities",
  "数字身份、可信接入、智能体发现能力处于待编排状态": "Digital identity, trusted access, and agent discovery capabilities are ready to be orchestrated",
  "机器狗、AR眼镜、核心网智能体已进入协同准备态": "The robot dog, AR glasses, and core network agents are in collaborative standby",
  "机器狗数字身份完成签发，接入凭证进入可用状态": "The robot dog's digital identity is issued and access credentials are available",
  "将机器狗能力注册为可发现服务，开放给后续网络编排使用": "Register robot dog capabilities as discoverable services for network orchestration",
  "机器狗身份、能力卡片和接入路径已完成准备": "Robot dog identity, capability card, and access path are ready",
  "数字身份申请阶段完成，可以进入家庭域网络创建": "Digital identity application is complete; home-domain networking can start",
  "建立跨域智能体协作链路，让眼镜意图可被远端能力承接": "Build a cross-domain agent collaboration link so glasses intent can be handled remotely",
  "通过Agent GW完成跨域寻址，并由ACN确认对端身份可信": "Complete cross-domain addressing through Agent GW and verify peer identity through ACN",
  "跨域认证、任务级会话和协议转换能力已生效": "Cross-domain authentication, task session, and protocol conversion are active",
  "跨域A2A链路已建立，后续视觉任务可进入算力资源编排": "The cross-domain A2A link is established; vision tasks can enter compute orchestration",
  "把机器狗第一视角视频接入家庭域，形成可用实时视野": "Connect first-person robot dog video to the home domain as live vision",
  "选择低时延视频路径，优先保障眼镜端观看体验": "Select a low-latency video path for the AR glasses viewing experience",
  "家庭域连接、UPF路径和视频通道已完成联动": "Home-domain connection, UPF path, and video channel are linked",
  "机器狗原始视野已稳定输出，等待后续增强识别任务": "Raw robot dog vision is stable and waiting for enhanced recognition",
  "将机器狗实时视野接入视觉识别任务，响应用户寻找目标物的意图": "Feed live robot dog vision into recognition for the user's target-item request",
  "将机器狗实时视野接入快递包装检测任务，响应用户查询快递包装破损原因的意图": "Feed live robot dog vision into parcel packaging inspection for the user's damage-cause request",
  "判断当前视频链路稳定，触发算力资源分配": "Confirm the video link is stable and trigger compute allocation",
  "为视觉识别任务分配低时延算力资源和推理会话": "Allocate low-latency compute resources and an inference session for vision recognition",
  "识别任务进入运行态，视频流开始进入算力节点处理": "The recognition task is running and the video stream enters compute-node processing",
  "将识别结果与交接任务结果同步回系统门户": "Synchronize recognition and handover results back to the system portal",
  "阶段9任务完成，整条作业闭环成功": "Stage 9 is complete and the full task loop is closed",
  "阶段10任务完成，整条作业闭环成功": "Stage 10 is complete and the full task loop is closed",
  "机器狗与超市智能体完成商品取件交接动作": "The robot dog completes item pickup and handover with the supermarket agent",
  "机器狗与快递站智能体完成快递取件交接动作": "The robot dog completes parcel pickup and handover with the pickup-station agent",
  "随路QoS保障用户体验，视频链路体验进入动态保障态。": "In-path QoS assures user experience while the video link enters dynamic assurance.",
  "随路QoS保障用户体验": "In-Path QoS Experience Assurance",
  "收到视觉推理请求后启用随路QoS保障策略": "Enable in-path QoS assurance after receiving the visual reasoning request",
  "增强机器狗回传的视频": "Enhance the video returned by the robot dog",
  "丰富的业务需求表达": "Rich business requirement expression",
  "原生意图入口": "Native intent entry",
  "端网协同": "Device-network collaboration",
  "意图 NAS": "Intent NAS",
  "RAN、UPF与算力节点建立QoS保障路径": "RAN, UPF, and the compute node establish a QoS assurance path",
  "QoS指标和用户对话层进入实时刷新": "QoS metrics and the user dialog layer refresh in real time",
  "实时问答": "Live Q&A",
  "用户": "User",
  "用户消息": "User Message",
  "智能体回复": "Agent Reply",
  "等待问答内容推送": "Waiting for Q&A content",
  "端侧状态：随路QoS保障": "Device Status:\nIn-Path QoS Assurance",
  "随路QoS保障": "In-Path QoS Assurance",
  "GBR动态保障": "Dynamic GBR Assurance",
  "QoS随路优化中": "QoS In-Path Optimization",
  "视频体验持续保障": "Video experience remains assured",
  "GBR带宽保障": "GBR Bandwidth Assurance",
  "体验质量感知": "Experience Quality Awareness",
  "QoS保障曲线": "QoS Assurance Curve",
  "等待QoS推送": "Waiting for QoS Push",
  "为机器狗申请可验证数字身份，建立后续网络接入前提": "Apply for a verifiable digital identity for the robot dog",
  "启用统一数字身份管理和可信接入控制能力": "Enable unified digital identity management and trusted access control",
  "将用户意图拆分为身份签发、能力注册和网络接入准备": "Split user intent into identity issuance, capability registration, and access preparation",
  "数字身份申请正在处理，机器狗能力等待发布": "Digital identity application is processing; robot dog capabilities wait for publishing",
  "创建家庭域连接，让AR眼镜能够低时延访问机器狗": "Create a home-domain connection for low-latency AR glasses access to the robot dog",
  "将家庭域创建拆分为域管理、接入凭证和物理组网配置": "Split home-domain creation into domain management, credentials, and physical networking",
  "签约数据和接入凭证已进入家庭域管理流程": "Subscription data and access credentials enter home-domain management",
  "家庭域网络正在创建，端侧连接参数开始生效": "Home-domain networking is being created and device-side parameters are taking effect",
  "优先选择低时延路径承载机器狗视频能力": "Prioritize a low-latency path for robot dog video",
  "路径配置开始下发，视频流量进入专用转发路径": "Path configuration is being delivered and video traffic enters a dedicated forwarding path",
  "家庭域连接建立中，端侧带宽和时延进入目标范围": "Home-domain connection is establishing; bandwidth and latency enter target ranges",
  "端侧状态：L1级通信保障": "Device Status:\nL1 Communication Assurance",
  "保障效果": "Assurance Effect",
  "连接无中断": "No connection interruption",
  "端侧状态：L2级通信保障": "Device Status:\nL2 Communication Assurance",
  "视频传输流畅": "Smooth video transmission",
  "视频传输保障": "Video Transport Assurance",
  "L2级通信保障": "L2 Communication Assurance",
  "端侧状态：L3级通信保障": "Device Status:\nL3 Communication Assurance",
  "L3级通信保障": "L3 Communication Assurance",
  "AI推理链路稳定，结果回传抖动低于5ms": "AI inference link is stable; result return jitter is below 5 ms",
  "下发AI推理通信保障策略": "Deliver AI inference communication assurance policy",
  "Share Video": "Share Video",
  "L1级通信保障": "L1 Communication Assurance",
  "下发保障策略": "Deliver Assurance Policy",
  "调用Policy Tool": "Call Policy Tool",
  "生成式网络开始为家庭域计算接入路径": "Generative networking starts computing an access path for the home domain",
  "任务链路完成调度": "Task link scheduling is complete",
  "调用CMF Tool创建算力会话": "Call CMF Tool to create a compute session",
  "调用CMF Tool分配算力资源": "Call CMF Tool to allocate compute resources",
  "Agent GW跨域互联": "Agent GW Cross-Domain Interconnect",
  "6G核心网作用": "6G Core Network Functions",
  "L3按需组网": "L3 On-Demand Networking",
  "ACN Agent:创建管理家庭域": "ACN Agent:\nCreate and manage home domain",
  "Connection Agent：下发物理组网配置": "Connection Agent:\nDeliver physical networking config",
  "Connection Agent:接入网络": "Connection Agent:\nAccess network",
  "Computing Agent:创建算力会话": "Computing Agent:\nCreate compute session",
  "ACN Agent:签发数字身份": "ACN Agent:\nIssue digital identity",
  "IDM Tool颁发数字身份": "IDM Tool issues digital identity",
  "IDM颁发数字身份": "IDM issues digital identity",
  "ACF能力注册": "ACF capability registration",
  "ACF:创建管理家庭域": "ACF:\nCreate and manage home domain",
  "CCF:创建算力会话": "CCF:\nCreate compute session",
  "IDM:签发数字身份": "IDM:\nIssue digital identity",
  "ACF:能力注册": "ACF:\nRegister capability",
  "AR眼镜、机器狗与超市智能体双向认证": "AR glasses, robot dog, and supermarket agent mutual authentication",
  "机器狗和AR眼镜分别与超市智能体双向认证": "Robot dog and AR glasses each mutually authenticate with the supermarket agent",
  "AR眼镜、机器狗与快递站智能体双向认证": "AR glasses, robot dog, and pickup-station agent mutual authentication",
  "机器狗和AR眼镜分别与快递站智能体双向认证": "Robot dog and AR glasses each mutually authenticate with the pickup-station agent",
  "AR Glasses (6G终端)": "AR Glasses (6G Terminal)",
  "机器狗与超市智能体交接物品": "Robot dog and supermarket agent hand over item",
  "机器狗与超市智能体双向认证": "Robot dog and supermarket agent mutual authentication",
  "眼镜与超市智能体双向认证": "AR glasses and supermarket agent mutual authentication",
  "机器狗与快递站智能体交接快递": "Robot dog and pickup-station agent hand over the parcel",
  "机器狗与快递站智能体双向认证": "Robot dog and pickup-station agent mutual authentication",
  "眼镜与快递站智能体双向认证": "AR glasses and pickup-station agent mutual authentication",
  "智能体通信网络": "Agent Communication Network",
  "下一代核心网": "Next-Generation Core Network",
  "AR眼镜已接入": "AR Glasses Connected",
  "机器狗抵达商店并回传实时视野": "Robot dog reaches the store and streams live vision",
  "获取超市智能体数字身份": "Get supermarket agent digital identity",
  "机器狗抵达快递站并回传实时视野": "Robot dog reaches the pickup station and streams live vision",
  "获取快递站智能体数字身份": "Get pickup-station agent digital identity",
  "机器狗感知设备输入": "Robot dog sensor input",
  "标注结果回传AR眼镜": "Return annotations to AR glasses",
  "网络算力节点识别标注": "Network compute node recognition and annotation",
  "网络算力节点检查快递包装并回传标注结果": "Network compute node parcel packaging inspection and annotation",
  "机器狗感知输入": "Robot dog perception input",
  "结果回传AR眼镜": "Return result to AR glasses",
  "跨域智能体认证交互": "Agent Authentication",
  "机器狗实时视野": "Robot Dog Live Vision",
  "数字身份申请": "Digital Identity Application",
  "签约数据更新": "Subscription Data Update",
  "下发域接入凭证": "Deliver Domain Access Credentials",
  "下发物理组网配置": "Deliver Physical Network Config",
  "下发UPF配置": "Deliver UPF Config",
  "更新签约数据": "Update Subscription Data",
  "申请网内算力": "Request In-Network Compute",
  "创建管理家庭域": "Create and Manage Home Domain",
  "创建家庭域": "Create Home Domain",
  "创建算力会话": "Create Compute Session",
  "分配算力资源": "Compute Resource Allocation",
  "算力卸载已完成": "Compute Offload Completed",
  "算力卸载": "Compute Offload",
  "生成式网络": "Generative Networking",
  "身份可信认证": "Trusted Identity Authentication",
  "ID寻址路由": "ID Addressing Route",
  "Agent协议转换": "Agent Protocol Conversion",
  "协议转换": "Protocol Conversion",
  "寻址路由": "Addressing Route",
  "颁发数字身份": "Issue Digital Identity",
  "发布能力卡片": "Publish Capability Card",
  "接入网络": "Access Network",
  "能力注册": "Capability Registration",
  "业务授权": "Service Authorization",
  "身份申请": "Identity Application",
  "能力发布": "Capability Publishing",
  "可信身份背书": "Trusted Identity Endorsement",
  "按需组网": "On-Demand Networking",
  "安全接入控制": "Secure Access Control",
  "域内连接最优选路": "Optimal In-Domain Routing",
  "用户体验保障": "User Experience Assurance",
  "统一数字身份管理": "Digital Identity Management",
  "通信凭证签发": "Communication Credential Issuance",
  "可信接入控制": "Trusted Access Control",
  "智能体发布发现": "Agent Publishing and Discovery",
  "网络提供强大算力": "Network Provides Strong Compute",
  "算力随路卸载": "Compute Offloaded Along the Path",
  "传输低时延": "Low-Latency Transport",
  "算力入网实际应用": "Compute-Network Application",
  "机器狗共享实时视野": "Robot Dog Shares Live Vision",
  "机器狗视野增强": "Enhanced Robot Dog Vision",
  "机器狗原始视野": "Raw Robot Dog Vision",
  "机器狗增强后的视野": "Enhanced Robot Dog Vision",
  "保障视频效果": "Assured Video Effect",
  "机器狗原始视频": "Original Robot Dog Video",
  "AR眼镜视野": "AR Glasses View",
  "增强后AR眼镜视角": "Enhanced AR Glasses Live View",
  "机械臂视频流": "Robotic Arm Video Stream",
  "物品交接": "Item Handover",
  "快递交接": "Parcel Handover",
  "家庭域创建": "Home Domain Creation",
  "机器狗接入": "Robot Dog Access",
  "眼镜已接入": "AR Glasses Connected",
  "用户状态": "User Status",
  "端侧状态": "Device Status",
  "端侧带宽": "Device Bandwidth",
  "平均时延": "Average Latency",
  "端到端时延": "End-to-End Latency",
  "实时状态": "Real-Time Status",
  "当前任务摘要": "Current Task Summary",
  "工作流": "Workflow",
  "故事线": "Storyline",
  "业务目标": "Objective",
  "核心网能力": "Core Network Capabilities",
  "系统决策": "Decision",
  "当前结果": "Result",
  "等待当前任务目标": "Waiting for current objective",
  "等待核心网能力生效": "Waiting for core network capability",
  "等待系统编排决策": "Waiting for orchestration decision",
  "等待阶段结果生成": "Waiting for stage result",
  "已完成 / Completed": "Completed",
  "进行中 / Working": "Working",
  "即将开始 / Upcoming": "Upcoming",
  "待注册 / Unregistered": "Unregistered",
  "已完成任务": "Completed Tasks",
  "已注册设备": "Registered Device",
  "未注册设备": "Unregistered Device",
  "已颁发": "Issued",
  "未颁发": "Not Issued",
  "凭证": "Credential",
  "机器狗ID": "Robot Dog ID",
  "当前": "Current",
  "时间窗口: 最近": "Time Window: Last",
  "目标": "Objective",
  "能力": "Capability",
  "决策": "Decision",
  "结果": "Result",
  "已完成": "Completed",
  "进行中": "Working",
  "即将开始": "Upcoming",
  "待注册": "Unregistered",
  "AR眼镜": "AR Glasses",
  "超市智能体": "Supermarket Agent",
  "商店智能体": "Store Agent",
  "快递站智能体": "Pickup Station Agent",
  "核心网作用": "Core Network Functions",
  "智能体网络": "Agentic Network",
  "智能体": "Agent",
  "机器狗": "Robot Dog",
  "核心网": "Core Network",
  "家庭域": "Home Domain",
  "数字身份": "Digital Identity",
  "接入凭证": "Access Credentials",
  "签约数据": "Subscription Data",
  "物理组网配置": "Physical Network Config",
  "低时延": "Low Latency",
  "超市": "Supermarket",
  "商店": "Store",
  "快递站": "Pickup Station",
  "网络": "Network",
  "投影": "Projection",
  "终端": "Terminal",
};

const TRANSLATION_ENTRIES = Object.entries(UI_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
const originalTextByNode = new WeakMap();
const containsHan = (text) => /[\u3400-\u9fff]/.test(text);

const translateTextNodeValue = (text) => {
  let nextText = text;
  TRANSLATION_ENTRIES.forEach(([source, target]) => {
    nextText = nextText.split(source).join(target);
  });
  return nextText;
};

const walkTextNodes = (root, visitor) => {
  if (!root || typeof document === "undefined") {
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, svg, noscript, [data-language-managed]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  nodes.forEach(visitor);
};

const applyLanguageToDom = (root, language) => {
  walkTextNodes(root, (node) => {
    if (language === "zh") {
      const original = originalTextByNode.get(node);
      if (original && node.nodeValue !== original) {
        node.nodeValue = original;
      }
      return;
    }

    const currentText = node.nodeValue;
    const original = containsHan(currentText)
      ? currentText
      : originalTextByNode.get(node) || currentText;

    if (containsHan(currentText)) {
      originalTextByNode.set(node, currentText);
    }

    if (containsHan(original)) {
      const translated = translateTextNodeValue(original);
      if (node.nodeValue !== translated) {
        node.nodeValue = translated;
      }
    }
  });
};

const useLanguageOverlay = (rootRef, language) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === "undefined") {
      return undefined;
    }

    const apply = () => {
      window.requestAnimationFrame(() => applyLanguageToDom(root, language));
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language, rootRef]);
};

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
    <div className="h-full p-3 xl:p-4">
      {children}
    </div>
  </div>
);

// 状态行组件
const StatusRow = ({ label, value, status = "success", isMono = false, valueClassName = "", stacked = false }) => {
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

  if (stacked) {
    return (
      <div className="py-2 border-b border-blue-950/40 last:border-0 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="status-row-label font-semibold text-blue-100/95">{label}</span>
          {status === 'working' && <CircleDot className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />}
          {status === 'pending' && <CircleDot className="w-4 h-4 shrink-0 text-blue-500" />}
        </div>
        <div className={`mt-1 font-bold leading-snug ${getStatusColor()} ${isMono ? 'font-mono' : ''} ${valueClassName}`}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="status-row flex justify-between items-center py-2.5 border-b border-blue-950/40 last:border-0 text-sm lg:text-base">
      <span className="status-row-label min-w-0 pr-2 font-semibold text-blue-100/95">{label}</span>
      <div className="status-row-value-wrap flex shrink-0 items-center gap-1.5 whitespace-nowrap">
        <span className={`shrink-0 whitespace-nowrap font-bold ${getStatusColor()} ${isMono ? 'font-mono' : ''} ${valueClassName}`}>{value}</span>
        {status === 'working' && <CircleDot className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />}
        {status === 'pending' && <CircleDot className="w-4 h-4 shrink-0 text-blue-500" />}
      </div>
    </div>
  );
};

const CompletedTasksPanel = () => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-emerald-400/35 bg-slate-950/42 shadow-[0_0_22px_rgba(16,185,129,0.12)]">
    <div className="completed-tasks-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="flex flex-col gap-2.5">
        {STAGE10_COMPLETED_TASKS.map((group, index) => (
          <section
            key={group.title}
            className="rounded-md border border-blue-400/20 bg-blue-950/18 px-3 py-3 shadow-[inset_0_0_14px_rgba(59,130,246,0.06)]"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span className="flex h-7 min-w-7 items-center justify-center rounded border border-emerald-300/45 bg-emerald-400/10 px-1.5 text-sm font-black text-emerald-200">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="min-w-0 text-lg font-black leading-tight text-blue-50">
                {group.title}
              </h3>
            </div>
            <ul className="space-y-1">
              {group.tasks.map((task) => (
                <li key={task} className="flex gap-2.5 text-base font-normal leading-snug text-white">
                  <span className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.75)]" />
                  <span className="min-w-0 break-words">{task}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </div>
);

const TaskBriefPanel = ({ logs }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const intentScrollRef = useRef(null);
  const isIntentCardLogs = safeLogs[0] && !Array.isArray(safeLogs[0]) && typeof safeLogs[0] === "object";
  const formatIntentSummaryLine = (line) => String(line).replace(/\s*Tool\b/g, "");

  useEffect(() => {
    if (!isIntentCardLogs || !intentScrollRef.current) {
      return;
    }

    intentScrollRef.current.scrollTop = intentScrollRef.current.scrollHeight;
  }, [isIntentCardLogs, safeLogs.length]);

  if (safeLogs.length === 0) {
    return <div className="min-h-0 flex-1" />;
  }

  if (isIntentCardLogs) {
    return (
      <div ref={intentScrollRef} className="intent-summary-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {safeLogs.map((card, index) => (
          <div
            key={card.id || `${card.label}-${index}`}
            className="rounded-lg border border-cyan-300/35 bg-cyan-400/[0.08] px-3 py-2.5 text-cyan-50 shadow-[inset_0_0_18px_rgba(34,211,238,0.08),0_0_14px_rgba(34,211,238,0.12)] backdrop-blur-md"
          >
            <div className="mb-1.5 text-[11px] font-black leading-none tracking-wide text-cyan-200">
              {card.label || "摘要"}
            </div>
            <div className="space-y-0.5 text-[12px] font-normal leading-snug text-blue-50 lg:text-[13px]">
              {(card.lines || []).map((line) => (
                <div key={line} className="min-w-0 break-words">{formatIntentSummaryLine(line)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const briefByCategory = safeLogs.reduce((acc, [, category, message]) => ({
    ...acc,
    [category]: message,
  }), {});
  const cards = [
    {
      category: "业务目标",
      label: "目标",
      value: briefByCategory["业务目标"] || "等待当前任务目标",
      className: "border-cyan-300/35 bg-cyan-400/[0.08] text-cyan-50 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)]",
      badgeClassName: "border-cyan-200/50 bg-cyan-300/15 text-cyan-100",
    },
    {
      category: "核心网能力",
      label: "能力",
      value: briefByCategory["核心网能力"] || "等待核心网能力生效",
      className: "border-emerald-300/35 bg-emerald-400/[0.075] text-emerald-50 shadow-[inset_0_0_18px_rgba(52,211,153,0.08)]",
      badgeClassName: "border-emerald-200/50 bg-emerald-300/15 text-emerald-100",
    },
    {
      category: "系统决策",
      label: "决策",
      value: briefByCategory["系统决策"] || "等待系统编排决策",
      className: "border-amber-300/35 bg-amber-300/[0.08] text-amber-50 shadow-[inset_0_0_18px_rgba(251,191,36,0.08)]",
      badgeClassName: "border-amber-200/50 bg-amber-300/15 text-amber-100",
    },
    {
      category: "当前结果",
      label: "结果",
      value: briefByCategory["当前结果"] || "等待阶段结果生成",
      className: "border-blue-300/35 bg-blue-400/[0.08] text-blue-50 shadow-[inset_0_0_18px_rgba(96,165,250,0.08)]",
      badgeClassName: "border-blue-200/50 bg-blue-300/15 text-blue-100",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-3">
      {cards.map((card) => (
        <div
          key={card.category}
          className={`flex min-h-[64px] flex-1 items-start gap-2.5 rounded-lg border px-3 py-2.5 ${card.className}`}
        >
          <div className={`task-brief-badge flex h-7 w-10 shrink-0 items-center justify-center rounded border text-[11px] font-black leading-none tracking-wide ${card.badgeClassName}`}>
            {card.label}
          </div>
          <div className="task-brief-copy min-w-0 flex-1 text-[12px] font-bold leading-snug lg:text-[13px]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const StageStorySummary = ({ stage }) => {
  const story = STAGE_STORY_LINES[stage] || "";

  if (!story) {
    return null;
  }

  return (
    <div className="relative z-10 mt-6 flex justify-center">
      <div className="flex max-w-[980px] items-center justify-center gap-3 rounded-lg border border-cyan-300/45 bg-slate-950/78 px-5 py-2.5 text-center shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md">
        <span className="shrink-0 rounded border border-cyan-300/35 bg-cyan-950/70 px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-cyan-100">
        故事线
        </span>
        <span className="text-sm font-bold leading-snug text-cyan-50 lg:text-base">
          {story}
        </span>
      </div>
    </div>
  );
};

const ARGlasses = ({ className = "", speechText = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    {speechText && (
      <div className="absolute -left-1 top-0 z-20 max-w-[150px] -translate-y-1/2 rounded-lg border border-cyan-300/45 bg-slate-950/88 px-2.5 py-1.5 text-[10px] font-bold leading-snug text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.2)] backdrop-blur-md">
        <span className="block break-words">{speechText}</span>
        <span className="absolute bottom-[-4px] left-6 h-2 w-2 rotate-45 border-b border-r border-cyan-300/45 bg-slate-950/88" />
      </div>
    )}
    <div className="absolute w-3/4 h-2 bottom-3 rounded-full blur-md opacity-45 bg-cyan-500 shadow-[0_0_15px_#06b6d4]" />
    <img
      src="/topology/glasses_transparent.png"
      alt="AR Glasses"
      className="w-full h-full object-contain transition-all duration-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]"
      draggable="false"
    />
  </div>
);

const ArAccessStateCard = ({ registered = false }) => {
  const stateStyles = registered
    ? {
        card: "border-emerald-500/30 bg-slate-950/10",
        header: "text-emerald-400",
        icon: <ShieldCheck className="w-5 h-5 animate-pulse" />,
        title: "已注册设备",
        subtitle: "Registered Device",
        gradientId: "stage1-ar-registered-beam",
        beamStart: "rgba(16, 185, 129, 0.35)",
        beamLine: "rgba(52, 211, 153, 0.4)",
        beamDot: "#10b981",
        cardPanel: "bg-emerald-950/80 border-cyan-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        panelTitle: "Digital ID",
        panelTitleClass: "text-cyan-300 border-cyan-500/20",
        deviceName: "3lt1zY73G@CMCC.org",
        detail: "Capabilities:",
        detailValue: "[Device-Network Synergy, AR]",
        statusLabel: "Active",
        statusClass: "text-emerald-400",
      }
    : {
        card: "border-red-500/30 bg-red-950/10",
        header: "text-red-400",
        icon: <ShieldAlert className="w-5 h-5 animate-bounce" />,
        title: "未注册设备",
        subtitle: "Unknown Device",
        gradientId: "stage1-ar-unregistered-beam",
        beamStart: "rgba(239, 68, 68, 0.35)",
        beamLine: "rgba(248, 113, 113, 0.4)",
        beamDot: "#ef4444",
        cardPanel: "bg-red-950/80 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]",
        panelTitle: "Device Warning",
        panelTitleClass: "text-red-400 border-red-500/20",
        deviceName: "AR Glasses",
        detail: "Status:",
        detailValue: "待注册 / Unregistered",
        statusLabel: "Blocked",
        statusClass: "text-red-400 animate-pulse",
      };

  return (
    <div className={`border backdrop-blur-md flex flex-1 flex-col overflow-hidden rounded-xl p-3 relative ${stateStyles.card}`}>
      <div className={`flex items-center gap-2 mb-2 relative z-20 ${stateStyles.header}`}>
        {stateStyles.icon}
        <div>
          <div className="font-bold text-xs lg:text-sm">{stateStyles.title}</div>
          <div className="text-[10px] opacity-70">{stateStyles.subtitle}</div>
        </div>
      </div>

      <div className="flex-1 w-full relative mt-1">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={stateStyles.gradientId} x1="0" y1="0.8" x2="0.8" y2="0.2">
              <stop offset="0%" stopColor={stateStyles.beamStart} stopOpacity="0.7" />
              <stop offset="100%" stopColor={stateStyles.beamStart} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="34,65 65,15 95,50" fill={`url(#${stateStyles.gradientId})`} className="opacity-40 animate-pulse" />
          <line x1="34" y1="65" x2="65" y2="15" stroke={stateStyles.beamLine} strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="34" y1="65" x2="95" y2="50" stroke={stateStyles.beamLine} strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="34" cy="65" r="1.5" fill={stateStyles.beamDot} />
        </svg>

        <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
          <ARGlasses className="w-full h-full object-contain" />
        </div>

        <div className={`absolute right-3 top-3 w-[42%] max-w-[145px] origin-top-right border p-2 sm:p-2.5 2xl:max-w-[205px] 2xl:p-3 rounded-lg backdrop-blur-md z-20 ${registered ? "animate-hologram" : "animate-hologram-red"} [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] leading-tight ${stateStyles.cardPanel}`}>
          <div className={`font-black mb-1 border-b pb-1 uppercase tracking-wide text-[10px] sm:text-[11px] ${stateStyles.panelTitleClass}`}>
            {stateStyles.panelTitle}
          </div>
          <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-[11px]">
            {stateStyles.deviceName}
          </div>
          <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-medium">
            <div className="flex flex-col gap-0.5">
              <span className="opacity-75">{stateStyles.detail}</span>
              <span className="font-bold text-cyan-300 leading-tight break-words">
                {stateStyles.detailValue}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-75">Status:</span>
              <span className={`font-bold flex items-center gap-0.5 ${stateStyles.statusClass}`}>
                {stateStyles.statusLabel}
                {registered && <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArRegistrationPanel = () => (
  <div className="flex min-h-[260px] basis-1/2 flex-col gap-2">
    <ArAccessStateCard registered />
  </div>
);

const RegisteredRobotDogCard = ({ className = "flex-1 h-[180px] lg:h-[210px]" }) => (
  <div className={`border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${className}`}>
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
          <linearGradient id="handoff-robot-reg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="34,65 65,15 95,50" fill="url(#handoff-robot-reg-cone-beam)" className="opacity-40 animate-pulse" />
        <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="34" cy="65" r="1.5" fill="#10b981" />
      </svg>

      <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
        <UnitreeGo2Vector
          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]"
          status="registered"
          colors={{
            glow: "#10b981",
            led: "#34d399",
            accent: "#10b981",
          }}
        />
      </div>

      <div className="absolute right-3 top-3 w-[44%] max-w-[155px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] leading-tight text-emerald-300">
        <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[10px] sm:text-[11px]">
          Digital ID
        </div>
        <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-[11px]">
          DID:2168nLB3G@CMCC.org
        </div>
        <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-medium">
          <div className="flex flex-col gap-0.5">
            <span className="opacity-75">Capabilities:</span>
            <span className="font-bold text-cyan-300 leading-tight break-words">
              [4 Legs, Camera, Payload:10KG/10KM]
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-75">Status:</span>
            <span className="font-bold flex items-center gap-0.5 text-emerald-400">
              Active <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RobotArm = ({ className = "" }) => (
  <svg
    viewBox="0 0 160 130"
    className={`transition-all duration-300 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="arm-shell" x1="20" y1="20" x2="140" y2="110" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="46%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="arm-dark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <filter id="arm-cyan-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <ellipse cx="72" cy="116" rx="45" ry="7" fill="#020617" opacity="0.45" />
    <g filter="url(#arm-cyan-glow)">
      <ellipse cx="50" cy="104" rx="25" ry="11" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
      <ellipse cx="50" cy="101" rx="17" ry="7" fill="url(#arm-shell)" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="42" y="70" width="16" height="32" rx="7" fill="url(#arm-shell)" stroke="#94a3b8" strokeWidth="1.2" />
      <circle cx="50" cy="69" r="13" fill="url(#arm-shell)" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="50" cy="69" r="5" fill="#22d3ee" />
      <path d="M58 65 L90 42" stroke="url(#arm-shell)" strokeWidth="18" strokeLinecap="round" />
      <path d="M58 65 L90 42" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.45" />
      <circle cx="94" cy="40" r="13" fill="url(#arm-shell)" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="94" cy="40" r="5" fill="#22d3ee" />
      <path d="M102 45 L125 72" stroke="url(#arm-shell)" strokeWidth="16" strokeLinecap="round" />
      <path d="M102 45 L125 72" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.42" />
      <circle cx="128" cy="76" r="10" fill="url(#arm-shell)" stroke="#22d3ee" strokeWidth="1.8" />
      <path d="M136 77 L148 68" stroke="url(#arm-dark)" strokeWidth="5" strokeLinecap="round" />
      <path d="M136 80 L150 84" stroke="url(#arm-dark)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="128" cy="76" r="3.5" fill="#22d3ee" />
    </g>

    <path d="M50 69 L18 40" stroke="rgba(34,211,238,0.6)" strokeWidth="1.8" strokeDasharray="3 3" />
    <path d="M94 40 L130 22" stroke="rgba(34,211,238,0.55)" strokeWidth="1.8" strokeDasharray="3 3" />
    <circle cx="18" cy="40" r="3" fill="#22d3ee" filter="url(#arm-cyan-glow)" />
    <circle cx="130" cy="22" r="3" fill="#22d3ee" filter="url(#arm-cyan-glow)" />
  </svg>
);

const HandoffPanel = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-3">
    <RegisteredRobotDogCard className="min-h-[260px] flex-1" />
    <ArAccessStateCard registered />
  </div>
);

const QosConversationPanel = ({ items = [] }) => {
  const scrollAreaRef = useRef(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const programmaticScrollRef = useRef(false);
  const bottomThreshold = 8;

  useEffect(() => {
    if (!items.length) {
      setScrollLocked(false);
      return;
    }

    if (scrollLocked) {
      return;
    }

    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    programmaticScrollRef.current = true;
    scrollArea.scrollTop = scrollArea.scrollHeight;
    window.requestAnimationFrame(() => {
      programmaticScrollRef.current = false;
    });
  }, [items, scrollLocked]);

  const isScrollAtBottom = (scrollArea) => (
    scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight <= bottomThreshold
  );

  const syncScrollLock = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    setScrollLocked(!isScrollAtBottom(scrollArea));
  };

  const handleScroll = () => {
    if (programmaticScrollRef.current) {
      return;
    }
    syncScrollLock();
  };

  const handleManualScrollInput = () => {
    window.requestAnimationFrame(syncScrollLock);
  };

  const handlePointerDown = (event) => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    const scrollbarGutterWidth = 16;
    const bounds = scrollArea.getBoundingClientRect();
    if (event.clientX >= bounds.right - scrollbarGutterWidth) {
      handleManualScrollInput();
    }
  };

  const renderImage = (item) => (
    <figure className={`relative shrink-0 overflow-hidden rounded-lg border border-white/20 bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.24)] ${item.id.startsWith("stage9-mock-grape-juice-") ? "h-[64px] w-[96px]" : "h-[82px] w-[118px]"}`}>
      <img
        src={item.image}
        alt=""
        className="h-full w-full object-contain p-1"
        draggable="false"
      />
      <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/75 text-white/80">
        <ImagePlus className="h-2.5 w-2.5" />
      </span>
    </figure>
  );

  return (
    <section
      aria-label="QoS conversation"
      className="relative flex min-h-0 max-h-[450px] flex-[1.32_1_0%] flex-col overflow-hidden rounded-xl border border-[#699aa5]/40 bg-[#10272d]/95 shadow-[inset_0_0_32px_rgba(82,148,160,0.08),0_12px_28px_rgba(0,0,0,0.24)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_12%_22%,rgba(94,194,207,0.16),transparent_34%),linear-gradient(135deg,transparent_48%,rgba(125,211,252,0.035)_49%,transparent_50%)] bg-[size:auto,18px_18px]" />
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#92c8d2]/35 bg-gradient-to-r from-[#337986]/95 via-[#1c4d57]/95 to-[#102c35]/95 px-4 py-3 shadow-[inset_0_1px_0_rgba(201,242,247,0.13),0_5px_18px_rgba(3,18,23,0.28)]">
        <div>
          <div className="text-[15px] font-bold tracking-[0.02em] text-slate-50">实时问答</div>
          <div className="mt-0.5 text-[9px] font-medium tracking-[0.12em] text-[#a4c8cf]/65">AGENT COMMUNICATION LOG</div>
        </div>
        <AudioWaveform className="h-5 w-5 text-[#78c8d3]/80" />
      </header>

      <div
        ref={scrollAreaRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-color:#6fa6b0_rgba(11,32,38,0.72)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#6fa6b0]/80 [&::-webkit-scrollbar-track]:bg-[#0b2026]/70"
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onTouchStart={handleManualScrollInput}
        onWheel={handleManualScrollInput}
      >
        <div className="flex min-h-full flex-col justify-end gap-3">
        {items.length ? items.map((item, index) => {
          const horizontalPlacement = item.imageHorizontalPlacement;
          const isAgentReply = horizontalPlacement === "right"
            || (!horizontalPlacement && index % 2 === 1);
          const imageAbove = item.imageVerticalPlacement === "above";

          return (
            <div key={item.id} className={`flex w-full items-start gap-2 ${isAgentReply ? "justify-end" : "justify-start"}`}>
              {!isAgentReply && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b5d6dd]/60 bg-[#5f94a9] text-white">
                  <UserRound className="h-4 w-4" />
                </div>
              )}
              <div className={`flex w-[78%] max-w-[520px] flex-col ${isAgentReply ? "items-end" : "items-start"}`}>
                <div className={`mb-1 flex items-center px-1 text-[10px] font-medium text-[#b6d0d5]/65 ${isAgentReply ? "flex-row-reverse" : "flex-row"}`}>
                  <span>{isAgentReply ? "Agent" : "用户"}</span>
                </div>
                <div className={`flex w-full flex-col gap-2 ${isAgentReply ? "items-end" : "items-start"}`}>
                  {imageAbove && renderImage(item)}
                  <article className={`w-fit max-w-full rounded-[9px] border px-3 py-2 text-[13px] font-medium leading-[1.5] shadow-[0_5px_14px_rgba(0,0,0,0.18)] ${isAgentReply ? "rounded-br-[3px] border-[#648f98]/45 bg-[#193941]/92 text-[#e7f1f3]" : "rounded-bl-[3px] border-[#9ac6d0]/60 bg-[#4f8297]/95 text-white"}`}>
                    <p className="text-left">{item.dialog}</p>
                  </article>
                  {!imageAbove && renderImage(item)}
                </div>
              </div>
              {isAgentReply && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7db5c0]/40 bg-[#1b4149] text-[#9ed5de]">
                  <Settings className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        }) : (
          <div className="flex min-h-[120px] flex-1 items-center justify-center rounded-lg border border-dashed border-[#7da7af]/25 bg-[#173138]/55 px-4 text-center text-sm font-normal text-[#a8c2c7]/55">
            等待问答内容推送
          </div>
        )}
        </div>
      </div>
      <footer className="relative z-10 flex shrink-0 items-center gap-2 border-t border-[#78aab4]/25 bg-[#142e34]/82 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#81abb3]/35 bg-[#10262b]/80 px-3 py-2 text-[11px] text-[#a5c0c5]/55">
          Agent AI
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#9dc2c9]/75">
          <ImagePlus className="h-4 w-4" />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#8fd3df]">
          <SendHorizontal className="h-4 w-4" />
        </span>
      </footer>
    </section>
  );
};

const DOG_RAW_SAMPLE_MIN_MS = 420;
const DOG_RAW_SAMPLE_MAX_MS = 1500;
const DOG_RAW_STALL_MIN_MS = 1900;
const DOG_RAW_STALL_MAX_MS = 3400;

const DogVisionPanel = ({
  label,
  state,
  videoRef,
  tall = false,
  sampled = false,
  stallEnabled = true,
  noiseEnabled = true,
  onFirstFrame,
}) => {
  const live = state === "receiving" || state === "connected";
  const canvasRef = useRef(null);
  const firstFrameReportedRef = useRef(false);
  const [sampleStalled, setSampleStalled] = useState(false);
  const frameSampled = sampled && stallEnabled;

  const reportFirstFrame = () => {
    const video = videoRef.current;

    if (
      firstFrameReportedRef.current
      || !onFirstFrame
      || !video
      || video.readyState < 2
      || video.videoWidth <= 0
      || video.videoHeight <= 0
    ) {
      return;
    }

    firstFrameReportedRef.current = true;
    onFirstFrame();
  };

  useEffect(() => {
    if (!frameSampled) {
      setSampleStalled(false);
      return undefined;
    }

    let disposed = false;
    let captureTimer = null;
    let sampleCount = 0;

    const randomDelay = (min, max) => Math.round(min + Math.random() * (max - min));

    const captureFrame = () => {
      let capturedFrame = false;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
          const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
          const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (context) {
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = width / height;
            const sourceWidth = canvasAspect > videoAspect ? video.videoWidth : video.videoHeight * canvasAspect;
            const sourceHeight = canvasAspect > videoAspect ? video.videoWidth / canvasAspect : video.videoHeight;
            const sourceX = (video.videoWidth - sourceWidth) / 2;
            const sourceY = (video.videoHeight - sourceHeight) / 2;

            context.filter = noiseEnabled
              ? "contrast(1.12) saturate(0.74) brightness(0.88) blur(0.7px)"
              : "none";
            context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
            context.filter = "none";

            if (noiseEnabled) {
              const frame = context.getImageData(0, 0, width, height);
              const pixels = frame.data;
              for (let index = 0; index < pixels.length; index += 4) {
                const grain = (Math.random() - 0.5) * 34;
                pixels[index] = Math.max(0, Math.min(255, pixels[index] + grain));
                pixels[index + 1] = Math.max(0, Math.min(255, pixels[index + 1] + grain * 0.92));
                pixels[index + 2] = Math.max(0, Math.min(255, pixels[index + 2] + grain * 1.08));
              }
              context.putImageData(frame, 0, 0);
            }
            capturedFrame = true;
            reportFirstFrame();
          }
        }
      } catch (error) {
        console.debug("Sampled robot-dog frame was not ready", error);
      }

      if (!disposed) {
        if (!capturedFrame) {
          setSampleStalled(false);
          captureTimer = window.setTimeout(captureFrame, 250);
          return;
        }

        sampleCount += 1;
        const shouldStall = sampleCount % 5 === 0 || Math.random() < 0.08;
        const nextDelay = shouldStall
          ? randomDelay(DOG_RAW_STALL_MIN_MS, DOG_RAW_STALL_MAX_MS)
          : randomDelay(DOG_RAW_SAMPLE_MIN_MS, DOG_RAW_SAMPLE_MAX_MS);
        setSampleStalled(shouldStall);
        captureTimer = window.setTimeout(() => {
          setSampleStalled(false);
          captureFrame();
        }, nextDelay);
      }
    };

    captureFrame();

    return () => {
      disposed = true;
      setSampleStalled(false);
      if (captureTimer !== null) {
        window.clearTimeout(captureTimer);
      }
    };
  }, [frameSampled, noiseEnabled, state, videoRef]);

  const visionMode = frameSampled
    ? "sampled-noisy"
    : sampled && noiseEnabled
      ? "live-noisy"
      : "live-clear";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-emerald-400/35 bg-slate-950/45 shadow-[inset_0_0_24px_rgba(16,185,129,0.12),0_0_18px_rgba(34,211,238,0.14)] ${tall ? "min-h-0 flex-1" : "min-h-[360px] flex-1"}`}
      data-vision-mode={visionMode}
      data-stall-enabled={sampled ? String(stallEnabled) : undefined}
      data-noise-enabled={sampled ? String(noiseEnabled) : undefined}
      data-sample-interval={frameSampled ? `${DOG_RAW_SAMPLE_MIN_MS}-${DOG_RAW_SAMPLE_MAX_MS}` : undefined}
      data-sample-stalled={sampled ? String(sampleStalled) : undefined}
    >
      <video
        ref={videoRef}
        className={frameSampled
          ? "pointer-events-none absolute h-px w-px opacity-0"
          : `absolute inset-0 h-full w-full object-cover ${sampled && noiseEnabled ? "scale-[1.015] blur-[1.2px] contrast-[0.92] saturate-[0.82]" : ""}`}
        autoPlay
        muted
        playsInline
        aria-hidden={frameSampled ? "true" : undefined}
        onLoadedData={reportFirstFrame}
        onPlaying={reportFirstFrame}
      />
      {frameSampled && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Sampled noisy raw robot dog video" />
          {sampleStalled && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-950/38 backdrop-blur-[1px]" aria-label="视频加载中">
              <LoaderCircle className="h-9 w-9 animate-spin text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            </div>
          )}
        </>
      )}
      {sampled && noiseEnabled && (
        <div className="sampled-video-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-screen" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:22px_22px] mix-blend-screen" />
      <div className="absolute inset-0 border border-cyan-300/20" />
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded border border-emerald-400/45 bg-slate-950/80 px-3 py-1.5 text-xs font-bold tracking-wider text-emerald-200 backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]"}`} />
        {label}
      </div>
    </div>
  );
};

const BackgroundVideoPanel = ({ visible }) => {
  const background = useBackendVideoStream({
    enabled: true,
    ready: true,
    gateState: "ready",
    streamEpoch: null,
    offerUrl: getWebRtcOfferUrl(),
    clientId: "react-stage10-background",
    streamType: "background",
    label: "Stage10 background video",
    attachKey: visible,
  });
  if (!visible) {
    return (
      <video
        ref={background.videoRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex min-h-[420px] flex-1 shrink-0">
      <DogVisionPanel
        label="机械臂视频流"
        state={background.state}
        videoRef={background.videoRef}
        tall
      />
    </div>
  );
};

const DogVisionStreams = ({
  showEnhanced,
  preloadEnhanced,
  sampleRaw = false,
  stage5QoeComplete = false,
  stage5SandboxComplete = false,
  stageAnimationDone = false,
  onFirstFrame,
  showQosConversation = false,
  qosDialogItems = [],
  enhancedLabel = "机器狗增强后的视野",
}) => {
  const { health, ready, state: gateState } = useDogVideoOfferGate(true);
  const [gateOpened, setGateOpened] = useState(false);
  const streamEpoch = health?.streamEpoch ?? null;

  useEffect(() => {
    if (ready) {
      setGateOpened(true);
    } else if (health?.streamRequested === false) {
      setGateOpened(false);
    }
  }, [health?.streamRequested, ready]);

  const streamReady = gateOpened || ready;
  const raw = useBackendVideoStream({
    enabled: !showQosConversation,
    ready: streamReady,
    gateState,
    streamEpoch,
    offerUrl: getDogVisionOfferUrl(),
    clientId: "react-dog-raw",
    streamType: "raw",
    label: "Dog raw vision",
    attachKey: showEnhanced && !showQosConversation,
  });
  const enhanced = useBackendVideoStream({
    enabled: preloadEnhanced && !sampleRaw,
    ready: streamReady,
    gateState,
    streamEpoch,
    offerUrl: getDogEnhancedOfferUrl(),
    clientId: "react-dog-enhanced",
    streamType: "enhanced",
    label: "Dog enhanced vision",
    attachKey: `${showEnhanced}:${showQosConversation}:${sampleRaw}`,
  });

  if (!showEnhanced) {
    return (
      <>
        <DogVisionPanel label="机器狗原始视野" state={raw.state} videoRef={raw.videoRef} />
        {preloadEnhanced && (
          <video
            ref={enhanced.videoRef}
            className="pointer-events-none absolute h-px w-px opacity-0"
            autoPlay
            muted
            playsInline
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  if (showQosConversation) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <DogVisionPanel
          label={enhancedLabel}
          state={enhanced.state}
          videoRef={enhanced.videoRef}
          tall
        />
        <QosConversationPanel items={qosDialogItems} />
      </div>
    );
  }

  if (sampleRaw) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col"
        data-stage5-video-phase={stage5SandboxComplete ? "smooth-clear" : stage5QoeComplete ? "smooth-noisy" : "stalled-noisy"}
      >
        <DogVisionPanel
          label={stageAnimationDone ? "AR眼镜视野" : "机器狗原始视频"}
          state={raw.state}
          videoRef={raw.videoRef}
          tall
          sampled
          stallEnabled={!stage5QoeComplete}
          noiseEnabled={!stage5SandboxComplete}
          onFirstFrame={onFirstFrame}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <DogVisionPanel
        label="机器狗原始视野"
        state={raw.state}
        videoRef={raw.videoRef}
        tall
      />
      <DogVisionPanel
        label={enhancedLabel}
        state={enhanced.state}
        videoRef={enhanced.videoRef}
        tall
      />
    </div>
  );
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
      <div className="mb-2 text-sm font-black leading-none tracking-wide text-cyan-50">
        L3级通信保障
      </div>
      <div className="mb-2 h-px w-full bg-cyan-300/35" />
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
  const appRootRef = useRef(null);
  const [language, setLanguage] = useState(() => (
    typeof window === "undefined"
      ? "zh"
      : window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || "zh"
  ));
  useLanguageOverlay(appRootRef, language);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.title = language === "en" ? "Next-Generation Core Network" : "下一代核心网";
  }, [language]);

  const { stage, connectionState, error } = useStagePolling();
  const arLastWhisper = useArLastWhisper();
  const [stage5VideoReady, setStage5VideoReady] = useState(false);
  const handleStage5VideoFrame = useCallback(() => {
    if (stage === 5) {
      setStage5VideoReady(true);
    }
  }, [stage]);
  const effectiveStageConfig = useEffectiveStageConfig(stage, { stage5VideoReady });
  const qosExperienceStage = isQosExperienceStage(stage);
  const qosFeed = useQosFeed(qosExperienceStage);
  const mockStage9Dialogs = getRuntimeConfig().mockStage9Dialogs === true;
  const qosDialogItems = mockStage9Dialogs
    ? STAGE9_MOCK_DIALOG_ITEMS
    : qosFeed.dialogItems;
  const postAnimationWhisperBaselineRef = useRef({ stage, whisper: arLastWhisper });
  const [postAnimationArSpeechText, setPostAnimationArSpeechText] = useState("");

  useEffect(() => {
    setStage5VideoReady(false);
  }, [stage]);

  useEffect(() => {
    postAnimationWhisperBaselineRef.current = { stage, whisper: arLastWhisper };
    setPostAnimationArSpeechText("");
  }, [stage]);

  useEffect(() => {
    if (stage <= 1 || stage === 8 || qosExperienceStage) {
      setPostAnimationArSpeechText("");
      postAnimationWhisperBaselineRef.current = { stage, whisper: arLastWhisper };
      return;
    }

    if (effectiveStageConfig.showArSpeech || !effectiveStageConfig.stageAnimationDone) {
      setPostAnimationArSpeechText("");
      postAnimationWhisperBaselineRef.current = { stage, whisper: arLastWhisper };
      return;
    }

    if (!arLastWhisper) {
      setPostAnimationArSpeechText("");
      postAnimationWhisperBaselineRef.current = { stage, whisper: "" };
      return;
    }

    const baseline = postAnimationWhisperBaselineRef.current;
    if (baseline.stage === stage && arLastWhisper !== baseline.whisper) {
      setPostAnimationArSpeechText(arLastWhisper);
      postAnimationWhisperBaselineRef.current = { stage, whisper: arLastWhisper };
    }
  }, [
    arLastWhisper,
    effectiveStageConfig.showArSpeech,
    effectiveStageConfig.stageAnimationDone,
    qosExperienceStage,
    stage,
  ]);

  const arSpeechText = effectiveStageConfig.showArSpeech
    ? arLastWhisper
    : postAnimationArSpeechText;
  const topologyAgentBubble = effectiveStageConfig.systemAgentBubble
    ? pinBubbleToSystemAgent(effectiveStageConfig.systemAgentBubble)
    : qosExperienceStage || stage === 10
    ? null
    : pinBubbleToSystemAgent(
        getWorkflowBubbleFromRows(effectiveStageConfig.workflow, stage)
      );
  const childAgentBubbles = [
    ...(effectiveStageConfig.agentBubble ? [effectiveStageConfig.agentBubble] : []),
    ...(effectiveStageConfig.agentBubbles || []),
  ];
  const panelComponents = {
    ARGlasses,
    ArRegistrationPanel,
    BackgroundVideoPanel,
    DogVisionStreams,
    HandoffPanel,
    RobotDog,
    SciFiPanel,
  };

  return (
    <div
      ref={appRootRef}
      className={`video-backed-ui h-screen w-screen text-white p-1.5 md:p-2 font-sans overflow-hidden flex items-stretch justify-stretch relative isolate ${language === "en" ? "lang-en" : "lang-zh"}`}
    >
      <WebRtcBackground />
      <div className="video-dim-overlay fixed inset-0 -z-10 bg-black/35 pointer-events-none" />
      <button
        type="button"
        aria-label="Toggle language"
        className="fixed right-4 top-4 z-[90] flex items-center gap-1 rounded-full border border-cyan-300/35 bg-slate-950/80 p-1 text-[11px] font-semibold tracking-[0.08em] text-slate-200 shadow-[0_0_18px_rgba(34,211,238,0.22)] backdrop-blur-md transition hover:border-cyan-200/70"
        onClick={() => setLanguage((current) => (current === "zh" ? "en" : "zh"))}
      >
        <span className={`rounded-full px-2 py-1 transition ${language === "zh" ? "bg-cyan-300 text-slate-950" : "text-slate-400"}`}>ZH</span>
        <span className={`rounded-full px-2 py-1 transition ${language === "en" ? "bg-cyan-300 text-slate-950" : "text-slate-400"}`}>EN</span>
      </button>
      {connectionState !== "connected" && (
        <div className="fixed bottom-3 right-3 z-50 max-w-[280px] rounded border border-amber-400/40 bg-slate-950/65 px-3 py-2 text-xs text-amber-100 backdrop-blur-md">
          Stage API: {connectionState}
          {error && <span className="block truncate text-amber-200/70">{error}</span>}
        </div>
      )}
      {/* 动画样式定义 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sampled-noise-shift {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.22; }
          25% { transform: translate3d(-1%, 1%, 0); opacity: 0.3; }
          50% { transform: translate3d(1%, -1%, 0); opacity: 0.2; }
          75% { transform: translate3d(0.5%, 0.5%, 0); opacity: 0.28; }
        }
        .sampled-video-noise {
          background-image: repeating-radial-gradient(circle at 35% 45%, rgba(186, 230, 253, 0.38) 0 0.7px, transparent 0.9px 3px);
          background-size: 7px 7px;
          animation: sampled-noise-shift 180ms steps(2, end) infinite;
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
        .lang-en {
          overflow-wrap: break-word;
          word-break: normal;
          hyphens: none;
        }
        .lang-en .whitespace-nowrap {
          white-space: normal;
        }
        .lang-en h1,
        .lang-en h2,
        .lang-en h3,
        .lang-en p,
        .lang-en span,
        .lang-en div {
          min-width: 0;
        }
        .lang-en .text-\\[13px\\],
        .lang-en .text-\\[12px\\],
        .lang-en .text-xs {
          line-height: 1.18;
        }
        .lang-en .tracking-\\[0\\.2em\\],
        .lang-en .tracking-\\[0\\.18em\\],
        .lang-en .tracking-\\[0\\.16em\\] {
          letter-spacing: 0.04em;
        }
        .lang-en .max-w-\\[120px\\],
        .lang-en .max-w-\\[130px\\],
        .lang-en .max-w-\\[140px\\] {
          max-width: 160px;
        }
        .completed-tasks-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .completed-tasks-scroll::-webkit-scrollbar {
          display: none;
        }
        .lang-en .task-brief-badge {
          width: 4.85rem;
          padding-left: 0.25rem;
          padding-right: 0.25rem;
          font-size: 10px;
          letter-spacing: 0;
          overflow-wrap: normal;
          word-break: normal;
          hyphens: none;
          white-space: normal;
        }
        .lang-en .task-brief-copy {
          overflow-wrap: normal;
          word-break: normal;
          hyphens: none;
        }
        .lang-en .status-row-label {
          white-space: nowrap;
          overflow-wrap: normal;
          word-break: normal;
          hyphens: none;
        }
        .lang-en .status-row {
          flex-wrap: wrap;
          align-items: baseline;
          row-gap: 0.15rem;
        }
        .lang-en .status-row-value-wrap {
          min-width: 0;
          flex-shrink: 1;
          white-space: normal;
        }
        .lang-en .status-panel-title {
          white-space: pre-line;
        }
        .lang-en .stage-plan-en-compact {
          scale: 0.93;
          transform-origin: 0 0;
        }
        .lang-en .core-functions-heading,
        .lang-en .core-functions-heading h3,
        .lang-en .core-functions-heading span {
          white-space: nowrap;
        }
        .lang-en .core-function-item-label {
          white-space: nowrap;
          overflow: visible;
          font-size: 12px;
          line-height: 1;
        }
        .lang-en .stepbar-id {
          white-space: nowrap;
          overflow-wrap: normal;
          word-break: normal;
          font-size: 1.25rem;
          line-height: 1;
        }
        .lang-en .stepbar-title {
          font-size: 1rem;
          line-height: 1.05;
        }
        .lang-en .stepbar-card:nth-child(4) .stepbar-title {
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .lang-en .stepbar-subtitle {
          font-size: 0.875rem;
          line-height: 1.05;
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
        @keyframes cp-tool-call-flash {
          0% {
            border-color: rgba(253, 230, 138, 0.58);
            background: rgba(252, 211, 77, 0.16);
            box-shadow: 0 0 14px rgba(251, 191, 36, 0.22);
            filter: brightness(1);
            transform: scale(1);
          }
          22% {
            border-color: rgba(255, 251, 235, 1);
            background: rgba(251, 191, 36, 0.48);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.96), 0 0 30px rgba(251, 191, 36, 0.9), inset 0 0 16px rgba(255, 251, 235, 0.34);
            filter: brightness(1.7) saturate(1.35);
            transform: scale(1.045);
          }
          100% {
            border-color: rgba(253, 230, 138, 0.74);
            background: rgba(252, 211, 77, 0.2);
            box-shadow: 0 0 18px rgba(251, 191, 36, 0.38);
            filter: brightness(1.08);
            transform: scale(1);
          }
        }
        @keyframes cp-tool-panel-flash {
          0% { filter: drop-shadow(0 0 0 rgba(251, 191, 36, 0)); }
          24% { filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.68)); }
          100% { filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.16)); }
        }
        .cp-tool-call-flash {
          animation: cp-tool-call-flash 0.72s ease-out both;
          position: relative;
          z-index: 2;
        }
        .cp-tool-panel-flash {
          animation: cp-tool-panel-flash 0.78s ease-out both;
        }
      `}} />

      {/* 主屏幕容器 - 整体升级为全毛玻璃HUD悬浮舱 */}
      <div className="relative flex h-full w-full max-w-none flex-col overflow-hidden rounded-xl border-2 border-cyan-300/55 bg-slate-950/38 p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.85),0_0_34px_rgba(34,211,238,0.18),0_28px_90px_rgba(0,0,0,0.72)] ring-1 ring-white/10 backdrop-blur-xl md:p-4">
        <div className="absolute inset-0 rounded-xl border border-slate-950/80 pointer-events-none" />
        <div className="absolute inset-[3px] rounded-[1.35rem] border border-blue-200/15 pointer-events-none" />
        
        {/* 顶部 Header */}
        <header className="relative z-10 mb-3 flex min-h-[60px] shrink-0 items-center justify-between">
          <div className="w-24" aria-hidden="true" />
          <div className="text-center absolute left-1/2 top-1/2 w-[calc(100%-12rem)] -translate-x-1/2 -translate-y-1/2">
            <h1 className={`text-3xl md:text-5xl font-bold tracking-widest text-white glow-text ${language === "zh" ? "mb-2" : "mb-0"}`}>
              {language === "en" ? "Next-Generation Core Network" : "下一代核心网"}
            </h1>
            {language === "zh" && (
              <p className="text-blue-200 font-medium text-sm md:text-base">
                Next-Generation Core Network
              </p>
            )}
          </div>
          <div className="w-24"></div>
        </header>

        {/* 核心内容区 */}
        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(380px,23vw)_minmax(0,1fr)_minmax(280px,20vw)]">
          
          <LeftPanel
            effectiveStageConfig={effectiveStageConfig}
            stage={stage}
            language={language}
            translateText={translateTextNodeValue}
            components={panelComponents}
            qosDialogItems={qosDialogItems}
            onStage5VideoFrame={handleStage5VideoFrame}
          />

          {/* 中间列：6G核心网静态平面架构与意图 NAS 入口 */}
          <div className="min-h-0">
            <NetworkTopology3D
              stage={stage}
              activeFlowType={effectiveStageConfig.activeFlowType}
              agentBubble={topologyAgentBubble}
              agentBubbles={childAgentBubbles}
              arSpeechText={arSpeechText}
              hideRobotDogSpeech={effectiveStageConfig.hideRobotDogSpeech}
              title={effectiveStageConfig.topologyTitle}
              topologyLines={effectiveStageConfig.topologyLines}
              workflow={effectiveStageConfig.workflow}
              highlightedNodes={effectiveStageConfig.highlightedNodes}
              stagePhaseKey={effectiveStageConfig.stagePhaseKey}
              qosMetrics={qosFeed.metrics}
              language={language}
              robotDogVisual={RobotDog}
            />
          </div>

          {/* 右列：关键步骤展示 */}
          <StepBar
            steps={effectiveStageConfig.steps}
            orientation="vertical"
            stage={stage}
            stagePhaseKey={effectiveStageConfig.stagePhaseKey}
            workflow={effectiveStageConfig.workflow}
          />

        </div>

        <CoreNetworkValuePanel />
      </div>
      {/* 底部反光效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/10 to-transparent -z-10 pointer-events-none transform scale-y-[-1] opacity-50 blur-xl"></div>
    </div>
  );
}
