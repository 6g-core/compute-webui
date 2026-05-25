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
