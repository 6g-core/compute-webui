# Mock WebUI White-Box Reliability Notes

## Scope

This document covers reliability-sensitive logic in the mock frontend:

- Runtime URL resolution for browser, Docker, and Node test environments.
- Stage, AR whisper, and latency payload parsing.
- Topology task summary visibility and stage-to-summary mapping.
- Automated tests used for white-box review.

It intentionally does not cover visual asset quality, video codec behavior, or real backend model correctness.

## Architecture

The UI keeps React components focused on rendering and moves deterministic rules into pure utility modules:

- `src/config/runtimeUrls.js` resolves API URLs from `window.__RUNTIME_CONFIG__`, Vite environment variables, or host/port defaults.
- `src/utils/pollingPayloads.js` parses backend polling payloads and rejects invalid values before hooks update state.
- `src/utils/topologySummary.js` owns the task summary mapping and CSS class constants used by `NetworkTopology3D`.
- `src/hooks/usePolling.js` remains responsible for polling cadence, connection state, and hook cleanup.
- `src/components/NetworkTopology3D.jsx` renders topology state but no longer owns task-summary business rules.

This split makes the main reliability rules testable with Node's built-in test runner without a browser or extra dependencies.

## Reliability Rules

### Runtime URL Resolution

`runtimeUrls.js` is safe to import and call in non-browser environments. If `window` is unavailable, helpers use:

- Empty runtime config: `{}`
- Protocol: `http:`
- Hostname: `localhost`

Priority order for API URLs:

1. Explicit runtime config, such as `window.__RUNTIME_CONFIG__.stageApiUrl`
2. Vite environment variable, such as `VITE_STAGE_API_URL`
3. Runtime host/port fallback, such as `http://localhost:8000/api/stage`

### Polling Payload Parsing

`pollingPayloads.js` centralizes defensive parsing:

- Stage payloads must normalize to one of `1, 2, 4, 5, 6, 7, 8, 9`; backend stage `3` maps to frontend stage `2`.
- Unknown stage values throw and leave the current UI stage unchanged through `useStagePolling`.
- AR speech uses only `last_whisper` or `lastWhisper`; unrelated fields do not fabricate bubbles.
- Latency must be a finite number.
- Latency history is bounded to 24 points to keep rendering stable.

### Topology Summary

`topologySummary.js` defines when the top-left task summary appears:

- Hidden when no topology animation signal is active.
- Visible when there are active connections, highlighted nodes, topology lines, or a Stage 9 handoff flash.
- Stage 9 hides the summary after the handoff flash ends.
- Text is wrapped, not truncated, and the max width is capped at `24%` to avoid covering the CP frame.

The phase summary mapping is explicit so white-box reviewers can trace which animation phase produces each summary.

## Test Matrix

Run all tests:

```bash
npm test
```

Current test files:

- `test/runtimeUrls.test.js`
  - Verifies helpers do not throw without `window`.
  - Verifies runtime config overrides fallback URLs.
  - Verifies stage normalization accepts only supported stages.

- `test/pollingPayloads.test.js`
  - Verifies stage parsing and backend stage `3` normalization.
  - Verifies AR whisper extraction does not use unrelated transcript fields.
  - Verifies invalid latency rejection.
  - Verifies latency series remains bounded to 24 points.

- `test/topologySummary.test.js`
  - Verifies summary overlay visibility gating.
  - Verifies phase-specific summary mappings.
  - Verifies idle Stage 9 hides the summary.
  - Verifies summary styling remains wrapped and non-truncated.

Build verification:

```bash
npm run build
```

Whitespace verification:

```bash
git diff --check
```

## White-Box Review Checklist

- Confirm all polling data enters UI state through `src/utils/pollingPayloads.js`.
- Confirm task summary text comes from `src/utils/topologySummary.js`, not duplicated component-local maps.
- Confirm `NetworkTopology3D` uses `TASK_SUMMARY_CLASSNAME`, `TASK_SUMMARY_BAR_CLASSNAME`, and `TASK_SUMMARY_TEXT_CLASSNAME`.
- Confirm no test depends on external network, Docker, browser, or model services.
- Confirm `npm test` and `npm run build` pass before rebuilding Docker images.
