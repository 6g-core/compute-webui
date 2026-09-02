import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);
const panelSource = readFileSync(
  new URL("../src/components/DemoPanels.jsx", import.meta.url),
  "utf8",
);
const cssSource = readFileSync(
  new URL("../src/index.css", import.meta.url),
  "utf8",
);
const stageConfigSource = readFileSync(
  new URL("../src/config/stageConfig.jsx", import.meta.url),
  "utf8",
);
const topologySource = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);

test("main content keeps the demo, topology, and steps in three columns", () => {
  assert.match(
    appSource,
    /md:grid-cols-\[minmax\(380px,23vw\)_minmax\(0,1fr\)_minmax\(280px,20vw\)\]/,
  );
  assert.match(appSource, /<StepBar[\s\S]*steps=\{effectiveStageConfig\.steps\}[\s\S]*orientation="vertical"[\s\S]*stagePhaseKey=\{effectiveStageConfig\.stagePhaseKey\}[\s\S]*workflow=\{effectiveStageConfig\.workflow\}[\s\S]*\/>/);
  assert.equal((appSource.match(/<StepBar\b/g) || []).length, 1);
  assert.ok(appSource.indexOf("<LeftPanel") < appSource.indexOf("<NetworkTopology3D"));
  assert.ok(appSource.indexOf("<NetworkTopology3D") < appSource.indexOf("<StepBar"));
  assert.ok(appSource.indexOf("<StepBar") < appSource.indexOf("<CoreNetworkValuePanel"));
});

test("page and topology headings use the revised core-network copy", () => {
  assert.match(appSource, /下一代核心网/);
  assert.doesNotMatch(appSource, /新一代核心网/);
  assert.match(topologySource, /title = ['"]数字身份申请['"]/);
  assert.doesNotMatch(`${appSource}\n${stageConfigSource}\n${topologySource}`, /核心网：(数字身份申请|生成式网络|Agent GW跨域互联|分配算力资源|算力卸载|随路QoS保障)/);
});

test("confirmed intent bubbles keep their two lines in English mode", () => {
  assert.match(appSource, /"收到意图:": "Intent received: "/);
  assert.match(appSource, /"意图校验通过": "Intent validation passed"/);
  assert.match(appSource, /"编排结果验收通过": "Orchestration result validation passed"/);
  assert.match(appSource, /"使用Sandbox Services Skill": "Use Sandbox Services Skill"/);
});

test("bottom value panel recreates the supplied reference as native markup", () => {
  assert.match(panelSource, /aria-label="核心网价值能力"/);
  assert.doesNotMatch(panelSource, /77\.png|coreNetworkValueBanner/);
  [
    "个人专网",
    "通信对象：人 → 智能体",
    "跨生态安全互信",
    "围绕人的群智协同",
    "统一数字身份",
    "绑定SIM卡",
    "AI任务低时延",
    "差异化体验保障：面向人 → 面向AI任务",
    "Token通道",
    "E2E时延 &lt; 400ms",
    "智能体通信网络",
    "数据路径：南-北 → 东-西",
    "免公网绕行",
  ].forEach((text) => assert.ok(panelSource.includes(text), `missing reference copy: ${text}`));
  assert.match(panelSource, /const HumanAgentTaskMap =/);
  assert.match(panelSource, /const TokenChannel =/);
  assert.match(panelSource, /const AgentCommunicationMap =/);
  assert.match(panelSource, /import personalNetworkDiagram from '\.\.\/\.\.\/88\.png';/);
  assert.match(panelSource, /import agentCommunicationDiagram from '\.\.\/\.\.\/89\.png';/);
  assert.match(panelSource, /core-network-value-panel[^\n]*h-\[22vh\] min-h-\[200px\] max-h-\[260px\]/);
  assert.equal((panelSource.match(/h-auto max-h-\[110px\] w-auto max-w-full object-contain xl:max-h-\[118px\]/g) || []).length, 2);
  assert.match(panelSource, /grid-cols-\[max-content_minmax\(180px,240px\)\] justify-center/);
  assert.match(panelSource, /grid-cols-\[minmax\(170px,230px\)_max-content\] justify-center/);
  assert.match(panelSource, /flex w-\[72%\] items-center justify-center/);
  assert.doesNotMatch(panelSource, /HuaweiSignature|HUAWEI|aria-label="Huawei"/i);
});

test("right step panel uses the concise title and explains every major stage", () => {
  assert.match(panelSource, /aria-label="关键步骤展示"/);
  assert.doesNotMatch(panelSource, /关键步骤动态显示/);
  assert.match(panelSource, /const STEP_DETAIL_ITEMS = \{/);
  ["01", "02", "03", "04", "05"].forEach((stepId) => {
    assert.match(panelSource, new RegExp(`"${stepId}": \\[`));
  });
  [
    "颁发数字身份",
    "创建家庭域",
    "身份可信认证",
    "端网协同",
    "确定性体验",
    "随路QoS保障",
    "机器狗通知机械臂开始协作",
    "机器狗前往交接区域",
    "机械臂交接快递给机器狗",
    "机器狗交付",
  ].forEach((text) => assert.ok(panelSource.includes(text), `missing step detail: ${text}`));
  [
    "跨域智能体认证",
    "Token tunnel保障",
    "跨域智能体协作",
  ].forEach((text) => assert.ok(stageConfigSource.includes(text), `missing step title: ${text}`));
  assert.equal((stageConfigSource.match(/title: "跨域智能体认证"/g) || []).length, 3);
  assert.equal((stageConfigSource.match(/title: "Token tunnel保障"/g) || []).length, 3);
  assert.equal((stageConfigSource.match(/title: "跨域智能体协作"/g) || []).length, 3);
  assert.match(panelSource, /"04": \["端网协同", "确定性体验", "随路QoS保障"\]/);
  assert.match(
    panelSource,
    /"05": \["机器狗通知机械臂开始协作", "机器狗前往交接区域", "机械臂交接快递给机器狗", "机器狗交付"\]/,
  );
  assert.match(panelSource, /const expandedStepIndex = workingStepIndex >= 0 \? workingStepIndex : latestCompletedStepIndex/);
  assert.match(panelSource, /const isExpanded = isVertical && stepIndex === expandedStepIndex && detailItems\.length > 0/);
  assert.match(panelSource, /\{isExpanded && \(/);
  assert.doesNotMatch(panelSource, /当前阶段小步骤/);
  assert.match(panelSource, /data-status=\{detailStatus\}/);
  assert.match(panelSource, /success: "已完成"/);
  assert.match(panelSource, /pending: "待完成"/);
  assert.match(panelSource, /const STAGE24_PLANNING_DETAIL_ITEMS = \[[\s\S]*连接智能体：端侧QoE感知[\s\S]*QoS策略工具：保障策略生成[\s\S]*RAN \/ UPF：保障通道建立/);
  assert.match(panelSource, /Number\(stage\) === 24 && step\.id === "04"/);
});
