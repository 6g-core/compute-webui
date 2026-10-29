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
export WEBRTC_SIGNAL_URL="${WEBRTC_SIGNAL_URL:-}"
export DOG_WEBRTC_SIGNAL_URL="${DOG_WEBRTC_SIGNAL_URL:-}"
export DOG_ENHANCED_WEBRTC_SIGNAL_URL="${DOG_ENHANCED_WEBRTC_SIGNAL_URL:-}"
export WEBRTC_PORT
export DOG_WEBRTC_PORT
export DOG_ENHANCED_WEBRTC_PORT

python3 - <<'PY'
import json
import os


def value(env_key, default_expr):
    """env 显式给值就用（JSON 字符串），否则用浏览器侧动态默认值。"""
    raw = (os.environ.get(env_key) or "").strip()
    if raw:
        return json.dumps(raw, ensure_ascii=False)
    return default_expr


lines = [
    "(() => {",
    '  const protocol = window.location.protocol === "https:" ? "https:" : "http:";',
    "  const host = window.location.hostname;",
    "  const sysAgentBase = " + value("SYS_AGENT_API_URL", "`${protocol}//${host}:9100`") + ";",
    "  const sandboxBase = " + value("SANDBOX_API_URL", "`${protocol}//${host}:8787`") + ";",
    "  window.__RUNTIME_CONFIG__ = {",
    "    ...(window.__RUNTIME_CONFIG__ || {}),",
    "    sysAgentApiUrl: sysAgentBase,",
    "    stageApiUrl: " + value("STAGE_API_URL", "`${sysAgentBase}/api/stage`") + ",",
    "    arStatusApiUrl: " + value("AR_STATUS_API_URL", "`${sysAgentBase}/api/v1/system/ar/status`") + ",",
    "    sandboxApiUrl: sandboxBase,",
    "    sandboxHealthApiUrl: " + value("SANDBOX_HEALTH_API_URL", "`${sandboxBase}/api/health`") + ",",
    "    latencyApiUrl: " + value("LATENCY_API_URL", "`${sandboxBase}/api/latency`") + ",",
    "    qosPushChannelUrl: " + value("QOS_PUSH_CHANNEL_URL", "`${sandboxBase}/api/v1/qos/events`") + ",",
    "    intentStatusApiUrl: " + value("INTENT_STATUS_API_URL", "`${sandboxBase}/api/v1/intent/status`") + ",",
    "    webRtcSignalUrl: " + value("WEBRTC_SIGNAL_URL", "`${sandboxBase}/api/v1/web/sdp/offer`") + ",",
    "    dogWebRtcSignalUrl: " + value("DOG_WEBRTC_SIGNAL_URL", "`${sandboxBase}/api/v1/web/sdp/offer`") + ",",
    "    dogEnhancedWebRtcSignalUrl: " + value("DOG_ENHANCED_WEBRTC_SIGNAL_URL", "`${sandboxBase}/api/v1/web/sdp/offer`") + ",",
    "  };",
    "})();",
    "",
]

with open("/app/dist/runtime-config.js", "w", encoding="utf-8") as handle:
    handle.write("\n".join(lines))
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
