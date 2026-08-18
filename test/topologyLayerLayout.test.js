import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);

test("topology uses stacked CP, DAP, and UP layers", () => {
  assert.match(source, /key: "cp",[\s\S]*label: "CP",[\s\S]*top-\[1%\] h-\[18%\]/);
  assert.match(source, /key: "dap",[\s\S]*label: "DAP",[\s\S]*top-\[20%\] h-\[42%\]/);
  assert.match(source, /key: "up",[\s\S]*label: "UP",[\s\S]*top-\[63%\] h-\[36%\]/);
});

test("DAP keeps the three destination agents in one vertical branch", () => {
  assert.match(source, /SRF: \{[^\n]*x: 41\.5, y: 51/);
  assert.match(source, /SystemAgent: \{[^\n]*x: 56\.5, y: 50/);
  assert.match(source, /ConnectionAgent: \{[^\n]*x: 79, y: 27/);
  assert.match(source, /ACN: \{[^\n]*x: 79, y: 41/);
  assert.match(source, /name: "Computing Agent",[\s\S]*x: 79,[\s\S]*y: 54,/);
});

test("right-side agent bubbles sit beside their nodes", () => {
  assert.match(source, /RIGHT_SIDE_AGENT_BUBBLE_KEYS = new Set\(\["ConnectionAgent", "ACN", "Computing"\]\)/);
  assert.match(source, /const placement = isRightSideAgentBubble \? "right" : requestedPlacement/);
  assert.match(source, /translate\(54px, -50%\)/);
});

test("CP tool panel lays out both tool groups horizontally", () => {
  const start = source.indexOf("const UnifiedToolPanel =");
  const end = source.indexOf("const QosMetricsChart =", start);
  const panelSource = source.slice(start, end);

  assert.match(panelSource, /left-\[37%\] top-\[2\.5%\].*h-\[15%\] w-\[59%\]/);
  assert.match(panelSource, /items-stretch gap-3 text-blue-50/);
  assert.doesNotMatch(panelSource, /overflow-hidden rounded-xl border/);
  assert.doesNotMatch(panelSource, /rounded-lg border border-cyan-200\/14/);
  assert.match(source, /title: "Agentic Base",\s*columns: 3,/);
  assert.match(source, /title: "Beyond Connectivity",\s*columns: 1,/);
  assert.match(panelSource, /gridTemplateColumns: `repeat\(\$\{group\.columns\}, minmax\(0, 1fr\)\)`/);
  assert.match(panelSource, /gridTemplateRows: "repeat\(2, minmax\(0, 1fr\)\)"/);
  assert.match(panelSource, /text-\[13px\]/);
  assert.match(panelSource, /text-\[14px\]/);
  assert.match(panelSource, /text-\[10px\]/);
  assert.match(panelSource, /\{name\}/);
  assert.match(panelSource, /hasWorkingTool/);
  assert.match(panelSource, /cp-tool-panel-flash/);
  assert.match(panelSource, /cp-tool-call-flash/);
  assert.match(source, /title: "Agentic Base"/);
  assert.match(source, /title: "Beyond Connectivity"/);
});

test("SystemAgent plan bubbles stay below the DAP top boundary", () => {
  assert.match(source, /bubble\.variant === "stage2SystemPlan"[\s\S]*mergedStyle\.left = "39%"[\s\S]*mergedStyle\.top = "22%"/);
  assert.match(source, /bubble\.title === "Apply for the Digital ID"[\s\S]*mergedStyle\.top = "23%"/);
});

test("robot-dog intent uses a horizontal arrow into the DAP boundary", () => {
  assert.match(source, /const IntentEntryArrow =/);
  assert.match(source, /left-\[13\.5%\] top-\[31%\].*w-\[18\.5%\]/);
  assert.match(source, /aria-label="意图入口"/);
  assert.match(source, /意图入口/);
  assert.match(source, /text-amber-300/);
  assert.match(source, /h-1 .*from-amber-400\/45.*to-amber-200/);
  assert.match(source, /<IntentEntryArrow \/>/);
});

test("ordinary traffic uses particles while stage 9 owns the Token Tunnel", () => {
  assert.match(source, /const TOKEN_TUNNEL_CONNECTIONS = \[\s*\["UE", "gNB"\],\s*\["gNB", "UPF"\],\s*\["UPF", "Gateway"\],\s*\]/);
  assert.match(source, /shouldShowTokenTunnel\(stage\)/);
  assert.match(source, /Token Tunnel/);
  assert.match(source, /strokeDasharray="1\.8 4\.6"/);
  assert.match(source, /strokeWidth="0\.68"/);
  assert.match(source, /key=\{`token-tunnel-\$\{key\}`\}[\s\S]*stroke="#22f5ff"[\s\S]*filter="url\(#topology-line-glow\)"/);
  assert.match(source, /TOKEN_TUNNEL_CONNECTION_KEYS\.has\(pathKey\)/);
  assert.match(source, /topology-flow_1\.05s_linear_infinite_reverse/);
});
