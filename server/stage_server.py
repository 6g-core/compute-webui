import argparse
import json
import random
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class StageState:
    def __init__(self, initial_stage):
        self.stage = initial_stage


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


class StageRequestHandler(BaseHTTPRequestHandler):
    server_version = "StageServer/1.0"

    def do_OPTIONS(self):
      self.send_response(204)
      self.send_header("Access-Control-Allow-Origin", "*")
      self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      self.send_header("Access-Control-Allow-Headers", "Content-Type")
      self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            write_json(self, {"ok": True})
            return

        path = self.path.split("?", 1)[0]

        if path == "/api/latency":
            latency_ms = 70 + random.randint(-5, 5)
            write_json(self, {
                "timestamp": int(time.time() * 1000),
                "latencyMs": latency_ms,
            })
            return

        if path != "/api/stage":
            write_json(self, {"error": "not found"}, status=404)
            return

        write_json(self, {"stage": self.server.state.stage})

    def do_POST(self):
        if self.path != "/api/stage":
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

        if next_stage not in (1, 2, 4, 5, 6, 7, 8, 9):
            write_json(self, {"error": "stage must be one of 1, 2, 4, 5, 6, 7, 8, 9"}, status=400)
            return

        self.server.state.stage = next_stage
        write_json(self, {"stage": self.server.state.stage})

    def log_message(self, format, *args):
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))


def main():
    parser = argparse.ArgumentParser(description="Serve and mutate the current demo stage.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=28448)
    parser.add_argument("--stage", type=int, default=1)
    args = parser.parse_args()

    if args.stage == 3:
        args.stage = 2

    if args.stage not in (1, 2, 4, 5, 6, 7, 8, 9):
        raise SystemExit("--stage must be one of 1, 2, 4, 5, 6, 7, 8, 9")

    server = ThreadingHTTPServer((args.host, args.port), StageRequestHandler)
    server.state = StageState(args.stage)
    print(f"Stage server listening on http://{args.host}:{args.port} with stage={args.stage}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
