import importlib


def load_module(tmp_path, monkeypatch):
    monkeypatch.setenv('PRIVUS_DATA', str(tmp_path))
    import assistant.profile as profile
    importlib.reload(profile)
    return profile


def test_load_default(tmp_path, monkeypatch):
    profile_module = load_module(tmp_path, monkeypatch)
    profile = profile_module.load_profile()
    assert profile['name'] == ''
    assert profile['model'] == 'gpt-3.5-turbo'
    assert profile['tone'] == 'vous'
    assert profile['language'] == 'fr'
    assert profile['enabledPlugins'] == []


def test_save_and_load(tmp_path, monkeypatch):
    profile_module = load_module(tmp_path, monkeypatch)
    profile_module.save_profile({'name': 'Alice', 'model': 'gpt-4', 'tone': 'tu', 'enabledPlugins': ['weather']})
    profile = profile_module.load_profile()
    assert profile['name'] == 'Alice'
    assert profile['model'] == 'gpt-4'
    assert profile['tone'] == 'tu'
    assert profile['enabledPlugins'] == ['weather']
