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
  assert.match(stageSource, /label: "IDM：\\n签发数字身份"/);
  assert.match(stageSource, /label: "ACF：\\n能力注册"/);
  assert.match(stageSource, /activeConnections: \["SystemAgent->IDM"\]/);
  assert.match(stageSource, /pathKey: "ACN->IDM", reverse: true/);
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
  assert.match(stageSource, /label: "CCF：\\n创建算力会话"/);
  assert.match(stageSource, /label: "CCF：\\n分配算力资源"/);
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
  assert.match(stageSource, /label: "CCF：\\n拉起沙箱用于清晰视频"/);
  assert.match(stageSource, /Planning Agent将清晰视频沙箱任务交给CCF/);
  assert.match(stageSource, /key: "stage5_ccf_dispatch"[\s\S]*SystemAgent->Computing/);
  assert.ok(
    stageSource.indexOf('key: "stage5_qoe_done"') < stageSource.indexOf('key: "stage5_ccf_dispatch"'),
    "Stage 5 must finish QoE assurance before the compute sandbox starts",
  );
  assert.match(stageSource, /tasks: \[\s*\{ label: "Connection Agent：\\nL2级通信保障"[\s\S]*\{ label: "CCF：\\n拉起沙箱用于清晰视频"/);
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
  assert.match(effectiveStageSource, /if \(stage === 9\)[\s\S]*agentBubbles: phase\.agentBubbles \|\| \[\]/);
});

test("non-Planning DAP completion stays in the execution bubble and appends orchestration acceptance", () => {
  assert.match(stageSource, /const ORCHESTRATION_ACCEPTANCE_COPY = "编排结果验收通过"/);
  assert.match(stageSource, /variant: "taskProgress"/);
  ["stage2_4_done"].forEach((phaseKey) => {
    assert.match(
      stageSource,
      new RegExp(`key: "${phaseKey}"[\\s\\S]*?agentBubbles: buildAcceptedTaskAgentBubbles\\(`),
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
