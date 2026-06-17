# 智能流程监控平台 (webfront)

基于 Nuxt 3 + Element Plus + PrimeVue + VueFlow 的浅色风格前端。

## 布局

- 顶部 Header：图标 + 标题 + 后端连接状态
- 左侧上半：实时视频流（通过 `POST /api/v1/web/sdp/offer` 与 `sandbox` 建立 WebRTC，被动显示占位流或 YOLO 处理后的视频）
- 左侧下半：流程日志 / 状态指标 切换面板
- 右侧：VueFlow 流程图，支持自由布局拖拽、缩放、节点动态高亮（`is-active` / `is-success` / `is-error`）

## 启动

```bash
npm install
npm run dev
```

默认端口 3000。浏览器端默认会把后端地址解析为当前页面主机名的 `8787` 端口，例如从同网段机器访问 `http://192.168.1.15:3000` 时，后端默认使用 `http://192.168.1.15:8787`。如需连接 mock 后端或其它地址，可在页面右上角设置里的「后端地址」调整。

## 视频显示语义

- 页面启动后会立即尝试与 `sandbox` 建立 WebRTC 视频连接
- 前端不负责判断业务状态，只被动显示 `sandbox` 当前输出的流
- 首次协商失败、收到 answer 后长期未进入 `connected`、或连接中途 `failed/disconnected` 时，前端会清理旧 peer 并自动重试
- 眼镜未连上或狗视频尚未接入时，`sandbox` 会输出占位流
- 狗视频接入后，`sandbox` 会在原有连接内切成 YOLO 处理后的视频
- 眼镜退出或触发 `hot_reset` 后，前端连接保留，视频回退为占位流
- 只有 WebRTC 自身断开或 `sandbox` 不可达时，前端才会自动重连

## 节点高亮 API

`FlowDiagram` 组件暴露：

- `highlight(nodeId, edgeId?, status?)` — 高亮指定节点（与边）
- `clearHighlight()` — 清除全部高亮
- `resetLayout()` — 恢复默认节点布局

可通过模板 `ref` 或后端 SSE/WebSocket 推送驱动。
