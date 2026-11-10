import { normalizeStage } from "../config/runtimeUrls.js";

export const parseStagePayload = (payload) => {
  const nextStage = normalizeStage(payload?.stage);

  if (!nextStage) {
    throw new Error(`Unknown stage: ${payload?.stage}`);
  }

  return nextStage;
};

export const parseArLastWhisper = (payload) => (
  String(payload?.last_whisper ?? payload?.lastWhisper ?? "").trim()
);

export const parseLatencyPayload = (payload, now = Date.now) => {
  const latencyMs = Number(payload?.latencyMs);

  if (!Number.isFinite(latencyMs)) {
    throw new Error("Latency API returned invalid latency");
  }

  const timestamp = Number(payload?.timestamp);

  return {
    latencyMs,
    timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : now(),
  };
};

export const appendLatencyPoint = (points, point, maxPoints = 24) => (
  [...points, point].slice(-maxPoints)
);

// Core timestamps are nanoseconds, sandbox timestamps are milliseconds.
export const latestRejectedIntent = (payloads) => {
  const milliseconds = (value) => {
    const stamp = Number(value || 0);
    return stamp > 1e17 ? stamp / 1e6 : stamp > 0 && stamp < 1e11 ? stamp * 1000 : stamp;
  };
  return payloads.filter((item) => item?.intent_reject).reduce(
    (latest, item) => !latest || milliseconds(item.timestamp) > milliseconds(latest.timestamp) ? item : latest,
    null,
  );
};
