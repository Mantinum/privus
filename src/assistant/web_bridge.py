import sys
import json
import os
import datetime
from pathlib import Path

if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from assistant.database import Database
    from assistant.crypto_utils import generate_key
    from assistant.profile import load_profile, save_profile
    from assistant import plugin_loader
    from assistant.plugin_loader import load_plugins, list_plugins
    from assistant.nlp import parse_command
else:
    from .database import Database
    from .crypto_utils import generate_key
    from .profile import load_profile, save_profile
    from . import plugin_loader
    from .plugin_loader import load_plugins, list_plugins
    from .nlp import parse_command

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


def cmd_delete(id_str: str) -> None:
    try:
        event_id = int(id_str)
    except ValueError:
        print("Invalid ID", file=sys.stderr)
        sys.exit(1)
    if _db.delete_event(event_id):
        print("OK")
    else:
        print("Not found", file=sys.stderr)
        sys.exit(1)


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


def cmd_plugins_load() -> None:
    """Load plugins once."""
    load_plugins()


def cmd_plugins_list() -> None:
    infos = [
        {
            "slug": p.slug,
            "name": p.name,
            "description": p.description,
            "version": p.version,
            "enabled": p.enabled,
        }
        for p in list_plugins()
    ]
    print(json.dumps(infos, ensure_ascii=False))


def cmd_plugin_set(slug: str, enabled_str: str) -> None:
    enabled = enabled_str.lower() in {"1", "true", "yes"}
    profile = load_profile()
    plugins = set(profile.get("enabledPlugins", []))
    if enabled:
        plugins.add(slug)
    else:
        plugins.discard(slug)
    profile["enabledPlugins"] = sorted(plugins)
    save_profile(profile)
    plugin_loader.reset()
    print("OK")


def cmd_plugin_parse(text: str) -> None:
    load_plugins()
    result = parse_command(text)
    if result and result[0] == "reply":
        print(json.dumps({"reply": result[1]["text"]}, ensure_ascii=False))
    else:
        print("{}")


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
    elif command == "delete" and len(sys.argv) >= 3:
        cmd_delete(sys.argv[2])
    elif command == "profile_get":
        cmd_profile_get()
    elif command == "profile_set" and len(sys.argv) >= 3:
        cmd_profile_set(sys.argv[2])
    elif command == "plugins_load":
        cmd_plugins_load()
    elif command == "plugins_list":
        cmd_plugins_list()
    elif command == "plugin_set" and len(sys.argv) >= 4:
        cmd_plugin_set(sys.argv[2], sys.argv[3])
    elif command == "plugin_parse" and len(sys.argv) >= 3:
        cmd_plugin_parse(sys.argv[2])
    else:
        print("Invalid command", file=sys.stderr)
        sys.exit(1)
