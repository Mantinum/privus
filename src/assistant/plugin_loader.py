import json
import importlib.util
from pathlib import Path
from typing import Optional

from .nlp import router as default_router

PLUGINS_DIR = Path(__file__).resolve().parents[2] / "plugins"
_loaded = False


def load_plugins(router=default_router) -> None:
    """Load plugins from the plugins directory and register them."""
    global _loaded
    if _loaded:
        return
    if not PLUGINS_DIR.exists():
        return

    for plugin_json in PLUGINS_DIR.glob('*/plugin.json'):
        try:
            info = json.loads(plugin_json.read_text(encoding='utf-8'))
        except Exception:
            continue
        slug = info.get('slug') or plugin_json.parent.name
        main_path = plugin_json.parent / 'main.py'
        if not main_path.exists():
            continue
        spec = importlib.util.spec_from_file_location(f"plugin_{slug}", main_path)
        if not spec or not spec.loader:
            continue
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if hasattr(module, 'register'):
            try:
                module.register(router)
                print(f"\u2713 Plugin {slug} charg\u00e9")
            except Exception as e:
                print(f"Erreur chargement plugin {slug}: {e}")
    _loaded = True
