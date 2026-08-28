from __future__ import annotations

import http.client
import json
from pathlib import Path
import sys
import threading
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.webui_api_server import create_server  # noqa: E402


class WebUiApiServerTest(unittest.TestCase):
    def start_server(self, *, enable_stage: bool, enable_latency: bool = False):
        server = create_server(
            "127.0.0.1",
            0,
            initial_stage=1,
            enable_stage=enable_stage,
            enable_latency=enable_latency,
        )
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(thread.join, 1)
        self.addCleanup(server.shutdown)
        return server

    def request(self, server, method: str, path: str, payload: dict | None = None):
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {}
        if body is not None:
            headers["Content-Type"] = "application/json"
            headers["Content-Length"] = str(len(body))
        connection = http.client.HTTPConnection("127.0.0.1", server.server_address[1], timeout=2)
        self.addCleanup(connection.close)
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        response_body = response.read()
        if not response_body:
            return response.status, None
        return response.status, json.loads(response_body.decode("utf-8"))

    def read_qos_event(self, event_response):
        self.assertEqual(b"event: qos\n", event_response.fp.readline())
        data_line = event_response.fp.readline().decode("utf-8")
        self.assertTrue(data_line.startswith("data: "))
        self.assertEqual(b"\n", event_response.fp.readline())
        return json.loads(data_line.removeprefix("data: "))

    def test_qos_post_remains_available_when_stage_mock_is_disabled(self):
        server = self.start_server(enable_stage=False)

        stage_status, stage_body = self.request(server, "GET", "/api/stage")
        self.assertEqual(404, stage_status)
        self.assertEqual({"error": "not found"}, stage_body)

        qos_status, qos_body = self.request(
            server,
            "POST",
            "/api/v1/qos",
            {
                "metrics": [
                    {
                        "timestamp": 1785729000000,
                        "sendrate_kbps": 4200,
                        "gbr_kbps": 5000,
                        "q_lvl": 4,
                    }
                ]
            },
        )
        self.assertEqual(200, qos_status)
        self.assertEqual({"ok": True, "type": "metrics"}, qos_body)

    def test_stage_mock_behavior_is_preserved_when_enabled(self):
        server = self.start_server(enable_stage=True)

        status, body = self.request(server, "GET", "/api/stage")
        self.assertEqual(200, status)
        self.assertEqual({"stage": 1}, body)

        status, body = self.request(server, "POST", "/api/stage", {"stage": 10})
        self.assertEqual(200, status)
        self.assertEqual({"stage": 10}, body)

        status, body = self.request(server, "POST", "/api/stage", {"stage": 21})
        self.assertEqual(200, status)
        self.assertEqual({"stage": 21}, body)

        status, body = self.request(server, "POST", "/api/stage", {"stage": 22})
        self.assertEqual(200, status)
        self.assertEqual({"stage": 22}, body)

        status, body = self.request(server, "POST", "/api/stage", {"stage": 23})
        self.assertEqual(200, status)
        self.assertEqual({"stage": 23}, body)

        status, body = self.request(server, "POST", "/api/stage", {"stage": 24})
        self.assertEqual(200, status)
        self.assertEqual({"stage": 24}, body)

    def test_qos_events_stream_receives_posted_payloads(self):
        server = self.start_server(enable_stage=False)
        event_connection = http.client.HTTPConnection("127.0.0.1", server.server_address[1], timeout=2)
        self.addCleanup(event_connection.close)
        event_connection.request("GET", "/api/v1/qos/events")
        event_response = event_connection.getresponse()
        self.assertEqual(200, event_response.status)
        self.assertEqual(b": connected\n", event_response.fp.readline())
        self.assertEqual(b"\n", event_response.fp.readline())

        status, body = self.request(
            server,
            "POST",
            "/api/v1/qos",
            {
                "dialogs": ["QoS保障已启用"],
                "images": ["data:image/png;base64,QUJDRA=="],
                "imagePlacements": [["right", "below"]],
            },
        )
        self.assertEqual(200, status)
        self.assertEqual({"ok": True, "type": "dialogImages"}, body)

        event_payload = self.read_qos_event(event_response)
        self.assertEqual(["QoS保障已启用"], event_payload["dialogs"])
        self.assertEqual([["right", "below"]], event_payload["imagePlacements"])

    def test_qos_empty_dialog_payload_resets_dialog_stream(self):
        server = self.start_server(enable_stage=False)
        event_connection = http.client.HTTPConnection("127.0.0.1", server.server_address[1], timeout=2)
        self.addCleanup(event_connection.close)
        event_connection.request("GET", "/api/v1/qos/events")
        event_response = event_connection.getresponse()
        self.assertEqual(200, event_response.status)
        self.assertEqual(b": connected\n", event_response.fp.readline())
        self.assertEqual(b"\n", event_response.fp.readline())

        status, body = self.request(
            server,
            "POST",
            "/api/v1/qos",
            {
                "dialogs": ["QoS保障已启用"],
                "images": ["data:image/png;base64,QUJDRA=="],
                "imagePlacements": [["left", "below"]],
            },
        )
        self.assertEqual(200, status)
        self.assertEqual({"ok": True, "type": "dialogImages"}, body)
        event_payload = self.read_qos_event(event_response)
        self.assertEqual(["QoS保障已启用"], event_payload["dialogs"])
        self.assertEqual([["left", "below"]], event_payload["imagePlacements"])

        status, body = self.request(
            server,
            "POST",
            "/api/v1/qos",
            {
                "dialogs": [],
                "images": [],
                "imagePlacements": [],
            },
        )
        self.assertEqual(200, status)
        self.assertEqual({"ok": True, "type": "reset"}, body)
        self.assertEqual([], self.read_qos_event(event_response)["dialogs"])

    def test_docker_entrypoint_writes_qos_channel_runtime_config(self):
        entrypoint = (ROOT / "docker-entrypoint.sh").read_text(encoding="utf-8")

        self.assertIn('export QOS_PUSH_CHANNEL="${QOS_PUSH_CHANNEL:-}"', entrypoint)
        self.assertIn('export QOS_PUSH_CHANNEL_URL="${QOS_PUSH_CHANNEL_URL:-$QOS_PUSH_CHANNEL}"', entrypoint)
        self.assertIn('export ENABLE_STAGE_SERVER="${ENABLE_STAGE_SERVER:-true}"', entrypoint)
        self.assertIn('"qosPushChannelUrl": os.environ.get("QOS_PUSH_CHANNEL_URL") or None,', entrypoint)
        self.assertIn('"mockStage9Dialogs": os.environ["ENABLE_STAGE_SERVER"].lower() != "false",', entrypoint)


if __name__ == "__main__":
    unittest.main()
