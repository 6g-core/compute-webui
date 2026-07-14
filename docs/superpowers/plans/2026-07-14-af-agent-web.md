# AF Agent Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `compute-webui` 新增 `/af-agent-web`，完成能力申请、API 描述展示和一次性视觉识别调用。

**Architecture:** 新增 `src/af-agent/` 目录隔离 AF 页面、API helper 和样式；`App.jsx` 只加路径分支。前端直接调用 sys agent 和 sandbox，失败时展示 sys agent 返回的 `display_message`。

**Tech Stack:** React 19、Vite、lucide-react、原生 fetch、Blob URL。

---

## 文件结构

- Create: `compute-webui/src/af-agent/afAgentApi.js`
  - URL 构造、fetch 封装、错误消息解析。
- Create: `compute-webui/src/af-agent/AfAgentWeb.jsx`
  - AF 页面组件。
- Create: `compute-webui/src/af-agent/AfAgentWeb.css`
  - 页面局部样式。
- Modify: `compute-webui/src/App.jsx`
  - `/af-agent-web` 路径分支。
- Modify: `compute-webui/public/runtime-config.js`
  - 追加 `afSysAgentApiUrl`。

### Task 1: 新增 API helper

**Files:**
- Create: `compute-webui/src/af-agent/afAgentApi.js`

- [ ] **Step 1: 创建 URL 和错误 helper**

新增 `src/af-agent/afAgentApi.js`：

```javascript
const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

export const getAfRuntimeConfig = () => window.__RUNTIME_CONFIG__ || {};

export const buildDefaultSysAgentBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:9100`;
};

export const buildCapabilityExposureUrl = () => {
  const runtimeConfig = getAfRuntimeConfig();
  const baseUrl = runtimeConfig.afSysAgentApiUrl
    || runtimeConfig.sysAgentApiUrl
    || import.meta.env.VITE_AF_SYS_AGENT_API_URL
    || buildDefaultSysAgentBaseUrl();
  return `${trimTrailingSlash(baseUrl)}/api/v1/capability_exposure`;
};

export const buildVisualRecogUrl = (info) => {
  const apiDesc = Array.isArray(info?.api_desc) ? info.api_desc[0] : null;
  const host = String(info?.host || "").trim();
  const port = String(info?.port || "").trim();
  const apiName = String(apiDesc?.name || "").trim();

  if (!host || !port || !apiName) {
    throw new Error("能力描述不完整，无法调用该能力");
  }

  return `http://${host}:${port}/api/v1/${apiName}`;
};

export const resolveCapabilityErrorMessage = (payload) => {
  return payload?.payload?.display_message
    || payload?.message
    || payload?.reason
    || "当前能力开放平台不支持该能力";
};
```

- [ ] **Step 2: 增加 fetch helper**

在同一文件追加：

```javascript
export const requestCapabilityExposure = async (intentPayload) => {
  const response = await fetch(buildCapabilityExposureUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent_payload: intentPayload,
    }),
  });
  const payload = await response.json();
  if (!response.ok || payload.status !== "success") {
    throw new Error(resolveCapabilityErrorMessage(payload));
  }
  return payload.payload;
};

export const requestVisualRecog = async ({ capabilityInfo, videoFile, target }) => {
  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("target", target);

  const response = await fetch(buildVisualRecogUrl(capabilityInfo), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "视觉识别调用失败";
    try {
      const payload = await response.json();
      message = payload.message || payload.reason || message;
    } catch (_error) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.blob();
};
```

- [ ] **Step 3: 提交 Task 1**

```bash
git add src/af-agent/afAgentApi.js
git commit -m "feat: add AF agent API helpers"
```

### Task 2: 新增 AF 页面组件

**Files:**
- Create: `compute-webui/src/af-agent/AfAgentWeb.jsx`
- Create: `compute-webui/src/af-agent/AfAgentWeb.css`

- [ ] **Step 1: 创建组件骨架**

新增 `src/af-agent/AfAgentWeb.jsx`：

```jsx
import React, { useMemo, useState } from "react";
import { Download, Upload, WandSparkles } from "lucide-react";
import {
  requestCapabilityExposure,
  requestVisualRecog,
} from "./afAgentApi";
import "./AfAgentWeb.css";

const DEFAULT_INTENT = "视觉识别服务";

const getPrimaryApi = (capabilityInfo) => {
  const apiList = Array.isArray(capabilityInfo?.api_desc) ? capabilityInfo.api_desc : [];
  return apiList[0] || null;
};

function SchemaList({ schema }) {
  const properties = schema?.properties || {};
  const required = new Set(schema?.required || []);
  return (
    <div className="af-agent-schema-list">
      {Object.entries(properties).map(([name, detail]) => (
        <div className="af-agent-schema-row" key={name}>
          <span>{name}{required.has(name) ? " *" : ""}</span>
          <strong>{detail.type}</strong>
          <p>{detail.description || ""}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 实现页面状态和能力申请**

在同一文件追加：

```jsx
export default function AfAgentWeb() {
  const [intentPayload, setIntentPayload] = useState(DEFAULT_INTENT);
  const [capabilityInfo, setCapabilityInfo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [target, setTarget] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestingCapability, setRequestingCapability] = useState(false);
  const [recognizing, setRecognizing] = useState(false);

  const primaryApi = useMemo(() => getPrimaryApi(capabilityInfo), [capabilityInfo]);

  const handleCapabilityRequest = async () => {
    setErrorMessage("");
    setRequestingCapability(true);
    try {
      const info = await requestCapabilityExposure(intentPayload);
      if (!getPrimaryApi(info)) {
        throw new Error("能力描述不完整，无法调用该能力");
      }
      setCapabilityInfo(info);
    } catch (error) {
      setCapabilityInfo(null);
      setErrorMessage(error.message || "当前能力开放平台不支持该能力");
    } finally {
      setRequestingCapability(false);
    }
  };

  const handleRecognize = async () => {
    if (!videoFile) {
      setErrorMessage("请先上传 mp4 视频文件");
      return;
    }
    if (!target.trim()) {
      setErrorMessage("请输入识别目标");
      return;
    }
    setErrorMessage("");
    setRecognizing(true);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }
    try {
      const blob = await requestVisualRecog({
        capabilityInfo,
        videoFile,
        target: target.trim(),
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      setErrorMessage(error.message || "视觉识别调用失败");
    } finally {
      setRecognizing(false);
    }
  };
```

- [ ] **Step 3: 实现 JSX**

在同一组件中继续追加 return，并闭合函数：

```jsx
  return (
    <main className="af-agent-page">
      <section className="af-agent-shell">
        <header className="af-agent-header">
          <div>
            <h1>AF智能体</h1>
            <p>通过能力开放平台申请视觉识别能力，并直接调用开放 API。</p>
          </div>
        </header>

        <div className="af-agent-grid">
          <section className="af-agent-panel">
            <h2>能力申请</h2>
            <label className="af-agent-field">
              <span>申请能力</span>
              <input
                value={intentPayload}
                onChange={(event) => setIntentPayload(event.target.value)}
              />
            </label>
            <button
              className="af-agent-primary-button"
              type="button"
              disabled={requestingCapability}
              onClick={handleCapabilityRequest}
            >
              <WandSparkles size={18} />
              {requestingCapability ? "申请中" : "通过能力开放平台申请能力"}
            </button>

            {errorMessage ? (
              <div className="af-agent-error">{errorMessage}</div>
            ) : null}

            {primaryApi ? (
              <div className="af-agent-api-desc">
                <h3>{primaryApi.title}</h3>
                <p>{primaryApi.description}</p>
                <h4>输入</h4>
                <SchemaList schema={primaryApi.inputSchema} />
                <h4>输出</h4>
                <SchemaList schema={primaryApi.outputSchema} />
              </div>
            ) : null}
          </section>

          <section className="af-agent-panel">
            <h2>调用 API</h2>
            <label className="af-agent-upload">
              <Upload size={20} />
              <span>{videoFile ? videoFile.name : "上传 mp4 视频"}</span>
              <input
                type="file"
                accept="video/mp4"
                onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              />
            </label>
            <label className="af-agent-field">
              <span>识别目标</span>
              <input
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="例如：小狗、红色的盒子"
              />
            </label>
            <button
              className="af-agent-primary-button"
              type="button"
              disabled={!primaryApi || recognizing}
              onClick={handleRecognize}
            >
              {recognizing ? "识别中" : "开始识别"}
            </button>

            {resultUrl ? (
              <div className="af-agent-result">
                <video src={resultUrl} controls />
                <a className="af-agent-download" href={resultUrl} download="visual_recog_result.mp4">
                  <Download size={18} />
                  下载识别结果
                </a>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: 添加 CSS**

新增 `src/af-agent/AfAgentWeb.css`：

```css
.af-agent-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #18202f;
  padding: 32px;
}

.af-agent-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.af-agent-header {
  margin-bottom: 24px;
}

.af-agent-header h1 {
  font-size: 32px;
  line-height: 1.2;
  margin: 0 0 8px;
  letter-spacing: 0;
}

.af-agent-header p {
  margin: 0;
  color: #5d6678;
}

.af-agent-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.af-agent-panel {
  background: #ffffff;
  border: 1px solid #dfe5ef;
  border-radius: 8px;
  padding: 20px;
  min-width: 0;
}

.af-agent-panel h2,
.af-agent-panel h3,
.af-agent-panel h4 {
  letter-spacing: 0;
}

.af-agent-field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.af-agent-field span {
  font-size: 14px;
  color: #495468;
}

.af-agent-field input {
  height: 42px;
  border: 1px solid #cbd5e4;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 15px;
}

.af-agent-primary-button,
.af-agent-download {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  border: 0;
  background: #1957d2;
  color: #ffffff;
  padding: 0 16px;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
}

.af-agent-primary-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.af-agent-error {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.af-agent-api-desc {
  margin-top: 20px;
  border-top: 1px solid #e4e9f2;
  padding-top: 16px;
}

.af-agent-schema-list {
  display: grid;
  gap: 8px;
}

.af-agent-schema-row {
  border: 1px solid #e4e9f2;
  border-radius: 6px;
  padding: 10px;
}

.af-agent-schema-row span {
  display: inline-block;
  min-width: 80px;
  font-weight: 600;
}

.af-agent-schema-row strong {
  color: #1957d2;
}

.af-agent-schema-row p {
  margin: 6px 0 0;
  color: #5d6678;
}

.af-agent-upload {
  min-height: 112px;
  border: 1px dashed #9aa8bd;
  border-radius: 8px;
  display: grid;
  place-items: center;
  gap: 8px;
  margin-bottom: 14px;
  cursor: pointer;
  color: #495468;
}

.af-agent-upload input {
  display: none;
}

.af-agent-result {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.af-agent-result video {
  width: 100%;
  background: #101828;
  border-radius: 8px;
}

@media (max-width: 860px) {
  .af-agent-page {
    padding: 18px;
  }

  .af-agent-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: 提交 Task 2**

```bash
git add src/af-agent/AfAgentWeb.jsx src/af-agent/AfAgentWeb.css
git commit -m "feat: add AF agent capability page"
```

### Task 3: 接入 `/af-agent-web` 路径和运行时配置

**Files:**
- Modify: `compute-webui/src/App.jsx`
- Modify: `compute-webui/public/runtime-config.js`

- [ ] **Step 1: 在 App.jsx 增加路径分支**

在 `src/App.jsx` imports 增加：

```jsx
import AfAgentWeb from './af-agent/AfAgentWeb.jsx';
```

在 `function App()` 或默认导出组件最前面增加：

```jsx
  if (window.location.pathname === "/af-agent-web") {
    return <AfAgentWeb />;
  }
```

如果 `App.jsx` 当前不是命名 `function App()`，把该分支放入现有顶层组件 return 之前，保持旧页面默认路径不变。

- [ ] **Step 2: 追加 runtime config**

在 `public/runtime-config.js` 的 `window.__RUNTIME_CONFIG__` 对象中追加：

```javascript
    afSysAgentApiUrl: `${protocol}//${host}:9100`,
```

不要修改现有 `sysAgentApiUrl`、`sandboxApiUrl` 等字段。

- [ ] **Step 3: 本地构建验证**

Run: `npm run build`

Expected: PASS，输出 Vite build 成功信息。

- [ ] **Step 4: 提交 Task 3**

```bash
git add src/App.jsx public/runtime-config.js
git commit -m "feat: route AF agent web page"
```

## Self-Review

- Spec 覆盖：页面路径、能力申请、失败提示、`host + port + api_desc.name` 拼 URL、blob 预览下载均有任务。
- 未定项扫描：未发现未完成标记或空泛实现项。
- 类型一致性：`AfAgentWeb`、`buildVisualRecogUrl`、`requestCapabilityExposure` 名称一致。
