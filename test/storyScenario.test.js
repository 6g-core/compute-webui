import assert from "node:assert/strict";
import test from "node:test";

import {
  applyStoryProfileToText,
  applyStoryProfileToValue,
  getStoryScenario,
  normalizeStoryScenario,
} from "../src/config/storyScenario.js";

test("normalizeStoryScenario keeps supported scenarios and falls back to blind box", () => {
  assert.equal(normalizeStoryScenario("blind_box_store"), "blind_box_store");
  assert.equal(normalizeStoryScenario("parcel_pickup"), "parcel_pickup");
  assert.equal(normalizeStoryScenario("unknown"), "blind_box_store");
});

test("parcel_pickup profile replaces store copy with parcel copy", () => {
  assert.equal(
    applyStoryProfileToText(
      "机器狗与超市智能体完成商品交接。",
      "parcel_pickup",
    ),
    "机器狗与快递站智能体完成快递交接。",
  );
  assert.equal(
    applyStoryProfileToText(
      "Compute offloading for object recognition",
      "parcel_pickup",
    ),
    "Compute offloading for parcel damage inspection",
  );
});

test("getStoryScenario reads browser runtime config", () => {
  globalThis.window = {
    __RUNTIME_CONFIG__: { storyScenario: "parcel_pickup" },
  };
  try {
    assert.equal(getStoryScenario(), "parcel_pickup");
  } finally {
    delete globalThis.window;
  }
});

test("applyStoryProfileToValue rewrites nested values and object keys", () => {
  assert.deepEqual(
    applyStoryProfileToValue(
      {
        "物品交接:": ["获取超市智能体数字身份"],
      },
      "parcel_pickup",
    ),
    {
      "快递交接:": ["获取快递站智能体数字身份"],
    },
  );
});
