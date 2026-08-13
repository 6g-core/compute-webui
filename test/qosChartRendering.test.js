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
