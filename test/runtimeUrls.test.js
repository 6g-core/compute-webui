import assert from "node:assert/strict";
import test from "node:test";

import {
  buildHttpUrl,
  getQosPushChannelUrl,
  getRuntimeConfig,
  getStageApiUrl,
  normalizeStage,
} from "../src/config/runtimeUrls.js";

test("runtime URL helpers are safe when window is unavailable", () => {
  const previousWindow = globalThis.window;

  try {
    delete globalThis.window;

    assert.deepEqual(getRuntimeConfig(), {});
    assert.equal(buildHttpUrl(8000, "/api/stage"), "http://localhost:8000/api/stage");
    assert.equal(getStageApiUrl(), "http://localhost:8000/api/stage");
    assert.equal(getQosPushChannelUrl(), "http://localhost:8787/api/v1/qos/events");
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("runtime URL helpers prefer injected runtime config in browser-like environments", () => {
  const previousWindow = globalThis.window;

  try {
    globalThis.window = {
      __RUNTIME_CONFIG__: {
        stageApiUrl: "http://stage.example/api/stage",
        qosPushChannelUrl: "http://stage.example/api/v1/qos/events",
        backendHost: "backend.example",
      },
      location: {
        protocol: "https:",
        hostname: "web.example",
      },
    };

    assert.equal(getStageApiUrl(), "http://stage.example/api/stage");
    assert.equal(getQosPushChannelUrl(), "http://stage.example/api/v1/qos/events");
    assert.equal(buildHttpUrl(8787, "/api/health"), "https://web.example:8787/api/health");
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("normalizeStage accepts only stages used by the mock UI", () => {
  assert.equal(normalizeStage(1), 1);
  assert.equal(normalizeStage("3"), 2);
  assert.equal(normalizeStage(9), 9);
  assert.equal(normalizeStage(10), 10);
  assert.equal(normalizeStage(0), null);
  assert.equal(normalizeStage("not-a-stage"), null);
});
