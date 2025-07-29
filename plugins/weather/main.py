import requests


def register(router):
    pattern = r"m\u00e9t\u00e9o"

    def callback(match):
        try:
            resp = requests.get("https://wttr.in?format=3", timeout=5)
            if resp.ok:
                return resp.text.strip()
        except Exception:
            pass
        return "Impossible de r\u00e9cup\u00e9rer la m\u00e9t\u00e9o"

    router.add_intent(pattern, callback)
