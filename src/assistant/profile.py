import json
import os
from pathlib import Path
from typing import Any, Dict

DATA_DIR = Path(os.environ.get("PRIVUS_DATA", "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_FILE = DATA_DIR / "profile.json"

DEFAULT_PROFILE = {
    "name": "",
    "model": "gpt-3.5-turbo",
    "tone": "vous",
    "language": "fr",
}


def load_profile() -> Dict[str, Any]:
    if PROFILE_FILE.exists():
        try:
            with PROFILE_FILE.open("r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                return {**DEFAULT_PROFILE, **data}
        except Exception:
            pass
    return DEFAULT_PROFILE.copy()


def save_profile(data: Dict[str, Any]) -> None:
    PROFILE_FILE.write_text(
        json.dumps({**DEFAULT_PROFILE, **data}, ensure_ascii=False), encoding="utf-8"
    )


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Missing command", file=sys.stderr)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "get":
        print(json.dumps(load_profile(), ensure_ascii=False))
    elif cmd == "set" and len(sys.argv) >= 3:
        try:
            payload = json.loads(sys.argv[2])
        except Exception as e:
            print("Invalid JSON", file=sys.stderr)
            sys.exit(1)
        save_profile(payload)
        print("OK")
    else:
        print("Invalid command", file=sys.stderr)
        sys.exit(1)
