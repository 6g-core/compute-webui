import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const stageSource = readFileSync(
  new URL("../src/config/stageConfig.jsx", import.meta.url),
  "utf8",
);
const effectiveStageSource = readFileSync(
  new URL("../src/hooks/useEffectiveStageConfig.js", import.meta.url),
  "utf8",
);

test("identity issuance and capability registration use IDM and ACF", () => {
  assert.match(stageSource, /label: "IDM颁发数字身份:"[\s\S]*targetNode: "IDM"/);
  assert.match(stageSource, /label: "能力注册:"[\s\S]*融合ARF能力[\s\S]*targetNode: "ACN"/);
  assert.match(stageSource, /owner: "IDM", label: "签发数字身份"/);
  assert.match(stageSource, /owner: "ACF", label: "能力注册"/);
  assert.match(stageSource, /activeConnections: \["SystemAgent->IDM"\]/);
  assert.match(stageSource, /pathKey: "ACN->IDM", reverse: true/);
});

test("Stage 2 child agents report Tool outcomes without task dispatch or receipt copy", () => {
  const stage2Start = stageSource.indexOf("const STAGE2_INTENT_SUMMARY");
  const stage2End = stageSource.indexOf("const STAGE4_PHASE_TIMING");
  const stage2Source = stageSource.slice(stage2Start, stage2End);

  [
    "IDM Agent：调用IDM Tool完成数字身份签发",
    "ACF Agent：调用ARF Tool完成能力注册",
    "Connection Agent：调用AM Tool完成接入注册",
    "Connection Agent：调用SM Tool完成PDU会话创建",
  ].forEach((copy) => assert.ok(stage2Source.includes(copy), `missing Stage 2 child-agent copy: ${copy}`));
  assert.doesNotMatch(stage2Source, /发送.*任务|将.*任务交给|收到任务/);
  assert.match(stage2Source, /key: "stage2_4_dispatch"[\s\S]*buildStage2ChildAgentBubble/);
  assert.match(stage2Source, /key: "stage2_5_dispatch"[\s\S]*buildNetworkAccessAgentBubbles\("am"\)/);
});

test("ACF creates home-domain credentials with the ordered ACN Skill tool chain", () => {
  [
    "使用ACN Skill",
    "调用Subscription_tool",
    "调用Create_Or_Update_Subnet_Context_tool",
    "调用Issue_Access_Token_tool",
    "调用Validate_Access_Token_tool",
  ].forEach((copy) => assert.ok(stageSource.includes(copy), `missing ACN Skill copy: ${copy}`));
  assert.match(stageSource, /const buildAcnSkillAgentBubbles = \(step\) =>[\s\S]*targetNode: "ACN"[\s\S]*variant: "acnSkillProgress"[\s\S]*compactItems: true/);
  assert.match(stageSource, /activeTools: step === "subscription" \? \["UDM Tool"\] : \[\]/);
  ["skill", "subscription", "subnetContext", "issueToken", "validateToken", "done"].forEach((step) => {
    assert.match(stageSource, new RegExp(`agentBubbles: buildAcnSkillAgentBubbles\\("${step}"\\)`));
  });
  assert.match(stageSource, /subnetContext, status: progress\.subnetContext \}/);
  assert.doesNotMatch(stageSource, /subnetContext, status: progress\.subnetContext, fitOneLine/);
  assert.match(stageSource, /key: "stage4_4_subscription"[\s\S]*highlightedNodes: \["ACN"\][\s\S]*buildAcnSkillAgentBubbles\("subscription"\)/);
  assert.match(stageSource, /key: "stage4_4_subnet_context"[\s\S]*highlightedNodes: \["ACN"\][\s\S]*buildAcnSkillAgentBubbles\("subnetContext"\)/);
  assert.match(stageSource, /key: "stage4_4_issue_token"[\s\S]*highlightedNodes: \["ACN"\][\s\S]*buildAcnSkillAgentBubbles\("issueToken"\)/);
  assert.match(stageSource, /key: "stage4_4_validate_token"[\s\S]*highlightedNodes: \["ACN"\][\s\S]*buildAcnSkillAgentBubbles\("validateToken"\)/);
});

test("physical subnet configuration calls the PDU session tool while SM and the UPF path stay active", () => {
  assert.match(stageSource, /const buildPduSessionAgentBubbles = \(step\) =>[\s\S]*调用Create_Subnet_PDUSession_tool[\s\S]*activeTools: step === "working" \? \["SM Tool"\] : \[\]/);
  assert.match(stageSource, /key: "stage4_5_sm"[\s\S]*activeConnections: \["ConnectionAgent->UPF"\][\s\S]*buildPduSessionAgentBubbles\("working"\)/);
  assert.match(stageSource, /key: "stage4_5_done"[\s\S]*buildPduSessionAgentBubbles\("done"\)/);
});

test("compute orchestration is owned by the merged CCF", () => {
  assert.match(stageSource, /CCF收到任务：创建算力会话/);
  assert.match(stageSource, /owner: "CCF", label: "创建算力会话"/);
  assert.match(stageSource, /owner: "CCF", label: "分配算力资源"/);
  assert.doesNotMatch(stageSource, /CMF Tool|Computing Agent|ACN Agent|System Agent/);
});

test("Stage 5 and Stage 7 CCF use the ordered Sandbox Services Skill tool chain", () => {
  [
    "使用Sandbox Services Skill",
    "调用Select_Sandbox_Images_tool",
    "调用Select_Computing_Site_tool",
    "调用Select_Computing_Resources_tool",
    "调用Generate_Sandbox_Template_tool",
    "调用Validate_Sandbox_Template_tool",
    "调用Create_or_Update_Sandbox_Service_tool",
  ].forEach((copy) => assert.ok(stageSource.includes(copy), `missing Sandbox Services copy: ${copy}`));
  assert.match(stageSource, /variant: "sandboxServices"/);
  assert.match(stageSource, /dapTop: "44\.5%"/);
  assert.match(stageSource, /sandboxFocusIndex: activeIndex/);
  assert.doesNotMatch(stageSource, /marqueeItems: true|marquee: true/);
  assert.match(stageSource, /const SANDBOX_SERVICES_STEPS = \["images", "site", "resources", "template", "validate", "service"\]/);
  ["skill", "images", "site", "resources", "template", "validate", "service", "done"].forEach((step) => {
    const calls = stageSource.match(new RegExp(`buildSandboxServicesAgentBubbles\\("${step}"\\)`, "g")) || [];
    assert.equal(calls.length, 2, `${step} must be shown in both Stage 5 and Stage 7`);
  });
  assert.match(stageSource, /owner: "CCF", label: "拉起沙箱用于清晰视频"/);
  assert.match(stageSource, /Planning Agent将清晰视频沙箱任务交给CCF/);
  assert.match(stageSource, /key: "stage5_ccf_dispatch"[\s\S]*SystemAgent->Computing/);
  assert.ok(
    stageSource.indexOf('key: "stage5_qoe_done"') < stageSource.indexOf('key: "stage5_ccf_dispatch"'),
    "Stage 5 must finish QoE assurance before the compute sandbox starts",
  );
  assert.match(stageSource, /tasks: \[\s*\{ owner: "连接智能体", label: "L2级通信保障"[\s\S]*\{ owner: "CCF", label: "拉起沙箱用于清晰视频"/);
});

test("stage 6 keeps Agent GW bubbles visible long enough for the demo", () => {
  assert.match(stageSource, /label: "ID寻址路由:"[\s\S]*targetNode: "AgentGW"[\s\S]*placement: "left"[\s\S]*offsetX: -4\.5[\s\S]*activeTools: \["A2A GW Tool"\]/);
  assert.match(stageSource, /label: "Agent协议转换:"[\s\S]*targetNode: "AgentGW"[\s\S]*placement: "left"[\s\S]*offsetX: -4\.5[\s\S]*activeTools: \["A2A GW Tool"\]/);
  assert.match(stageSource, /6: \{ workingMs: 1100, successMs: 350 \}/);
});

test("every Planning Agent intent acknowledgement uses the validated two-line format", () => {
  assert.match(stageSource, /const buildConfirmedIntentLines = \(intent\) => \[\s*`收到意图:\$\{intent\}`,\s*"意图校验通过",\s*\]/);
  [
    "Apply for the Digital ID",
    "Create Home Domain",
    "Share Video",
    "Compute offloading for object recognition",
  ].forEach((intent) => {
    assert.match(stageSource, new RegExp(`lines: buildConfirmedIntentLines\\("${intent}"\\)`));
  });
  assert.equal((stageSource.match(/variant: "intentValidation"/g) || []).length, 4);
  assert.doesNotMatch(stageSource, /lines: \["收到意图：",/);
});

test("L1, L2, L3, and in-path QoS share the detailed QoE assurance sequence", () => {
  assert.match(stageSource, /title: "使用QoE_assurance Skill"/);
  assert.match(stageSource, /analytic: "调用QoE_Analytic_tool"/);
  assert.match(stageSource, /decision: "调用QoS_Policy_Decision_tool"/);
  assert.match(stageSource, /QOE_ASSURANCE_PROGRESS = \{[\s\S]*skill: \{ analytic: "pending", decision: "pending" \}[\s\S]*analytic: \{ analytic: "working", decision: "pending" \}[\s\S]*decision: \{ analytic: "success", decision: "working" \}[\s\S]*done: \{ analytic: "success", decision: "success" \}/);
  assert.match(stageSource, /return \[\{[\s\S]*variant: "qoeAssurance"[\s\S]*items: \[[\s\S]*status: progress\.analytic[\s\S]*status: progress\.decision[\s\S]*ORCHESTRATION_ACCEPTANCE_COPY[\s\S]*activeTools: \["analytic", "decision"\]\.includes\(step\) \? \["Policy Tool"\] : \[\]/);

  ["skill", "analytic", "decision", "done"].forEach((step) => {
    const calls = stageSource.match(new RegExp(`buildQoeAssuranceAgentBubbles\\("${step}"\\)`, "g")) || [];
    const expectedCalls = step === "skill" ? 7 : 4;
    assert.equal(calls.length, expectedCalls, `${step} must cover L1, L2, L3, and in-path QoS phases`);
  });

  ["stage4_6_dispatch", "stage5_connection_dispatch", "stage7_5_policy_dispatch"].forEach((phaseKey) => {
    assert.match(
      stageSource,
      new RegExp(`key: "${phaseKey}"[\\s\\S]*?agentBubbles: buildQoeAssuranceAgentBubbles\\("skill"\\)`),
      `${phaseKey} must show the unified QoE bubble immediately`,
    );
  });

  [
    "stage4_6_skill",
    "stage4_6_analytic",
    "stage4_6_decision",
    "stage5_qoe_skill",
    "stage5_qoe_analytic",
    "stage5_qoe_decision",
    "stage7_5_qoe_skill",
    "stage7_5_qoe_analytic",
    "stage7_5_qoe_decision",
    "stage9_qos_policy_decision",
  ].forEach((phaseKey) => assert.ok(stageSource.includes(`key: "${phaseKey}"`), `missing phase: ${phaseKey}`));
  assert.match(effectiveStageSource, /if \(isQosExperienceStage\(stage\)\)[\s\S]*agentBubbles: hideStage23Overlays \? \[\] : phase\.agentBubbles \|\| \[\]/);
});

test("stage 9 restores the Planning Agent orchestration bubble with phase progress", () => {
  assert.match(stageSource, /const STAGE9_PLAN_PROGRESS = \{[\s\S]*uplink:[\s\S]*downlink:[\s\S]*decision:[\s\S]*done:/);
  assert.match(stageSource, /const STAGE22_PLANNING_BUBBLE_PRESET = \{[\s\S]*variant: "stage2SystemPlan"[\s\S]*positionKey: "stage22-planning"[\s\S]*compact: true[\s\S]*orientation: "vertical"[\s\S]*tone: "dapGlass"[\s\S]*heading: "Planning Agent"/);
  assert.match(stageSource, /const buildStage9SystemPlanBubble = \(step\) =>[\s\S]*\.\.\.STAGE22_PLANNING_BUBBLE_PRESET[\s\S]*title: "随路QoS保障"/);
  assert.match(stageSource, /连接智能体[\s\S]*端侧QoE感知[\s\S]*QoS策略工具[\s\S]*保障策略生成[\s\S]*RAN \/ UPF[\s\S]*随路路径建立/);
  for (const builder of ['buildStage2SystemPlanBubble', 'buildStage4SystemPlanBubble', 'buildStage5SystemPlanBubble', 'buildStage7SystemPlanBubble']) {
    assert.match(stageSource, new RegExp(`const ${builder} = [\\s\\S]*?\\.\\.\\.STAGE22_PLANNING_BUBBLE_PRESET`));
  }
  assert.equal((stageSource.match(/systemAgentBubble: buildStage9SystemPlanBubble\(/g) || []).length, 4);
  assert.match(effectiveStageSource, /if \(isQosExperienceStage\(stage\)\)[\s\S]*const planningTaskComplete = phase\.key === "stage9_qos_clear"[\s\S]*systemAgentBubble: hideStage23Overlays \|\| planningTaskComplete \? null : phase\.systemAgentBubble \|\| null/);
  assert.match(effectiveStageSource, /isFrozenFinalStage = stage === 21 \|\| stage === 22 \|\| stage === 23 \|\| stage === 24[\s\S]*STAGE9_QOS_PHASES\.length - 1/);
  assert.match(effectiveStageSource, /hideStage23Overlays = stage === 23[\s\S]*systemAgentBubble: hideStage23Overlays \|\| planningTaskComplete \? null[\s\S]*agentBubbles: hideStage23Overlays \? \[\]/);
  assert.match(stageSource, /STAGE_CONFIG\[21\] = \{[\s\S]*STAGE_CONFIG\[9\][\s\S]*STAGE_CONFIG\[22\] = \{[\s\S]*STAGE_CONFIG\[21\][\s\S]*STAGE_CONFIG\[23\] = \{[\s\S]*STAGE_CONFIG\[22\]/);
  assert.match(stageSource, /STAGE_CONFIG\[24\] = \{[\s\S]*STAGE_CONFIG\[22\][\s\S]*enhancedDogVisionLabel: "保障视频效果"[\s\S]*title: "随路QoS保障"/);
});

test("completed sub-agent execution briefly returns to Planning and then clears it", () => {
  assert.match(stageSource, /key: "stage2_6"[\s\S]*systemAgentBubble: buildStage2SystemPlanBubble\(\{ idmStatus: "success", acfStatus: "success", connectionStatus: "success" \}\)/);
  assert.match(stageSource, /key: "stage4_6"[\s\S]*systemAgentBubble: buildStage4SystemPlanBubble\(\{ acfStatus: "success", connectionStatus: "success", policyStatus: "success" \}\)/);
  assert.match(stageSource, /key: "stage7_5"[\s\S]*systemAgentBubble: buildStage7SystemPlanBubble\(\{ computingStatus: "success", policyStatus: "success" \}\)/);
  assert.match(stageSource, /key: "stage5_6"[\s\S]*systemAgentBubble: buildStage5SystemPlanBubble\(\{ connectionStatus: "success", sandboxStatus: "success" \}\)/);
  assert.doesNotMatch(stageSource, /lines: \["Task Finished"\]/);
  assert.ok((effectiveStageSource.match(/systemAgentBubble: hideFinalFlash \? null : phase\.systemAgentBubble \|\| null/g) || []).length >= 3);
  assert.match(effectiveStageSource, /systemAgentBubble: stage5Prewarming \|\| hideFinalFlash[\s\S]*\? null[\s\S]*: phase\.systemAgentBubble \|\| null/);
  assert.match(stageSource, /key: "stage9_qos_clear"[\s\S]*systemAgentBubble: null[\s\S]*agentBubbles: \[\]/);
});

test("non-Planning DAP completion stays in the execution bubble and appends orchestration acceptance", () => {
  assert.match(stageSource, /const ORCHESTRATION_ACCEPTANCE_COPY = "编排结果验收通过"/);
  assert.match(stageSource, /variant: "taskProgress"/);
  ["stage2_4_done"].forEach((phaseKey) => {
    assert.match(
      stageSource,
      new RegExp(`key: "${phaseKey}"[\\s\\S]*?agentBubbles: buildStage2ChildAgentBubble\\(`),
      `${phaseKey} must retain its execution rows and append acceptance`,
    );
  });
  assert.match(stageSource, /key: "stage2_5_done"[\s\S]*buildNetworkAccessAgentBubbles\("done"\)/);
  assert.match(stageSource, /key: "stage4_5_done"[\s\S]*buildPduSessionAgentBubbles\("done"\)/);
  ["stage4_4_done", "stage4_6_done", "stage5_qoe_done", "stage5_sandbox_done", "stage7_4_done", "stage7_5_policy_done", "stage9_qos_done"].forEach((phaseKey) => {
    assert.match(
      stageSource,
      new RegExp(`key: "${phaseKey}"[\\s\\S]*?agentBubbles: build(?:AcnSkill|QoeAssurance|SandboxServices)AgentBubbles\\("done"\\)`),
      `${phaseKey} must finish in its existing Skill bubble`,
    );
  });
  assert.match(stageSource, /key: "stage9_qos_clear"[\s\S]*?agentBubbles: \[\]/);
  [
    "能力注册完成",
    "完成接入网络",
    "完成家庭域凭证任务",
    "完成物理组网配置",
    "完成L1级通信保障",
    "完成L2级通信保障",
    "完成L3级通信保障",
    "完成任务：创建算力会话",
  ].forEach((copy) => assert.doesNotMatch(stageSource, new RegExp(`lines: \\["${copy}`)));
});
