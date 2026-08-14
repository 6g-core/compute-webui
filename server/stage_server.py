from __future__ import annotations

from pathlib import Path
import sys


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from server.webui_api_server import main  # noqa: E402


if __name__ == "__main__":
    main(
        enable_stage_default=True,
        enable_latency_default=True,
        description="Serve and mutate the current demo stage.",
    )
