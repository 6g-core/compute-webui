# 网页视频测速与参数调优说明

本文用于说明网页新增的视频测速模块、sandbox 和机器狗视频参数的修改方式，以及 raw / enhanced 抖动差异和 30 FPS 卡住问题的原因。

## 1. 网页新增测速模块各组件功能

测速模块入口在 `compute-webui/src/App.jsx` 的 `DogVisionStreams`。它同时创建两路 WebRTC 视频：

- `react-dog-raw`：机器狗原始视野，`streamType=raw`。
- `react-dog-enhanced`：sandbox 处理后的增强视野，`streamType=enhanced`。

网页侧主要组件如下：

| 组件/文件 | 功能 |
| --- | --- |
| `DogVisionStreams` | 管理 raw/enhanced 两路视频是否启用、是否预加载、视频面板显示。 |
| `useDogVideoOfferGate` | 轮询 sandbox `/api/health`，确认 `streamRequested=true` 且 `videoReady=true` 后才允许网页发 WebRTC offer。 |
| `useBackendVideoStream` | 为 raw/enhanced 各自创建 `RTCPeerConnection`，发 SDP offer，接收视频 track，并定时读取浏览器 WebRTC stats。 |
| `buildVideoStatsSnapshot` | 从浏览器 inbound RTP stats 提取分辨率、FPS、码率、丢包、丢帧、freeze、jitter 等数据。 |
| `VideoResolutionTestPanel` | 页面上的测速面板，提供测试档位、raw/enhanced 选择、开始/停止采样、结果汇总、CSV/JSON 导出、参数命令提示。 |
| `sandbox/rtc/shared_signaling.py` | 根据 `streamType` 把网页 offer 路由到 raw track 或 enhanced track。 |
| `sandbox/media/raw_track.py` | raw 输出轨。dog 源存在时直接转发上游帧。 |
| `sandbox/media/ai_track.py` | enhanced 输出轨。按 `SANDBOX_VIDEO_OUTPUT_FPS` 固定节拍输出，并重新生成连续 PTS。 |

测速面板默认档位在 `VideoResolutionTestPanel.jsx`：

```text
640x480@15
1280x720@15
1280x720@30
1920x1080@15
1920x1080@30
```

每个 case 会记录：

- 实际收到的 `frameWidth` / `frameHeight`
- 浏览器统计的 `framesPerSecond`
- 接收码率 `bitrateKbps`
- `packetsLost`
- `framesDropped`
- RTP `jitterMs`
- `freezeCount` 和 freeze 总时长

注意：网页里的 `jitterMs` 来自浏览器 WebRTC inbound RTP stats 的 `report.jitter * 1000`，它是“这一路 RTP 包到达浏览器时的抖动”，不是完整端到端延迟。

## 2. sandbox 参数修改与生效验证

sandbox 侧最常调的是输出 FPS 和 YOLO 输入尺寸。

```bash
export SANDBOX_VIDEO_OUTPUT_FPS=15
export SANDBOX_VIDEO_LATENCY_WINDOW_MS=2000
export SANDBOX_YOLO_INPUT_SIZE=640,480
```

参数含义：

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `SANDBOX_VIDEO_OUTPUT_FPS` | `15` | enhanced 输出轨的固定输出 FPS；raw 无 dog 源时的占位帧也使用这个 FPS。 |
| `SANDBOX_VIDEO_LATENCY_WINDOW_MS` | `2000` | sandbox latency 统计窗口。 |
| `SANDBOX_YOLO_INPUT_SIZE` | 配置文件或 `480,640` | YOLO 推理输入尺寸，格式是 `width,height`。 |
| `SANDBOX_YOLO_ENABLED` | `true` | 是否启用 YOLO。只做传输测速时通常不用改。 |

修改方式：

1. 在启动 sandbox 的 shell 里先 `export` 参数。
2. 重启 sandbox 服务或容器。
3. 再触发机器狗共享视野，让网页重新建立 raw/enhanced WebRTC 连接。

验证 sandbox 参数生效：

```bash
curl -s http://127.0.0.1:8787/api/health
```

重点看这些字段：

- `videoMetrics.fps`：enhanced 输出侧最近 FPS。
- `videoMetrics.inputFps`：sandbox 从 dog 输入侧读到的 FPS。
- `detectorDetails`：YOLO 当前配置、prompt、输入尺寸等 detector 状态。
- `streamRequested`、`videoReady`：是否已经进入视频链路。

也可以看 sandbox 日志：

```bash
rg -n "LATENCY kind=summary component=sandbox|receiverFps|jitterBuffer" logs
```

重点看：

```text
component=sandbox stage=sandbox_pipeline inputFps=...
component=glasses stage=receiver receiverFps=... jitterBufferP50Ms=...
```

为什么多数测速不需要改 YOLO：

- 分辨率/FPS 测试主要验证 dog -> sandbox -> web 的视频传输能力。
- `SANDBOX_VIDEO_OUTPUT_FPS` 控制 enhanced WebRTC 输出节拍，和 YOLO 模型本身不是一回事。
- detector 可以按自己的输入尺寸做推理，没必要为了每个视频分辨率都改 YOLO。
- 如果只想测 raw/enhanced 的传输稳定性，建议先固定 YOLO 输入尺寸，减少变量。

YOLO 注意事项：

- 如果确实修改 `SANDBOX_YOLO_INPUT_SIZE`，宽高建议使用 32 的倍数，因为 YOLO 模型通常有 32 stride。
- `640,480` 是可以的，二者都是 32 的倍数。
- `1280,720` 里的 `720` 不是 32 的倍数；建议改成 `1280,736`，或者保持较小的 `640,384` / `640,480`。
- `1920,1080` 里的 `1080` 不是 32 的倍数；建议改成 `1920,1088`，或使用更省算力的 `960,544`。
- 不要把视频显示分辨率和 YOLO 推理输入尺寸强行绑定。显示可以是 720p/1080p，YOLO 输入可以独立取 32 倍数尺寸。

## 3. 机器狗参数修改与生效验证

机器狗侧常用视频参数：

```bash
export DOG_CAMERA_DEVICE=/dev/video4
export DOG_FALLBACK_CAMERA_DEVICE=/dev/video0
export DOG_CAMERA_WIDTH=640
export DOG_CAMERA_HEIGHT=480
export DOG_CAMERA_FPS=15
export DOG_CAMERA_WARMUP_SECONDS=2.0
```

参数含义：

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `DOG_CAMERA_DEVICE` | `/dev/video4` | 优先打开的真实摄像头。 |
| `DOG_FALLBACK_CAMERA_DEVICE` | `/dev/video0` | 主摄像头不可用时的 fallback。 |
| `DOG_CAMERA_WIDTH` | `640` | 摄像头采集宽度。 |
| `DOG_CAMERA_HEIGHT` | `480` | 摄像头采集高度。 |
| `DOG_CAMERA_FPS` | `15` | 摄像头采集 FPS。 |
| `DOG_CAMERA_WARMUP_SECONDS` | `2.0` | 摄像头打开后的预热时间。 |

修改方式：

1. 在机器狗启动服务前设置环境变量。
2. 重启 dog 服务。
3. 等 sandbox 重新调用 `/api/v1/stream/push`。

验证机器狗参数生效：

```bash
curl -s http://127.0.0.1:18890/api/health
```

如果不是在机器狗本机执行，把 `127.0.0.1` 换成机器狗对外地址，例如：

```bash
curl -s http://192.168.1.110:18890/api/health
```

重点看：

- `currentSource`：是否已经从 `synthetic` 切到真实摄像头，例如 `/dev/video4`。
- `sourceMode`：是否为 `camera_opencv` 或 `camera`。
- `peerConnectionState`：是否为 `connected`。
- `sourceFps`：实际输出 FPS 是否接近期望值。
- `videoSenderRttMs`：dog 到 sandbox 的发送侧 RTT 估计。

也可以看 dog 日志：

```bash
rg -n "OpenCV camera opened|camera_source_selected|sourceFps|peer_connected|RTCRtpsender|InvalidDataError" dog.txt logs
```

正常情况下应该看到类似：

```text
OpenCV camera opened; source=... width=640 height=480 fps=15
LATENCY ... stage=camera_source_selected currentSource=/dev/video4 sourceMode=camera_opencv
LATENCY ... stage=peer_connected connectionState=connected
LATENCY ... stage=dog_sender sourceFps=...
```

如果 `currentSource=synthetic`，说明还在假视频占位，没有成功切到真实摄像头。常见原因是摄像头设备不存在、权限不足、被其他进程占用，或者设备不支持当前宽高/FPS 组合。

## 4. 为什么 enhanced 的抖动更小

enhanced 的 jitter 更小，主要不是因为它“网络更好”，而是因为它被 sandbox 重新定时输出了。

raw 路径：

```text
dog 摄像头 -> dog WebRTC -> sandbox raw track -> web raw receiver
```

raw 有 dog 源时，`RawDogVideoTrack.recv()` 基本直接返回上游帧：

```python
return await source_track.recv()
```

所以 dog 摄像头采集节奏、dog -> sandbox 网络抖动、上游 RTP/PTS 波动，都会比较直接地暴露给网页 raw receiver。

enhanced 路径：

```text
dog 摄像头 -> dog WebRTC -> sandbox AI track -> 固定节拍重发 -> web enhanced receiver
```

`AIVideoTrack.recv()` 会：

- 按 `SANDBOX_VIDEO_OUTPUT_FPS` 等待下一个输出槽位。
- 选择最新处理好的帧。
- 重新生成连续递增的 PTS。
- 再把帧发给 WebRTC sender。

也就是说 enhanced 像经过了一层“节拍器”。它会牺牲一部分实时性，换来更稳定的下游输出节奏。浏览器看到的 RTP jitter 就容易更低。

但这不代表 enhanced 的端到端延迟一定更小。enhanced 多了：

- YOLO 推理
- 画框/overlay
- 帧格式转换
- 排队和取最新帧
- sandbox 重新编码发送

所以判断体验时要同时看：

- `jitterMs` / `jitterBufferP50Ms`
- `framesPerSecond`
- `framesDropped`
- `freezeCount`
- `sandboxProcessingMs`
- `dogToGlassesEstMs`

只看 jitter 会偏向 enhanced，因为 enhanced 的输出节奏天然更平滑。

## 5. 为什么 30 FPS 会视频传输卡住

30 FPS 本身不是唯一根因。之前的现象更像是 30 FPS 把已有问题放大了：编码器、切源、时间戳和 CPU/网络压力一起变紧，最终让视频发送线程停止。

当前代码里有一个关键风险：dog 在收到 `/api/v1/stream/push` 后，会先建 WebRTC 连接并用 synthetic 假视频占位；真实摄像头是后面异步打开，再切到输出 track 上。

流程是：

```text
1. sandbox 请求 dog 推流
2. dog 创建 RTCPeerConnection
3. dog 先发送 synthetic 占位视频
4. dog 后台打开真实摄像头
5. 打开成功后从 synthetic 切到真实摄像头
6. WebRTC 编码器继续复用同一个 sender
```

问题在 PTS。PTS 是视频帧显示时间戳，编码器要求它一直递增。synthetic track 和真实摄像头 track 各自从自己的 `_frame_index=0` 开始生成 PTS。切源时可能出现：

```text
synthetic 已经发到 PTS=180000
真实摄像头第一帧又从 PTS=3000 或 6000 开始
```

编码器看到时间戳倒退，就可能报：

```text
pts is smaller than initial pts
av.error.InvalidDataError: Invalid data found when processing input: 'avcodec_send_frame()'
```

这时 dog 的 HTTP 服务仍然活着，但 `RTCRtpsender(video)` 线程已经退出，结果就是“服务还在，但没有视频包继续发”。

30 FPS 为什么更容易触发或更明显：

- 每秒帧数翻倍，编码器压力更大。
- PTS 步长变小，切源/重连时更容易撞到时间戳边界问题。
- 真实摄像头 30 FPS 对 USB 摄像头、MJPG 解码、OpenCV 读取和 VP8 编码压力更高。
- 如果 sandbox 同时跑 enhanced/YOLO，CPU/GPU/编码资源竞争更明显。
- raw 和 enhanced 两路网页预览同时打开时，sandbox 也要维护两路 WebRTC sender。

临时规避：

- 先用 `640x480@15` 或 `1280x720@15` 做稳定性基线。
- 不要同时改 dog FPS、sandbox output FPS、YOLO input size 三个变量。
- 如果要测 30 FPS，先关闭不必要的 enhanced 预加载或降低 YOLO 输入尺寸。
- 观察 dog 日志是否出现 `RTCRtpsender(video)`、`InvalidDataError`、`avcodec_send_frame()`。

根治方向：

- dog 的最外层输出 track 应统一重打 PTS，保证切源前后 PTS 单调递增。
- 切源时尽量不要把底层 source track 的 PTS 原样透传给同一个 WebRTC encoder。
- 发生 sender 编码异常后，应主动关闭旧 PeerConnection，并通知 sandbox/web 重新协商，避免“服务活着但视频线程死了”的半死状态。

