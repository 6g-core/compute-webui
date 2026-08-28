import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);
const appSource = readFileSync(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);

test("Stage 9 restores the QoS metrics chart in the marked lower-right region", () => {
  assert.match(source, /const QosMetricsChart = \(\{ metrics = \[\] \}\) =>/);
  assert.match(source, /QoS保障曲线/);
  assert.match(source, /left-\[76%\] top-\[55%\][\s\S]*h-\[31%\] w-\[19%\]/);
  assert.match(source, /data-qos-metrics-count=\{metrics\.length\}/);
  assert.match(source, /sendrate_kbps[\s\S]*gbr_kbps[\s\S]*q_lvl/);
  assert.match(source, /numericStage === 9 && <QosMetricsChart metrics=\{qosMetrics\} \/>/);
  assert.match(appSource, /qosMetrics=\{qosFeed\.metrics\}/);
});

test("Token Tunnel label moves above the restored Stage 9 chart", () => {
  assert.match(source, /token-tunnel-label[^"]*left-\[88\.5%\] top-\[50\.5%\]/);
});
