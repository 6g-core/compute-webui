import argparse
import json
import queue
import random
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


ALLOWED_STAGES = (1, 2, 4, 5, 6, 7, 8, 9, 10)


class WebUiApiState:
    def __init__(self, initial_stage, *, enable_stage=True, enable_latency=True):
        self.stage = initial_stage
        self.enable_stage = enable_stage
        self.enable_latency = enable_latency
        self._qos_lock = threading.Lock()
        self._qos_subscribers = []

    def subscribe_qos(self):
        subscriber = queue.Queue(maxsize=20)
        with self._qos_lock:
            self._qos_subscribers.append(subscriber)
        return subscriber

    def unsubscribe_qos(self, subscriber):
        with self._qos_lock:
            self._qos_subscribers = [
                current for current in self._qos_subscribers
                if current is not subscriber
            ]

    def publish_qos(self, payload):
        with self._qos_lock:
            subscribers = list(self._qos_subscribers)

        for subscriber in subscribers:
            try:
                subscriber.put_nowait(payload)
            except queue.Full:
                try:
                    subscriber.get_nowait()
                    subscriber.put_nowait(payload)
                except queue.Empty:
                    pass


def write_json(handler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def is_supported_qos_image_source(image_source):
    if not isinstance(image_source, str) or not image_source.strip():
        return False

    normalized = image_source.strip().lower()
    return (
        normalized.startswith("http://")
        or normalized.startswith("https://")
        or normalized.startswith("data:image/png;base64,")
        or normalized.startswith("data:image/jpeg;base64,")
        or normalized.startswith("data:image/gif;base64,")
    )


def ensure_number(value, field_name):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be a number") from exc

    if numeric_value != numeric_value or numeric_value in (float("inf"), float("-inf")):
        raise ValueError(f"{field_name} must be finite")
    return numeric_value


def validate_qos_payload(payload):
    if not isinstance(payload, dict):
        raise ValueError("payload must be an object")

    has_metrics = "metrics" in payload
    has_dialog_layer = any(key in payload for key in ("dialogs", "images", "imagePlacements"))

    if has_metrics and has_dialog_layer:
        raise ValueError("payload cannot mix metrics with dialogs/images")

    if has_metrics:
        metrics = payload.get("metrics")
        if not isinstance(metrics, list):
            raise ValueError("metrics must be an array")

        for index, metric in enumerate(metrics):
            if not isinstance(metric, dict):
                raise ValueError(f"metrics[{index}] must be an object")
            ensure_number(metric.get("timestamp"), f"metrics[{index}].timestamp")
            ensure_number(metric.get("sendrate_kbps"), f"metrics[{index}].sendrate_kbps")
            ensure_number(metric.get("gbr_kbps"), f"metrics[{index}].gbr_kbps")
            ensure_number(metric.get("q_lvl"), f"metrics[{index}].q_lvl")
        return "metrics"

    if has_dialog_layer:
        dialogs = payload.get("dialogs")
        images = payload.get("images")
        image_placements = payload.get("imagePlacements")
        if not all(isinstance(items, list) for items in (dialogs, images, image_placements)):
            raise ValueError("dialogs, images, and imagePlacements must be arrays")
        if len(dialogs) != len(images) or len(dialogs) != len(image_placements):
            raise ValueError("dialogs, images, and imagePlacements must have the same length")

        for index, dialog in enumerate(dialogs):
            if not isinstance(dialog, str):
                raise ValueError(f"dialogs[{index}] must be a string")
            if not is_supported_qos_image_source(images[index]):
                raise ValueError(f"images[{index}] must be a png/jpeg/gif data URI or http(s) URL")
            if image_placements[index] not in ("above", "below"):
                raise ValueError(f"imagePlacements[{index}] must be above or below")
        return "dialogImages"

    raise ValueError("payload must include metrics or dialogs/images")


class WebUiApiRequestHandler(BaseHTTPRequestHandler):
    server_version = "WebUiApiServer/1.0"
    protocol_version = "HTTP/1.1"

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            write_json(self, {"ok": True})
            return

        path = self.path.split("?", 1)[0]

        if path == "/api/v1/qos/events":
            self.handle_qos_events()
            return

        if path == "/api/latency" and self.server.state.enable_latency:
            latency_ms = 70 + random.randint(-5, 5)
            write_json(self, {
                "timestamp": int(time.time() * 1000),
                "latencyMs": latency_ms,
            })
            return

        if path != "/api/stage" or not self.server.state.enable_stage:
            write_json(self, {"error": "not found"}, status=404)
            return

        write_json(self, {"stage": self.server.state.stage})

    def do_POST(self):
        path = self.path.split("?", 1)[0]

        if path == "/api/v1/qos":
            self.handle_qos_push()
            return

        if path != "/api/stage" or not self.server.state.enable_stage:
            write_json(self, {"error": "not found"}, status=404)
            return

        content_length = int(self.headers.get("Content-Length", "0") or "0")
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            write_json(self, {"error": "invalid json"}, status=400)
            return

        try:
            next_stage = int(payload.get("stage"))
        except (TypeError, ValueError):
            write_json(self, {"error": "stage must be an integer"}, status=400)
            return

        if next_stage == 3:
            next_stage = 2

        if next_stage not in ALLOWED_STAGES:
            write_json(self, {"error": "stage must be one of 1, 2, 4, 5, 6, 7, 8, 9, 10"}, status=400)
            return

        self.server.state.stage = next_stage
        write_json(self, {"stage": self.server.state.stage})

    def handle_qos_push(self):
        content_length = int(self.headers.get("Content-Length", "0") or "0")
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            write_json(self, {"error": "invalid json"}, status=400)
            return

        try:
            payload_type = validate_qos_payload(payload)
        except ValueError as exc:
            write_json(self, {"error": str(exc)}, status=400)
            return

        self.server.state.publish_qos(payload)
        write_json(self, {"ok": True, "type": payload_type})

    def handle_qos_events(self):
        subscriber = self.server.state.subscribe_qos()
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        try:
            self.wfile.write(b": connected\n\n")
            self.wfile.flush()

            while True:
                try:
                    payload = subscriber.get(timeout=15)
                    message = json.dumps(payload, ensure_ascii=False)
                    self.wfile.write(f"event: qos\ndata: {message}\n\n".encode("utf-8"))
                except queue.Empty:
                    self.wfile.write(b": keepalive\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionError):
            pass
        finally:
            self.server.state.unsubscribe_qos(subscriber)

    def log_message(self, format, *args):
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))


def normalize_initial_stage(stage):
    if stage == 3:
        return 2
    if stage not in ALLOWED_STAGES:
        raise ValueError("stage must be one of 1, 2, 4, 5, 6, 7, 8, 9, 10")
    return stage


def create_server(host, port, *, initial_stage=1, enable_stage=True, enable_latency=True):
    stage = normalize_initial_stage(initial_stage)
    server = ThreadingHTTPServer((host, port), WebUiApiRequestHandler)
    server.state = WebUiApiState(
        stage,
        enable_stage=enable_stage,
        enable_latency=enable_latency,
    )
    return server


def main(
    argv=None,
    *,
    enable_stage_default=True,
    enable_latency_default=True,
    description="Serve WebUI API endpoints.",
):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=28448)
    parser.add_argument("--stage", type=int, default=1)
    stage_group = parser.add_mutually_exclusive_group()
    stage_group.add_argument("--enable-stage", action="store_true", dest="enable_stage")
    stage_group.add_argument("--disable-stage", action="store_false", dest="enable_stage")
    latency_group = parser.add_mutually_exclusive_group()
    latency_group.add_argument("--enable-latency", action="store_true", dest="enable_latency")
    latency_group.add_argument("--disable-latency", action="store_false", dest="enable_latency")
    parser.set_defaults(
        enable_stage=enable_stage_default,
        enable_latency=enable_latency_default,
    )
    args = parser.parse_args(argv)

    try:
        server = create_server(
            args.host,
            args.port,
            initial_stage=args.stage,
            enable_stage=args.enable_stage,
            enable_latency=args.enable_latency,
        )
    except ValueError as exc:
        raise SystemExit(f"--{exc}") from exc

    stage_status = "enabled" if args.enable_stage else "disabled"
    latency_status = "enabled" if args.enable_latency else "disabled"
    print(
        f"WebUI API server listening on http://{args.host}:{args.port} "
        f"with stage={server.state.stage} stageMock={stage_status} latencyMock={latency_status}"
    )

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
