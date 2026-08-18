const OTT_DOMAIN_NODE_KEYS = new Set(["OttAgentGW", "MarketAgent"]);

export const shouldShowOttDomain = (stage) => Number(stage) !== 9;

export const shouldShowQosMetricsChart = (stage) => Number(stage) === 9;

export const shouldShowTokenTunnel = (stage) => Number(stage) === 9;

export const shouldShowTopologyNode = (stage, nodeKey) => (
  shouldShowOttDomain(stage) || !OTT_DOMAIN_NODE_KEYS.has(nodeKey)
);

export const shouldShowTopologyConnection = (stage, connection) => (
  connection.every((nodeKey) => shouldShowTopologyNode(stage, nodeKey))
);
