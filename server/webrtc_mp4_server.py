import argparse
import asyncio
from fractions import Fraction
import ipaddress
import logging
import time
from pathlib import Path

import av
from aiohttp import web
from aiortc import RTCConfiguration, RTCIceServer, RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.mediastreams import MediaStreamError


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MEDIA = ROOT / "fixed_camera_moving_personmp_.mp4"
DEFAULT_TURN_URLS = [
    "turn:101.245.78.174:28002?transport=udp",
    "turn:101.245.78.174:28002?transport=tcp",
]
DEFAULT_TURN_USERNAME = "cloudproxy"
DEFAULT_TURN_CREDENTIAL = "f41bd6b00f9fe5b5980197d793699aea"

pcs = set()


class LoopingVideoStreamTrack(VideoStreamTrack):
    def __init__(self, media_path):
        super().__init__()
        self.media_path = str(media_path)
        self.container = None
        self.frame_iter = None
        self.frame_interval = 1 / 24
        self.timestamp_step = int(90000 * self.frame_interval)
        self.start_time = None
        self.timestamp = 0
        self.open_container()

    def open_container(self):
        self.close_container()
        self.container = av.open(self.media_path, mode="r")
        video_stream = next(
            (stream for stream in self.container.streams if stream.type == "video"),
            None,
        )
        if video_stream is None:
            raise ValueError(f"No video stream found in media file: {self.media_path}")
        if video_stream.average_rate:
            self.frame_interval = float(1 / video_stream.average_rate)
            self.timestamp_step = int(90000 * self.frame_interval)
        self.frame_iter = self.container.decode(video_stream)

    def close_container(self):
        if self.container is not None:
            self.container.close()
            self.container = None
            self.frame_iter = None

    def next_frame(self):
        while True:
            try:
                return next(self.frame_iter)
            except StopIteration:
                logging.info("Looping media source from beginning: %s", self.media_path)
                self.open_container()

    async def recv(self):
        if self.readyState != "live":
            raise MediaStreamError

        frame = self.next_frame()
        if self.start_time is None:
            self.start_time = time.time()
            self.timestamp = 0
        else:
            self.timestamp += self.timestamp_step
            wait = self.start_time + (self.timestamp / 90000) - time.time()
            if wait > 0:
                await asyncio.sleep(wait)

        frame.pts = self.timestamp
        frame.time_base = Fraction(1, 90000)
        return frame

    def stop(self):
        super().stop()
        self.close_container()


def cors_response(data=None, status=200):
    response = web.json_response(data or {}, status=status)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


async def options(_request):
    return cors_response()


async def health(_request):
    return cors_response({"ok": True, "media_loop": True})


async def offer(request):
    params = await request.json()
    media_path = request.app["media_path"]
    advertise_ip = resolve_advertise_ip(request, request.app["advertise_ip"])

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

    try:
        video_track = LoopingVideoStreamTrack(media_path)
    except ValueError as exc:
        await pc.close()
        pcs.discard(pc)
        return cors_response({"error": str(exc)}, status=500)

    pc.addTrack(video_track)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logging.info("Peer %s connection state: %s", id(pc), pc.connectionState)
        if pc.connectionState in ("failed", "closed", "disconnected"):
            video_track.stop()
            await pc.close()
            pcs.discard(pc)

    await pc.setRemoteDescription(
        RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    )
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    answer_sdp = pc.localDescription.sdp

    if advertise_ip:
        answer_sdp = rewrite_candidate_addresses(answer_sdp, advertise_ip)
        logging.info("Peer %s advertising ICE address: %s", id(pc), advertise_ip)

    return cors_response(
        {"sdp": answer_sdp, "type": pc.localDescription.type}
    )


def resolve_advertise_ip(request, configured_ip):
    if configured_ip and configured_ip != "auto":
        return configured_ip

    host = request.headers.get("X-Forwarded-Host", request.host).split(",")[0].strip()
    host = host.rsplit(":", 1)[0].strip("[]")

    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return None

    if ip.is_global:
        return str(ip)
    return None


def rewrite_candidate_addresses(sdp, advertise_ip):
    lines = []

    for line in sdp.splitlines():
        if line.startswith("c=IN IP4 "):
            lines.append(f"c=IN IP4 {advertise_ip}")
            continue

        if line.startswith("a=candidate:"):
            parts = line.split(" ")
            if len(parts) > 5:
                try:
                    current_ip = ipaddress.ip_address(parts[4])
                except ValueError:
                    current_ip = None

                if current_ip and not current_ip.is_global:
                    parts[4] = advertise_ip
                    line = " ".join(parts)

        lines.append(line)

    return "\r\n".join(lines) + "\r\n"


async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    if coros:
        await asyncio.gather(*coros)
    pcs.clear()


def create_app(media_path):
    app = web.Application()
    app["media_path"] = media_path
    app["advertise_ip"] = "auto"
    app["turn_urls"] = DEFAULT_TURN_URLS
    app["turn_username"] = DEFAULT_TURN_USERNAME
    app["turn_credential"] = DEFAULT_TURN_CREDENTIAL
    app.router.add_get("/health", health)
    app.router.add_post("/offer", offer)
    app.router.add_options("/offer", options)
    app.on_shutdown.append(on_shutdown)
    return app


def main():
    parser = argparse.ArgumentParser(description="Serve a local MP4 as a WebRTC video source.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=28450)
    parser.add_argument("--media", type=Path, default=DEFAULT_MEDIA)
    parser.add_argument(
        "--advertise-ip",
        default="auto",
        help="Public IP to advertise in ICE candidates, or auto to infer from Host.",
    )
    parser.add_argument("--turn-url", action="append", dest="turn_urls")
    parser.add_argument("--turn-username", default=DEFAULT_TURN_USERNAME)
    parser.add_argument("--turn-credential", default=DEFAULT_TURN_CREDENTIAL)
    args = parser.parse_args()

    media_path = args.media.resolve()
    if not media_path.exists():
        raise SystemExit(f"Media file not found: {media_path}")

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logging.info("Serving WebRTC media source: %s", media_path)
    app = create_app(media_path)
    app["advertise_ip"] = args.advertise_ip
    app["turn_urls"] = args.turn_urls or DEFAULT_TURN_URLS
    app["turn_username"] = args.turn_username
    app["turn_credential"] = args.turn_credential
    web.run_app(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
