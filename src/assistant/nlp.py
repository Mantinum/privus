import re
import datetime
from typing import Tuple, Optional, Dict, Callable, List


class Router:
    """Simple intent router used by plugins."""

    def __init__(self) -> None:
        self.intents: List[tuple[re.Pattern, Callable[[re.Match], str]]] = []

    def add_intent(self, pattern: str, callback: Callable[[re.Match], str]) -> None:
        regex = re.compile(pattern, re.IGNORECASE)
        self.intents.append((regex, callback))

    def handle(self, text: str) -> Optional[str]:
        for regex, cb in self.intents:
            m = regex.search(text)
            if m:
                try:
                    return cb(m)
                except Exception:
                    return None
        return None


router = Router()

Command = Tuple[str, Dict]


def parse_command(text: str) -> Optional[Command]:
    text_lower = text.lower()

    if "demain" in text_lower and (
        "qu'est-ce que j'ai" in text_lower or "que j'ai" in text_lower
    ):
        return "view_events_tomorrow", {}

    m = re.search(r"rendez[- ]?vous.*?(\d{1,2})h", text_lower)
    if m and "demain" in text_lower:
        hour = int(m.group(1))
        return "add_event_tomorrow", {"hour": hour}

    m = re.search(r"rappelle[- ]?moi de (.+)\s+a\s+(\d{1,2})h", text_lower)
    if m:
        note = m.group(1)
        hour = int(m.group(2))
        return "add_reminder_today", {"note": note, "hour": hour}

    plugin_reply = router.handle(text_lower)
    if plugin_reply:
        return "reply", {"text": plugin_reply}

    return None
