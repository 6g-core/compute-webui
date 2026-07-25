"""
Mock backend for local WebUI development.

Runs independently from the real sandbox services and implements every backend
endpoint consumed by the Nuxt frontend.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from fractions import Fraction

from av import VideoFrame
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack


logging.basicConfig(level=logging.INFO)
log = logging.getLogger("webfront-mock")

app = FastAPI(title="Webfront Mock Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_STAGE_SEQUENCE: list[tuple[str, str, float]] = [
    ("INIT", "INIT", 8.0),
    ("ACN_NETWORKING", "ACN_NETWORKING", 70.0),
    ("ACN_NETWORKING", "ACN_COMPLETE", 10.0),
    ("COMPUTING", "COMPUTING", 80.0),
    ("COMPUTING", "SANDBOX_UP", 10.0),
    ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED", 80.0),
]

_AR_STATUS_MAP: dict[str, str] = {
    "INIT": "系统就绪，等待演示开始...",
    "ACN_NETWORKING": "正在进行 6G ACN 自动组网...",
    "ACN_COMPLETE": "6G ACN 组网完成",
    "COMPUTING": "智算沙箱寻址与媒体协商中...",
    "SANDBOX_UP": "智算沙箱拉起成功",
    "MEDIA_ESTABLISHED": "业务已连接，实时增强渲染中",
}

_WHISPER_SEQUENCE = [
    "看看前方情况",
    "沿着走廊走",
    "识别一下桌上物体",
    "停下来等一会",
    "回到出发点",
    "去厨房取餐",
]

_GESTURE_SEQUENCE = [
    "hello",
    "",
    "pointing_up",
    "",
    "pointing_left",
    "palm",
    "",
    "pointing_right",
    "back",
]

_current_stage = "INIT"
_current_ar = "INIT"
_current_whisper = _WHISPER_SEQUENCE[0]
_current_gesture = ""
_transport_mode = "ACN"
_manual_stage_mode = False

_STAGE_ALIASES: dict[str, tuple[str, str]] = {
    "1": ("INIT", "INIT"),
    "STAGE1": ("INIT", "INIT"),
    "STAGE_1": ("INIT", "INIT"),
    "INIT": ("INIT", "INIT"),
    "2": ("ACN_NETWORKING", "ACN_NETWORKING"),
    "STAGE2": ("ACN_NETWORKING", "ACN_NETWORKING"),
    "STAGE_2": ("ACN_NETWORKING", "ACN_NETWORKING"),
    "ACN": ("ACN_NETWORKING", "ACN_NETWORKING"),
    "ACN_NETWORKING": ("ACN_NETWORKING", "ACN_NETWORKING"),
    "ACN_COMPLETE": ("ACN_NETWORKING", "ACN_COMPLETE"),
    "3": ("COMPUTING", "COMPUTING"),
    "STAGE3": ("COMPUTING", "COMPUTING"),
    "STAGE_3": ("COMPUTING", "COMPUTING"),
    "COMPUTING": ("COMPUTING", "COMPUTING"),
    "SANDBOX_UP": ("COMPUTING", "SANDBOX_UP"),
    "4": ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED"),
    "STAGE4": ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED"),
    "STAGE_4": ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED"),
    "MEDIA": ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED"),
    "MEDIA_ESTABLISHED": ("MEDIA_ESTABLISHED", "MEDIA_ESTABLISHED"),
}

_pcs: set[RTCPeerConnection] = set()
_tasks: list[asyncio.Task] = []


async def _stage_loop() -> None:
    global _current_stage, _current_ar
    while True:
        for stage, ar, delay in _STAGE_SEQUENCE:
            while _manual_stage_mode:
                await asyncio.sleep(1.0)
            _current_stage = stage
            _current_ar = ar
            log.info("[stage] stage=%s ar=%s", stage, ar)
            await asyncio.sleep(delay)


async def _whisper_loop() -> None:
    global _current_whisper
    while True:
        for whisper in _WHISPER_SEQUENCE:
            _current_whisper = whisper
            await asyncio.sleep(6.0)


async def _gesture_loop() -> None:
    global _current_gesture
    while True:
        for gesture in _GESTURE_SEQUENCE:
            _current_gesture = gesture
            await asyncio.sleep(2.5)


@app.on_event("startup")
async def startup() -> None:
    _tasks.extend([
        asyncio.create_task(_stage_loop()),
        asyncio.create_task(_whisper_loop()),
        asyncio.create_task(_gesture_loop()),
    ])


@app.on_event("shutdown")
async def shutdown() -> None:
    for task in _tasks:
        task.cancel()
    await asyncio.gather(*_tasks, return_exceptions=True)
    await asyncio.gather(*(pc.close() for pc in list(_pcs)), return_exceptions=True)
    _pcs.clear()


def _now_ts() -> int:
    return int(datetime.now().timestamp())


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _normalize_stage(value: str) -> tuple[str, str]:
    key = value.strip().upper().replace("-", "_").replace(" ", "_")
    if key not in _STAGE_ALIASES:
        allowed = ", ".join(sorted(_STAGE_ALIASES))
        raise HTTPException(status_code=400, detail=f"Unsupported stage '{value}'. Allowed values: {allowed}")
    return _STAGE_ALIASES[key]


@app.get("/health")
@app.get("/api/health")
def health() -> dict:
    return {
        "ok": True,
        "status": "SUCCESS",
        "service": "webfront-mock",
        "transportMode": _transport_mode,
        "timestamp": _now_ts(),
    }


@app.post("/api/v1/transport_mode")
async def set_transport_mode(request: Request) -> dict:
    global _transport_mode
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    mode = str(payload.get("transportMode") or payload.get("transport_mode") or _transport_mode).upper()
    _transport_mode = "OTT" if mode == "OTT" else "ACN"
    return {
        "status": "SUCCESS",
        "transportMode": _transport_mode,
        "timestamp": _now_ts(),
    }


@app.get("/api/v1/system/topology/stage")
def topology_stage() -> dict:
    return {
        "status": "SUCCESS",
        "current_stage": _current_stage,
        "ar_stage": _current_ar,
        "scene": "scene_core",
        "transportMode": _transport_mode,
        "manual": _manual_stage_mode,
        "timestamp": _now_ts(),
    }


@app.post("/api/v1/system/topology/stage")
async def set_topology_stage(request: Request) -> dict:
    global _current_stage, _current_ar, _manual_stage_mode
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    raw_stage = str(payload.get("stage") or payload.get("current_stage") or payload.get("target_stage") or "")
    if not raw_stage:
        raise HTTPException(status_code=400, detail="Missing stage. Use JSON body like {'stage':'STAGE3'}.")
    _current_stage, _current_ar = _normalize_stage(raw_stage)
    _manual_stage_mode = bool(payload.get("manual", True))
    log.info("[stage] manual=%s stage=%s ar=%s", _manual_stage_mode, _current_stage, _current_ar)
    return {
        "status": "SUCCESS",
        "current_stage": _current_stage,
        "ar_stage": _current_ar,
        "manual": _manual_stage_mode,
        "timestamp": _now_ts(),
    }


@app.post("/api/v1/system/topology/stage/auto")
def resume_auto_stage() -> dict:
    global _manual_stage_mode
    _manual_stage_mode = False
    return {
        "status": "SUCCESS",
        "current_stage": _current_stage,
        "ar_stage": _current_ar,
        "manual": _manual_stage_mode,
        "timestamp": _now_ts(),
    }


@app.get("/api/v1/system/ar/status")
def ar_status() -> dict:
    return {
        "status": "SUCCESS",
        "ar_status": _current_ar,
        "message": _AR_STATUS_MAP.get(_current_ar, "系统就绪，等待演示开始..."),
        "last_whisper": _current_whisper,
        "current_gesture": _current_gesture,
        "timestamp": _now_ts(),
    }


@app.get("/api/v1/metrics/history")
def metrics_history(time_window: int = 300) -> dict:
    window = max(1, min(int(time_window), 3600))
    now_ts = _now_ts()
    start_ts = now_ts - window + 1
    is_media = _current_stage == "MEDIA_ESTABLISHED"

    core_samples = []
    ott_samples = []
    for index, ts in enumerate(range(start_ts, now_ts + 1)):
        progress = index / max(window - 1, 1)
        wave = ((index * 7) % 9) - 4
        ripple = ((index * 5) % 7) - 3

        if is_media:
            e2e = 26.0 + progress * 26.0 + wave * 1.1
            fps = 28.5 - progress * 4.0 - abs(ripple) * 0.25
        else:
            e2e = 12.0 + progress * 6.0 + wave * 0.5
            fps = 29.5 - abs(ripple) * 0.15

        sample = {
            "timestamp": ts,
            "e2e_latency_ms": round(_clamp(e2e, 8.0, 80.0), 2),
            "jitter_ms": round(_clamp(1.5 + abs(wave) * 0.35, 0.4, 8.0), 2),
            "compute_latency_ms": round(_clamp(e2e * 0.36 + ripple * 0.3, 3.0, 28.0), 2),
            "processing_latency_ms": round(_clamp(e2e * 0.28 + abs(wave) * 0.25, 2.0, 24.0), 2),
            "fps": round(_clamp(fps, 18.0, 30.0), 2),
        }
        core_samples.append(sample)

        if is_media:
            ott_samples.append({
                "timestamp": ts,
                "e2e_latency_ms": round(_clamp(sample["e2e_latency_ms"] + 16.0 + progress * 8.0, 18.0, 95.0), 2),
                "jitter_ms": round(_clamp(sample["jitter_ms"] + 1.2, 0.8, 10.0), 2),
                "compute_latency_ms": round(_clamp(sample["compute_latency_ms"] + 3.0, 3.0, 32.0), 2),
                "processing_latency_ms": round(_clamp(sample["processing_latency_ms"] + 2.5, 2.0, 28.0), 2),
                "fps": round(_clamp(sample["fps"] - 1.4, 16.0, 30.0), 2),
            })

    def average(rows: list[dict]) -> dict | None:
        if not rows:
            return None
        keys = ["e2e_latency_ms", "jitter_ms", "compute_latency_ms", "processing_latency_ms", "fps"]
        return {key: round(sum(float(row[key]) for row in rows) / len(rows), 2) for key in keys}

    return {
        "status": "SUCCESS",
        "metrics": core_samples,
        "ott_metrics": ott_samples,
        "average": average(core_samples),
        "ott_average": average(ott_samples),
    }


class SyntheticVideoTrack(VideoStreamTrack):
    """Small generated video stream so the frontend WebRTC path stays real."""

    width = 640
    height = 360

    def __init__(self) -> None:
        super().__init__()
        self._frame_index = 0

    async def recv(self) -> VideoFrame:
        pts, time_base = await self.next_timestamp()
        frame = VideoFrame(width=self.width, height=self.height, format="yuv420p")
        y = (48 + self._frame_index * 3) % 180
        u = 96 + (self._frame_index * 2) % 80
        v = 128 + (self._frame_index * 5) % 80
        frame.planes[0].update(bytes([y]) * frame.planes[0].buffer_size)
        frame.planes[1].update(bytes([u]) * frame.planes[1].buffer_size)
        frame.planes[2].update(bytes([v]) * frame.planes[2].buffer_size)
        frame.pts = pts
        frame.time_base = time_base or Fraction(1, 90000)
        self._frame_index += 1
        return frame


@app.post("/api/v1/web/sdp/offer")
async def web_sdp_offer(request: Request) -> dict:
    params = await request.json()
    sdp_offer = params.get("sdp_offer", {})
    offer = RTCSessionDescription(
        sdp=sdp_offer.get("sdp", ""),
        type=sdp_offer.get("type", "offer"),
    )

    pc = RTCPeerConnection()
    _pcs.add(pc)
    pc.addTrack(SyntheticVideoTrack())

    @pc.on("connectionstatechange")
    async def on_connectionstatechange() -> None:
        log.info("[webrtc] state=%s pcs=%d", pc.connectionState, len(_pcs))
        if pc.connectionState in {"failed", "closed", "disconnected"}:
            await pc.close()
            _pcs.discard(pc)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    return {
        "status": "SUCCESS",
        "sdp_answer": {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
        },
    }
