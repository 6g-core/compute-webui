# 机器狗视频链路速度与低延迟分辨率测试



本文档用于测试机器狗从摄像头采集视频并通过网络发送到网页前端时，在清晰、低延迟、不卡顿要求下可稳定工作的最大分辨率/FPS 档位。

测试链路：

```text
摄像头 -> 数据线/采集接口 -> 机器狗采集 -> 视频编码 -> 网络传输 -> 接收端解码/显示
```

当前 `dog -> sandbox/网页前端` 链路应按真实 WebRTC 视频链路测试，最终结论以浏览器端实际看到的分辨率、帧率、码率、丢帧和冻结情况为准。`iperf3` 和裸 UDP/FFmpeg 只用于排查网络、摄像头和编码上限，不能单独作为网页端可用分辨率结论。

当前实现已在 `compute-webui` 提供“网页视频分辨率测试”面板。正式记录网页端结果时，优先使用该面板完成 raw/enhanced 采样、JSON/CSV 导出和 sandbox 落盘；`chrome://webrtc-internals` 作为辅助核对工具。

不同分辨率下网页视频效果测试的代码设计见：[docs/video-resolution-web-test-design.md](docs/video-resolution-web-test-design.md)。

现场操作步骤见：[docs/video-resolution-test-operation.md](docs/video-resolution-test-operation.md)。

## 1. 测试目标

找到满足低延迟标准的最高稳定分辨率，例如：

| 指标 | 建议标准 |
| --- | --- |
| 网页端实际帧率 | 达到目标 fps 的 95% 以上 |
| 端到端延迟 | P95 < 200 ms |
| WebRTC 丢帧率 | < 1% |
| 网页冻结/卡顿 | 2-5 分钟内无明显连续冻结 |
| 连续稳定时间 | 每个 case 至少 2-5 分钟 |
| 网络占用 | 不超过稳定带宽的 60%-70% |

如果业务对实时控制要求更高，可以把 P95 延迟标准改为 100 ms 或 150 ms。

## 2. 当前链路参数与修改点

当前网页前端看到的机器狗视频不是浏览器直接连接 `dog`，而是：

```text
dog 摄像头采集 -> dog WebRTC 发送 -> sandbox WebRTC 接收 -> AIVideoTrack/RawDogVideoTrack -> sandbox WebRTC 发送 -> compute-webui 浏览器播放
```

### 2.1 当前默认参数

| 层级 | 当前参数 | 配置入口 |
| --- | --- | --- |
| `dog` 摄像头设备 | 默认 `/dev/video4`，fallback `/dev/video0` | `DOG_CAMERA_DEVICE`、`DOG_FALLBACK_CAMERA_DEVICE` |
| `dog` 摄像头分辨率 | 默认 `640x480` | `DOG_CAMERA_WIDTH`、`DOG_CAMERA_HEIGHT` |
| `dog` 摄像头帧率 | 默认 `15 fps` | `DOG_CAMERA_FPS` |
| `dog` 摄像头采集 | OpenCV V4L2，优先 `MJPG`，buffer size 为 `1` | 代码内固定 |
| `dog -> sandbox` | WebRTC，`sandbox` recvonly，`dog` send video track | `dog /api/v1/stream/push` |
| `dog` ICE/媒体端口 | 固定 UDP 端口范围，默认 `40100-40103` | `dog/config.json` 或 `DOG_RTC_UDP_PORT_START/END` |
| `sandbox` enhanced 输出 | 默认 `15 fps` | `SANDBOX_VIDEO_OUTPUT_FPS` |
| `sandbox` YOLO 输入尺寸 | 默认按 sandbox 配置加载；分辨率测试时要求与 dog 分辨率一致 | `SANDBOX_YOLO_INPUT_SIZE`，格式 `<width>,<height>` |
| `sandbox` raw 输出 | 订阅 dog 原始 track，按输出时钟兜底 | `SANDBOX_VIDEO_OUTPUT_FPS` |
| `sandbox -> compute-webui` | WebRTC，`compute-webui` recvonly | `POST /api/v1/web/sdp/offer` |
| `compute-webui` 视频类型 | `raw` 原始视野，`enhanced` 增强视野 | `streamType`；当前 WebRTC client id 固定为 `react-dog-raw` / `react-dog-enhanced` |

当前代码没有显式设置 WebRTC 发送码率、codec 优先级、`maxBitrate`、`maxFramerate` 或 `scaleResolutionDownBy`。如果不改代码，码率和 codec 主要由浏览器 / aiortc / 网络拥塞控制自动协商。当前网页分辨率测试通过固定 raw/enhanced 连接采样，case 结果用 `<width>x<height>@<fps>/<streamType>` 标识。

### 2.2 只改分辨率和 fps

优先通过环境变量调，不需要改代码。

`dog` 侧控制采集分辨率和采集 fps：

```bash
export DOG_CAMERA_DEVICE=/dev/video4
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=15
```

`sandbox` 侧控制 AI/enhanced 输出 fps、raw 占位输出 fps 和 overlay fps hint：

```bash
export SANDBOX_VIDEO_OUTPUT_FPS=15
export SANDBOX_YOLO_INPUT_SIZE=1280,720
```

如果要测试 `1280x720@30fps`，需要两侧一起调：

```bash
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=30
export SANDBOX_VIDEO_OUTPUT_FPS=30
export SANDBOX_YOLO_INPUT_SIZE=1280,720
```

### 2.3 需要改代码的参数

如果要明确控制 WebRTC 码率、codec 或编码策略，需要改发送端代码。通常至少有两处：

| 目标 | 需要修改的位置 | 说明 |
| --- | --- | --- |
| 控制 `dog -> sandbox` 码率/codec | `dog/main.py` 中 `peer_connection.addTrack(self.output_track)` 附近 | dog 是这一段 WebRTC 的视频发送端 |
| 控制 `sandbox -> compute-webui` 码率/codec | `sandbox/rtc/shared_signaling.py` 中 `pc.addTrack(...)` 附近 | sandbox 是网页这一段 WebRTC 的视频发送端 |
| 控制网页 ICE/TURN/连接策略 | `compute-webui/src/hooks/useBackendVideo.js` | compute-webui 是接收端，通常不控制发送码率 |
| 控制 raw/enhanced 选择 | `compute-webui/src/App.jsx` 和 `useBackendVideo.js` 的 `streamType` | `raw` 看原始狗视频，`enhanced` 看 YOLO/增强后视频 |

如果只是网页端卡顿，优先先调 `DOG_CAMERA_WIDTH/HEIGHT/FPS` 和 `SANDBOX_VIDEO_OUTPUT_FPS`；只有确认自动协商码率不可控时，再加 sender 参数控制。

### 2.4 推荐起测组合

先从稳定组合开始：

```bash
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=15
export SANDBOX_VIDEO_OUTPUT_FPS=15
export SANDBOX_YOLO_INPUT_SIZE=1280,720
```

稳定后再测试：

```bash
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=30
export SANDBOX_VIDEO_OUTPUT_FPS=30
```

如果 `720p@30fps` 网页端出现明显丢帧、冻结或延迟升高，优先回退到 `720p@15fps`，再考虑降低码率或增加显式 WebRTC sender 参数。

## 3. 测试准备

### 3.1 设备

- 机器狗一台，带摄像头。
- 接收端一台，可以是笔记本、边缘服务器或视频服务端。
- 机器狗和接收端处于同一网络，尽量固定网络环境。

### 3.2 工具

机器狗端建议安装：

```bash
sudo apt update
sudo apt install -y iperf3 v4l-utils ffmpeg gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-libav
```

其中 `v4l2-ctl` 来自 `v4l-utils`。如果执行 `v4l2-ctl --list-devices` 提示命令不存在，说明机器狗 Linux 系统没有安装该工具，先安装 `v4l-utils`，或使用第 5 节里的替代命令。

接收端建议安装：

```bash
sudo apt update
sudo apt install -y iperf3 ffmpeg
```

网页前端测试建议使用 Chrome 或 Edge，并打开：

```text
chrome://webrtc-internals
```

用于查看浏览器实际收到的视频分辨率、fps、码率、丢帧、jitter 和 freeze 指标。

如果使用 ACN SDK 的 MoQ 数据面传输，需要确认机器狗已完成入网，并且 `demo_robotdog_register_join.py` 或对应常驻进程正在运行。

## 4. 第一步：测试网络速度

先测机器狗到接收端的网络上限，避免把摄像头或编码问题误判成网络问题。

在接收端启动服务：

```bash
iperf3 -s
```

在机器狗端测试 TCP 带宽：

```bash
iperf3 -c 接收端IP -t 30
```

测试结果：
```
unitree@ubuntu:~$ iperf3 -c 192.168.1.45 -t 30
Connecting to host 192.168.1.45, port 5201
[  5] local 10.135.116.200 port 49730 connected to 192.168.1.45 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  18.5 MBytes   155 Mbits/sec    1    291 KBytes
[  5]   1.00-2.00   sec  19.5 MBytes   164 Mbits/sec    0    338 KBytes
[  5]   2.00-3.00   sec  18.3 MBytes   153 Mbits/sec    0    376 KBytes
[  5]   3.00-4.00   sec  19.3 MBytes   162 Mbits/sec    0    413 KBytes
[  5]   4.00-5.00   sec  19.6 MBytes   165 Mbits/sec    0    448 KBytes
[  5]   5.00-6.00   sec  20.9 MBytes   175 Mbits/sec    0    479 KBytes
[  5]   6.00-7.00   sec  20.5 MBytes   172 Mbits/sec    0    510 KBytes
[  5]   7.00-8.00   sec  20.1 MBytes   168 Mbits/sec    0    539 KBytes
[  5]   8.00-9.00   sec  22.1 MBytes   185 Mbits/sec    0    649 KBytes
[  5]   9.00-10.00  sec  21.2 MBytes   178 Mbits/sec    0    799 KBytes
[  5]  10.00-11.00  sec  20.0 MBytes   168 Mbits/sec    0    977 KBytes
[  5]  11.00-12.00  sec  21.2 MBytes   178 Mbits/sec    0   1.18 MBytes
[  5]  12.00-13.00  sec  21.2 MBytes   178 Mbits/sec    0   1.44 MBytes
[  5]  13.00-14.00  sec  20.0 MBytes   168 Mbits/sec    0   1.73 MBytes
[  5]  14.00-15.00  sec  20.0 MBytes   168 Mbits/sec    0   2.06 MBytes
[  5]  15.00-16.00  sec  20.0 MBytes   168 Mbits/sec    0   2.43 MBytes
[  5]  16.00-17.00  sec  22.5 MBytes   189 Mbits/sec    0   2.92 MBytes
[  5]  17.00-18.00  sec  18.8 MBytes   157 Mbits/sec    1   3.35 MBytes
[  5]  18.00-19.00  sec  20.0 MBytes   168 Mbits/sec    0   3.79 MBytes
[  5]  19.00-20.00  sec  18.8 MBytes   157 Mbits/sec    0   3.79 MBytes
[  5]  20.00-21.00  sec  22.5 MBytes   189 Mbits/sec    1   3.79 MBytes
[  5]  21.00-22.00  sec  18.8 MBytes   157 Mbits/sec    1   3.79 MBytes
[  5]  22.00-23.00  sec  23.8 MBytes   199 Mbits/sec    0   3.79 MBytes
[  5]  23.00-24.00  sec  20.0 MBytes   168 Mbits/sec    0   3.79 MBytes
[  5]  24.00-25.00  sec  21.2 MBytes   178 Mbits/sec    0   3.79 MBytes
[  5]  25.00-26.00  sec  20.0 MBytes   168 Mbits/sec    1   5.72 MBytes
[  5]  26.00-27.00  sec  23.8 MBytes   199 Mbits/sec    0   5.72 MBytes
[  5]  27.00-28.00  sec  16.2 MBytes   136 Mbits/sec    0   5.72 MBytes
[  5]  28.00-29.00  sec  23.8 MBytes   199 Mbits/sec    0   5.72 MBytes
[  5]  29.00-30.00  sec  21.2 MBytes   178 Mbits/sec    0   5.72 MBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec   614 MBytes   172 Mbits/sec    5             sender
[  5]   0.00-40.07  sec   614 MBytes   129 Mbits/sec                  receiver

iperf Done.
```



测试 UDP 在不同码率下的丢包和抖动：

```bash
iperf3 -c 接收端IP -u -b 10M -t 60
iperf3 -c 接收端IP -u -b 20M -t 60
iperf3 -c 接收端IP -u -b 50M -t 60
```

记录：
1. WIFI场景
| 测试码率 | 实际吞吐 | jitter | 丢包率 | 是否可用 |
| --- | --- | --- | --- | --- |
| 10 Mbps | | | | |
| 20 Mbps | | | | |
| 50 Mbps | | | | |

2. 基站场景
| 测试码率 | 实际吞吐 | jitter | 丢包率 | 是否可用 |
| --- | --- | --- | --- | --- |
| 10 Mbps | | | | |
| 20 Mbps | | | | |
| 50 Mbps | | | | |

判断建议：

- 丢包率接近 0 且 jitter 较低，说明该码率可以作为视频码率候选。
- 视频目标码率不要贴近网络上限，建议只使用稳定带宽的 60%-70%。
- 如果 UDP 丢包明显，优先降低码率、换 5G/有线网络、减少中间转发节点。
- 如果 `iperf3` 表现很好但网页仍卡顿，继续检查 WebRTC 实际码率、浏览器解码、机器狗编码和前端渲染；不要只根据网络测速判断链路可用。

## 5. 第二步：查看摄像头支持的分辨率

机器狗是 Linux 系统时，优先使用 `v4l2-ctl` 查看摄像头。如果命令不存在，先确认系统发行版：

```bash
cat /etc/os-release
```

Ubuntu / Debian 系统安装：

```bash
sudo apt update
sudo apt install -y v4l-utils
```

安装后查看摄像头设备：

```bash
v4l2-ctl --list-devices
```

假设摄像头是 `/dev/video0`，查看支持格式：

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
```

如果机器狗暂时不能联网安装 `v4l-utils`，可以先用系统自带方式确认摄像头节点：

```bash
ls -l /dev/video*
dmesg | grep -i video
```

也可以用 FFmpeg 直接枚举摄像头支持格式：

```bash
ffmpeg -f v4l2 -list_formats all -i /dev/video0
```

如果 `/dev/video0` 不存在，尝试 `/dev/video1`、`/dev/video2`，或根据 `ls -l /dev/video*` 的结果选择实际设备。

### 5.1 多个摄像头时确认目标设备

不要只依赖 `/dev/video0`、`/dev/video1` 的编号，Linux 重启或插拔设备后编号可能变化。建议按下面顺序确认。

查看摄像头名称和对应节点：

```bash
v4l2-ctl --list-devices
```

输出通常会按物理设备分组，例如：

```text
USB Camera:
        /dev/video0
        /dev/video1

Front Camera:
        /dev/video2
```

如果同一个摄像头下面有多个 `/dev/video*`，通常只有一个是视频画面节点，另一个可能是 metadata 节点。逐个查看能力：

```bash
v4l2-ctl -d /dev/video0 --all
v4l2-ctl -d /dev/video1 --all
```

优先选择能力里包含 `Video Capture` 的节点；如果只看到 `Metadata Capture`，一般不是可直接取画面的节点。

查看稳定设备路径：

```bash
ls -l /dev/v4l/by-id/
ls -l /dev/v4l/by-path/
```

`/dev/v4l/by-id/` 和 `/dev/v4l/by-path/` 会指向真实的 `/dev/video*`，比 `/dev/video0` 这种编号更稳定。脚本中建议优先使用这些稳定路径，例如：

```bash
ffmpeg -f v4l2 -i /dev/v4l/by-id/实际摄像头名称 -frames:v 1 test.jpg
```

查看单个节点的厂商、型号和连接路径：

```bash
udevadm info --query=all --name=/dev/video0 | grep -E "ID_MODEL|ID_SERIAL|ID_PATH|ID_V4L_PRODUCT|ID_VENDOR"
```

最后用预览或抓图确认画面。接收端有显示环境时：

```bash
ffplay -f v4l2 -video_size 640x480 -i /dev/video0
ffplay -f v4l2 -video_size 640x480 -i /dev/video1
```

没有显示环境时，逐个抓一张图，再下载或查看图片：

```bash
ffmpeg -f v4l2 -i /dev/video0 -frames:v 1 camera-video0.jpg
ffmpeg -f v4l2 -i /dev/video1 -frames:v 1 camera-video1.jpg
```

现场确认方法：

- 遮挡某个摄像头镜头，看哪一路画面变黑。
- 移动机器狗或晃动目标摄像头，看哪一路画面变化。
- 如果要用前视摄像头，记录它对应的 `/dev/v4l/by-id/` 或 `/dev/v4l/by-path/` 路径，后续测试固定使用这个路径。

### 5.2 宇树 Go2 EDU 本体相机

宇树 Go2 EDU 的本体前视相机不一定暴露成 `/dev/video0` 这种 V4L2 设备。很多 Go2 EDU 环境中，本体相机由机器狗内部服务输出 H.264 RTP 组播流，因此 `v4l2-ctl --list-devices` 看不到它是正常现象。

先确认机器狗网络接口名称：

```bash
ip -br addr
```

如果机器狗通过网线连接，接口通常是 `eth0`。如果实际接口不是 `eth0`，把下面命令里的 `multicast-iface=eth0` 替换成实际接口名。

在机器狗本机有图形界面时，直接预览本体相机：

```bash
gst-launch-1.0 udpsrc address=230.1.1.1 port=1720 multicast-iface=eth0 \
  ! application/x-rtp,media=video,encoding-name=H264 \
  ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! autovideosink
```

低延迟预览版本：

```bash
gst-launch-1.0 udpsrc address=230.1.1.1 port=1720 multicast-iface=eth0 \
  ! application/x-rtp,media=video,encoding-name=H264 \
  ! rtph264depay ! queue max-size-buffers=1 leaky=downstream \
  ! h264parse ! queue max-size-buffers=1 leaky=downstream \
  ! avdec_h264 ! videoconvert ! autovideosink sync=false
```

如果没有图形界面，可以先录制 10 秒视频文件确认是否有流：

```bash
timeout 10s gst-launch-1.0 -e udpsrc address=230.1.1.1 port=1720 multicast-iface=eth0 \
  ! application/x-rtp,media=video,encoding-name=H264 \
  ! rtph264depay ! h264parse ! mp4mux ! filesink location=go2-camera-test.mp4
```

录制结束后检查文件：

```bash
ls -lh go2-camera-test.mp4
ffprobe go2-camera-test.mp4
```

如果要在接收端看 Go2 本体相机，接收端也需要能收到该组播流。先确认接收端与 Go2 在同一网段，并且网络允许组播；然后在接收端执行同样的 `gst-launch-1.0 udpsrc ...` 命令，`multicast-iface` 改成接收端连接 Go2 的网卡名。

Go2 EDU 本体相机测试时建议先按以下档位记录：

| 来源 | 候选分辨率 | 候选帧率 | 说明 |
| --- | --- | --- | --- |
| Go2 本体相机组播流 | 720p | 15 fps | 优先测试，通常更稳 |
| Go2 本体相机组播流 | 1080p | 15 fps | 如果系统支持切换，再测试 |
| 外接 USB 摄像头 | 按 `v4l2-ctl` 输出 | 按实际支持 | 使用 `/dev/video*` 或 `/dev/v4l/by-id/*` |

注意：

- 如果测试的是 Go2 本体相机，优先走本节的 GStreamer 组播流，不要纠结 `/dev/video0`。
- 如果测试的是外接 USB 摄像头，继续使用前面的 `v4l2-ctl`、`ffmpeg -f v4l2` 方法。
- Go2 本体相机的输出分辨率可能由宇树内部服务或 App 配置决定，测速时先记录实际收到的视频宽高和 fps，再判断是否需要另找配置入口调整。

记录摄像头实际支持的分辨率和帧率：

| 格式 | 分辨率 | 最大帧率 | 备注 |
| --- | --- | --- | --- |
| MJPEG/YUYV/H264 | 640x480 | | |
| MJPEG/YUYV/H264 | 1280x720 | | |
| MJPEG/YUYV/H264 | 1920x1080 | | |

注意：

- 摄像头标称支持某个分辨率，不代表编码和网络链路也能低延迟稳定传输。
- 如果同一分辨率下有 MJPEG、YUYV、H264 等格式，优先选择机器狗 CPU/GPU 压力较低、网络码率可控的格式。

## 6. 第三步：建立延迟打点

建议每帧或每个视频分片都带上测试头：

```json
{
  "seq": 1,
  "send_time_ns": 1234567890000000000,
  "width": 1280,
  "height": 720,
  "fps": 30,
  "payload_size": 4096
}
```

接收端收到后记录：

```text
latency_ms = (recv_time_ns - send_time_ns) / 1000000
```

如果机器狗和接收端不是同一台机器，需要先做时间同步：

```bash
timedatectl
chronyc tracking
```

更准确的端到端验证方法：

1. 用摄像头拍摄毫秒计时器或闪烁 LED。
2. 接收端显示视频画面。
3. 对比真实时间和画面中时间，得到采集到显示的总延迟。

### 6.1 当前 dog -> 网页前端 WebRTC 链路观测

视频跑起来后，先确认 `dog` 侧确实在发送真实摄像头画面，而不是占位流：

```bash
curl http://DOG_IP:8890/api/health
```

重点记录：

| 字段 | 含义 | 判断 |
| --- | --- | --- |
| `peerConnectionState` | WebRTC 连接状态 | 应为 `connected` 或稳定保持连接 |
| `currentSource` | 当前视频源 | 应为真实摄像头、文件或 FFmpeg 输入，不应长期是 `synthetic` |
| `sourceMode` | 视频源模式 | `camera_opencv`、`camera`、`ffmpeg_pipe` 等 |
| `sourceFps` | dog 侧实际输出帧率 | 应接近目标 fps |
| `videoSenderRttMs` | WebRTC 发送端 RTT | 越低越好，持续升高通常说明链路拥塞 |

如果有 `sandbox` 服务，网页链路运行时也记录：

```bash
curl http://SANDBOX_IP:8787/api/latency
```

当前实现会在 `compute-webui` 的“网页视频分辨率测试”面板中自动采集浏览器 `inbound-rtp video` 指标。需要进一步排查时，再打开 `chrome://webrtc-internals` 找到对应 PeerConnection 核对：

| 指标 | 含义 | 判断 |
| --- | --- | --- |
| `frameWidth` / `frameHeight` | 浏览器实际收到的分辨率 | 必须等于或接近本档目标分辨率 |
| `framesPerSecond` | 浏览器实际播放 fps | 达到目标 fps 的 95% 以上 |
| `bytesReceived` | 收到的字节数 | 用差分计算实际视频码率 |
| `framesDropped` | 浏览器丢帧 | 持续增加说明解码或渲染跟不上 |
| `jitter` | 网络抖动 | 抖动高时容易卡顿、花屏或延迟波动 |
| `freezeCount` / `totalFreezesDuration` | 冻结次数和时长 | 真实反映网页端卡顿 |

实际接收码率计算：

```text
Mbps = bytesReceived_delta * 8 / 时间秒 / 1000000
```

例如 5 秒内 `bytesReceived` 增加 3,000,000 bytes：

```text
3,000,000 * 8 / 5 / 1000000 = 4.8 Mbps
```

## 7. 第四步：按网页实际体验阶梯扫描分辨率

固定编码方式，从低到高测试。当前实现内置下面 5 个档位，每个档位都需要分别采样 `raw` 和 `enhanced`：

| 档位 | 分辨率 | 帧率 | 建议初始码率 |
| --- | --- | --- | --- |
| 1 | 640x480 | 15 fps | 1-2 Mbps |
| 2 | 1280x720 | 15 fps | 2.5-4 Mbps |
| 3 | 1280x720 | 30 fps | 3-5 Mbps |
| 4 | 1920x1080 | 15 fps | 5-8 Mbps |
| 5 | 1920x1080 | 30 fps | 8-10 Mbps |

当前面板操作顺序：

```text
1. 在 compute-webui 测试面板选择分辨率/FPS 档位。
2. 复制面板生成的 dog/sandbox 环境变量。
3. 应用环境变量并重启 dog 和 sandbox。
4. 等网页视频恢复。
5. 为 raw 填写或确认 clarity / smoothness / notes，再开始 raw 采样。
6. raw 停止或倒计时结束后，结果会自动提交到 sandbox。
7. 为 enhanced 填写或确认 clarity / smoothness / notes，再开始 enhanced 采样。
8. enhanced 停止或倒计时结束后，结果会自动提交到 sandbox。
9. 需要时下载当前 run 的 JSON/CSV 汇总。
```

注意：当前实现会在 case 结束时立即提交结果，所以主观评价需要在当前 case 停止或自动结束前填好。

如果使用 `dog` 直接打开 Linux 摄像头，每档通过环境变量调整，然后重启 `dog`：

```bash
export DOG_CAMERA_DEVICE=/dev/video4
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=15
python main.py --config config.json
```

如果是外部 FFmpeg 给 `dog` 喂流，则通过 `scale`、`fps` 和码率调整输入质量，例如：

```powershell
ffmpeg -f dshow -rtbufsize 256M -i video="Integrated Camera" `
  -an -vf scale=1280:720,fps=15 `
  -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p `
  -b:v 3M -f mpegts udp://WSL_IP:23000?pkt_size=1316
```

每个 case 建议运行 2-5 分钟；使用当前面板时，默认采样时间是 `120s`，可以在页面调整。记录时 raw/enhanced 应分开保存：

| caseId | dog sourceFps | 浏览器 fps | 浏览器实际码率 | RTT | jitter | 丢帧/冻结 | CPU | clarity | smoothness | 结论 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 640x480@15/raw | | | | | | | | | | |
| 640x480@15/enhanced | | | | | | | | | | |
| 1280x720@15/raw | | | | | | | | | | |
| 1280x720@15/enhanced | | | | | | | | | | |
| 1280x720@30/raw | | | | | | | | | | |
| 1280x720@30/enhanced | | | | | | | | | | |
| 1920x1080@15/raw | | | | | | | | | | |
| 1920x1080@15/enhanced | | | | | | | | | | |
| 1920x1080@30/raw | | | | | | | | | | |
| 1920x1080@30/enhanced | | | | | | | | | | |

通过标准：

```text
P95 延迟 < 目标延迟
浏览器丢帧率 < 1%
浏览器实际 fps >= 目标 fps 的 95%
2-5 分钟内无明显连续冻结
机器狗 CPU/温度没有持续过载
```

同一个 `width/height/fps` 下，`raw` 和 `enhanced` 都通过，才认为该档位通过。满足标准的最高档位，就是当前网络、编码配置、YOLO/overlay 处理和网页前端渲染条件下的最大可用分辨率/FPS。

## 8. FFmpeg 参考测试命令

### 8.1 机器狗发送 UDP 视频

以下命令用于快速验证网络、摄像头和编码能力，不依赖 `dog/sandbox` 的 WebRTC 链路。它不能替代网页前端实测结论：

```bash
ffmpeg -f v4l2 -framerate 30 -video_size 1280x720 -i /dev/video0 \
  -c:v libx264 -preset ultrafast -tune zerolatency \
  -bf 0 -g 30 -b:v 3M \
  -f mpegts udp://接收端IP:5000
```

如果机器狗支持硬件编码，优先使用硬件编码器，例如：

```bash
ffmpeg -f v4l2 -framerate 30 -video_size 1280x720 -i /dev/video0 \
  -c:v h264_v4l2m2m -bf 0 -g 30 -b:v 3M \
  -f mpegts udp://接收端IP:5000
```

### 8.2 接收端播放

```bash
ffplay -fflags nobuffer -flags low_delay -framedrop udp://0.0.0.0:5000
```

如果画面卡顿，先降低码率，再降低分辨率。

如果裸 UDP 播放流畅，但网页 WebRTC 仍然卡顿，优先检查浏览器 `webrtc-internals` 中的 `framesDropped`、`freezeCount`、`jitter`，再检查 `dog /api/health` 中的 `sourceFps` 和 `videoSenderRttMs`。

## 9. ACN SDK / MoQ 链路测试建议

当前 SDK 中，控制面通过 WebSocket 保持在线和分发任务消息，数据面通过 MoQ 发送对象。视频测试建议把编码后的视频帧或分片作为 MoQ payload 发送。

发送端核心调用：

```python
sdk.task_info_report(agent_id, task_id, "Video", payload_bytes)
```

接收端注册回调：

```python
def on_message_received(namespace: str, track: str, payload: bytes) -> None:
    if track != "Video":
        return
    recv_time_ns = time.time_ns()
    # 从 payload 中解析 seq/send_time_ns，然后计算 latency_ms

sdk.register_callbacks(on_message_received=on_message_received)
```

建议 payload 结构：

```text
4 bytes  header_length
N bytes  JSON header，包含 seq/send_time_ns/width/height/fps/chunk_index/chunk_count
M bytes  encoded video bytes
```

注意：

- 不建议直接发送原始 RGB/YUYV 帧，码率过大，延迟会很快失控。
- 如果单帧编码后太大，需要切片发送，并在接收端按 `seq + chunk_index` 重组。
- 视频实时预览优先使用 `subscribe` 模式，不建议用 `fetch` 作为主实时通道。

## 10. 现场判定示例

假设目标标准是：

```text
30 fps
P95 < 200 ms
丢帧率 < 1%
```

测试结果：

| caseId | 浏览器 fps | 实际码率 | P95 延迟 | 丢帧/冻结 | 主观评价 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| 640x480@15/raw | 15 | 1.2 Mbps | 90 ms | 无明显冻结 | good/good | 通过 |
| 640x480@15/enhanced | 15 | 1.4 Mbps | 105 ms | 无明显冻结 | good/good | 通过 |
| 1280x720@15/raw | 15 | 3.5 Mbps | 145 ms | 无明显冻结 | good/good | 通过 |
| 1280x720@15/enhanced | 14.8 | 4.2 Mbps | 170 ms | 无明显冻结 | good/ok | 通过 |
| 1280x720@30/raw | 29 | 5.0 Mbps | 190 ms | 无明显冻结 | good/ok | 通过 |
| 1280x720@30/enhanced | 24 | 5.4 Mbps | 210 ms | 偶发冻结 | ok/bad | 不通过 |
| 1920x1080@15/raw | 12 | 6.5 Mbps | 280 ms | 明显冻结 | ok/bad | 不通过 |
| 1920x1080@15/enhanced | 10 | 7.2 Mbps | 320 ms | 明显冻结 | bad/bad | 不通过 |

结论：

```text
当前网页前端稳定最大档位为 1280x720@15fps。
```

实际部署时建议保留余量，例如线上使用：

```text
1280x720@15fps，码率降低 10%-20%
或 960x540@15fps，换取更稳的头控体验
```

## 11. 常见问题

### 11.1 网络带宽够，但延迟仍然高

优先检查：

- 是否使用软件编码导致 CPU 过高。
- 是否使用了 B 帧。
- 接收端播放器是否缓存太多。
- 发送端是否积压旧帧，没有丢弃过期帧。

### 11.2 低分辨率正常，高分辨率明显卡顿

可能原因：

- 摄像头输出帧率不足。
- USB/采集接口带宽不足。
- 编码器性能不足。
- 网络码率超过稳定带宽。

处理方式：

- 降低码率。
- 使用 H265 或硬件 H264。
- 降低 fps。
- 降低分辨率。

### 11.3 延迟越来越大

说明链路中存在排队。实时视频应丢弃旧帧，而不是排队发送所有帧。

处理方式：

- 发送端只保留最新帧。
- 接收端只显示最新完整帧。
- 当发送队列超过阈值时主动丢弃旧分片。

### 11.4 ACN 前端显示机器狗离线

机器狗入网进程必须常驻运行。执行 `join_network()` 后，如果 Python 进程退出，WebSocket 会断开，前端可能显示离线。应使用常驻脚本或 systemd 服务保持在线。
