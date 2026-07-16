import assert from "node:assert/strict";
import {
  buildNetworkRecoveryPresentation,
  buildNetworkRecoveryStartPayload,
  isNetworkRecoveryStartDisabled,
  normalizeNetworkRecoveryPhase,
} from "./networkRecoveryDemo.js";

assert.equal(normalizeNetworkRecoveryPhase("optimizing"), "optimizing");
assert.equal(normalizeNetworkRecoveryPhase("bad-value"), "idle");
assert.equal(normalizeNetworkRecoveryPhase(undefined), "idle");

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

const guaranteed = buildNetworkRecoveryPresentation("guaranteed");
assert.equal(guaranteed.guaranteeLabels.RAN, "网络保障中");
assert.equal(guaranteed.guaranteeLabels.UPF, "网络保障中");
