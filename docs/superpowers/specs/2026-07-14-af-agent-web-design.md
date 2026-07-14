# AF 智能体前端设计

## 背景

`compute-webui` 当前是 React/Vite 单页应用。AF 智能体需要作为独立入口 `/af-agent-web` 出现，不干扰现有大屏。该页面用于向 core_network 的 sys agent 申请能力开放，展示 CMF 返回的 `info.json.api_desc`，并根据 `host + port + api_desc[0].name` 调用 sandbox 的一次性视频识别接口。

## 目标

- 在 `compute-webui` 中新增 `/af-agent-web` 页面。
- 页面标题为“AF智能体”。
- 首屏包含输入框和按钮：
  - 输入框默认值：“视觉识别服务”。
  - 按钮：“通过能力开放平台申请能力”。
- 点击按钮调用 `POST /api/v1/capability_exposure`。
- sys agent 返回失败时，前端根据 `reason=capability_not_supported` 提示：“当前能力开放平台不支持该能力”。
- sys agent 返回成功时展示 `payload.api_desc[0]` 的能力介绍、输入 schema 和输出 schema。
- 展示上传 mp4、目标输入框、开始识别按钮。
- 点击开始识别后调用 `http://{payload.host}:{payload.port}/api/v1/{api_desc[0].name}`。
- 成功收到 `video/mp4` 后使用 blob URL 预览，并提供下载按钮。

## 非目标

- 不改现有阶段大屏 UI 和拓扑逻辑。
- 不引入 React Router；路径判断保持简单。
- 不新增全局状态管理。
- 不代理 sandbox 视频接口，浏览器直接调用 sandbox。

## 页面结构

新增目录 `src/af-agent/`：

- `AfAgentWeb.jsx`
  - 页面组件。
  - 管理 intent、能力描述、上传文件、target、结果视频 URL、错误状态。
- `afAgentApi.js`
  - 构造 sys agent URL。
  - 调用 capability exposure。
  - 根据 `info.json` 构造 sandbox API URL。
  - 调用 visual_recog 并返回 blob。
- `AfAgentWeb.css`
  - 页面样式，局部类名以 `af-agent-` 前缀开头。

`src/App.jsx` 只增加一个路径分支：

```jsx
if (window.location.pathname === "/af-agent-web") {
  return <AfAgentWeb />;
}
```

## API 约定

### 申请能力

请求：

```http
POST http://<sys-agent-host>:9100/api/v1/capability_exposure
Content-Type: application/json
```

Body：

```json
{
  "intent_payload": "视觉识别服务"
}
```

失败处理：

- 若 `status !== "success"` 且 `reason=capability_not_supported`，展示“当前能力开放平台不支持该能力”。
- 若是其他失败，展示 `reason`，缺省时展示“能力申请失败”。

成功处理：

- `payload` 即 CMF 原样返回的 `info.json`。
- 要求 `payload.host`、`payload.port`、`payload.api_desc[0].name` 存在。
- 缺字段时展示“能力描述不完整，无法调用该能力”。

### 调用视觉识别

URL：

```text
http://{payload.host}:{payload.port}/api/v1/{payload.api_desc[0].name}
```

Body：`FormData`

- `video`: File
- `target`: string

成功响应：`video/mp4` blob。

失败响应：JSON，优先展示 `message`，否则展示 `reason`。

## 运行时配置

新增可选 runtime/env 配置：

- `window.__RUNTIME_CONFIG__.afSysAgentApiUrl`
- `VITE_AF_SYS_AGENT_API_URL`

优先级：

1. `window.__RUNTIME_CONFIG__.afSysAgentApiUrl`
2. `window.__RUNTIME_CONFIG__.sysAgentApiUrl`
3. `import.meta.env.VITE_AF_SYS_AGENT_API_URL`
4. `http://{window.location.hostname}:9100`

为了不影响旧大屏，`public/runtime-config.js` 只追加 `afSysAgentApiUrl` 字段，不修改旧字段。

## 交互状态

- `idle`：展示申请能力输入框。
- `requestingCapability`：按钮 disabled，文案“申请中”。
- `capabilityReady`：展示能力描述和视频识别表单。
- `recognizing`：识别按钮 disabled，文案“识别中”。
- `resultReady`：展示输出视频和下载按钮。
- `error`：展示错误提示，但保留用户输入，方便重试。

## 视觉与可用性

- 使用实际工具页作为首屏，不做营销 landing。
- 页面布局为双栏：
  - 左侧能力申请与 API 描述。
  - 右侧视频上传、目标输入和结果预览。
- 移动端降为单栏。
- 所有按钮、输入、上传控件保持固定尺寸或稳定最小高度，避免识别状态切换时布局跳动。
- 使用 `lucide-react` 图标增强按钮含义，沿用项目已有依赖。

## 测试策略

- `afAgentApi.js` 单元可测函数：
  - `buildCapabilityExposureUrl()`。
  - `buildVisualRecogUrl(info)`。
  - 失败响应消息解析。
- 组件层验证：
  - `/af-agent-web` 路径渲染 AF 页面。
  - 点击申请能力时发送 `intent_payload`。
  - 失败时展示“当前能力开放平台不支持该能力”。
  - 成功时显示能力标题、描述、上传控件。
  - 点击开始识别时使用 `host + port + api_desc.name` 拼接 URL。

## 风险与约束

- 浏览器直接调用 sandbox，需要 sandbox 的 `/api/v1/visual_recog` 提供 CORS。
- `info.json` 字段由 CMF 原样返回，前端必须做字段完整性校验。
- 上传和识别耗时可能较长，前端只做简单 loading，不实现进度条。
