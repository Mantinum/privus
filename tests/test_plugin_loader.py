import os
from assistant.plugin_loader import load_plugins
from assistant.nlp import router


def test_weather_pattern_loaded():
    router.intents.clear()
    load_plugins(router)
    assert any(r.search('m\u00e9t\u00e9o') for r, _ in router.intents)
