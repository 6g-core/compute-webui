# 第一版视频分辨率测试修改总结

## 1. 修改目标

按照“不同分辨率下网页视频效果测试代码设计”的第一版目标落地：

- `compute-webui` 增加网页视频分辨率测试面板。
- 每个分辨率/FPS 档位都分别采样 `raw` 和 `enhanced`。
- 采样指标来自浏览器 `RTCPeerConnection.getStats()`。
- 前端支持下载 JSON/CSV。
- 前端在 case 停止或倒计时结束后提交给 `sandbox`。
- `sandbox` 将结果按 JSONL 追加保存到本地文件。
- 第一版只生成 dog/sandbox 环境变量命令，不远程修改参数，也不自动重启服务。

## 2. 前端修改

### 2.1 WebRTC stats 采样

文件：

- `compute-webui/src/hooks/useBackendVideo.js`

修改内容：

- `useBackendVideoStream` 在收到视频 track 后，每 `1000ms` 调用一次 `pc.getStats()`。
- 从 `inbound-rtp` video report 中读取网页浏览器真实接收指标。
- 新增返回字段 `stats`，供页面测试面板使用。

当前采集字段：

- `frameWidth`
- `frameHeight`
- `framesPerSecond`
- `bitrateKbps`
- `bytesReceived`
- `framesDropped`
- `packetsLost`
- `jitterMs`
- `freezeCount`
- `totalFreezesDurationMs`

### 2.2 测试结果提交地址

文件：

- `compute-webui/src/config/runtimeUrls.js`

新增方法：

```js
getVideoResolutionTestResultsApiUrl()
```

默认地址：

```text
http://<sandboxHost>:8787/api/v1/video-resolution-test/results
```

也可以通过运行时配置或环境变量覆盖：

```text
window.__RUNTIME_CONFIG__.videoResolutionTestResultsApiUrl
VITE_VIDEO_RESOLUTION_TEST_RESULTS_API_URL
```

### 2.3 视频分辨率测试面板

文件：

- `compute-webui/src/components/VideoResolutionTestPanel.jsx`
- `compute-webui/src/App.jsx`

新增能力：

- 内置测试档位：

| 档位 | 分辨率 | FPS |
| --- | --- | --- |
| 1 | 640x480 | 15 |
| 2 | 1280x720 | 15 |
| 3 | 1280x720 | 30 |
| 4 | 1920x1080 | 15 |
| 5 | 1920x1080 | 30 |

- 每个档位都支持 `raw` 和 `enhanced` 两个 case。
- 当前页面维护两条固定 WebRTC 连接：
  - `react-dog-raw`，`streamType: "raw"`
  - `react-dog-enhanced`，`streamType: "enhanced"`
- case 结果通过 `<width>x<height>@<fps>/<streamType>` 区分，client id 不随分辨率/FPS 档位变化。
- 自动生成环境变量命令：

```bash
export DOG_CAMERA_WIDTH=<width>
export DOG_CAMERA_HEIGHT=<height>
export DOG_CAMERA_FPS=<fps>
export SANDBOX_VIDEO_OUTPUT_FPS=<fps>
export SANDBOX_YOLO_INPUT_SIZE=<width>,<height>
```

- 默认采样时长 `120s`，页面可修改。
- 可填写主观评价：
  - `clarity`
  - `smoothness`
  - `notes`
- 主观评价会在 case 结束时随结果一起提交，现场应在点击停止或等待自动结束前填好。
- case 停止或倒计时结束后计算摘要并提交给 sandbox。
- 支持下载当前 run 的 JSON 和 CSV。

## 3. 后端修改

### 3.1 新增保存接口

文件：

- `sandbox/transports/http_api.py`
- `sandbox/services/sandbox_service.py`

新增接口：

```text
POST /api/v1/video-resolution-test/results
```

请求体核心字段：

```json
{
  "runId": "web-video-20260723T171600",
  "caseId": "1280x720@15/enhanced",
  "streamType": "enhanced",
  "target": {
    "width": 1280,
    "height": 720,
    "fps": 15
  },
  "config": {
    "dogCameraWidth": 1280,
    "dogCameraHeight": 720,
    "dogCameraFps": 15,
    "sandboxVideoOutputFps": 15,
    "sandboxYoloInputSize": "1280,720"
  },
  "durationSec": 120,
  "browser": {},
  "subjective": {}
}
```

### 3.2 校验规则

后端会校验：

- `runId` 必填。
- `caseId` 必填。
- `streamType` 必须是 `raw` 或 `enhanced`。
- `target.width`、`target.height`、`target.fps` 必须是正数。
- `config.sandboxYoloInputSize` 必须等于 `<target.width>,<target.height>`。
- `durationSec` 必须大于 0。
- `browser` 必填。

其中 `SANDBOX_YOLO_INPUT_SIZE` 与目标分辨率一致是强校验。

### 3.3 落盘规则

默认保存目录：

```text
video-resolution-test-results
```

可通过环境变量覆盖：

```bash
export SANDBOX_VIDEO_TEST_RESULTS_DIR=/abs/path/video-resolution-test-results
```

保存文件：

```text
<runId>.jsonl
```

每完成一个 case，追加一行 JSON，不覆盖历史结果。

## 4. 测试修改

文件：

- `sandbox/tests/test_main_app_routes.py`
- `sandbox/tests/test_webui_runtime_apis.py`

新增覆盖：

- sandbox app 注册 `POST /api/v1/video-resolution-test/results`。
- 合法结果能写入 JSONL。
- `SANDBOX_YOLO_INPUT_SIZE` 与目标分辨率不一致时返回 `400`。
- `streamType` 不是 `raw/enhanced` 时返回 `400`。

## 5. 使用流程

每个档位现场执行：

```text
1. 在 compute-webui 测试面板选择分辨率/FPS。
2. 复制面板生成的环境变量。
3. 在 dog 和 sandbox 侧应用环境变量并重启服务。
4. 网页视频恢复后，为 raw 填写或确认 `clarity` / `smoothness` / `notes`，再点击 raw 采样。
5. raw 停止或倒计时结束后，结果自动提交给 sandbox。
6. 为 enhanced 填写或确认 `clarity` / `smoothness` / `notes`，再点击 enhanced 采样。
7. enhanced 停止或倒计时结束后，结果自动提交给 sandbox。
8. 需要时下载 JSON/CSV 汇总。
```

一个档位只有在同一组 `width/height/fps` 下 `raw` 和 `enhanced` 都通过，才认为该档位网页视频效果通过。
