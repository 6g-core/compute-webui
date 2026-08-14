import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);

const extractQosDialogOverlaySource = () => {
  const start = source.indexOf("const QosDialogOverlay =");
  const end = source.indexOf("const DogVisionPanel =", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  return source.slice(start, end);
};

test("QoS dialog overlay aligns left and right placements explicitly", () => {
  const overlaySource = extractQosDialogOverlaySource();

  assert.match(overlaySource, /horizontalPlacement === "left"/);
  assert.match(overlaySource, /horizontalPlacement === "right"/);
  assert.match(overlaySource, /verticalPlacement !== "below"/);
  assert.match(overlaySource, /w-1\/4/);
  assert.match(overlaySource, /h-auto/);
});
