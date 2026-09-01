# Docker Runbook

Build and run everything locally:

```bash
docker compose up --build
```

Open:

```text
http://localhost:28449
```

Default services inside the container:

```text
Frontend:              28449
Stage/Latency API:     28448
Background WebRTC:     28450
Dog WebRTC:            28451
Enhanced Dog WebRTC:   28452
```

Configure endpoint IP/ports at startup. These endpoints may live on different servers:

```bash
BACKEND_IP=192.168.1.10 BACKEND_PORT=28448 \
WEBRTC_IP=192.168.1.20 WEBRTC_PORT=28450 \
DOG_WEBRTC_IP=192.168.1.21 DOG_WEBRTC_PORT=28451 \
DOG_ENHANCED_WEBRTC_IP=192.168.1.22 DOG_ENHANCED_WEBRTC_PORT=28452 \
docker compose up --build
```

`*_HOST` can be used instead of `*_IP` if the endpoint is a DNS name.

Switch the story copy profile at startup:

```bash
COMPUTE_WEBUI_STORY_SCENARIO=parcel_pickup docker compose up --build
```

Use `COMPUTE_WEBUI_STORY_SCENARIO=blind_box_store` to switch back to the
default mystery-box/store copy.

Use full URLs when the backend or WebRTC paths are not the defaults:

```bash
STAGE_API_URL=http://192.168.1.10:9000/api/stage \
LATENCY_API_URL=http://192.168.1.10:9000/api/latency \
WEBRTC_SIGNAL_URL=http://192.168.1.20:28450/offer \
DOG_WEBRTC_SIGNAL_URL=http://192.168.1.21:28451/offer \
DOG_ENHANCED_WEBRTC_SIGNAL_URL=http://192.168.1.22:28452/offer \
docker compose up --build
```

Disable bundled mock services when using real external services:

```bash
ENABLE_STAGE_SERVER=false ENABLE_WEBRTC_SERVERS=false \
STAGE_API_URL=http://192.168.1.10:9000/api/stage \
WEBRTC_SIGNAL_URL=http://192.168.1.20:28450/offer \
DOG_WEBRTC_SIGNAL_URL=http://192.168.1.21:28451/offer \
DOG_ENHANCED_WEBRTC_SIGNAL_URL=http://192.168.1.22:28452/offer \
docker compose up --build
```

## 配置机械臂摄像头视频流

进入 stage 10 后，前端显示 `WEBRTC_SIGNAL_URL` 对应的背景视频流。该地址必须指向
机械臂摄像头服务，不能与机器狗的原始流和增强流共用 Sandbox 地址。

未显式配置时，机械臂摄像头默认使用当前前端主机的 `28450/offer`；机器狗原始流
和增强流默认继续使用 Sandbox 的 `/api/v1/web/sdp/offer`。

在连接现场摄像头的 Windows 电脑上运行摄像头 WebRTC 服务。

安装 Python 3.11，然后在本项目目录中执行：

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-camera.txt
```

列出可用摄像头：

```powershell
python server\camera_webrtc_server.py --list-cameras --backend dshow
```

优先使用稳定的摄像头名称启动服务：

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-name "Logitech" --backend dshow
```

如果名称不可用或匹配到多个设备，则使用摄像头编号：

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-index 1 --backend dshow
```

可选分辨率参数：

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-name "Logitech" --width 1920 --height 1080 --fps 30
```

查询 Windows 电脑的现场网络 IPv4 地址：

```powershell
ipconfig
```

在前端所在机器验证摄像头服务：

```bash
curl http://<windows-ip>:28450/health
```

启动前端时分别配置机械臂摄像头与机器狗视频地址：

```bash
WEBRTC_SIGNAL_URL=http://<windows-ip>:28450/offer \
DOG_WEBRTC_SIGNAL_URL=http://<sandbox-ip>:8787/api/v1/web/sdp/offer \
DOG_ENHANCED_WEBRTC_SIGNAL_URL=http://<sandbox-ip>:8787/api/v1/web/sdp/offer \
docker compose up --build
```

使用外部机械臂摄像头和真实 Sandbox 时，可以关闭容器内置的 MP4 模拟视频服务：

```bash
ENABLE_WEBRTC_SERVERS=false \
WEBRTC_SIGNAL_URL=http://<windows-ip>:28450/offer \
DOG_WEBRTC_SIGNAL_URL=http://<sandbox-ip>:8787/api/v1/web/sdp/offer \
DOG_ENHANCED_WEBRTC_SIGNAL_URL=http://<sandbox-ip>:8787/api/v1/web/sdp/offer \
docker compose up --build
```

确保 Windows 防火墙允许 TCP `28450` 入站，并且浏览器能够直接访问该地址。
