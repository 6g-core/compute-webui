import assert from "node:assert/strict";
import test from "node:test";

import {
  isSupportedQosImageSource,
  parseQosPushPayload,
} from "../src/utils/qosPayloads.js";

test("parseQosPushPayload accepts metrics-only payloads", () => {
  const parsed = parseQosPushPayload({
    metrics: [
      {
        timestamp: "2026-08-03T10:00:00.000Z",
        sendrate_kbps: "4200",
        gbr_kbps: 5000,
        q_lvl: 4,
      },
    ],
  });

  assert.equal(parsed.type, "metrics");
  assert.equal(parsed.metrics.length, 1);
  assert.equal(parsed.metrics[0].sendrate_kbps, 4200);
  assert.equal(parsed.metrics[0].gbr_kbps, 5000);
  assert.equal(parsed.metrics[0].q_lvl, 4);
});

test("parseQosPushPayload accepts dialog/image payloads with per-item placement", () => {
  const parsed = parseQosPushPayload({
    dialogs: ["QoS保障已启用", "GBR已抬升"],
    images: [
      "data:image/png;base64,QUJDRA==",
      "https://example.com/qos.gif",
    ],
    imagePlacements: ["above", "below"],
  });

  assert.equal(parsed.type, "dialogImages");
  assert.deepEqual(parsed.dialogItems.map((item) => item.imagePlacement), ["above", "below"]);
  assert.equal(parsed.dialogItems[0].dialog, "QoS保障已启用");
});

test("parseQosPushPayload rejects mixed metrics and dialog/image payloads", () => {
  assert.throws(() => parseQosPushPayload({
    metrics: [],
    dialogs: [],
    images: [],
    imagePlacements: [],
  }), /cannot mix metrics/);
});

test("parseQosPushPayload accepts reset payloads", () => {
  assert.deepEqual(parseQosPushPayload({ type: "reset" }), { type: "reset" });
  assert.deepEqual(parseQosPushPayload({ reset: true }), { type: "reset" });
  assert.throws(() => parseQosPushPayload({
    type: "reset",
    dialogs: [],
    images: [],
    imagePlacements: [],
  }), /cannot mix reset/);
});

test("parseQosPushPayload validates dialog/image array shape", () => {
  assert.throws(() => parseQosPushPayload({
    dialogs: ["QoS保障已启用"],
    images: ["data:image/png;base64,QUJDRA=="],
    imagePlacements: [],
  }), /same length/);

  assert.throws(() => parseQosPushPayload({
    dialogs: ["QoS保障已启用"],
    images: ["data:image/svg+xml;base64,QUJDRA=="],
    imagePlacements: ["above"],
  }), /png\/jpeg\/gif/);
});

test("isSupportedQosImageSource allows png jpeg gif data URIs and http URLs only", () => {
  assert.equal(isSupportedQosImageSource("data:image/png;base64,QUJDRA=="), true);
  assert.equal(isSupportedQosImageSource("data:image/jpeg;base64,QUJDRA=="), true);
  assert.equal(isSupportedQosImageSource("data:image/gif;base64,QUJDRA=="), true);
  assert.equal(isSupportedQosImageSource("https://example.com/a.png"), true);
  assert.equal(isSupportedQosImageSource("ftp://example.com/a.png"), false);
  assert.equal(isSupportedQosImageSource("data:image/webp;base64,QUJDRA=="), false);
});
