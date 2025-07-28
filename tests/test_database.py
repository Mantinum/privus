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

