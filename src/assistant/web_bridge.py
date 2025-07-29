import sys
import json
import os
import datetime
from pathlib import Path

from .database import Database
from .crypto_utils import generate_key
from .profile import load_profile, save_profile

DATA_DIR = Path(os.environ.get("PRIVUS_DATA", "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "assistant_web.db"
KEY_PATH = DATA_DIR / "web_key"


def _load_key() -> bytes:
    if KEY_PATH.exists():
        return KEY_PATH.read_bytes()
    key = generate_key()
    KEY_PATH.write_bytes(key)
    return key


_db = Database(DB_PATH, _load_key())


def cmd_get(date_str: str) -> None:
    date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    events = _db.get_events_for_day(date)
    print(json.dumps(events, default=str))


def cmd_add(title: str, dt_str: str) -> None:
    dt = datetime.datetime.fromisoformat(dt_str)
    _db.add_event(title, dt)
    print("OK")


def cmd_list() -> None:
    events = _db.get_all_events()
    print(json.dumps(events, default=str))


def cmd_profile_get() -> None:
    profile = load_profile()
    print(json.dumps(profile, ensure_ascii=False))


def cmd_profile_set(json_str: str) -> None:
    try:
        data = json.loads(json_str)
    except Exception:
        print("Invalid JSON", file=sys.stderr)
        sys.exit(1)
    save_profile(data)
    print("OK")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing command", file=sys.stderr)
        sys.exit(1)
    command = sys.argv[1]
    if command == "get" and len(sys.argv) >= 3:
        cmd_get(sys.argv[2])
    elif command == "add" and len(sys.argv) >= 4:
        cmd_add(sys.argv[2], sys.argv[3])
    elif command == "list":
        cmd_list()
    elif command == "profile_get":
        cmd_profile_get()
    elif command == "profile_set" and len(sys.argv) >= 3:
        cmd_profile_set(sys.argv[2])
    else:
        print("Invalid command", file=sys.stderr)
        sys.exit(1)

