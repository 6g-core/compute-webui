import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);
const cssSource = readFileSync(
  new URL("../src/index.css", import.meta.url),
  "utf8",
);

test("topology uses a vertical CP, DAP, UP, RAN, and endpoint stack", () => {
  const cpIndex = source.indexOf('code="CP"');
  const dapIndex = source.indexOf('code="DAP"');
  const upIndex = source.indexOf('code="UP"');
  const ranIndex = source.indexOf('<RANNode');
  const endpointIndex = source.lastIndexOf('<EndpointNode');

  assert.ok(cpIndex >= 0);
  assert.ok(cpIndex < dapIndex);
  assert.ok(dapIndex < upIndex);
  assert.ok(upIndex < ranIndex);
  assert.ok(ranIndex < endpointIndex);
  assert.match(source, /data-topology-layout="vertical-planes"/);
  assert.match(source, /code="CP"[\s\S]*top-\[5%\][\s\S]*code="DAP"[\s\S]*top-\[17\.5%\][\s\S]*code="UP"[\s\S]*top-\[39\.5%\]/);
  assert.match(source, /top-\[56\.5%\][\s\S]*data-network-node="RAN"/);
  assert.match(source, /key: 'front', x: 50, y: 89/);
});

test("the endpoint row contains the five requested participants", () => {
  assert.match(source, /key: 'RobotDog', label: '机器狗'/);
  assert.match(source, /key: 'UE', label: 'AR 眼镜'/);
  assert.match(source, /key: 'MarketAgent', label: '超市智能体'/);
  assert.match(source, /key: 'MechanicalArm', label: '机械臂'/);
  assert.match(source, /key: 'AIPC', label: 'AI PC', eyebrow: 'AI TERMINAL'/);
  assert.match(source, /robotDogVisual: RobotDogVisual/);
  assert.match(source, /<RobotDogVisual className="h-\[72px\] w-\[112px\]" status="neutral"/);
  assert.match(source, /const GlassesGlyph =/);
  assert.match(source, /import acnImage from '\.\.\/ACN\.png'/);
  assert.match(source, /const MarketAgentImage =/);
  assert.match(source, /src=\{acnImage\}/);
  assert.match(source, /import computingImage from '\.\.\/Computing\.png'/);
  assert.match(source, /const AIPCImage =/);
  assert.match(source, /src=\{computingImage\}/);
  assert.match(source, /const MechanicalArmGlyph =/);
  assert.match(source, /const BaseStationGlyph =/);
  assert.match(source, /const MetallicDefs =/);
  assert.doesNotMatch(source, /robotdog_transparent\.png|glasses_transparent\.png|ran_transparent\.png|Market\.png/);
});

test("DAP exposes only three abstract NF capability groups", () => {
  assert.match(source, /const DAP_CAPABILITIES = \[/);
  assert.match(source, /label: '智能网元', english: 'INTELLIGENT NFs'/);
  assert.match(source, /label: '数据网元', english: 'DATA NFs'/);
  assert.match(source, /label: '算力网元', english: 'COMPUTING NFs'/);
  assert.match(source, /data-dap-capability=\{capability\.key\}/);
  assert.doesNotMatch(source, /UnifiedToolPanel|DAP_BUS|TOPOLOGY_NODES/);
  assert.doesNotMatch(source, /systemagent_transparent|Connetction\.png|upfnew\.png/);
});

test("legacy stage node keys collapse onto the new plane capability anchors", () => {
  assert.match(source, /SRF: 'intelligent'[\s\S]*SystemAgent: 'intelligent'[\s\S]*ConnectionAgent: 'intelligent'[\s\S]*ACN: 'intelligent'/);
  assert.match(source, /DCF: 'data'[\s\S]*DSF: 'data'[\s\S]*IDM: 'data'/);
  assert.match(source, /Computing: 'computing'/);
  assert.match(source, /UP_NODE_KEYS = new Set\(\['UPF', 'Gateway', 'AgentGW', 'OttAgentGW'\]\)/);
  assert.match(source, /categoryIsActive/);
  assert.match(source, /cpActive = toolStates\.some/);
});

test("the access-to-DAP path is a persistent, emphasized 意图 NAS link", () => {
  assert.match(source, /aria-label="端侧到DAP意图NAS链路"/);
  assert.match(source, /M 43\.5 89 L 4\.4 89 Q 3 89 3 87\.6 L 3 22\.1 Q 3 20\.7 4\.4 20\.7 L 25\.6 20\.7/);
  assert.match(source, /stroke="#c9a34e" strokeWidth="0\.35" strokeDasharray="1\.2 1\.1"[^>]*opacity="0\.42"/);
  assert.match(source, /stroke="#ead79b" strokeWidth="0\.68" strokeDasharray="1\.8 4\.6"[^>]*opacity="0\.95"[^>]*className="intent-nas-flow"/);
  assert.doesNotMatch(source, /id="intent-nas-gradient"|url\(#intent-nas-gradient\)/);
  assert.match(source, /className="intent-nas-flow"/);
  assert.match(source, /intent-nas-label[^"]*left-\[10\.5%\][^"]*top-\[49%\][^"]*w-\[168px\]/);
  assert.match(source, /data-intent-nas-detail="expanded"[\s\S]*意图 NAS[\s\S]*原生意图入口[\s\S]*端网协同[\s\S]*丰富的业务需求表达/);
  assert.doesNotMatch(source, /stage-flow-|active-flow-|latency-/);
  assert.doesNotMatch(source, /\[animation:topology-flow/);
});

test("the NAS path mirrors Token Tunnel from the front endpoint into the intelligent NF", () => {
  assert.match(source, /aria-label="正前方终端经左侧接入智能网元意图NAS链路"/);
  assert.match(source, /data-intent-target="intelligent"/);
  assert.match(source, /data-intent-routing="token-tunnel-mirror"/);
  assert.match(source, /M 43\.5 89 L 4\.4 89 Q 3 89 3 87\.6 L 3 22\.1 Q 3 20\.7 4\.4 20\.7 L 25\.6 20\.7/);
  assert.match(source, /id="intent-nas-around-glow"/);
  assert.match(source, /strokeDasharray="1\.8 4\.6"/);
  assert.doesNotMatch(source, /M 41\.5 90\.4 C|M 7 34|M 4\.7 71 C|intent-nas-dap-gradient/);
});

test("the endpoint participants are enclosed by the restored dashed terminal ring", () => {
  assert.match(source, /aria-label="端侧终端虚线环"/);
  assert.match(source, /ellipse cx="50" cy="83\.5" rx="42" ry="14\.5"/);
  assert.match(source, /strokeDasharray="1\.45 1\.55"/);
});

test("the RAN cone uses layered soft gradients and fine clipped rays", () => {
  assert.match(source, /id="ran-cone-outer-fill"/);
  assert.match(source, /id="ran-cone-inner-fill"/);
  assert.match(source, /id="ran-cone-soft-glow"/);
  assert.match(source, /id="ran-light-cone-clip"/);
  assert.match(source, /\[18, 26, 34, 42, 50, 58, 66, 74, 82\]/);
  assert.match(source, /strokeWidth="0\.07"/);
});

test("DAP is one large perspective plane with three unboxed capability groups", () => {
  assert.match(source, /isDap[\s\S]*'polygon\(12\.3% 0,87\.7% 0,100% 100%,0 100%\)'[\s\S]*'polygon\(9% 0,91% 0,100% 100%,0 100%\)'/);
  const cpEdgeSlope = (0.09 * 52) / 7.8;
  const dapEdgeSlope = (0.123 * 82) / 16.8;
  assert.ok(Math.abs(cpEdgeSlope - dapEdgeSlope) < 0.002);
  assert.match(source, /isDap \? 'translate-y-\[16px\]' : 'translate-y-\[10px\]'/);
  assert.match(source, /polygon\(9% 0,91% 0,100% 100%,0 100%\)/);
  assert.match(source, /code="CP"[\s\S]*className="left-\[24%\] top-\[5%\] h-\[7\.8%\] w-\[52%\]"/);
  assert.match(source, /className="left-\[9%\] top-\[17\.5%\] h-\[16\.8%\] w-\[82%\]"/);
  assert.match(source, /code="UP"[\s\S]*className="left-\[18%\] top-\[39\.5%\] h-\[7\.8%\] w-\[64%\]"/);
  assert.match(source, /network-plane-surface/);
  assert.match(source, /network-plane-active/);
  assert.equal((source.match(/data-plane-label=/g) || []).length, 2);
  assert.match(cssSource, /\.network-plane-label \{[\s\S]*transform: translate\(-50%, -50%\)[\s\S]*brightness\(1\.08\)/);
  assert.equal((source.match(/className="network-plane-code text/g) || []).length, 2);
  assert.equal((source.match(/network-plane-code-reflection-window/g) || []).length, 2);
  assert.match(cssSource, /\.network-plane-code-reflection-window \{[\s\S]*height: 15px[\s\S]*overflow: hidden[\s\S]*opacity: 0\.6[\s\S]*mask-image: linear-gradient/);
  assert.match(cssSource, /\.network-plane-code-reflection \{[\s\S]*translateY\(-5px\) scaleY\(-0\.58\)[\s\S]*blur\(0\.3px\)/);
  assert.doesNotMatch(cssSource, /skewX\(/);
  assert.doesNotMatch(cssSource, /-webkit-box-reflect/);
  assert.doesNotMatch(cssSource, /\.network-plane-label[\s\S]{0,240}drop-shadow/);
  assert.doesNotMatch(cssSource, /\.network-plane-label::(?:before|after)/);
  assert.match(cssSource, /\.network-plane-label > span \{[\s\S]*color-mix\(in srgb, var\(--plane-color\) 42%, transparent\)/);
  assert.match(source, /architecture-glow/);
  assert.match(source, /top-\[7%\] grid h-\[42%\] translate-x-\[5%\][\s\S]*left-\[14%\][\s\S]*top-\[83%\][\s\S]*text-\[27px\][\s\S]*>DAP<\/span>[\s\S]*text-\[14px\] font-normal[\s\S]*DATA &amp; AI PLANE/);
  assert.doesNotMatch(source, /top-\[59%\] h-px bg-gradient-to-r/);
  assert.ok((source.match(/text-\[(?:14|8)px\] font-normal tracking-/g) || []).length >= 4);
  assert.doesNotMatch(source, /DAP_CAPABILITY_CLIP_PATH|clipPath: DAP_CAPABILITY_CLIP_PATH/);
  assert.doesNotMatch(source, /network-plane-dap|border-violet-300\/45|data-dap-capability=\{capability\.key\}[\s\S]{0,400}borderColor/);
});

test("the intent source rotates into the front carousel slot", () => {
  assert.match(source, /const CAROUSEL_SLOTS = \[[\s\S]*key: 'front'[\s\S]*key: 'right'[\s\S]*key: 'back'[\s\S]*key: 'back-left'[\s\S]*key: 'left'/);
  assert.match(source, /const DEFAULT_INTENT_SOURCE_BY_STAGE = \{/);
  assert.match(source, /4: 'UE'/);
  assert.match(source, /9: 'UE'/);
  assert.match(source, /10: 'MarketAgent'/);
  assert.match(source, /const intentSourceKey = showQosExperience[\s\S]*\? 'UE'/);
  assert.match(source, /bubbleIntentSource[\s\S]*highlightedIntentSource[\s\S]*routedIntentSource[\s\S]*intentSourceKey/);
  assert.match(source, /CAROUSEL_SLOTS\[\(index - frontEndpointIndex \+ storyEndpoints\.length\) % storyEndpoints\.length\]/);
  assert.match(source, /data-carousel-position=\{slot\.key\}/);
  assert.match(source, /transition-\[left,top,opacity,transform\] duration-700/);
  assert.match(source, /isFront \? '#fbbf24' : endpoint\.accent/);
});

test("stage 9 draws an orthogonal Token Tunnel from the front AR glasses to the computing NF", () => {
  assert.match(source, /shouldShowTokenTunnel\(stage\)/);
  assert.match(source, /data-token-tunnel="stage-9"/);
  assert.match(source, /aria-label="AR眼镜到算力网元Token Tunnel链路"/);
  assert.match(source, /const tokenTunnelTargetX = isStage9FinalView \? 76\.1 : 80\.8/);
  assert.match(source, /const tokenTunnelPath = `M 56\.5 89 L 95\.6 89 Q 97 89 97 87\.6 L 97 22\.1 Q 97 20\.7 95\.6 20\.7 L \$\{tokenTunnelTargetX\} 20\.7`/);
  assert.equal((source.match(/d=\{tokenTunnelPath\}/g) || []).length, 2);
  assert.match(source, /stroke="#63b5df" strokeWidth="1\.25" strokeLinecap="round" opacity="0\.82" filter="url\(#token-tunnel-glow\)"/);
  assert.match(source, /stroke="#d6f1ff" strokeWidth="0\.68" strokeDasharray="1\.8 4\.6"[^>]*opacity="0\.95"[^>]*className="token-tunnel-flow"/);
  assert.doesNotMatch(source, /id="token-tunnel-gradient"|url\(#token-tunnel-gradient\)/);
  assert.match(source, /token-tunnel-label/);
  assert.match(source, />\s*Token Tunnel\s*<\/div>/);
  assert.match(cssSource, /\.network-static-topology \.intent-nas-flow,\s*\.network-static-topology \.token-tunnel-flow[\s\S]*animation: intent-nas-flow 1\.3s linear infinite !important/);
  assert.match(cssSource, /@keyframes intent-nas-flow[\s\S]*stroke-dashoffset: 12[\s\S]*stroke-dashoffset: 0/);
});

test("the AR glasses use the same physical AI category as the other physical endpoints", () => {
  assert.match(source, /key: 'UE', label: 'AR 眼镜', eyebrow: 'PHYSICAL AI'/);
  assert.doesNotMatch(source, /SPATIAL TERMINAL/);
});

test("workflow bubbles preserve plan, Tool progress, and acceptance states", () => {
  assert.match(source, /isIntentValidation[\s\S]*lines\.map\(\(line\)/);
  assert.match(source, /isPlan[\s\S]*tasks\.map\(\(task\)/);
  assert.match(source, /isSandbox[\s\S]*aria-label="Sandbox Tool progress"/);
  assert.match(source, /item\.acceptance[\s\S]*border-t border-dashed border-emerald/);
  assert.match(source, /shouldHideCpToolBubble/);
  assert.match(source, /BUBBLE_SLOTS/);
});

test("endpoint intent bubbles reuse the nearby Stage 22 amber NAS treatment", () => {
  assert.match(source, /const getEndpointIntentStyle = \(targetNode\) => \{[\s\S]*left: `\$\{anchor\.x\}%`[\s\S]*anchor\.y - 11\.5[\s\S]*width: 'max-content'[\s\S]*maxWidth: '24%'[\s\S]*translateX\(-50%\)[\s\S]*animationDelay: '620ms'/);
  assert.match(source, /const endpointIntentBubble = bubble\.variant === 'voiceIntent'[\s\S]*storyEndpoints\.some[\s\S]*tone: 'intent'[\s\S]*getEndpointIntentStyle\(bubble\.targetNode\)/);
  assert.match(source, /targetNode: 'RobotDog'[\s\S]*variant: 'voiceIntent'[\s\S]*tone: 'intent'[\s\S]*getEndpointIntentStyle\('RobotDog'\)/);
  assert.match(source, /targetNode: 'UE'[\s\S]*variant: 'voiceIntent'[\s\S]*tone: 'intent'[\s\S]*getEndpointIntentStyle\('UE'\)/);
});

test("DAP execution bubbles stay close to their capability while CCF temporarily yields room", () => {
  assert.match(source, /const BUBBLE_SLOTS = \{[\s\S]*intelligent: \{ left: '32\.5%', top: '20\.6%', width: '18%' \}[\s\S]*data: \{ left: '32\.5%', top: '20\.6%', width: '18%' \}[\s\S]*computing: \{ left: '76\.5%', top: '20\.6%', width: '17%' \}/);
  assert.match(source, /const hasComputingBubble = allBubbles\.some\(\(bubble\) => getBubbleGroup\(bubble\.targetNode\) === 'computing'\)/);
  assert.match(source, /showQosExperience \? 'grid-cols-\[1fr_1\.7fr_1fr_1fr\] gap-\[3%\]' : 'grid-cols-3 gap-\[8%\]'/);
  assert.match(source, /const hasPlanningBubble = planningBubbleIsConfigured \|\| allBubbles\.some\(\(bubble\) => \([\s\S]*'stage2SystemPlan', 'intentValidation'[\s\S]*includes\(bubble\.variant\)/);
  assert.match(source, /capability\.key === 'computing' && hasComputingBubble \? '-translate-x-\[12%\]' : capability\.key === 'computing' && hasPlanningBubble && !showQosExperience \? 'translate-x-\[30%\]' : capability\.key === 'intelligent' && hasPlanningBubble && !showQosExperience \? '-translate-x-\[22%\]' : capability\.key === 'data' && hasPlanningBubble && !showQosExperience \? 'translate-x-\[30%\]' : ''/);
  assert.doesNotMatch(source, /capability\.key === 'data' && hasComputingBubble/);
  assert.match(source, /gridColumn: showQosExperience\s*\?/);
  assert.match(source, /translate: capability\.key === 'data'[\s\S]*'\-23% 0'[\s\S]*capability\.key === 'computing'[\s\S]*'\-46% 0'/);
  assert.match(source, /data-bubble-offset=\{capability\.key === 'computing' && hasComputingBubble \? 'left' : 'rest'\}/);
  assert.match(source, /suppressCapabilityShadow = capability\.key === 'intelligent'[\s\S]*capabilityHasBubble && capability\.key === 'computing'/);
  assert.match(source, /boxShadow: active && !suppressCapabilityShadow/);
});

test("only sub-agents sharing the center slot replace Planning while CCF coexists on the right", () => {
  assert.match(source, /const hasPlanningSlotSubAgentBubble = agentBubbles\.some\(\(bubble\) => \['intelligent', 'data'\]\.includes\(getBubbleGroup\(bubble\.targetNode\)\)\)/);
  assert.match(source, /const planningBubbleIsConfigured = agentBubble\?\.variant === 'stage2SystemPlan'/);
  assert.match(source, /const visibleAgentBubble = hasPlanningSlotSubAgentBubble && planningBubbleIsConfigured \? null : agentBubble/);
  assert.match(source, /const allBubbles = \[visibleAgentBubble, \.\.\.agentBubbles, stage9ArQosBubble\]\.filter\(Boolean\)/);
  assert.match(source, /suppressDarkShadow: true[\s\S]*className: 'origin-bottom'[\s\S]*left: '32\.5%'[\s\S]*width: '18%'/);
  assert.match(source, /text-\[8px\][\s\S]*text-\[11px\][\s\S]*text-\[13px\][\s\S]*text-\[9px\][\s\S]*text-\[10px\]/);
});

test("Planning intent validation shares the right-side Planning slot without covering a capability", () => {
  assert.match(source, /const INTENT_VALIDATION_SLOT = \{ left: '32\.5%', top: '20\.6%', width: '18%' \}/);
  assert.match(source, /bubble\.variant === 'intentValidation' && getBubbleGroup\(bubble\.targetNode\) === 'intelligent'[\s\S]*dapGroup: 'intelligent'[\s\S]*suppressDarkShadow: true[\s\S]*INTENT_VALIDATION_SLOT/);
});

test("stage 9 anchors the QoS intent above the AR glasses and Planning orchestration beside the intelligent NF", () => {
  assert.match(source, /const stage9ArQosBubble = showQosExperience[\s\S]*targetNode: 'UE'[\s\S]*Number\(stage\) === 24 \? '保障机器狗回传视频清晰流畅' : '增强机器狗回传的视频'[\s\S]*variant: 'voiceIntent'[\s\S]*tone: 'intent'[\s\S]*positionKey: 'stage9-ar-qos'/);
  assert.match(source, /positionKey === 'stage9-ar-qos'[\s\S]*left: '50%'[\s\S]*top: '77\.5%'[\s\S]*width: 'max-content'[\s\S]*maxWidth: '32%'[\s\S]*translateX\(-50%\)/);
  assert.match(source, /positionKey === 'stage22-planning' \|\| bubble\.variant === 'stage2SystemPlan'[\s\S]*planningFrameHeight[\s\S]*'20\.5%'[\s\S]*'18\.5%'[\s\S]*'16\.5%'[\s\S]*left: '32\.5%'[\s\S]*width: '18%'[\s\S]*top: '20\.3%'[\s\S]*height: planningFrameHeight[\s\S]*rotateY\(4deg\)/);
  assert.match(source, /data-planning-reference=\{isPlan \? 'stage22' : undefined\}/);
  assert.match(source, /isVerticalPlan && !suppressDarkShadow[\s\S]*perspective\(120px\) rotateX\(64deg\)/);
  assert.match(source, /isVerticalPlan \? 'grid-cols-1 gap-\[1px\]'/);
  assert.doesNotMatch(source, /isStage9QoeExecution|top: '35\.5%'/);
  assert.match(source, /\[visibleAgentBubble, \.\.\.agentBubbles, stage9ArQosBubble\]/);
  assert.match(source, /isStage9FinalView \? 'grid-cols-\[1fr_0\.9fr_1fr_1\.8fr\] gap-\[3%\]' : showQosExperience \? 'grid-cols-\[1fr_1\.7fr_1fr_1fr\] gap-\[3%\]' : 'grid-cols-3 gap-\[8%\]'/);
  assert.match(source, /gridColumn: showQosExperience[\s\S]*intelligent: '1', data: '3', computing: '4'/);
});

test("stage 9 final view brings the data NF closer and materializes SM on CP", () => {
  assert.match(source, /const isStage9FinalView = showQosExperience[\s\S]*stage9_qos_done[\s\S]*stage9_qos_clear/);
  assert.match(source, /data-stage9-sm-invocation="final"[\s\S]*stroke="#4f9fc9"[\s\S]*stroke="#c9efff"[\s\S]*className="sm-tool-call-flow"/);
  assert.match(source, /data-stage9-sm-badge="final"[\s\S]*stage9-sm-tool-call-flash h-\[40px\] w-\[120px\][\s\S]*polygon\(32px 0, calc\(100% - 32px\) 0, 100% 100%, 0 100%\)[\s\S]*<Cpu[\s\S]*>SM<[\s\S]*>work<[\s\S]*Tool/);
  assert.match(source, /const isDapGlassPlan[\s\S]*backdrop-blur-xl[\s\S]*border-violet-300\/60[\s\S]*from-white\/\[0\.12\]/);
  assert.match(cssSource, /\.network-static-topology \.sm-tool-call-flow[\s\S]*animation: intent-nas-flow 1\.3s linear infinite/);
  assert.match(cssSource, /\.network-static-topology \.stage9-sm-tool-call-flash[\s\S]*stage9-sm-tool-call-flash 0\.72s ease-out both/);
  assert.match(cssSource, /@keyframes stage9-sm-tool-call-flash[\s\S]*22%[\s\S]*brightness\(1\.7\)[\s\S]*scale\(1\.045\)/);
  assert.match(cssSource, /background: rgba\(56, 189, 248, 0\.48\)/);
});

test("video stages reuse the Stage 22 rounded transport motion from the robot dog through UP to the AR glasses", () => {
  assert.match(source, /const numericStage = Number\(stage\)/);
  assert.match(source, /const showStage22Transport = numericStage === 22[\s\S]*numericStage === 24[\s\S]*numericStage === 8[\s\S]*numericStage === 5[\s\S]*numericStage === 7/);
  assert.match(source, /aria-label="机器狗经UP到AR眼镜的视频传输链路"[\s\S]*data-stage22-transport="RobotDog-UP-UE"/);
  assert.match(source, /const transportStart = \{[\s\S]*displayAnchors\.RobotDog\.x[\s\S]*displayAnchors\.RobotDog\.y - 8/);
  assert.match(source, /const transportEnd = \{[\s\S]*displayAnchors\.UE\.x[\s\S]*displayAnchors\.UE\.y - 7/);
  assert.match(source, /const buildRanAvoidingTerminalPath = \(start, end\) =>/);
  assert.match(source, /routeOnRight = \(\(start\.x \+ end\.x\) \/ 2\) >= 50/);
  assert.match(source, /sideDirection = routeOnRight \? 1 : -1[\s\S]*startIsCloserToRan = Math\.abs\(start\.x - 50\) <= Math\.abs\(end\.x - 50\)/);
  assert.match(source, /firstControlX = startIsCloserToRan[\s\S]*sideDirection \* 10[\s\S]*sideDirection \* 4[\s\S]*secondControlX = startIsCloserToRan[\s\S]*controlY = 34\.5/);
  assert.match(source, /single high cubic arch follows the red reference in 66\.png[\s\S]*buildRanAvoidingTerminalPath\(transportStart, transportEnd\)/);
  assert.match(source, /path: `M \$\{start\.x\} \$\{start\.y\} C \$\{firstControlX\} \$\{controlY\}, \$\{secondControlX\} \$\{controlY\}, \$\{end\.x\} \$\{end\.y\}`/);
  assert.match(source, /data-ran-avoidance-side=\{stage22TransportRoute\.side\}/);
  assert.equal((source.match(/d=\{stage22TransportPath\}/g) || []).length, 2);
  assert.match(source, /z-\[23\][\s\S]*data-stage22-layer="above-UP-below-bubble"/);
  assert.match(source, /stroke="#3fae9f"[\s\S]*stroke="#baf7e8"[\s\S]*className="stage22-transport-flow"/);
  assert.match(cssSource, /\.network-static-topology \.stage22-transport-flow[\s\S]*animation: intent-nas-flow 1\.3s linear infinite/);
});

test("stage 23 removes the transient stage 22 overlays while retaining the final topology", () => {
  assert.match(source, /const isStage23CleanView = Number\(stage\) === 23/);
  assert.match(source, /const showStage9Sm = isStage9FinalView && !isStage23CleanView/);
  assert.match(source, /const stage9ArQosBubble = showQosExperience && !isStage23CleanView/);
  assert.match(source, /\{showStage9Sm && \(/);
  assert.match(source, /const showStage22Transport = numericStage === 22[\s\S]*numericStage === 24/);
});

test("stage 24 keeps the stage 22 final overlays, updates its copy, and restores Token Tunnel", () => {
  assert.match(source, /const showQosExperience = isQosExperienceStage\(stage\)/);
  assert.match(source, /const showTokenTunnel = shouldShowTokenTunnel\(stage\)/);
  assert.match(source, /Number\(stage\) === 24 \? '保障机器狗回传视频清晰流畅'/);
  assert.match(source, /\{showTokenTunnel && \([\s\S]*data-token-tunnel="stage-9"/);
});

test("Stages 1-10 use the Stage 22 motion language without restoring legacy topology-line clutter", () => {
  assert.match(source, /network-static-topology/);
  assert.match(source, /data-animation-reference="stage22"/);
  assert.match(source, /stage-motion-bubble/);
  assert.match(source, /stage-motion-node-active/);
  assert.match(source, /stage-motion-capability-active/);
  assert.match(source, /shouldShowTokenTunnel/);
  assert.doesNotMatch(source, /explicitActiveConnections|activeLineConfig/);
  assert.doesNotMatch(source, /useEffect|useState|setInterval/);
  assert.doesNotMatch(cssSource, /\.network-static-topology \*[\s\S]*transition-duration: 0s !important/);
  assert.match(cssSource, /\.network-static-topology \.network-plane-surface[\s\S]*animation: none !important/);
  assert.match(cssSource, /@keyframes stage-motion-bubble-enter/);
  assert.match(cssSource, /@keyframes stage-motion-active-response/);
});
