# 不同分辨率下网页视频效果测试代码设计

## 1. 目标

设计一套用于测试机器狗视频在不同分辨率和 fps 下网页展示效果的工具。

最终观察对象是 `compute-webui` 浏览器页面，而不是单独的 `iperf3`、裸 UDP 或 dog/sandbox 内部指标。

测试链路：

```text
dog 摄像头采集
-> dog WebRTC 发送
-> sandbox WebRTC 接收
-> RawDogVideoTrack 或 AIVideoTrack
-> sandbox WebRTC 发送
-> compute-webui 浏览器播放
```

第一版目标：

- 在 `compute-webui` 增加视频分辨率测试面板。
- 每个分辨率/FPS 档位都分别采样 `raw` 和 `enhanced` 两路。
- 采样指标以浏览器 `RTCPeerConnection.getStats()` 为准。
- 测试结果同时支持前端导出和提交给 `sandbox` 后端落盘。
- 第一版不从网页远程修改 dog/sandbox 参数，也不自动重启服务。

## 2. 测试矩阵

内置五个分辨率/FPS 档位：

| 档位 | 分辨率 | FPS |
| --- | --- | --- |
| 1 | 640x480 | 15 |
| 2 | 1280x720 | 15 |
| 3 | 1280x720 | 30 |
| 4 | 1920x1080 | 15 |
| 5 | 1920x1080 | 30 |

每个档位生成两个测试 case：

| streamType | 含义 |
| --- | --- |
| `raw` | dog 原始视频经 sandbox raw relay 到网页 |
| `enhanced` | dog 视频经 sandbox `AIVideoTrack`，包含 YOLO 检测/画框/overlay 后到网页 |

总 case 数：

```text
5 个分辨率/FPS档位 * 2 路视频 = 10 个 case
```

推荐执行顺序：

```text
640x480@15 raw
640x480@15 enhanced
1280x720@15 raw
1280x720@15 enhanced
1280x720@30 raw
1280x720@30 enhanced
1920x1080@15 raw
1920x1080@15 enhanced
1920x1080@30 raw
1920x1080@30 enhanced
```

每个 case 默认采样 `120s`。前端允许人工调整采样时长，但默认报告和现场标准按 `120s` 记录。

## 3. 参数规则

每个测试档位需要让 dog 采集分辨率、sandbox 输出 fps、YOLO 输入尺寸保持一致。

`SANDBOX_YOLO_INPUT_SIZE` 的格式是：

```text
width,height
```

每个档位生成的配置命令规则：

```bash
export DOG_CAMERA_WIDTH=<width>
export DOG_CAMERA_HEIGHT=<height>
export DOG_CAMERA_FPS=<fps>
export SANDBOX_VIDEO_OUTPUT_FPS=<fps>
export SANDBOX_YOLO_INPUT_SIZE=<width>,<height>
```

示例：

```bash
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=15
export SANDBOX_VIDEO_OUTPUT_FPS=15
export SANDBOX_YOLO_INPUT_SIZE=1280,720
```

说明：

- `raw` 和 `enhanced` 使用同一组 dog/sandbox 参数。
- `raw` 用于判断采集、网络、WebRTC 和浏览器解码能力。
- `enhanced` 用于判断加入 YOLO/overlay 后的网页效果。
- 如果 `raw` 流畅但 `enhanced` 卡顿，优先排查 sandbox YOLO 推理、画框、overlay 和输出 FPS。
- 1080p 下 `SANDBOX_YOLO_INPUT_SIZE=1920,1080` 压力很大，测试允许失败，但结果必须真实记录。

第一版网页只生成配置命令，不负责远程设置环境变量或重启服务。现场流程为：

```text
1. 在网页选择档位。
2. 复制网页生成的 dog/sandbox 环境变量。
3. 手动重启 dog 和 sandbox。
4. 网页确认视频恢复后，依次采 raw 和 enhanced。
5. 保存结果。
```

## 4. compute-webui 设计

### 4.1 测试面板

新增一个视频测试面板，建议放在现有机器狗视频区域附近，或作为独立的调试面板。

面板能力：

- 展示五个分辨率/FPS 档位。
- 当前选中档位显示 `raw` 和 `enhanced` 两个 case 的实时状态和保存状态。
- 为当前档位生成环境变量命令。
- 支持开始/停止当前 case 采样。
- 显示当前采样剩余时间、实时指标和最终摘要。
- 支持填写主观评价：
  - clarity: `bad` / `ok` / `good`
  - smoothness: `bad` / `ok` / `good`
  - notes: 自由文本
- 主观评价会在 case 结束时随结果一起提交；现场操作时应在点击停止或等待自动结束前填好。
- 支持下载当前 run 的 JSON/CSV。
- 每个 case 完成后 POST 到 sandbox 保存。

### 4.2 WebRTC stats 采样

扩展 `useBackendVideoStream` 或新增独立 hook，例如 `useWebRtcVideoStats`。

实现要求：

- 在创建 `RTCPeerConnection` 后保留 pc 引用。
- 每 `1000ms` 调用一次 `pc.getStats()`。
- 从 `inbound-rtp` 且 `kind === "video"` 的 report 中读取指标。
- 优先记录浏览器真实值，而不是 sandbox 模拟 receiver metrics。

需要采集的实时字段：

| 字段 | 来源 | 说明 |
| --- | --- | --- |
| `frameWidth` | inbound-rtp | 浏览器实际收到宽度 |
| `frameHeight` | inbound-rtp | 浏览器实际收到高度 |
| `framesPerSecond` | inbound-rtp | 浏览器当前 FPS |
| `bytesReceived` | inbound-rtp | 用差分计算码率 |
| `framesDropped` | inbound-rtp | 浏览器丢帧 |
| `packetsLost` | inbound-rtp | RTP 丢包 |
| `jitter` | inbound-rtp | WebRTC jitter，转为 ms 存储 |
| `freezeCount` | inbound-rtp | 浏览器冻结次数，字段不存在时按 0 |
| `totalFreezesDuration` | inbound-rtp | 冻结总时长，字段不存在时按 0 |

码率计算：

```text
bitrateKbps = (bytesReceived_delta * 8) / elapsed_ms
```

采样摘要：

- `avgFps`
- `minFps`
- `avgBitrateKbps`
- `maxBitrateKbps`
- `framesDropped`
- `packetsLost`
- `avgJitterMs`
- `maxJitterMs`
- `freezeCount`
- `totalFreezeDurationMs`
- `actualFrameWidth`
- `actualFrameHeight`

### 4.3 raw/enhanced case 行为

当前实现中，`compute-webui` 页面会分别维护两条 WebRTC 视频连接：

- `react-dog-raw`，`streamType: "raw"`
- `react-dog-enhanced`，`streamType: "enhanced"`

同一个档位下，raw 和 enhanced 必须分别采样。case 结果通过 `<width>x<height>@<fps>/<streamType>` 区分；WebRTC 连接本身使用固定的 raw/enhanced client id，而不是每个分辨率/FPS 档位单独创建一个 client id。

case 标识：

```text
<width>x<height>@<fps>/<streamType>
```

示例：

```text
1280x720@15/raw
1280x720@15/enhanced
```

raw 请求：

```json
{
  "client_id": "react-dog-raw",
  "streamType": "raw",
  "sdp_offer": {
    "type": "offer",
    "sdp": "..."
  }
}
```

enhanced 请求：

```json
{
  "client_id": "react-dog-enhanced",
  "streamType": "enhanced",
  "sdp_offer": {
    "type": "offer",
    "sdp": "..."
  }
}
```

## 5. sandbox 设计

### 5.1 保存结果 API

新增接口：

```text
POST /api/v1/video-resolution-test/results
```

请求体：

```json
{
  "runId": "20260723-001",
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
  "browser": {
    "actualFrameWidth": 1280,
    "actualFrameHeight": 720,
    "avgFps": 14.8,
    "minFps": 13.9,
    "avgBitrateKbps": 3500,
    "maxBitrateKbps": 4300,
    "framesDropped": 2,
    "packetsLost": 0,
    "avgJitterMs": 8,
    "maxJitterMs": 15,
    "freezeCount": 0,
    "totalFreezeDurationMs": 0
  },
  "subjective": {
    "clarity": "good",
    "smoothness": "good",
    "notes": ""
  },
  "createdAtMs": 1784780000000
}
```

响应：

```json
{
  "ok": true,
  "path": "video-resolution-test-results/20260723-001.jsonl"
}
```

### 5.2 落盘规则

默认保存目录：

```text
./video-resolution-test-results
```

可通过环境变量覆盖：

```bash
export SANDBOX_VIDEO_TEST_RESULTS_DIR=/abs/path/video-resolution-test-results
```

文件格式：

```text
<runId>.jsonl
```

每个 case 追加一行 JSON，避免覆盖历史结果。

### 5.3 校验规则

接口最小校验：

- `runId` 必填，字符串。
- `caseId` 必填，字符串。
- `streamType` 必须是 `raw` 或 `enhanced`。
- `target.width`、`target.height`、`target.fps` 必须是正数。
- `config.sandboxYoloInputSize` 必须等于 `<target.width>,<target.height>`。
- `durationSec` 必须大于 0。
- `browser` 必填。

校验失败返回 `400`。

## 6. 结果判定

单个 case 通过建议：

```text
avgFps >= target.fps * 0.95
freezeCount == 0 或现场可接受
framesDropped / 估算总帧数 < 1%
actualFrameWidth == target.width 或接近目标宽度
actualFrameHeight == target.height 或接近目标高度
主观 smoothness != bad
```

档位通过建议：

```text
同一个 width/height/fps 下 raw 和 enhanced 都通过，才认为该档位网页视频效果通过。
```

问题定位：

| 现象 | 初步判断 |
| --- | --- |
| raw 卡，enhanced 也卡 | dog 采集、网络、WebRTC 或浏览器解码瓶颈 |
| raw 稳，enhanced 卡 | sandbox YOLO/overlay/增强输出瓶颈 |
| raw/enhanced 都收到低于目标分辨率 | dog 采集参数未生效或浏览器协商降级 |
| enhanced FPS 明显低于 raw | YOLO 输入尺寸或模型后端压力过大 |
| 1080p enhanced 失败 | 可接受，记录为 YOLO 高输入尺寸下不可用 |

## 7. 测试计划

### 7.1 compute-webui

- 单测 stats 聚合：
  - `bytesReceived` 差分计算码率。
  - `framesDropped`、`packetsLost`、`freezeCount` 差分。
  - 缺失 freeze 字段时 fallback 为 0。
  - 多个 inbound video report 时选择有 frame 信息的 report。
- 手动验证：
  - raw case 可以采样并生成摘要。
  - enhanced case 可以采样并生成摘要。
  - 同一档位 raw/enhanced 结果分开保存。
  - 导出 JSON/CSV 可用。

### 7.2 sandbox

- API 单测：
  - 合法结果写入 JSONL。
  - 缺少 `runId` 返回 `400`。
  - `streamType` 非 `raw/enhanced` 返回 `400`。
  - `SANDBOX_YOLO_INPUT_SIZE` 与目标分辨率不一致返回 `400`。
  - 连续提交多个 case 不覆盖旧结果。
- 手动验证：
  - 设置 `SANDBOX_VIDEO_TEST_RESULTS_DIR` 后结果写到指定目录。
  - 未设置时结果写到默认目录。

### 7.3 现场验收

每个档位执行：

```text
1. 设置 dog/sandbox 环境变量。
2. 重启 dog 和 sandbox。
3. 等 compute-webui 显示视频恢复。
4. 选择 raw，提前填写或确认主观评分和备注，采样 120s。
5. 选择 enhanced，提前填写或确认主观评分和备注，采样 120s。
6. 如需修正主观评分，必须在当前 case 停止或自动结束前完成。
7. 保存结果。
```

最终输出：

- 一份 JSONL 原始结果。
- 一份前端导出的 CSV 汇总。
- 一个最高通过档位结论。
