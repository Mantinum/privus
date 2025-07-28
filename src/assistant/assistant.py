import os
import datetime
from pathlib import Path
from .crypto_utils import generate_key
from .database import Database
from .nlp import parse_command

DATA_DIR = Path(os.environ.get("PRIVUS_DATA", "data"))
DB_PATH = DATA_DIR / "assistant.db"


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    key = generate_key()
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
