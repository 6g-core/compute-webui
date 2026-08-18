import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/NetworkTopology3D.jsx", import.meta.url),
  "utf8",
);

const extractQosChartSource = () => {
  const start = source.indexOf("const QosMetricsChart =");
  const end = source.indexOf("const CurrentTaskSummaryOverlay", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  return source.slice(start, end);
};

test("QoS chart renders line paths without per-sample SVG circle markers", () => {
  const qosChartSource = extractQosChartSource();

  assert.match(qosChartSource, /buildLinePath\("sendrateY"\)/);
  assert.match(qosChartSource, /buildLinePath\("gbrY"\)/);
  assert.doesNotMatch(qosChartSource, /<circle\s+cx=\{point\.x\}/);
});

test("QoS chart fills the OTT zone and uses balanced compact typography", () => {
  const qosChartSource = extractQosChartSource();

  assert.match(qosChartSource, /left-\[73%\] top-\[63%\]/);
  assert.match(qosChartSource, /h-\[36%\] w-\[25%\]/);
  assert.match(qosChartSource, /text-\[19px\].*QoS保障曲线/);
  assert.match(qosChartSource, /text-\[21px\].*Q\{latestPoint/s);
  assert.match(qosChartSource, /text-\[16px\].*等待QoS推送/s);
  assert.match(qosChartSource, /text-\[14px\]/);
  assert.match(qosChartSource, /text-\[13px\]/);
  assert.match(qosChartSource, /text-\[12px\]/);
});
