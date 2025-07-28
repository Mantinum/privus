import sqlite3
import datetime
from pathlib import Path
from .crypto_utils import encrypt, decrypt

class Database:
    def __init__(self, path: str, key: bytes):
        self.key = key
        self.path = Path(path)
        self.conn = sqlite3.connect(self.path)
        self._create_tables()

    def _create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS events (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   title TEXT,
                   time TEXT
               )"""
        )
        self.conn.commit()

    def add_event(self, title: str, dt: datetime.datetime):
        enc_title = encrypt(self.key, title)
        enc_time = encrypt(self.key, dt.isoformat())
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO events (title, time) VALUES (?, ?)",
            (enc_title, enc_time),
        )
        self.conn.commit()

    def get_events_for_day(self, date: datetime.date):
        cursor = self.conn.cursor()
        cursor.execute("SELECT title, time FROM events")
        results = []
        for enc_title, enc_time in cursor.fetchall():
            title = decrypt(self.key, enc_title)
            dt = datetime.datetime.fromisoformat(decrypt(self.key, enc_time))
            if dt.date() == date:
                results.append({"title": title, "datetime": dt})
        return results
