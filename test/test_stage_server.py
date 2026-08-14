from __future__ import annotations

import queue
from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.webui_api_server import WebUiApiState, validate_qos_payload  # noqa: E402


def dialog_payload(dialog, image="data:image/png;base64,QUJDRA==", placement="below"):
    return {
        "dialogs": [dialog],
        "images": [image],
        "imagePlacements": [placement],
    }


class WebUiApiStateQosCacheTest(unittest.TestCase):
    def test_dialog_images_are_cached_and_replayed_to_new_subscribers(self):
        state = WebUiApiState(initial_stage=1)

        state.publish_qos(dialog_payload("用户问题"), "dialogImages")

        subscriber = state.subscribe_qos()
        replayed = subscriber.get_nowait()

        self.assertEqual(["用户问题"], replayed["dialogs"])
        self.assertEqual(["below"], replayed["imagePlacements"])

    def test_dialog_images_are_accumulated_before_publish(self):
        state = WebUiApiState(initial_stage=1)
        subscriber = state.subscribe_qos()

        state.publish_qos(dialog_payload("用户问题"), "dialogImages")
        first_snapshot = subscriber.get_nowait()
        state.publish_qos(
            dialog_payload("模型结果", image="data:image/gif;base64,QUJDRA=="),
            "dialogImages",
        )
        second_snapshot = subscriber.get_nowait()

        self.assertEqual(["用户问题"], first_snapshot["dialogs"])
        self.assertEqual(["用户问题", "模型结果"], second_snapshot["dialogs"])
        self.assertEqual(
            [
                "data:image/png;base64,QUJDRA==",
                "data:image/gif;base64,QUJDRA==",
            ],
            second_snapshot["images"],
        )

    def test_reset_clears_dialog_cache_and_notifies_current_subscribers(self):
        state = WebUiApiState(initial_stage=1)
        state.publish_qos(dialog_payload("用户问题"), "dialogImages")
        subscriber = state.subscribe_qos()
        self.assertEqual(["用户问题"], subscriber.get_nowait()["dialogs"])

        state.publish_qos({"type": "reset"}, "reset")

        self.assertEqual([], subscriber.get_nowait()["dialogs"])
        new_subscriber = state.subscribe_qos()
        with self.assertRaises(queue.Empty):
            new_subscriber.get_nowait()

    def test_metrics_are_not_replayed_to_new_subscribers(self):
        state = WebUiApiState(initial_stage=1)
        state.publish_qos(
            {
                "metrics": [
                    {
                        "timestamp": 1,
                        "sendrate_kbps": 2,
                        "gbr_kbps": 3,
                        "q_lvl": 4,
                    }
                ]
            },
            "metrics",
        )

        subscriber = state.subscribe_qos()

        with self.assertRaises(queue.Empty):
            subscriber.get_nowait()

    def test_validate_reset_payload(self):
        self.assertEqual("reset", validate_qos_payload({"type": "reset"}))
        self.assertEqual("reset", validate_qos_payload({"reset": True}))
        with self.assertRaisesRegex(ValueError, "cannot mix reset"):
            validate_qos_payload({
                "type": "reset",
                "dialogs": [],
                "images": [],
                "imagePlacements": [],
            })


if __name__ == "__main__":
    unittest.main()
