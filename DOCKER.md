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

## Use a Windows Camera as the Background WebRTC Source

Run the camera source on the Windows laptop connected to the venue camera.

Install Python 3.11, then from this project directory on Windows:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-camera.txt
```

Start the camera WebRTC server:

```powershell
python server\camera_webrtc_server.py --list-cameras --backend dshow
```

Use the external camera name or index from the list. Prefer `--camera-name`
when Windows reports a stable device name:

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-name "Logitech" --backend dshow
```

If the camera name is not available or is ambiguous, use the listed index:

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-index 1 --backend dshow
```

Optional resolution parameters:

```powershell
python server\camera_webrtc_server.py --host 0.0.0.0 --port 28450 --camera-name "Logitech" --width 1920 --height 1080 --fps 30
```

Find the Windows laptop IPv4 address on the wired network:

```powershell
ipconfig
```

From the machine running the frontend, verify the camera server:

```bash
curl http://<windows-ip>:28450/health
```

Point the frontend background stream at the Windows camera:

```bash
WEBRTC_SIGNAL_URL=http://<windows-ip>:28450/offer \
docker compose up --build
```

When using external WebRTC services for the background only, keep the bundled stage
server enabled and disable the bundled MP4 WebRTC servers if they are not needed:

```bash
ENABLE_WEBRTC_SERVERS=false \
WEBRTC_SIGNAL_URL=http://<windows-ip>:28450/offer \
docker compose up --build
```

Make sure Windows Firewall allows inbound TCP traffic on port `28450`.
