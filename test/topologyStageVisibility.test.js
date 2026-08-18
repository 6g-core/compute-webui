import assert from "node:assert/strict";
import test from "node:test";

import {
  shouldShowOttDomain,
  shouldShowQosMetricsChart,
  shouldShowTokenTunnel,
  shouldShowTopologyConnection,
  shouldShowTopologyNode,
} from "../src/utils/topologyStageVisibility.js";

test("stage 9 replaces the OTT domain contents with the QoS chart", () => {
  assert.equal(shouldShowOttDomain(9), false);
  assert.equal(shouldShowQosMetricsChart(9), true);
  assert.equal(shouldShowTokenTunnel(9), true);
  assert.equal(shouldShowTopologyNode(9, "OttAgentGW"), false);
  assert.equal(shouldShowTopologyNode(9, "MarketAgent"), false);
  assert.equal(shouldShowTopologyNode(9, "AgentGW"), true);
  assert.equal(shouldShowTopologyConnection(9, ["AgentGW", "OttAgentGW"]), false);
  assert.equal(shouldShowTopologyConnection(9, ["OttAgentGW", "MarketAgent"]), false);
});

test("stage 10 restores the OTT domain and hides the QoS chart", () => {
  assert.equal(shouldShowOttDomain(10), true);
  assert.equal(shouldShowQosMetricsChart(10), false);
  assert.equal(shouldShowTokenTunnel(10), false);
  assert.equal(shouldShowTopologyNode(10, "OttAgentGW"), true);
  assert.equal(shouldShowTopologyNode(10, "MarketAgent"), true);
  assert.equal(shouldShowTopologyConnection(10, ["AgentGW", "OttAgentGW"]), true);
  assert.equal(shouldShowTopologyConnection(10, ["OttAgentGW", "MarketAgent"]), true);
});

test("the Token Tunnel is exclusive to in-path QoS stage 9", () => {
  assert.equal(shouldShowTokenTunnel(8), false);
  assert.equal(shouldShowTokenTunnel("9"), true);
  assert.equal(shouldShowTokenTunnel(10), false);
});
