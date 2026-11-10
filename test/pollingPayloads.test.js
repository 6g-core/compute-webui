import assert from "node:assert/strict";
import test from "node:test";

import {
  appendLatencyPoint,
  parseArLastWhisper,
  parseLatencyPayload,
  parseStagePayload,
} from "../src/utils/pollingPayloads.js";

test("parseStagePayload normalizes backend stage 3 to frontend stage 2", () => {
  assert.equal(parseStagePayload({ stage: 3 }), 2);
});

test("parseStagePayload rejects unknown or missing stage values", () => {
  assert.throws(() => parseStagePayload({ stage: "random" }), /Unknown stage: random/);
  assert.throws(() => parseStagePayload({}), /Unknown stage: undefined/);
});

test("parseArLastWhisper trims real backend whisper fields without fabricating text", () => {
  assert.equal(parseArLastWhisper({ last_whisper: "  find the yellow bottle  " }), "find the yellow bottle");
  assert.equal(parseArLastWhisper({ lastWhisper: "  share video  " }), "share video");
  assert.equal(parseArLastWhisper({ transcript: "ignored" }), "");
  assert.equal(parseArLastWhisper(null), "");
});

test("parseLatencyPayload accepts finite latency and timestamp only", () => {
  assert.deepEqual(parseLatencyPayload({ latencyMs: "21.5", timestamp: 12345 }), {
    latencyMs: 21.5,
    timestamp: 12345,
  });

  assert.throws(() => parseLatencyPayload({ latencyMs: Infinity }), /invalid latency/);
  assert.throws(() => parseLatencyPayload({ latencyMs: "fast" }), /invalid latency/);
});

test("appendLatencyPoint keeps a bounded 24 point sliding window", () => {
  const current = Array.from({ length: 24 }, (_, index) => ({
    timestamp: index,
    latencyMs: index,
  }));

  const next = appendLatencyPoint(current, { timestamp: 24, latencyMs: 24 });

  assert.equal(next.length, 24);
  assert.equal(next[0].timestamp, 1);
  assert.equal(next.at(-1).timestamp, 24);
});

test("latest rejection pairs current sandbox speech with rejection despite old nanosecond core event", async () => {
  const { latestRejectedIntent } = await import("../src/utils/pollingPayloads.js");
  const current = { intent_reject: true, text: "Destroys the server.", timestamp: 1794295774787 };
  const old = { intent_reject: true, text: "old", timestamp: 1794282900366454449 };
  assert.equal(latestRejectedIntent([current, old]), current);
  assert.equal(latestRejectedIntent([old, current]), current);
  assert.equal(latestRejectedIntent([{ intent_reject: false }]), null);
  assert.equal(latestRejectedIntent([null]), null);
});
