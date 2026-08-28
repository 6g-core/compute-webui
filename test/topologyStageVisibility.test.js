import assert from "node:assert/strict";
import test from "node:test";

import {
  isQosExperienceStage,
  shouldShowOttDomain,
  shouldShowTokenTunnel,
  shouldShowTopologyConnection,
  shouldShowTopologyNode,
} from "../src/utils/topologyStageVisibility.js";

test("stage 9 hides the OTT domain while showing Token Tunnel", () => {
  assert.equal(isQosExperienceStage(9), true);
  assert.equal(shouldShowOttDomain(9), false);
  assert.equal(shouldShowTokenTunnel(9), true);
  assert.equal(shouldShowTopologyNode(9, "OttAgentGW"), false);
  assert.equal(shouldShowTopologyNode(9, "MarketAgent"), false);
  assert.equal(shouldShowTopologyNode(9, "AgentGW"), true);
  assert.equal(shouldShowTopologyConnection(9, ["AgentGW", "OttAgentGW"]), false);
  assert.equal(shouldShowTopologyConnection(9, ["OttAgentGW", "MarketAgent"]), false);
});

test("stages 21 through 24 preserve the final stage 9 topology", () => {
  [21, 22, 23, 24].forEach((stage) => {
    assert.equal(isQosExperienceStage(stage), true);
    assert.equal(shouldShowOttDomain(stage), false);
  });
  [21, 22, 23, 24].forEach((stage) => assert.equal(shouldShowTokenTunnel(stage), true));
});

test("stage 10 restores the OTT domain and hides Token Tunnel", () => {
  assert.equal(shouldShowOttDomain(10), true);
  assert.equal(shouldShowTokenTunnel(10), false);
  assert.equal(shouldShowTopologyNode(10, "OttAgentGW"), true);
  assert.equal(shouldShowTopologyNode(10, "MarketAgent"), true);
  assert.equal(shouldShowTopologyConnection(10, ["AgentGW", "OttAgentGW"]), true);
  assert.equal(shouldShowTopologyConnection(10, ["OttAgentGW", "MarketAgent"]), true);
});

test("the Token Tunnel is exclusive to the in-path QoS views", () => {
  assert.equal(shouldShowTokenTunnel(8), false);
  assert.equal(shouldShowTokenTunnel("9"), true);
  assert.equal(shouldShowTokenTunnel(10), false);
  assert.equal(shouldShowTokenTunnel(24), true);
});
