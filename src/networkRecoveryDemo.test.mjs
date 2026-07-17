import assert from "node:assert/strict";
import {
  appendNetworkRecoveryBandwidthPoint,
  buildNetworkRecoveryPresentation,
  buildNetworkRecoveryStartPayload,
  isNetworkRecoveryStartDisabled,
  normalizeNetworkRecoveryDemoPayload,
  normalizeNetworkRecoveryPhase,
} from "./networkRecoveryDemo.js";

assert.equal(normalizeNetworkRecoveryPhase("optimizing"), "optimizing");
assert.equal(normalizeNetworkRecoveryPhase("bad-value"), "idle");
assert.equal(normalizeNetworkRecoveryPhase(undefined), "idle");

assert.deepEqual(normalizeNetworkRecoveryDemoPayload({
  phase: "congested",
  updatedAtMs: 123,
  sampledAtMs: 456,
  bandwidthMbps: 0.82,
  bandwidthUnit: "Mbps",
}), {
  phase: "congested",
  updatedAtMs: 123,
  sampledAtMs: 456,
  bandwidthMbps: 0.82,
  bandwidthUnit: "Mbps",
});
assert.deepEqual(normalizeNetworkRecoveryDemoPayload({ phase: "guaranteed" }), {
  phase: "guaranteed",
  updatedAtMs: 0,
  sampledAtMs: 0,
  bandwidthMbps: 1.5,
  bandwidthUnit: "Mbps",
});
assert.deepEqual(normalizeNetworkRecoveryDemoPayload({ phase: "bad-value", bandwidthMbps: "bad" }), {
  phase: "idle",
  updatedAtMs: 0,
  sampledAtMs: 0,
  bandwidthMbps: 1.2,
  bandwidthUnit: "Mbps",
});

assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "idle", startLocked: false }), false);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 9, pending: false, phase: "idle", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: true, phase: "idle", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "congested", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "idle", startLocked: true }), true);
assert.deepEqual(buildNetworkRecoveryStartPayload(8), { stage: 8 });
assert.deepEqual(buildNetworkRecoveryStartPayload("8"), { stage: 8 });

const congested = buildNetworkRecoveryPresentation("congested");
assert.equal(congested.userPlaneLinks.length, 4);
assert.equal(congested.lineOverrides["UE->gNB"].latencyMs, 45);
assert.equal(congested.lineOverrides["UE->gNB"].color, "#ef4444");

const optimizing = buildNetworkRecoveryPresentation("optimizing");
assert.equal(optimizing.cmfLabel, "检测到网络恶化，保障策略应用中");
assert.equal(optimizing.activeConnections.length, 3);
assert.deepEqual(optimizing.labelPositions.CMF, { left: "56%", top: "57%" });

const guaranteed = buildNetworkRecoveryPresentation("guaranteed");
assert.equal(guaranteed.guaranteeLabels.RAN, "网络保障中");
assert.equal(guaranteed.guaranteeLabels.UPF, "网络保障中");
assert.deepEqual(guaranteed.labelPositions.RAN, { left: "18%", top: "64%" });
assert.deepEqual(guaranteed.labelPositions.UPF, { left: "32%", top: "90%" });

const bandwidthPoints = appendNetworkRecoveryBandwidthPoint(
  [{ timestamp: 1000, bandwidthMbps: 1.2 }],
  { bandwidthMbps: 0.83 },
  2000,
);
assert.deepEqual(bandwidthPoints, [
  { timestamp: 1000, bandwidthMbps: 1.2 },
  { timestamp: 2000, bandwidthMbps: 0.83 },
]);
