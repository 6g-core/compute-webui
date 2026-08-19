import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);

test("topology uses stacked CP, DAP, and UP layers", () => {
  assert.match(source, /key: "cp",[\s\S]*label: "CP",[\s\S]*left-\[37%\] top-\[1%\] h-\[11\.5%\] w-\[61%\]/);
  assert.match(source, /key: "dap",[\s\S]*label: "DAP",[\s\S]*left-\[37%\] top-\[14\.5%\] h-\[51\.5%\]/);
  assert.match(source, /key: "up",[\s\S]*label: "UP",[\s\S]*top-\[67%\] h-\[32%\]/);
});

test("SRF sits outside DAP and all NFs share one unpartitioned DAP plane", () => {
  assert.match(source, /gNB: \{[^\n]*x: 20, y: 55/);
  assert.match(source, /SRF: \{[^\n]*x: 29\.5, y: 49/);
  assert.match(source, /ACN: \{ name: "ACF"/);
  assert.match(source, /SystemAgent: \{ name: "Planning\\nAgent", x: 42, y: 39/);
  assert.match(source, /ConnectionAgent: \{ name: "Connection\\nAgent", x: 51\.3, y: 39/);
  assert.match(source, /ACN: \{ name: "ACF", x: 60\.6, y: 39/);
  assert.match(source, /DCF: \{ name: "DCF", x: 68, y: 39/);
  assert.match(source, /DSF: \{ name: "DSF", x: 75\.2, y: 39/);
  assert.match(source, /IDM: \{ name: "IDM", x: 82\.4, y: 39/);
  assert.match(source, /name: "CCF",[\s\S]*x: 91\.5,[\s\S]*y: 39/);
  assert.doesNotMatch(source, /Data Control|Data Storage|Identity Management|Computing Control/);
  assert.doesNotMatch(source, /DAP_SUBZONES|data-topology-subzone/);
  assert.doesNotMatch(source, /Intelligent NFs|Data NFs|Computing NFs/);
});

test("DAP NFs all attach to the DAP bus and active paths are bus-routed", () => {
  assert.match(source, /const DAP_BUS = \{ startX: 38\.5, endX: 96\.5, y: 22\.5 \}/);
  assert.match(source, /DAP_BUS_BRANCHES = \{[\s\S]*SRF: \{ tapX: 38\.5[\s\S]*SystemAgent: \{ tapX: 42[\s\S]*Computing: \{ tapX: 91\.5/);
  assert.match(source, /DAP_BUS_CONNECTIONS = Object\.keys\(DAP_BUS_BRANCHES\)/);
  assert.match(source, /aria-label="DAP Bus"/);
  assert.match(source, /!startsInDap && !endsInDap/);
  assert.match(source, /const getDapBusBranchAnchor = \(nodeKey\) =>/);
  assert.match(source, /y: node\.y \+ branch\.anchorOffsetY/);
  assert.match(source, /buildDapBusBranchPath\(nodeKey\)/);
  assert.match(source, /return `M \$\{anchor\.x\} \$\{anchor\.y\} L \$\{tap\.x\} \$\{tap\.y\}`/);
  assert.match(source, /const startAnchor = DAP_BUS_BRANCHES\[from\][\s\S]*getDapBusBranchAnchor\(from\)/);
  assert.match(source, /const endAnchor = DAP_BUS_BRANCHES\[to\][\s\S]*getDapBusBranchAnchor\(to\)/);
  assert.match(source, /return \[\s*startAnchor,[\s\S]*endAnchor,\s*\]/);
  assert.match(source, /index === 0 \? "M" : "L"/);
  assert.match(source, /M \$\{DAP_BUS\.startX\} \$\{DAP_BUS\.y\} L \$\{DAP_BUS\.endX\} \$\{DAP_BUS\.y\}/);
  assert.doesNotMatch(source, /getDapBusCurveSegment|startControlY|busControl/);
  assert.match(source, /\[stage, activeFlowType, topologyLines, latencySampleTick\]/);
  assert.match(source, /DAP_BUS_BRANCHES\[connection\[0\]\] && DAP_BUS_BRANCHES\[connection\[1\]\]/);
  assert.match(source, /stroke="#cbd5e1"[\s\S]*strokeWidth="0\.35"[\s\S]*strokeDasharray="1\.2 1\.1"/);
  assert.doesNotMatch(source, />\s*DAP Bus\s*</);
});

test("CP tool panel keeps only AM, SM, Policy, and UDM", () => {
  const start = source.indexOf("const UnifiedToolPanel =");
  const end = source.indexOf("const QosMetricsChart =", start);
  const panelSource = source.slice(start, end);

  assert.match(source, /const CP_TOOL_ITEMS = \["AM Tool", "SM Tool", "Policy Tool", "UDM Tool"\]/);
  assert.match(panelSource, /left-\[42%\] top-\[2\.3%\].*h-\[7\.6%\] w-\[55%\] grid-cols-4/);
  assert.doesNotMatch(panelSource, /Agentic Base/);
  assert.doesNotMatch(panelSource, /Beyond Connectivity/);
  assert.doesNotMatch(panelSource, /IDM Tool|ARF Tool|CMF Tool|CSPF Tool/);
  assert.match(panelSource, /left-1\/2 top-\[43%\][\s\S]*-translate-x-1\/2 -translate-y-1\/2[\s\S]*text-\[14px\]/);
  assert.doesNotMatch(panelSource, /items-center justify-start/);
  assert.match(panelSource, /text-\[14px\]/);
  assert.match(panelSource, /text-\[10px\]/);
  assert.match(panelSource, /name\.replace\(\/\\s\+Tool\$\/, ""\)/);
  assert.match(panelSource, /absolute bottom-1\.5 right-1\.5 rounded border[\s\S]*text-\[10px\][\s\S]*Tool/);
  assert.match(panelSource, /hasWorkingTool/);
  assert.match(panelSource, /cp-tool-panel-flash/);
  assert.match(panelSource, /cp-tool-call-flash/);
});

test("DAP functions use borderless icons without descriptive subtitles", () => {
  const compactStart = source.indexOf("if (value.compact)");
  const compactEnd = source.indexOf("return (", source.indexOf("return (", compactStart) + 1);
  const compactSource = source.slice(compactStart, compactEnd);

  assert.match(compactSource, /relative flex w-\[96px\] flex-col items-center px-1 py-1/);
  assert.match(compactSource, /h-\[72px\] w-\[88px\] object-contain/);
  assert.match(compactSource, /text-\[14px\]/);
  assert.doesNotMatch(compactSource, /rounded-lg border|bg-slate-950\/88|value\.description/);
  assert.match(source, /UPF: \{[^\n]*size: "w-20 md:w-24 2xl:w-32"/);
  assert.match(source, /AgentGW: \{[^\n]*size: "w-16 md:w-20 2xl:w-28"/);
  assert.match(source, /OttAgentGW: \{[^\n]*size: "w-16 md:w-20 2xl:w-28"/);
  assert.match(source, /MarketAgent: \{[^\n]*size: "w-16 md:w-20 2xl:w-28"/);
  assert.match(source, /Gateway: \{[^\n]*size: "w-16 md:w-20 2xl:w-28"/);
});

test("DAP agent bubbles use shared lanes and give CCF a wider execution area", () => {
  assert.match(source, /const isDapAgentBubble = DAP_NF_KEYS\.has\(bubble\.targetNode\)/);
  assert.match(source, /width: dapBubbleGroup\.width/);
  assert.doesNotMatch(source, /isDapSystemIntentBubble|width: .*38\.5%.*dapBubbleGroup/);
  assert.match(source, /const placement = isDapAgentBubble \? "below" : requestedPlacement/);
  assert.match(source, /const DAP_BUBBLE_GROUPS = \{[\s\S]*intelligent: \{ left: "39\.2%", top: "46\.5%", width: "24\.1%" \}[\s\S]*data: \{ left: "65\.2%"[\s\S]*computing: \{ left: "78\.5%", top: "46\.5%", width: "18%" \}/);
  assert.doesNotMatch(source, /DAP_WIDE_COMPUTING_BUBBLE_GROUP/);
  assert.match(source, /SystemAgent: "intelligent"[\s\S]*ConnectionAgent: "intelligent"[\s\S]*ACN: "intelligent"[\s\S]*DCF: "data"[\s\S]*DSF: "data"[\s\S]*IDM: "data"[\s\S]*Computing: "computing"/);
  assert.match(source, /dapBubbleGroup\.left[\s\S]*dapBubbleGroup\.top[\s\S]*dapBubbleGroup\.width/);
  assert.match(source, /activeDapBubbleByGroup[\s\S]*groups\[group\] = bubble[\s\S]*activeDapBubbleByGroup\[group\] === bubble/);
  assert.doesNotMatch(source, /activeDapBubbleByGroup\[zone\.key\].*opacity-0/);
  assert.match(source, /up-planning[\s\S]*left-\[12%\]/);
  assert.match(source, /up-connection[\s\S]*left-1\/2/);
  assert.match(source, /up-acf[\s\S]*left-\[89%\]/);
  assert.match(source, /up-dcf[\s\S]*left-\[14%\]/);
  assert.match(source, /up-idm[\s\S]*left-\[88%\]/);
  assert.match(source, /up-computing[\s\S]*left-\[72%\]/);
  assert.match(source, /Computing: "up-computing"/);
  assert.match(source, /isBelowSystemPlan[\s\S]*replace\(\/\\n\+\/g, " "\)/);
  assert.match(source, /!isBelowSystemPlan &&[\s\S]*网络任务规划/);
  assert.match(source, /const mergedStyle = \{[\s\S]*\.\.\.\(bubble\.style \|\| \{\}\)/);
  assert.match(source, /if \(isDapAgentBubble\) \{[\s\S]*mergedStyle\.left = placementStyle\.left;[\s\S]*mergedStyle\.top = placementStyle\.top;[\s\S]*mergedStyle\.width = placementStyle\.width;[\s\S]*mergedStyle\.maxWidth = placementStyle\.maxWidth/);
  assert.match(source, /用户意图\{isDapSharedBubble \? "" : " · "\}/);
  assert.match(source, /isDapSharedBubble \? "mt-0\.5 block text-\[14px\] leading-tight"/);
  assert.match(source, /isDapSharedBubble[\s\S]*flex flex-col gap-0\.5[\s\S]*text-\[13px\] leading-\[1\.15\]/);
  assert.match(source, /isDapSharedBubble \? "h-3\.5 w-3\.5" : "h-2\.5 w-2\.5"/);
  assert.match(source, /className=\{isSystemIntentBubble \|\| bubble\.nowrap \? "whitespace-nowrap" : ""\}/);
});

test("the former core-functions strip is removed so topology space stays with DAP", () => {
  assert.doesNotMatch(source, /核心网作用|Core Network Functions|core-functions-heading|core-function-item-label/);
  assert.doesNotMatch(source, /coreFunctions = \[\]/);
});

test("only CP tool-state bubbles are hidden from the topology", () => {
  assert.match(source, /const isCpToolStateBubble = \(bubble\) =>/);
  assert.match(source, /!\["qoeAssurance", "acnSkillProgress", "sandboxServices", "taskProgress"\]\.includes\(bubble\.variant\)/);
  assert.match(source, /bubble\.activeTools\.some\(\(tool\) => CP_TOOL_ITEM_SET\.has\(tool\)\)/);
  assert.match(source, /!isCpToolStateBubble\(bubble\)/);
});

test("Skill progress bubbles keep their sequential Tool states together", () => {
  assert.match(source, /const isSkillProgressBubble = \["qoeAssurance", "acnSkillProgress", "sandboxServices"\]\.includes\(bubble\.variant\)/);
  assert.match(source, /isSkillProgressBubble \|\| isTaskProgressBubble[\s\S]*\{bubble\.title\}[\s\S]*items\.map\(\(item\)[\s\S]*item\.status === "success"[\s\S]*item\.status === "working"/);
  assert.match(source, /item\.fitOneLine \? "gap-1 text-\[9px\] leading-none tracking-\[-0\.035em\]"/);
  assert.match(source, /bubble\.denseItems \? "gap-1 text-\[10px\] leading-\[0\.9\]"/);
  assert.match(source, /const isSandboxServicesBubble = bubble\.variant === "sandboxServices"/);
  assert.match(source, /aria-label="Sandbox Tool progress"/);
  assert.match(source, /grid grid-cols-6 place-items-center/);
  assert.match(source, /toolName\.split\("_"\)/);
  assert.match(source, /`\$\{previousLine\}\$\{token\}`\.length <= 22/);
  assert.match(source, /sandboxFocusedLines\.map\(\(line\)/);
  assert.match(source, /block whitespace-nowrap/);
  assert.match(source, /text-\[13px\] font-bold leading-\[1\.1\]/);
  assert.doesNotMatch(source, /sandbox-tool-marquee|sandbox-tool-list-marquee/);
  assert.doesNotMatch(source, /data-topology-subzone=\{zone\.key\}/);
  assert.doesNotMatch(source, /bubble\.titleStatus/);
});

test("DAP task acceptance is a final row inside the original execution bubble", () => {
  assert.match(source, /const isTaskProgressBubble = bubble\.variant === "taskProgress"/);
  assert.match(source, /item\.acceptance \? "mt-0\.5 border-t border-dashed border-emerald-300\/30 pt-1 text-emerald-100"/);
});

test("intent receipt and validation render as two independently marked steps", () => {
  assert.match(source, /const isIntentValidationBubble = bubble\.variant === "intentValidation"/);
  assert.match(source, /isIntentValidationBubble \? \([\s\S]*lines\.map\(\(line, index\)[\s\S]*CheckCircle2[\s\S]*formatBubbleText\(line\)/);
});

test("robot-dog intent uses a horizontal arrow into the DAP boundary", () => {
  assert.match(source, /const IntentEntryArrow =/);
  assert.match(source, /left-\[13\.5%\] top-\[31%\].*w-\[23\.5%\]/);
  assert.match(source, /aria-label="意图入口"/);
  assert.match(source, /意图入口/);
  assert.match(source, /text-amber-300/);
  assert.match(source, /h-1 .*from-amber-400\/45.*to-amber-200/);
  assert.match(source, /<IntentEntryArrow \/>/);
  assert.match(source, /const isRobotDogToRan = from === "RobotDog" && to === "gNB"/);
  assert.match(source, /isRobotDogToRan[\s\S]*\(\(start\.y \+ end\.y\) \/ 2\) - 2\.5/);
});

test("ordinary traffic uses particles while stage 9 owns the Token Tunnel", () => {
  assert.match(source, /const TOKEN_TUNNEL_CONNECTIONS = \[\s*\["UE", "gNB"\],\s*\["gNB", "UPF"\],\s*\["UPF", "Gateway"\],\s*\]/);
  assert.match(source, /shouldShowTokenTunnel\(stage\)/);
  assert.match(source, /Token Tunnel/);
  assert.match(source, /left-\[40%\] top-\[68%\][^\n]*text-xs/);
  assert.match(source, /strokeDasharray="1\.8 4\.6"/);
  assert.match(source, /strokeWidth="0\.68"/);
  assert.match(source, /key=\{`token-tunnel-\$\{key\}`\}[\s\S]*stroke="#22f5ff"[\s\S]*filter="url\(#topology-line-glow\)"/);
  assert.match(source, /TOKEN_TUNNEL_CONNECTION_KEYS\.has\(pathKey\)/);
  assert.match(source, /topology-flow_1\.05s_linear_infinite_reverse/);
});
