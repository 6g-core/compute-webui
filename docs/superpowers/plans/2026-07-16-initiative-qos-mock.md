# Initiative QoS Mock Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 compute-webui Stage 8 增加网络拥塞恢复 demo 入口，并根据 sandbox health phase 展示用户面红线、CMF 优化提示、控制面高亮和 RAN/UPF 保障标签。

**Architecture:** sandbox 只提供 `networkRecoveryDemo.phase`；web 本地维护 Stage 8 的链路集合、展示时延覆盖值、按钮锁定和节点提示。新增一个小型纯函数模块承载 phase 归一化与拓扑展示规则，React 组件只消费计算结果。

**Tech Stack:** React, Vite, plain Node tests, existing `usePolling.js`, existing `NetworkTopology3D.jsx`, existing `topologyFlowConfig.js`.

---

## 2026-07-16 调整：时长、带宽图和提示位置

**目标:** 在原 Stage 8 网络拥塞恢复 demo 上增加可配置阶段时长、sandbox 下发的保障带宽采样，以及更贴近节点下方的 CMF/RAN/UPF 提示位置。

**文件:**
- Modify: `sandbox/services/sandbox_service.py`
- Modify: `sandbox/tests/test_network_recovery_demo.py`
- Modify: `sandbox/docs/environment-variables.md`
- Modify: `compute-webui/src/networkRecoveryDemo.js`
- Modify: `compute-webui/src/networkRecoveryDemo.test.mjs`
- Modify: `compute-webui/src/hooks/usePolling.js`
- Modify: `compute-webui/src/App.jsx`
- Modify: `compute-webui/src/components/DemoPanels.jsx`
- Modify: `compute-webui/src/components/NetworkTopology3D.jsx`
- Modify: `compute-webui/docs/superpowers/specs/2026-07-16-initiative-qos-mock-design.md`

- [x] **Step 1: 写 sandbox 失败测试**

覆盖默认 `congested/optimizing` 时长为 `5.0` 秒、环境变量覆盖、health payload 包含 `bandwidthBaseMbps/bandwidthMbps/bandwidthUnit/sampledAtMs`，并确认 phase 对应 `1.2/0.8/0.8/1.5Mbps` 基准值。

- [x] **Step 2: 写 compute-webui 失败测试**

覆盖 `normalizeNetworkRecoveryDemoPayload`、`appendNetworkRecoveryBandwidthPoint` 和 `buildNetworkRecoveryPresentation().labelPositions`。

- [x] **Step 3: 实现 sandbox 最小改动**

新增 `SANDBOX_NETWORK_RECOVERY_DEMO_CONGESTED_S` 与 `SANDBOX_NETWORK_RECOVERY_DEMO_OPTIMIZING_S`，默认 `5.0` 秒；`/api/health.networkRecoveryDemo` 增加带宽采样字段并保留原 phase 字段。

- [x] **Step 4: 实现 web 最小改动**

`useNetworkRecoveryDemo` 读取带宽字段；`DemoApp` 维护最近 24 个带宽采样；Stage 8 右侧面板在时延图下方展示 `保障带宽` 折线图；CMF/RAN/UPF 标签使用集中配置的位置。

- [x] **Step 5: 验证**

运行 targeted unit tests、sandbox 相关回归、compute-webui build，并只暂存本轮相关文件，保留本地 `public/runtime-config.js` 端口配置不提交。

## File Structure

- Create: `src/networkRecoveryDemo.js`
  - phase 归一化、按钮禁用条件、Stage 8 用户面链路、控制面高亮路径、展示文案。
- Create: `src/networkRecoveryDemo.test.mjs`
  - 使用 Node `assert` 测试纯函数。
- Modify: `package.json`
  - 新增 `test:qos-demo` 脚本。
- Modify: `src/hooks/usePolling.js`
  - 新增 `useNetworkRecoveryDemo(enabled)`，轮询 sandbox health。
- Modify: `src/App.jsx`
  - 调用 hook，发起 `/start`，传递 demo props。
- Modify: `src/components/DemoPanels.jsx`
  - Stage 8 右侧区域增加按钮和错误提示。
- Modify: `src/components/NetworkTopology3D.jsx`
  - 根据 demo presentation 覆盖线色、时延、控制面高亮和节点标签。

### Task 1: Pure Demo Presentation Rules

**Files:**
- Create: `src/networkRecoveryDemo.js`
- Create: `src/networkRecoveryDemo.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing pure-function tests**

Create `src/networkRecoveryDemo.test.mjs`:

```js
import assert from "node:assert/strict";
import {
  buildNetworkRecoveryPresentation,
  isNetworkRecoveryStartDisabled,
  normalizeNetworkRecoveryPhase,
} from "./networkRecoveryDemo.js";

assert.equal(normalizeNetworkRecoveryPhase("optimizing"), "optimizing");
assert.equal(normalizeNetworkRecoveryPhase("bad-value"), "idle");
assert.equal(normalizeNetworkRecoveryPhase(undefined), "idle");

assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "idle", startLocked: false }), false);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 9, pending: false, phase: "idle", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: true, phase: "idle", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "congested", startLocked: false }), true);
assert.equal(isNetworkRecoveryStartDisabled({ stage: 8, pending: false, phase: "idle", startLocked: true }), true);

const congested = buildNetworkRecoveryPresentation("congested");
assert.equal(congested.userPlaneLinks.length, 4);
assert.equal(congested.lineOverrides["UE->gNB"].latencyMs, 45);
assert.equal(congested.lineOverrides["UE->gNB"].color, "#ef4444");

const optimizing = buildNetworkRecoveryPresentation("optimizing");
assert.equal(optimizing.cmfLabel, "检测到网络恶化，保障策略应用中");
assert.equal(optimizing.activeConnections.length, 3);

const guaranteed = buildNetworkRecoveryPresentation("guaranteed");
assert.equal(guaranteed.guaranteeLabels.RAN, "网络保障中");
assert.equal(guaranteed.guaranteeLabels.UPF, "网络保障中");
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
node src/networkRecoveryDemo.test.mjs
```

Expected: failure because `src/networkRecoveryDemo.js` does not exist.

- [ ] **Step 3: Implement pure functions**

Create `src/networkRecoveryDemo.js`:

```js
export const NETWORK_RECOVERY_PHASES = new Set(["idle", "congested", "optimizing", "guaranteed"]);
export const NETWORK_RECOVERY_RED_THRESHOLD_MS = 30;

export const NETWORK_RECOVERY_USER_PLANE_LINKS = [
  "UE->gNB",
  "RobotDog->gNB",
  "gNB->UPF",
  "UPF->Gateway",
];

export const NETWORK_RECOVERY_CONGESTED_LATENCY = {
  "UE->gNB": 45,
  "RobotDog->gNB": 52,
  "gNB->UPF": 64,
  "UPF->Gateway": 58,
};

export const NETWORK_RECOVERY_OPTIMIZING_CONNECTIONS = [
  { key: "Computing->SystemAgent", pathKey: "SystemAgent->Computing", reverse: true },
  { key: "SystemAgent->SRF", pathKey: "SRF->SystemAgent", reverse: true },
  { key: "SRF->gNB", pathKey: "gNB->SRF", reverse: true },
];

export const normalizeNetworkRecoveryPhase = (value) => (
  NETWORK_RECOVERY_PHASES.has(value) ? value : "idle"
);

export const isNetworkRecoveryStartDisabled = ({ stage, pending, phase, startLocked }) => (
  stage !== 8 || pending || startLocked || normalizeNetworkRecoveryPhase(phase) !== "idle"
);

export const buildNetworkRecoveryPresentation = (phaseInput) => {
  const phase = normalizeNetworkRecoveryPhase(phaseInput);
  const congested = phase === "congested" || phase === "optimizing";
  const lineOverrides = congested
    ? Object.fromEntries(
        NETWORK_RECOVERY_USER_PLANE_LINKS.map((key) => [
          key,
          {
            latencyMs: NETWORK_RECOVERY_CONGESTED_LATENCY[key],
            color: "#ef4444",
            thresholdMs: NETWORK_RECOVERY_RED_THRESHOLD_MS,
          },
        ]),
      )
    : {};

  return {
    phase,
    userPlaneLinks: NETWORK_RECOVERY_USER_PLANE_LINKS,
    lineOverrides,
    activeConnections: phase === "optimizing" ? NETWORK_RECOVERY_OPTIMIZING_CONNECTIONS : [],
    cmfLabel: phase === "optimizing" ? "检测到网络恶化，保障策略应用中" : "",
    guaranteeLabels: phase === "guaranteed" ? { RAN: "网络保障中", UPF: "网络保障中" } : {},
  };
};
```

Update `package.json` scripts:

```json
"test:qos-demo": "node src/networkRecoveryDemo.test.mjs"
```

- [ ] **Step 4: Run test and verify it passes**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
npm run test:qos-demo
```

Expected: script exits with code 0.

### Task 2: Health Polling and Start API

**Files:**
- Modify: `src/hooks/usePolling.js`
- Modify: `src/networkRecoveryDemo.js`

- [ ] **Step 1: Add start helper test**

Update the existing import in `src/networkRecoveryDemo.test.mjs`:

```js
import {
  buildNetworkRecoveryPresentation,
  buildNetworkRecoveryStartPayload,
  isNetworkRecoveryStartDisabled,
  normalizeNetworkRecoveryPhase,
} from "./networkRecoveryDemo.js";
```

Append these assertions after the phase/button assertions:

```js
assert.deepEqual(buildNetworkRecoveryStartPayload(8), { stage: 8 });
assert.deepEqual(buildNetworkRecoveryStartPayload("8"), { stage: 8 });
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
npm run test:qos-demo
```

Expected: failure because `buildNetworkRecoveryStartPayload` is not exported.

- [ ] **Step 3: Implement start payload and health hook**

Add to `src/networkRecoveryDemo.js`:

```js
export const buildNetworkRecoveryStartPayload = (stage) => ({
  stage: Number(stage),
});
```

In `src/hooks/usePolling.js`, import `getSandboxHealthApiUrl` and `normalizeNetworkRecoveryPhase`, then add:

```js
const useNetworkRecoveryDemo = (enabled) => {
  const [state, setState] = useState({ phase: "idle", updatedAtMs: 0, error: null });

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    if (!enabled) {
      setState({ phase: "idle", updatedAtMs: 0, error: null });
      return undefined;
    }

    const pollHealth = async () => {
      if (isPolling) {
        return;
      }
      isPolling = true;
      try {
        const response = await fetch(getSandboxHealthApiUrl(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Sandbox health API failed: ${response.status}`);
        }
        const payload = await response.json();
        const demo = payload.networkRecoveryDemo || {};
        if (!disposed) {
          setState({
            phase: normalizeNetworkRecoveryPhase(demo.phase),
            updatedAtMs: Number(demo.updatedAtMs) || 0,
            error: null,
          });
        }
      } catch (healthError) {
        if (!disposed) {
          setState({ phase: "idle", updatedAtMs: 0, error: healthError.message });
        }
      } finally {
        isPolling = false;
      }
    };

    pollHealth();
    const interval = window.setInterval(pollHealth, 1000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  return state;
};
```

Export it:

```js
export { useArLastWhisper, useLatencySeries, useNetworkRecoveryDemo, useStagePolling };
```

- [ ] **Step 4: Run pure test**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
npm run test:qos-demo
```

Expected: script exits with code 0.

### Task 3: Wire App and Button

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/DemoPanels.jsx`

- [ ] **Step 1: Add component props and start handler**

In `src/App.jsx`, update imports:

```js
import { useLatencySeries, useNetworkRecoveryDemo, useStagePolling } from './hooks/usePolling';
import { buildNetworkRecoveryPresentation, buildNetworkRecoveryStartPayload, isNetworkRecoveryStartDisabled } from './networkRecoveryDemo';
import { buildRuntimeBackendUrl } from './config/runtimeUrls';
```

Add state and hook near stage polling:

```js
const networkRecoveryDemo = useNetworkRecoveryDemo(stage === 8);
const [networkRecoveryPending, setNetworkRecoveryPending] = useState(false);
const [networkRecoveryStartLocked, setNetworkRecoveryStartLocked] = useState(false);
const [networkRecoveryError, setNetworkRecoveryError] = useState("");
const networkRecoveryPresentation = buildNetworkRecoveryPresentation(networkRecoveryDemo.phase);
```

Reset local lock when phase returns idle:

```js
useEffect(() => {
  if (networkRecoveryDemo.phase === "idle") {
    setNetworkRecoveryStartLocked(false);
  }
}, [networkRecoveryDemo.phase]);
```

Add start handler:

```js
const handleStartNetworkRecoveryDemo = async () => {
  setNetworkRecoveryPending(true);
  setNetworkRecoveryError("");
  try {
    const url = buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/v1/network_recovery_demo/start", "sandboxHost");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildNetworkRecoveryStartPayload(stage)),
    });
    const payload = await response.json();
    if (!response.ok || payload.ok !== true) {
      throw new Error(payload.reason || `HTTP ${response.status}`);
    }
    setNetworkRecoveryStartLocked(true);
  } catch (startError) {
    setNetworkRecoveryError(startError.message);
  } finally {
    setNetworkRecoveryPending(false);
  }
};
```

Pass props:

```jsx
<NetworkTopology3D
  ...
  networkRecoveryPresentation={stage === 8 ? networkRecoveryPresentation : null}
/>
<RightPanel
  ...
  networkRecoveryDemo={{
    phase: networkRecoveryDemo.phase,
    pending: networkRecoveryPending,
    error: networkRecoveryError || networkRecoveryDemo.error,
    disabled: isNetworkRecoveryStartDisabled({
      stage,
      pending: networkRecoveryPending,
      phase: networkRecoveryDemo.phase,
      startLocked: networkRecoveryStartLocked,
    }),
    onStart: handleStartNetworkRecoveryDemo,
  }}
/>
```

- [ ] **Step 2: Add button in `RightPanel`**

Update signature:

```js
export const RightPanel = ({ effectiveStageConfig, latencySeries, stage, components, networkRecoveryDemo }) => {
```

Render inside the Stage 8 status area:

```jsx
{stage === 8 && networkRecoveryDemo ? (
  <div className="mb-3 rounded border border-cyan-300/35 bg-slate-950/55 p-3">
    <button
      type="button"
      disabled={networkRecoveryDemo.disabled}
      onClick={networkRecoveryDemo.onStart}
      className="w-full rounded border border-cyan-300/60 bg-cyan-400/15 px-3 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:border-slate-500/40 disabled:bg-slate-800/50 disabled:text-slate-400"
    >
      {networkRecoveryDemo.pending ? "启动中..." : "模拟网络拥塞恢复"}
    </button>
    {networkRecoveryDemo.error ? (
      <div className="mt-2 text-xs text-amber-200">{networkRecoveryDemo.error}</div>
    ) : null}
  </div>
) : null}
```

- [ ] **Step 3: Run build**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
npm run build
```

Expected: Vite build exits with code 0.

### Task 4: Topology Overrides and Labels

**Files:**
- Modify: `src/components/NetworkTopology3D.jsx`
- Modify: `src/networkRecoveryDemo.test.mjs`

- [ ] **Step 1: Update topology line rendering**

In `NetworkTopology3D`, accept prop:

```js
networkRecoveryPresentation = null,
```

When building `activeLineConfigByKey`, merge overrides:

```js
const activeLineConfigByKey = useMemo(() => (
  Object.fromEntries(
    activeFlowConfig.lines.map((line) => {
      const override = networkRecoveryPresentation?.lineOverrides?.[line.key];
      return [
        line.key,
        {
          ...line,
          displayLatencyMs: override?.latencyMs ?? randomLatency(line.latencyMs),
          demoColor: override?.color,
        },
      ];
    })
  )
), [stage, activeFlowType, latencySampleTick, networkRecoveryPresentation]);
```

Use `lineConfig.demoColor || activeFlowConfig.color || "#22f5ff"` for active path color.

- [ ] **Step 2: Merge optimizing active connections**

Before rendering active connection overlay:

```js
const demoActiveConnections = networkRecoveryPresentation?.activeConnections || [];
const mergedActiveConnections = [...activeConnections, ...demoActiveConnections];
```

Render `mergedActiveConnections.map(renderActiveConnection)`.

- [ ] **Step 3: Add node labels**

Inside the topology scene, render labels near existing nodes:

```jsx
{networkRecoveryPresentation?.cmfLabel ? (
  <div className="absolute z-30 rounded border border-cyan-200/70 bg-slate-950/90 px-3 py-2 text-xs font-bold text-cyan-50" style={{ left: "57%", top: "31%" }}>
    {networkRecoveryPresentation.cmfLabel}
  </div>
) : null}
{networkRecoveryPresentation?.guaranteeLabels?.RAN ? (
  <div className="absolute z-30 rounded border border-cyan-200/70 bg-slate-950/90 px-2 py-1 text-xs font-bold text-cyan-50" style={{ left: "39%", top: "47%" }}>
    {networkRecoveryPresentation.guaranteeLabels.RAN}
  </div>
) : null}
{networkRecoveryPresentation?.guaranteeLabels?.UPF ? (
  <div className="absolute z-30 rounded border border-cyan-200/70 bg-slate-950/90 px-2 py-1 text-xs font-bold text-cyan-50" style={{ left: "52%", top: "58%" }}>
    {networkRecoveryPresentation.guaranteeLabels.UPF}
  </div>
) : null}
```

- [ ] **Step 4: Run validation**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
npm run test:qos-demo
npm run build
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit implementation**

Run:

```bash
cd /home/aicor/compute_network/sandbox-demo/compute-webui
git add package.json src/networkRecoveryDemo.js src/networkRecoveryDemo.test.mjs src/hooks/usePolling.js src/App.jsx src/components/DemoPanels.jsx src/components/NetworkTopology3D.jsx
git commit -m "feat: add initiative qos mock demo"
```
