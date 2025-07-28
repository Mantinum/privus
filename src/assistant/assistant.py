import os
import json
import hashlib
import base64
import getpass
import datetime
from pathlib import Path
from .crypto_utils import derive_key, generate_salt
from .database import Database
from .nlp import parse_command

DATA_DIR = Path(os.environ.get("PRIVUS_DATA", "data"))
DB_PATH = DATA_DIR / "assistant.db"
KEY_FILE = DATA_DIR / "key.json"


def _load_or_create_key() -> bytes:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if KEY_FILE.exists():
        with KEY_FILE.open("r") as f:
            info = json.load(f)
        salt = base64.b64decode(info["salt"])
        stored_hash = info["hash"]
        password = getpass.getpass("Mot de passe: ")
        key = derive_key(password, salt)
        if hashlib.sha256(key).hexdigest() != stored_hash:
            raise ValueError("Mot de passe incorrect")
        return key
    else:
        password = getpass.getpass("Cr\xe9ez un mot de passe: ")
        salt = generate_salt()
        key = derive_key(password, salt)
        info = {
            "salt": base64.b64encode(salt).decode("utf-8"),
            "hash": hashlib.sha256(key).hexdigest(),
        }
        with KEY_FILE.open("w") as f:
            json.dump(info, f)
        return key


def main():
    try:
        key = _load_or_create_key()
    except ValueError as e:
        print(str(e))
        return
    db = Database(DB_PATH, key)

    print("Assistant personnel Privus. Tapez 'exit' pour quitter.")
    while True:
        try:
            command = input(">>> ")
        except EOFError:
            break
        if command.strip().lower() in {"exit", "quit"}:
            break
        action = parse_command(command)
        if not action:
            print("Je n'ai pas compris la commande.")
            continue

        name, params = action
        if name == "view_events_tomorrow":
            date = datetime.date.today() + datetime.timedelta(days=1)
            events = db.get_events_for_day(date)
            if not events:
                print("Aucun événement prévu pour demain.")
            else:
                for ev in events:
                    print(f"- {ev['title']} à {ev['datetime'].strftime('%Hh%M')}")
        elif name == "add_event_tomorrow":
            hour = params["hour"]
            date = datetime.date.today() + datetime.timedelta(days=1)
            dt = datetime.datetime.combine(date, datetime.time(hour=hour))
            db.add_event("Rendez-vous", dt)
            print("Rendez-vous ajouté.")
        elif name == "add_reminder_today":
            hour = params["hour"]
            note = params["note"]
            date = datetime.date.today()
            dt = datetime.datetime.combine(date, datetime.time(hour=hour))
            db.add_event(f"Rappel: {note}", dt)
            print("Rappel ajouté.")


if __name__ == "__main__":
    main()
