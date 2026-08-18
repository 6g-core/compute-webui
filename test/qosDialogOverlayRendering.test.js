import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/App.jsx", import.meta.url),
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
