import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

import datetime
from assistant.database import Database
from assistant.crypto_utils import generate_key


def test_add_and_get_event(tmp_path):
    key = generate_key()
    db_file = tmp_path / "events.db"
    db = Database(db_file, key)
    dt = datetime.datetime(2024, 1, 1, 14, 0)
    db.add_event("Test", dt)

    events = db.get_events_for_day(dt.date())
    assert len(events) == 1
    assert events[0]["title"] == "Test"
    assert events[0]["datetime"] == dt


def test_get_all_events(tmp_path):
    key = generate_key()
    db_file = tmp_path / "events.db"
    db = Database(db_file, key)
    dt1 = datetime.datetime(2024, 1, 1, 10, 0)
    dt2 = datetime.datetime(2024, 1, 1, 12, 0)
    db.add_event("A", dt1)
    db.add_event("B", dt2)

    events = db.get_all_events()
    assert len(events) == 2
    assert events[0]["title"] == "A"
    assert events[1]["title"] == "B"

