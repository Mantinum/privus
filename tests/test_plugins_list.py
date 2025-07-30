import importlib
from assistant import plugin_loader
from assistant.plugin_loader import list_plugins


def test_plugins_list_contains_weather(tmp_path, monkeypatch):
    monkeypatch.setenv('PRIVUS_DATA', str(tmp_path))
    from assistant import profile as profile_module
    importlib.reload(profile_module)
    profile_module.save_profile({'enabledPlugins': ['weather']})
    importlib.reload(plugin_loader)
    plugins = list_plugins()
    slugs = [p.slug for p in plugins]
    assert 'weather' in slugs
