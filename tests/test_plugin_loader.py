import os
import importlib
from pathlib import Path
from assistant import plugin_loader
from assistant.plugin_loader import load_plugins
from assistant.nlp import router


def test_weather_pattern_loaded(tmp_path, monkeypatch):
    monkeypatch.setenv('PRIVUS_DATA', str(tmp_path))
    monkeypatch.syspath_prepend(str(Path('plugins').resolve()))
    from assistant import profile as profile_module
    importlib.reload(profile_module)
    profile_module.save_profile({'enabledPlugins': ['weather']})
    importlib.reload(plugin_loader)
    router.intents.clear()

    def fake_get(url, timeout=5):
        class Resp:
            ok = True
            text = 'Test meteo'

        return Resp()

    monkeypatch.setattr('requests.get', fake_get)
    load_plugins(router)
    assert any(r.search('m\u00e9t\u00e9o') for r, _ in router.intents)
