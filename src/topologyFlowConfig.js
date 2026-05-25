const latency = (min, max) => ({ min, max });

export const TOPOLOGY_STAGE_FLOW_CONFIG = {
  1: {
    default: {
      color: "#22f5ff",
      lines: [],
    },
  },
  2: {
    auth: {
      color: "#22f5ff",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "gNB->SRF", latencyMs: latency(7, 12) },
        { key: "SRF->ACN", latencyMs: latency(5, 10) },
      ],
    },
  },
  3: {
    auth: {
      color: "#22f5ff",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "gNB->SRF", latencyMs: latency(7, 12) },
        { key: "SRF->ACN", latencyMs: latency(5, 10) },
      ],
    },
  },
  4: {
    domain: {
      color: "#34d399",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "UE->gNB", latencyMs: latency(3, 7) },
        { key: "gNB->SRF", latencyMs: latency(7, 13) },
        { key: "SRF->ACN", latencyMs: latency(5, 10) },
      ],
    },
  },
  5: {
    dogVision: {
      color: "#22f5ff",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "UE->gNB", latencyMs: latency(3, 7) },
        { key: "gNB->UPF", latencyMs: latency(8, 14), labelPosition: "below" },
      ],
    },
  },
  6: {
    a2aGateway: {
      color: "#38bdf8",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "UE->gNB", latencyMs: latency(3, 7) },
        { key: "gNB->UPF", latencyMs: latency(8, 14), labelPosition: "below" },
        { key: "UPF->AgentGW", latencyMs: latency(9, 16) },
      ],
    },
    a2aTrust: {
      color: "#f472b6",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "UE->gNB", latencyMs: latency(3, 7) },
        { key: "gNB->SRF", latencyMs: latency(7, 13) },
        { key: "SRF->ACN", latencyMs: latency(5, 10) },
      ],
    },
  },
  7: {
    computeSandbox: {
      color: "#fbbf24",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "gNB->SRF", latencyMs: latency(7, 13) },
        { key: "SRF->Computing", latencyMs: latency(6, 12) },
      ],
    },
  },
  8: {
    dogVision: {
      color: "#22f5ff",
      lines: [
        { key: "RobotDog->gNB", latencyMs: latency(4, 8) },
        { key: "UE->gNB", latencyMs: latency(3, 7) },
        { key: "gNB->UPF", latencyMs: latency(8, 14), labelPosition: "below" },
        { key: "UPF->Gateway", latencyMs: latency(6, 11) },
      ],
    },
  },
};

export const getTopologyFlowConfig = (stage, activeFlowType) => {
  const stageConfig = TOPOLOGY_STAGE_FLOW_CONFIG[stage] || {};
  return stageConfig[activeFlowType] || stageConfig.default || { color: "#22f5ff", lines: [] };
};
