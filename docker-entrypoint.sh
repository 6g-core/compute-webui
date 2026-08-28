#!/usr/bin/env sh
set -eu

FRONTEND_PORT="${FRONTEND_PORT:-28449}"
STAGE_HOST="${STAGE_HOST:-0.0.0.0}"
STAGE_PORT="${STAGE_PORT:-28448}"
BACKEND_PORT="${BACKEND_PORT:-$STAGE_PORT}"
WEBRTC_HOST_BIND="${WEBRTC_HOST_BIND:-0.0.0.0}"
WEBRTC_PORT="${WEBRTC_PORT:-28450}"
DOG_WEBRTC_PORT="${DOG_WEBRTC_PORT:-28451}"
DOG_ENHANCED_WEBRTC_PORT="${DOG_ENHANCED_WEBRTC_PORT:-28452}"
WEBRTC_ADVERTISE_IP="${WEBRTC_ADVERTISE_IP:-auto}"

export FRONTEND_PORT
export STAGE_PORT
export BACKEND_PORT
export BACKEND_HOST="${BACKEND_HOST:-${BACKEND_IP:-}}"
export WEBRTC_HOST="${WEBRTC_HOST:-${WEBRTC_IP:-}}"
export DOG_WEBRTC_HOST="${DOG_WEBRTC_HOST:-${DOG_WEBRTC_IP:-}}"
export DOG_ENHANCED_WEBRTC_HOST="${DOG_ENHANCED_WEBRTC_HOST:-${DOG_ENHANCED_WEBRTC_IP:-}}"
export STAGE_API_URL="${STAGE_API_URL:-}"
export LATENCY_API_URL="${LATENCY_API_URL:-}"
export QOS_PUSH_CHANNEL="${QOS_PUSH_CHANNEL:-}"
export QOS_PUSH_CHANNEL_URL="${QOS_PUSH_CHANNEL_URL:-$QOS_PUSH_CHANNEL}"
export ENABLE_STAGE_SERVER="${ENABLE_STAGE_SERVER:-true}"
export WEBRTC_SIGNAL_URL="${WEBRTC_SIGNAL_URL:-}"
export DOG_WEBRTC_SIGNAL_URL="${DOG_WEBRTC_SIGNAL_URL:-}"
export DOG_ENHANCED_WEBRTC_SIGNAL_URL="${DOG_ENHANCED_WEBRTC_SIGNAL_URL:-}"
export WEBRTC_PORT
export DOG_WEBRTC_PORT
export DOG_ENHANCED_WEBRTC_PORT

python3 - <<'PY'
import json
import os

config = {
    "backendHost": os.environ.get("BACKEND_HOST") or None,
    "stageApiPort": int(os.environ["BACKEND_PORT"]),
    "stageApiUrl": os.environ.get("STAGE_API_URL") or None,
    "latencyApiUrl": os.environ.get("LATENCY_API_URL") or None,
    "qosPushChannelUrl": os.environ.get("QOS_PUSH_CHANNEL_URL") or None,
    "mockStage9Dialogs": os.environ["ENABLE_STAGE_SERVER"].lower() != "false",
    "webRtcHost": os.environ.get("WEBRTC_HOST") or None,
    "dogWebRtcHost": os.environ.get("DOG_WEBRTC_HOST") or None,
    "dogEnhancedWebRtcHost": os.environ.get("DOG_ENHANCED_WEBRTC_HOST") or None,
    "webRtcPort": int(os.environ["WEBRTC_PORT"]),
    "dogWebRtcPort": int(os.environ["DOG_WEBRTC_PORT"]),
    "dogEnhancedWebRtcPort": int(os.environ["DOG_ENHANCED_WEBRTC_PORT"]),
    "webRtcSignalUrl": os.environ.get("WEBRTC_SIGNAL_URL") or None,
    "dogWebRtcSignalUrl": os.environ.get("DOG_WEBRTC_SIGNAL_URL") or None,
    "dogEnhancedWebRtcSignalUrl": os.environ.get("DOG_ENHANCED_WEBRTC_SIGNAL_URL") or None,
}

with open("/app/dist/runtime-config.js", "w", encoding="utf-8") as handle:
    handle.write("window.__RUNTIME_CONFIG__ = ")
    json.dump(config, handle, ensure_ascii=False)
    handle.write(";\n")
PY

pids=""

start_service() {
  "$@" &
  pids="$pids $!"
}

shutdown() {
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}

trap shutdown INT TERM EXIT

api_stage_flag="--enable-stage"
api_latency_flag="--enable-latency"
if [ "${ENABLE_STAGE_SERVER:-true}" = "false" ]; then
  api_stage_flag="--disable-stage"
  api_latency_flag="--disable-latency"
fi
start_service python3 /app/server/webui_api_server.py --host "$STAGE_HOST" --port "$STAGE_PORT" --stage "${INITIAL_STAGE:-1}" "$api_stage_flag" "$api_latency_flag"

if [ "${ENABLE_WEBRTC_SERVERS:-true}" != "false" ]; then
  start_service python3 /app/server/webrtc_mp4_server.py --host "$WEBRTC_HOST_BIND" --port "$WEBRTC_PORT" --media /app/fixed_camera_moving_personmp_.mp4 --advertise-ip "$WEBRTC_ADVERTISE_IP"
  start_service python3 /app/server/webrtc_mp4_server.py --host "$WEBRTC_HOST_BIND" --port "$DOG_WEBRTC_PORT" --media /app/dog.mp4 --advertise-ip "$WEBRTC_ADVERTISE_IP"
  start_service python3 /app/server/webrtc_mp4_server.py --host "$WEBRTC_HOST_BIND" --port "$DOG_ENHANCED_WEBRTC_PORT" --media /app/dog_enhanced.mp4 --advertise-ip "$WEBRTC_ADVERTISE_IP"
fi

start_service python3 -m http.server "$FRONTEND_PORT" --bind 0.0.0.0 --directory /app/dist

echo "Frontend: http://0.0.0.0:${FRONTEND_PORT}"
echo "WebUI API: http://${STAGE_HOST}:${STAGE_PORT}"
echo "WebRTC offer ports: ${WEBRTC_PORT}, ${DOG_WEBRTC_PORT}, ${DOG_ENHANCED_WEBRTC_PORT}"

wait
