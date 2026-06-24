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
