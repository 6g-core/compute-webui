import assert from "node:assert/strict";
import test from "node:test";

import {
  getTaskSummaryText,
  shouldShowTaskSummary,
  TASK_SUMMARY_CLASSNAME,
  TASK_SUMMARY_TEXT_CLASSNAME,
} from "../src/utils/topologySummary.js";

test("shouldShowTaskSummary hides the overlay when there is no topology animation", () => {
  assert.equal(shouldShowTaskSummary({
    activeConnections: [],
    highlightedNodes: [],
    topologyLines: [],
    stage9BlinkActive: false,
  }), false);
});

test("shouldShowTaskSummary shows the overlay for active animation signals", () => {
  assert.equal(shouldShowTaskSummary({ highlightedNodes: ["SystemAgent"] }), true);
  assert.equal(shouldShowTaskSummary({ activeConnections: ["SystemAgent->ACN"] }), true);
  assert.equal(shouldShowTaskSummary({ topologyLines: [{ key: "UE->gNB" }] }), true);
  assert.equal(shouldShowTaskSummary({ stage9BlinkActive: true }), true);
});

test("getTaskSummaryText follows phase-specific mappings for intent stages", () => {
  assert.equal(getTaskSummaryText({ stagePhaseKey: "stage2_source" }), "数字身份申请");
  assert.equal(getTaskSummaryText({ stagePhaseKey: "stage4_source" }), "创建家庭域");
  assert.equal(getTaskSummaryText({ stagePhaseKey: "stage5_source" }), "视频传输保障");
  assert.equal(getTaskSummaryText({ stagePhaseKey: "stage7_source_ar" }), "申请网内算力");
});

test("getTaskSummaryText falls back to workflow mapping and hides idle stage 9", () => {
  assert.equal(getTaskSummaryText({
    workflow: [{ label: "身份可信认证:", status: "working" }],
  }), "机器狗和AR眼镜分别与超市智能体双向认证");

  assert.equal(getTaskSummaryText({
    stage: 9,
    stage9BlinkActive: false,
    workflow: [{ label: "物品交接:", status: "success" }],
  }), "");
});

test("TASK_SUMMARY_CLASSNAME keeps summary narrow, wrapped, and non-truncated", () => {
  assert.match(TASK_SUMMARY_CLASSNAME, /max-w-\[24%\]/);
  assert.match(TASK_SUMMARY_TEXT_CLASSNAME, /whitespace-normal/);
  assert.match(TASK_SUMMARY_TEXT_CLASSNAME, /break-words/);
  assert.doesNotMatch(TASK_SUMMARY_CLASSNAME, /truncate/);
  assert.doesNotMatch(TASK_SUMMARY_TEXT_CLASSNAME, /truncate/);
  assert.doesNotMatch(TASK_SUMMARY_TEXT_CLASSNAME, /text-wrap/);
});
