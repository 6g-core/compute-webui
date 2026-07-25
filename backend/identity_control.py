"""
Standalone demo-control backend for digital identity visibility.

This service is intentionally separate from the real backend. It only controls
whether the WebUI may show Robot Dog / AR Glasses digital identity cards.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="CMCC Digital Identity Control", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_visibility = {
    "RobotDog": False,
    "UE": False,
}


def _now_ts() -> int:
    return int(datetime.now().timestamp())


def _normalize_node(value: str) -> str:
    key = value.strip().replace("-", "_").replace(" ", "_").lower()
    aliases = {
        "robotdog": "RobotDog",
        "robot_dog": "RobotDog",
        "dog": "RobotDog",
        "ue": "UE",
        "ar": "UE",
        "ar_glasses": "UE",
        "arglasses": "UE",
        "glasses": "UE",
    }
    if key not in aliases:
        allowed = ", ".join(sorted(aliases))
        raise HTTPException(status_code=400, detail=f"Unsupported node '{value}'. Allowed values: {allowed}")
    return aliases[key]


def _visibility_payload() -> dict:
    return {
        "RobotDog": bool(_visibility["RobotDog"]),
        "UE": bool(_visibility["UE"]),
    }


def _set_visibility(payload: dict) -> None:
    if bool(payload.get("reset")):
        _visibility["RobotDog"] = False
        _visibility["UE"] = False

    nested = payload.get("digital_identity_visibility") or payload.get("identity_visibility") or payload.get("visibility")
    if isinstance(nested, dict):
        for raw_node, visible in nested.items():
            _visibility[_normalize_node(str(raw_node))] = bool(visible)

    flat_keys = {
        "robotDog": "RobotDog",
        "robot_dog": "RobotDog",
        "RobotDog": "RobotDog",
        "dog": "RobotDog",
        "arGlasses": "UE",
        "ar_glasses": "UE",
        "UE": "UE",
        "ue": "UE",
        "ar": "UE",
    }
    for key, node in flat_keys.items():
        if key in payload:
            _visibility[node] = bool(payload[key])

    if "node" in payload:
        _visibility[_normalize_node(str(payload["node"]))] = bool(payload.get("visible", True))


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "status": "SUCCESS",
        "service": "digital-identity-control",
        "timestamp": _now_ts(),
    }


@app.get("/api/v1/digital-identity/visibility")
def get_visibility() -> dict:
    return {
        "status": "SUCCESS",
        "digital_identity_visibility": _visibility_payload(),
        "timestamp": _now_ts(),
    }


@app.post("/api/v1/digital-identity/visibility")
async def set_visibility(request: Request) -> dict:
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    _set_visibility(payload)
    return {
        "status": "SUCCESS",
        "digital_identity_visibility": _visibility_payload(),
        "timestamp": _now_ts(),
    }
