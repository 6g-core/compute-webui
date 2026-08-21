import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);
const panelSource = readFileSync(
  new URL("../src/components/DemoPanels.jsx", import.meta.url),
  "utf8",
);
const stageSource = readFileSync(
  new URL("../src/config/stageConfig.jsx", import.meta.url),
  "utf8",
);
const effectiveStageSource = readFileSync(
  new URL("../src/hooks/useEffectiveStageConfig.js", import.meta.url),
  "utf8",
);

const extractQosConversationPanelSource = () => {
  const start = source.indexOf("const QosConversationPanel =");
  const end = source.indexOf("const DogVisionPanel =", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  return source.slice(start, end);
};

test("QoS conversation panel follows the supplied communication-log reference", () => {
  const panelSource = extractQosConversationPanelSource();

  assert.match(panelSource, /aria-label="QoS conversation"/);
  assert.match(panelSource, />\s*实时问答\s*</);
  assert.doesNotMatch(panelSource, />\s*LIVE\s*</);
  assert.doesNotMatch(panelSource, />\s*NOW\s*</);
  assert.match(panelSource, /max-h-\[450px\] flex-\[1\.32_1_0%\]/);
  assert.match(panelSource, /min-h-0 flex-1 overflow-hidden px-4 py-3/);
  assert.doesNotMatch(panelSource, /overflow-y-auto/);
  assert.match(panelSource, /orderQosDialogItems\(items, 3\)/);
  assert.match(panelSource, /horizontalPlacement === "right"/);
  assert.match(panelSource, /imageVerticalPlacement === "above"/);
  assert.match(panelSource, /\{imageAbove && renderImage\(item\)\}[\s\S]*<article[\s\S]*item\.dialog[\s\S]*<\/article>[\s\S]*\{!imageAbove && renderImage\(item\)\}/);
  assert.match(panelSource, /AGENT COMMUNICATION LOG/);
  assert.match(panelSource, /bg-gradient-to-r from-\[#337986\]\/95 via-\[#1c4d57\]\/95 to-\[#102c35\]\/95/);
  assert.match(panelSource, /bg-\[#193941\]\/92/);
  assert.match(panelSource, /bg-\[#4f8297\]\/95/);
  assert.match(panelSource, /<AudioWaveform className=/);
  assert.match(panelSource, /<SendHorizontal className=/);
  assert.match(panelSource, /<Settings className=/);
  assert.match(panelSource, /<UserRound className=/);
  assert.doesNotMatch(panelSource, /absolute inset-0 z-30/);
});

test("Stage 9 puts enhanced video above the conversation panel and replaces raw dog vision", () => {
  const start = source.indexOf("const DogVisionStreams =");
  const end = source.indexOf("const LatencyChart =", start);
  const streamsSource = source.slice(start, end);

  assert.match(streamsSource, /enabled: !showQosConversation/);
  assert.match(streamsSource, /if \(showQosConversation\)/);
  assert.match(streamsSource, /<DogVisionPanel[\s\S]*<QosConversationPanel items=\{qosDialogItems\}/);
  assert.doesNotMatch(streamsSource, /overlay=\{<Qos/);
});

test("Stage 5 keeps one raw stream and progressively removes stalls and noise", () => {
  const start = source.indexOf("const DOG_RAW_SAMPLE_MIN_MS =");
  const end = source.indexOf("const LatencyChart =", start);
  const streamsSource = source.slice(start, end);

  assert.match(streamsSource, /const DOG_RAW_SAMPLE_MIN_MS = 420/);
  assert.match(streamsSource, /const DOG_RAW_SAMPLE_MAX_MS = 1500/);
  assert.match(streamsSource, /const frameSampled = sampled && stallEnabled/);
  assert.match(streamsSource, /sampleCount % 5 === 0 \|\| Math\.random\(\) < 0\.08/);
  assert.match(streamsSource, /let capturedFrame = false/);
  assert.match(streamsSource, /if \(noiseEnabled\) \{[\s\S]*context\.putImageData\(frame, 0, 0\);[\s\S]*capturedFrame = true/);
  assert.match(streamsSource, /if \(!capturedFrame\) \{\s*setSampleStalled\(false\);\s*captureTimer = window\.setTimeout\(captureFrame, 250\);\s*return;/);
  assert.match(streamsSource, /data-sample-stalled=\{sampled \? String\(sampleStalled\) : undefined\}/);
  assert.match(streamsSource, /aria-label="视频加载中"/);
  assert.match(streamsSource, /left-3 top-3 z-20[\s\S]*\{label\}/);
  assert.match(streamsSource, /context\.drawImage\(video/);
  assert.match(streamsSource, /context\.getImageData\(0, 0, width, height\)/);
  assert.match(streamsSource, /const grain = \(Math\.random\(\) - 0\.5\) \* 34/);
  assert.match(streamsSource, /data-vision-mode=\{visionMode\}/);
  assert.match(streamsSource, /data-stall-enabled=\{sampled \? String\(stallEnabled\) : undefined\}/);
  assert.match(streamsSource, /data-noise-enabled=\{sampled \? String\(noiseEnabled\) : undefined\}/);
  assert.match(streamsSource, /onLoadedData=\{reportFirstFrame\}/);
  assert.match(streamsSource, /onPlaying=\{reportFirstFrame\}/);
  assert.match(streamsSource, /onFirstFrame=\{onFirstFrame\}/);
  assert.match(streamsSource, /enabled: !showQosConversation/);
  assert.match(streamsSource, /enabled: preloadEnhanced && !sampleRaw/);
  assert.match(streamsSource, /data-stage5-video-phase=\{stage5SandboxComplete \? "smooth-clear" : stage5QoeComplete \? "smooth-noisy" : "stalled-noisy"\}/);
  assert.match(streamsSource, /label=\{stageAnimationDone \? "AR眼镜视野" : "机器狗原始视频"\}[\s\S]*stallEnabled=\{!stage5QoeComplete\}[\s\S]*noiseEnabled=\{!stage5SandboxComplete\}/);
  assert.doesNotMatch(streamsSource, /label="增强后AR眼镜视角"/);
  assert.doesNotMatch(streamsSource, /RAW-FRAME|AR-VIEW|NOISE\+|ENHANCED|DOG-CAM|MOQT|SYNCED/);
  assert.doesNotMatch(source, /scan-line|@keyframes scan|context\.fillRect\(0, y, width, 1\)/);
  assert.match(panelSource, /sampleRaw=\{Number\(stage\) === 5\}/);
  assert.match(panelSource, /stage5QoeComplete=\{Boolean\(effectiveStageConfig\.stage5QoeComplete\)\}/);
  assert.match(panelSource, /stage5SandboxComplete=\{Boolean\(effectiveStageConfig\.stage5SandboxComplete\)\}/);
  assert.match(panelSource, /stageAnimationDone=\{Boolean\(effectiveStageConfig\.stageAnimationDone\)\}/);
  assert.match(panelSource, /onFirstFrame=\{Number\(stage\) === 5 \? onStage5VideoFrame : undefined\}/);
  assert.match(effectiveStageSource, /const \[stage5AnimationComplete, setStage5AnimationComplete\] = useState\(false\)/);
  assert.match(effectiveStageSource, /setStage5AnimationComplete\(true\);\s*\}, 1000\)/);
  assert.match(effectiveStageSource, /stageAnimationDone: allDone && stage5AnimationComplete/);
  assert.match(effectiveStageSource, /stage5QoeComplete: Boolean\(phase\.qoeComplete\)/);
  assert.match(effectiveStageSource, /stage5SandboxComplete: Boolean\(phase\.sandboxComplete\)/);
  assert.match(effectiveStageSource, /stage !== 5 \|\| !stage5VideoReady \|\| stage5PhaseIndex >= STAGE5_PHASES\.length - 1/);
  assert.doesNotMatch(effectiveStageSource, /if \(stage5PhaseIndex === 0\) \{\s*setStage5PhaseIndex\(1\);/);
  assert.match(effectiveStageSource, /const stage5Prewarming = !stage5VideoReady/);
  assert.match(effectiveStageSource, /leftPanelTitle: stage5Prewarming \? STAGE_CONFIG\[4\]\.leftPanelTitle : stageConfig\.leftPanelTitle/);
  assert.match(effectiveStageSource, /topologyLines: stage5Prewarming \? \[\] : phase\.topologyLines \|\| \[\]/);
  assert.match(effectiveStageSource, /stagePhaseKey: stage5Prewarming \? "stage5_preheating" : phase\.key/);
  assert.match(effectiveStageSource, /systemAgentBubble: stage5Prewarming \|\| hideFinalFlash \? null : phase\.systemAgentBubble \|\| null/);
  assert.match(effectiveStageSource, /const showArSpeech = !stage5Prewarming && phase\.key === "stage5_source"/);
  assert.match(panelSource, /data-stage5-video-prewarm=\{effectiveStageConfig\.stage5Prewarming \? "warming" : "ready"\}/);
  assert.match(panelSource, /className=\{effectiveStageConfig\.stage5Prewarming[\s\S]*"pointer-events-none absolute inset-0 flex opacity-0"[\s\S]*"contents"/);
  assert.match(panelSource, /Number\(stage\) === 5 && !effectiveStageConfig\.stage5Prewarming \? \(\s*null/);
  assert.match(source, /const \[stage5VideoReady, setStage5VideoReady\] = useState\(false\)/);
  assert.match(source, /useEffectiveStageConfig\(stage, \{ stage5VideoReady \}\)/);
  assert.match(stageSource, /STAGE_CONFIG\[5\] = \{[\s\S]*?showEnhancedDogVision: true/);
  assert.match(stageSource, /STAGE_CONFIG\[6\] = \{[\s\S]*?showEnhancedDogVision: false/);
});
