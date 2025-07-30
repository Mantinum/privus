import json
import importlib.util
from dataclasses import dataclass
from pathlib import Path
from typing import List

from .nlp import router as default_router
from .profile import load_profile

PLUGINS_DIR = Path(__file__).resolve().parents[2] / "plugins"


@dataclass
class PluginInfo:
    slug: str
    name: str
    description: str
    version: str
    path: Path
    enabled: bool = False


_loaded = False
_active_plugins: List[PluginInfo] = []


def load_plugins(router=default_router) -> None:
    """Load enabled plugins and register their intents."""
    global _loaded, _active_plugins
    if _loaded:
        return
    enabled = set(load_profile().get("enabledPlugins", []))
    _active_plugins = []

    for info in list_plugins():
        if info.slug not in enabled:
            continue
        main_path = info.path / "main.py"
        spec = importlib.util.spec_from_file_location(f"plugin_{info.slug}", main_path)
        if not spec or not spec.loader:
            continue
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
        except Exception as e:
            print(f"Erreur import plugin {info.slug}: {e}")
            continue
        if hasattr(module, "register"):
            try:
                module.register(router)
                info.enabled = True
                _active_plugins.append(info)
                print(f"\u2713 Plugin {info.slug} charg\u00e9")
            except Exception as e:
                print(f"Erreur chargement plugin {info.slug}: {e}")
    _loaded = True


def list_plugins() -> List[PluginInfo]:
    """Return metadata about all plugins with enable status from profile."""
    enabled = set(load_profile().get("enabledPlugins", []))
    plugins: List[PluginInfo] = []
    if not PLUGINS_DIR.exists():
        return plugins
    for plugin_json in PLUGINS_DIR.glob("*/plugin.json"):
        try:
            info = json.loads(plugin_json.read_text(encoding="utf-8"))
        except Exception:
            continue
        slug = info.get("slug") or plugin_json.parent.name
        plugins.append(
            PluginInfo(
                slug=slug,
                name=info.get("name", slug),
                description=info.get("description", ""),
                version=info.get("version", "0.0.0"),
                path=plugin_json.parent,
                enabled=slug in enabled,
            )
        )
    return plugins


def reset():
    """Reset loaded plugins so they will be reloaded on next call."""
    global _loaded, _active_plugins
    _loaded = False
    _active_plugins = []


def get_active_plugins() -> List[PluginInfo]:
    """Return plugins loaded via load_plugins."""
    return list(_active_plugins)
