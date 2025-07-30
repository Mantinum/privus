from __future__ import annotations
import os
from pathlib import Path
from typing import List, Dict

from gpt4all import GPT4All

MODELS_DIR = Path.home() / '.privus' / 'models'
DEFAULT_MODEL = 'ggml-gpt4all-j'

_cache: dict[str, GPT4All] = {}


def model_path(model_name: str = DEFAULT_MODEL) -> Path:
    filename = model_name
    if not filename.endswith(('.bin', '.gguf')):
        filename += '.gguf'
    return MODELS_DIR / filename


def download_model(model_name: str = DEFAULT_MODEL) -> Path:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    dest = model_path(model_name)
    if dest.exists():
        return dest
    url = f'https://gpt4all.io/models/gguf/{dest.name}'
    import requests
    resp = requests.get(url, stream=True)
    resp.raise_for_status()
    total = int(resp.headers.get('content-length', 0))
    downloaded = 0
    with open(dest, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=2**20):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                percent = int(downloaded * 100 / total) if total else 0
                print(percent)
    print('DONE')
    return dest


def _load(model_name: str = DEFAULT_MODEL) -> GPT4All:
    key = model_name
    if key not in _cache:
        path = model_path(model_name)
        if not path.exists():
            raise FileNotFoundError(path)
        _cache[key] = GPT4All(path.name, model_path=str(MODELS_DIR), allow_download=False)
    return _cache[key]


def chat(messages: List[Dict[str, str]], model_name: str = DEFAULT_MODEL) -> str:
    model = _load(model_name)
    prompt = ''
    for msg in messages:
        role = msg.get('role', '')
        content = msg.get('content', '')
        if role == 'system':
            prompt = content + '\n' + prompt
        elif role == 'user':
            prompt += f'User: {content}\n'
        elif role == 'assistant':
            prompt += f'Assistant: {content}\n'
    return model.generate(prompt).strip()
