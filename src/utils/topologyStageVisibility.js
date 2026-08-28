const OTT_DOMAIN_NODE_KEYS = new Set(["OttAgentGW", "MarketAgent"]);
const QOS_EXPERIENCE_STAGES = new Set([9, 21, 22, 23, 24]);
const TOKEN_TUNNEL_STAGES = new Set([9, 21, 22, 23, 24]);

export const isQosExperienceStage = (stage) => QOS_EXPERIENCE_STAGES.has(Number(stage));

export const shouldShowOttDomain = (stage) => !isQosExperienceStage(stage);

export const shouldShowTokenTunnel = (stage) => TOKEN_TUNNEL_STAGES.has(Number(stage));

export const shouldShowTopologyNode = (stage, nodeKey) => (
  shouldShowOttDomain(stage) || !OTT_DOMAIN_NODE_KEYS.has(nodeKey)
);

export const shouldShowTopologyConnection = (stage, connection) => (
  connection.every((nodeKey) => shouldShowTopologyNode(stage, nodeKey))
);
