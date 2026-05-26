import argparse
import asyncio
from fractions import Fraction
import logging
import time

from aiohttp import web
from aiortc import RTCConfiguration, RTCIceServer, RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.mediastreams import MediaStreamError
from av import VideoFrame

try:
    import cv2
except ImportError as exc:
    raise SystemExit(
        "opencv-python is required. Install it with: pip install opencv-python"
    ) from exc

try:
    from pygrabber.dshow_graph import FilterGraph
except ImportError:
    FilterGraph = None


DEFAULT_TURN_URLS = [
    "turn:101.245.78.174:28002?transport=udp",
    "turn:101.245.78.174:28002?transport=tcp",
]
DEFAULT_TURN_USERNAME = "cloudproxy"
DEFAULT_TURN_CREDENTIAL = "f41bd6b00f9fe5b5980197d793699aea"

pcs = set()


def get_camera_device_names():
    if FilterGraph is None:
        return []

    try:
        return FilterGraph().get_input_devices()
    except Exception as exc:
        logging.warning("Could not list DirectShow camera names: %s", exc)
        return []


def probe_camera_index(camera_index, backend="dshow"):
    backend_api = cv2.CAP_DSHOW if backend == "dshow" else cv2.CAP_MSMF if backend == "msmf" else cv2.CAP_ANY
    capture = cv2.VideoCapture(camera_index, backend_api)
    try:
        if not capture.isOpened():
            return None

        ok, frame = capture.read()
        if not ok or frame is None:
            return None

        return {
            "index": camera_index,
            "width": int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or frame.shape[1]),
            "height": int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or frame.shape[0]),
            "fps": float(capture.get(cv2.CAP_PROP_FPS) or 0),
        }
    finally:
        capture.release()


def list_cameras(max_index=8, backend="dshow"):
    names = get_camera_device_names()
    devices = []

    for index in range(max_index + 1):
        probe = probe_camera_index(index, backend)
        if not probe and index >= len(names):
            continue

        devices.append(
            {
                "index": index,
                "name": names[index] if index < len(names) else "",
                **(probe or {}),
                "available": bool(probe),
            }
        )

    return devices


def resolve_camera_index(camera_index, camera_name):
    if not camera_name:
        return camera_index

    names = get_camera_device_names()
    normalized_name = camera_name.casefold()
    matches = [
        (index, name)
        for index, name in enumerate(names)
        if normalized_name in name.casefold()
    ]

    if not matches:
        available = "\n".join(f"  [{index}] {name}" for index, name in enumerate(names))
        raise SystemExit(
            f"Camera name not found: {camera_name}\n"
            f"Available DirectShow cameras:\n{available or '  <none>'}"
        )

    if len(matches) > 1:
        available = "\n".join(f"  [{index}] {name}" for index, name in matches)
        raise SystemExit(
            f"Camera name matched multiple devices: {camera_name}\n"
            f"Use a more specific name or --camera-index.\n{available}"
        )

    return matches[0][0]


class CameraSource:
    def __init__(self, camera_index, width=None, height=None, fps=30, backend="auto"):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.fps = fps
        self.backend = backend
        self.capture = None
        self.lock = asyncio.Lock()

    def backend_api(self):
        if self.backend == "dshow":
            return cv2.CAP_DSHOW
        if self.backend == "msmf":
            return cv2.CAP_MSMF
        return cv2.CAP_ANY

    def open(self):
        if self.capture is not None and self.capture.isOpened():
            return

        self.close()
        self.capture = cv2.VideoCapture(self.camera_index, self.backend_api())
        if self.width:
            self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        if self.height:
            self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        if self.fps:
            self.capture.set(cv2.CAP_PROP_FPS, self.fps)

        if not self.capture.isOpened():
            raise RuntimeError(f"Could not open camera index {self.camera_index}")

    def close(self):
        if self.capture is not None:
            self.capture.release()
            self.capture = None

    def read_blocking(self):
        self.open()
        ok, frame = self.capture.read()
        if ok and frame is not None:
            return frame

        logging.warning("Camera read failed, reopening camera index %s", self.camera_index)
        self.close()
        time.sleep(0.2)
        self.open()
        ok, frame = self.capture.read()
        if not ok or frame is None:
            raise RuntimeError("Camera returned no frame")
        return frame

    async def read(self):
        async with self.lock:
            return await asyncio.to_thread(self.read_blocking)


class CameraVideoStreamTrack(VideoStreamTrack):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.frame_interval = 1 / max(source.fps or 30, 1)
        self.timestamp_step = int(90000 * self.frame_interval)
        self.start_time = None
        self.timestamp = 0

    async def recv(self):
        if self.readyState != "live":
            raise MediaStreamError

        frame_bgr = await self.source.read()

        if self.start_time is None:
            self.start_time = time.time()
            self.timestamp = 0
        else:
            self.timestamp += self.timestamp_step
            wait = self.start_time + (self.timestamp / 90000) - time.time()
            if wait > 0:
                await asyncio.sleep(wait)

        frame = VideoFrame.from_ndarray(frame_bgr, format="bgr24")
        frame.pts = self.timestamp
        frame.time_base = Fraction(1, 90000)
        return frame


def cors_response(data=None, status=200):
    response = web.json_response(data or {}, status=status)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


async def options(_request):
    return cors_response()


async def health(request):
    source = request.app["camera_source"]
    try:
        await source.read()
    except Exception as exc:
        return cors_response({"ok": False, "error": str(exc)}, status=503)

    return cors_response(
        {
            "ok": True,
            "camera_index": source.camera_index,
            "fps": source.fps,
        }
    )


def parse_offer_payload(params):
    sdp_offer = params.get("sdp_offer")
    if isinstance(sdp_offer, dict):
        return RTCSessionDescription(
            sdp=sdp_offer["sdp"],
            type=sdp_offer.get("type", "offer"),
        )

    return RTCSessionDescription(sdp=params["sdp"], type=params.get("type", "offer"))


async def offer(request):
    try:
        params = await request.json()
    except Exception:
        return cors_response({"error": "invalid json"}, status=400)

    pc = RTCPeerConnection(
        RTCConfiguration(
            iceServers=[
                RTCIceServer(
                    urls=request.app["turn_urls"],
                    username=request.app["turn_username"],
                    credential=request.app["turn_credential"],
                )
            ]
        )
    )
    pcs.add(pc)
    logging.info("Peer created: %s", id(pc))

    video_track = CameraVideoStreamTrack(request.app["camera_source"])
    pc.addTrack(video_track)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logging.info("Peer %s connection state: %s", id(pc), pc.connectionState)
        if pc.connectionState in ("failed", "closed", "disconnected"):
            await pc.close()
            pcs.discard(pc)

    try:
        await pc.setRemoteDescription(parse_offer_payload(params))
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
    except Exception as exc:
        await pc.close()
        pcs.discard(pc)
        return cors_response({"error": str(exc)}, status=400)

    answer_payload = {
        "type": pc.localDescription.type,
        "sdp": pc.localDescription.sdp,
    }
    return cors_response({"sdp_answer": answer_payload, **answer_payload})


async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    if coros:
        await asyncio.gather(*coros)
    pcs.clear()
    app["camera_source"].close()


def create_app(camera_source):
    app = web.Application()
    app["camera_source"] = camera_source
    app["turn_urls"] = DEFAULT_TURN_URLS
    app["turn_username"] = DEFAULT_TURN_USERNAME
    app["turn_credential"] = DEFAULT_TURN_CREDENTIAL
    app.router.add_get("/health", health)
    app.router.add_post("/offer", offer)
    app.router.add_options("/offer", options)
    app.on_shutdown.append(on_shutdown)
    return app


def main():
    parser = argparse.ArgumentParser(description="Serve a local camera as a WebRTC video source.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=28450)
    parser.add_argument("--camera-index", type=int, default=0)
    parser.add_argument(
        "--camera-name",
        help="Case-insensitive substring of the DirectShow camera name, for example 'Logitech' or 'USB'.",
    )
    parser.add_argument(
        "--list-cameras",
        action="store_true",
        help="List detected camera indexes and names, then exit.",
    )
    parser.add_argument("--max-camera-index", type=int, default=8)
    parser.add_argument("--width", type=int)
    parser.add_argument("--height", type=int)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument(
        "--backend",
        choices=("auto", "dshow", "msmf"),
        default="dshow",
        help="OpenCV capture backend. dshow is usually best for USB cameras on Windows.",
    )
    parser.add_argument("--turn-url", action="append", dest="turn_urls")
    parser.add_argument("--turn-username", default=DEFAULT_TURN_USERNAME)
    parser.add_argument("--turn-credential", default=DEFAULT_TURN_CREDENTIAL)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if args.list_cameras:
        devices = list_cameras(args.max_camera_index, args.backend)
        if not devices:
            print("No cameras found.")
            return

        for device in devices:
            status = "available" if device["available"] else "not opened"
            name = device["name"] or "<unnamed>"
            dimensions = (
                f" {device['width']}x{device['height']} {device['fps']:.1f}fps"
                if device["available"]
                else ""
            )
            print(f"[{device['index']}] {name} - {status}{dimensions}")
        return

    camera_index = resolve_camera_index(args.camera_index, args.camera_name)

    camera_source = CameraSource(
        camera_index=camera_index,
        width=args.width,
        height=args.height,
        fps=args.fps,
        backend=args.backend,
    )
    camera_source.open()

    app = create_app(camera_source)
    app["turn_urls"] = args.turn_urls or DEFAULT_TURN_URLS
    app["turn_username"] = args.turn_username
    app["turn_credential"] = args.turn_credential

    logging.info(
        "Serving camera index %s on http://%s:%s/offer",
        camera_index,
        args.host,
        args.port,
    )
    web.run_app(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
