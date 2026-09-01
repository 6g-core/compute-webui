import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import {
  getDogEnhancedOfferUrl,
  getDogVisionOfferUrl,
  getWebRtcOfferUrl,
} from "../src/hooks/useBackendVideo.js";

const restoreWindow = (previousWindow) => {
  if (previousWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = previousWindow;
  }
};

test("background video defaults to the independent arm camera endpoint", () => {
  const previousWindow = globalThis.window;

  try {
    delete globalThis.window;

    assert.equal(getWebRtcOfferUrl(), "http://localhost:28450/offer");
    assert.equal(getDogVisionOfferUrl(), "http://localhost:8787/api/v1/web/sdp/offer");
    assert.equal(getDogEnhancedOfferUrl(), "http://localhost:8787/api/v1/web/sdp/offer");
  } finally {
    restoreWindow(previousWindow);
  }
});

test("background and dog video endpoints remain independently configurable", () => {
  const previousWindow = globalThis.window;

  try {
    globalThis.window = {
      __RUNTIME_CONFIG__: {
        webRtcHost: "arm-camera.example",
        webRtcPort: 29450,
        sandboxApiUrl: "http://sandbox.example:8787",
      },
      location: {
        protocol: "http:",
        hostname: "web.example",
      },
    };

    assert.equal(getWebRtcOfferUrl(), "http://arm-camera.example:29450/offer");
    assert.equal(getDogVisionOfferUrl(), "http://sandbox.example:8787/api/v1/web/sdp/offer");
    assert.equal(getDogEnhancedOfferUrl(), "http://sandbox.example:8787/api/v1/web/sdp/offer");
  } finally {
    restoreWindow(previousWindow);
  }
});

test("explicit video signaling URLs take precedence", () => {
  const previousWindow = globalThis.window;

  try {
    globalThis.window = {
      __RUNTIME_CONFIG__: {
        webRtcSignalUrl: "http://arm.example/offer",
        dogWebRtcSignalUrl: "http://dog.example/offer",
        dogEnhancedWebRtcSignalUrl: "http://enhanced.example/offer",
      },
      location: {
        protocol: "http:",
        hostname: "web.example",
      },
    };

    assert.equal(getWebRtcOfferUrl(), "http://arm.example/offer");
    assert.equal(getDogVisionOfferUrl(), "http://dog.example/offer");
    assert.equal(getDogEnhancedOfferUrl(), "http://enhanced.example/offer");
  } finally {
    restoreWindow(previousWindow);
  }
});

test("static runtime config keeps the arm camera separate from Sandbox video", () => {
  const source = readFileSync(new URL("../public/runtime-config.js", import.meta.url), "utf8");
  const context = {
    window: {
      location: {
        protocol: "http:",
        hostname: "demo.example",
      },
    },
  };

  vm.runInNewContext(source, context);

  assert.equal(context.window.__RUNTIME_CONFIG__.webRtcSignalUrl, "http://demo.example:28450/offer");
  assert.equal(
    context.window.__RUNTIME_CONFIG__.dogWebRtcSignalUrl,
    "http://demo.example:8787/api/v1/web/sdp/offer",
  );
  assert.equal(
    context.window.__RUNTIME_CONFIG__.dogEnhancedWebRtcSignalUrl,
    "http://demo.example:8787/api/v1/web/sdp/offer",
  );
});
