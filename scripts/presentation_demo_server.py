"""Run this branch's stage/QoS API and three local MP4 WebRTC sources.

The adapter supplies the Sandbox health/AR endpoints needed for a standalone
local preview. Production API configuration and the QoS cache stay unchanged.
"""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server.webui_api_server import WebUiApiRequestHandler, create_server, write_json

LOCAL_HTTP = urllib.request.build_opener(urllib.request.ProxyHandler({}))
SOURCES = [(28450, 'fixed_camera_moving_personmp_.mp4'), (28451, 'dog.mp4'), (28452, 'dog_enhanced.mp4')]


class PresentationDemoHandler(WebUiApiRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/api/health':
            write_json(self, {'ok': True, 'streamRequested': True, 'videoReady': True, 'streamEpoch': self.server.demo_epoch})
        elif path == '/api/v1/system/ar/status':
            write_json(self, {'last_whisper': ''})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.split('?', 1)[0] != '/api/v1/web/sdp/offer':
            return super().do_POST()
        body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
        try:
            payload = json.loads(body)
            port = 28452 if payload.get('streamType') == 'enhanced' else 28451
            request = urllib.request.Request(f'http://127.0.0.1:{port}/offer', data=body, headers={'Content-Type': 'application/json'})
            with LOCAL_HTTP.open(request, timeout=25) as response:
                write_json(self, json.load(response))
        except Exception as error:
            write_json(self, {'error': str(error)}, status=502)

    def log_message(self, format, *args):
        if self.command != 'GET':
            super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8787)
    args = parser.parse_args()
    output = ROOT / 'artifacts/presentation'
    output.mkdir(parents=True, exist_ok=True)
    processes, logs = [], []
    server = create_server(args.host, args.port)
    server.RequestHandlerClass = PresentationDemoHandler
    server.demo_epoch = int(time.time())
    try:
        for port, media in SOURCES:
            log = (output / f'video-{port}.log').open('w', encoding='utf-8')
            logs.append(log)
            processes.append(subprocess.Popen([
                sys.executable, str(ROOT / 'server/webrtc_mp4_server.py'),
                '--host', args.host, '--port', str(port), '--media', str(ROOT / media),
            ], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)))
        deadline = time.monotonic() + 15
        for port, _ in SOURCES:
            while True:
                if any(process.poll() is not None for process in processes):
                    raise RuntimeError('A video server exited; see artifacts/presentation/video-*.log')
                try:
                    with LOCAL_HTTP.open(f'http://127.0.0.1:{port}/health', timeout=1):
                        break
                except OSError:
                    if time.monotonic() > deadline:
                        raise RuntimeError('Video server startup timed out')
                    time.sleep(0.1)
        print(f'Presentation demo ready: http://{args.host}:{args.port}; WebRTC ports 28450–28452', flush=True)
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        for process in processes:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
        for log in logs:
            log.close()


if __name__ == '__main__':
    main()
