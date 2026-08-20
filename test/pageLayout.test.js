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
  assert.match(appSource, /新一代核心网/);
  assert.doesNotMatch(appSource, /新一代新一代核心网/);
  assert.match(topologySource, /title = "数字身份申请"/);
  assert.doesNotMatch(`${appSource}\n${stageConfigSource}\n${topologySource}`, /核心网：(数字身份申请|生成式网络|Agent GW跨域互联|分配算力资源|算力卸载|随路QoS保障)/);
});

test("confirmed intent bubbles keep their two lines in English mode", () => {
  assert.match(appSource, /"收到意图:": "Intent received: "/);
  assert.match(appSource, /"意图校验通过": "Intent validation passed"/);
  assert.match(appSource, /"编排结果验收通过": "Orchestration result validation passed"/);
  assert.match(appSource, /"使用Sandbox Services Skill": "Use Sandbox Services Skill"/);
});

test("bottom value panel contains the core-network values from the reference", () => {
  [
    "智能体通信网络",
    "数字身份管理",
    "任务理解&技能路由",
    "动态专网建立",
    "Token 体验保障",
    "端网协同调度",
    "任务级快速（毫秒级）体验保障",
    "动态随路QoS",
    "基站用户容量提升3倍",
    "分布式算力网络",
    "端网协同分布式推理",
    "算力成本降低30%",
    "连接+算力协同调度",
    "任务成功率提升30%",
  ].forEach((text) => assert.ok(panelSource.includes(text), `missing value copy: ${text}`));
  assert.doesNotMatch(panelSource, /典型业务&价值/);
  assert.match(panelSource, /grid-cols-\[minmax\(0,1\.25fr\)_minmax\(0,1fr\)_minmax\(0,1\.08fr\)\]/);
  assert.match(panelSource, /aria-label="核心网价值能力"/);
  assert.doesNotMatch(panelSource, /AGENT FABRIC|TOKEN SLA|COMPUTE MESH/);
  assert.match(panelSource, /title: "Token 体验保障",\s+columns: 2,/);
  assert.doesNotMatch(panelSource, /效果：任务级快速|效果：基站用户容量/);
  assert.match(panelSource, /Bahnschrift_SemiCondensed/);
  assert.match(panelSource, /text-\[23px\] font-medium[^"]*text-\[#c7ebff\][^"]*xl:text-\[26px\]/);
  assert.match(panelSource, /text-\[13px\][^"]*font-medium[^"]*xl:text-\[15px\]/);
  assert.match(panelSource, /text-\[12px\] font-semibold[^"]*xl:text-sm/);
  assert.doesNotMatch(panelSource, /core-value-scan/);
  assert.doesNotMatch(appSource, /core-value-title-shimmer/);
  assert.doesNotMatch(panelSource, /cyber-hud-(?:card|corner)/);
  assert.doesNotMatch(cssSource, /\.cyber-hud-(?:card|corner)/);
  assert.doesNotMatch(panelSource, /⟨|⟩|>\/\/<|>\/\//);
  assert.doesNotMatch(panelSource, />\/\/<\/span>/);
  assert.doesNotMatch(cssSource, /@keyframes cyber-(?:pulse-glow|sheen-sweep)/);
  assert.match(cssSource, /\.cyber-tech-title \{[^}]*animation: none;[^}]*filter: none;[^}]*text-shadow:/s);
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
    "创建算力会话",
    "网络算力节点识别标注",
    "随路QoS保障",
  ].forEach((text) => assert.ok(panelSource.includes(text), `missing step detail: ${text}`));
  assert.match(panelSource, /const expandedStepIndex = workingStepIndex >= 0 \? workingStepIndex : latestCompletedStepIndex/);
  assert.match(panelSource, /const isExpanded = isVertical && stepIndex === expandedStepIndex && detailItems\.length > 0/);
  assert.match(panelSource, /\{isExpanded && \(/);
  assert.doesNotMatch(panelSource, /当前阶段小步骤/);
  assert.match(panelSource, /data-status=\{detailStatus\}/);
  assert.match(panelSource, /success: "已完成"/);
  assert.match(panelSource, /pending: "待完成"/);
});
