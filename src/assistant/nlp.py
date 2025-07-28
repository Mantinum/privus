import re
import datetime
from typing import Tuple, Optional, Dict

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

    return None
