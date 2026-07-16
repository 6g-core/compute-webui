export const NETWORK_RECOVERY_PHASES = new Set(["idle", "congested", "optimizing", "guaranteed"]);
export const NETWORK_RECOVERY_RED_THRESHOLD_MS = 30;

export const NETWORK_RECOVERY_USER_PLANE_LINKS = [
  "UE->gNB",
  "RobotDog->gNB",
  "gNB->UPF",
  "UPF->Gateway",
];

export const NETWORK_RECOVERY_CONGESTED_LATENCY = {
  "UE->gNB": 45,
  "RobotDog->gNB": 52,
  "gNB->UPF": 64,
  "UPF->Gateway": 58,
};

export const NETWORK_RECOVERY_OPTIMIZING_CONNECTIONS = [
  { key: "Computing->SystemAgent", pathKey: "SystemAgent->Computing", reverse: true },
  { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
  { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
];

export const normalizeNetworkRecoveryPhase = (value) => (
  NETWORK_RECOVERY_PHASES.has(value) ? value : "idle"
);

export const isNetworkRecoveryStartDisabled = ({ stage, pending, phase, startLocked }) => (
  stage !== 8 || pending || startLocked || normalizeNetworkRecoveryPhase(phase) !== "idle"
);

export const buildNetworkRecoveryStartPayload = (stage) => ({
  stage: Number(stage),
});

export const buildNetworkRecoveryPresentation = (phaseInput) => {
  const phase = normalizeNetworkRecoveryPhase(phaseInput);
  const congested = phase === "congested" || phase === "optimizing";
  const lineOverrides = congested
    ? Object.fromEntries(
        NETWORK_RECOVERY_USER_PLANE_LINKS.map((key) => [
          key,
          {
            latencyMs: NETWORK_RECOVERY_CONGESTED_LATENCY[key],
            color: "#ef4444",
            thresholdMs: NETWORK_RECOVERY_RED_THRESHOLD_MS,
          },
        ]),
      )
    : {};

  return {
    phase,
    userPlaneLinks: NETWORK_RECOVERY_USER_PLANE_LINKS,
    lineOverrides,
    activeConnections: phase === "optimizing" ? NETWORK_RECOVERY_OPTIMIZING_CONNECTIONS : [],
    cmfLabel: phase === "optimizing" ? "检测到网络恶化，保障策略应用中" : "",
    guaranteeLabels: phase === "guaranteed" ? { RAN: "网络保障中", UPF: "网络保障中" } : {},
  };
};
