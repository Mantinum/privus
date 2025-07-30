'use client'

import React, { useEffect, useState, FormEvent } from 'react';

const SettingsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [tone, setTone] = useState('vous');
  const [status, setStatus] = useState('');
  const [localReady, setLocalReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (typeof data.name === 'string') setName(data.name);
        if (typeof data.model === 'string') setModel(data.model);
        if (typeof data.tone === 'string') setTone(data.tone);
      });

    fetch('/api/local/exists?model=ggml-gpt4all-j')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLocalReady(!!d?.exists));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, model, tone }),
    });
    if (res.ok) {
      setStatus('Enregistré');
    } else {
      setStatus("Erreur lors de l'enregistrement");
    }
  };

  const downloadModel = () => {
    setProgress(0);
    const es = new EventSource('/api/local/download?model=ggml-gpt4all-j');
    es.onmessage = (ev) => {
      if (ev.data === 'DONE') {
        setProgress(100);
        setLocalReady(true);
        es.close();
      } else {
        const p = parseInt(ev.data, 10);
        if (!isNaN(p)) setProgress(p);
      }
    };
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-[#111827] rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-bold mb-2">Paramètres</h1>
        <label className="block">
          <span className="sr-only">Nom</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            className="w-full border border-[#2563eb] rounded p-2 bg-transparent text-[#f3f4f6]"
          />
        </label>
        <label className="block">
          <span className="sr-only">Modèle IA</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-[#2563eb] rounded p-2 bg-transparent text-[#f3f4f6]"
          >
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="local">Modèle local</option>
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Ton</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full border border-[#2563eb] rounded p-2 bg-transparent text-[#f3f4f6]"
          >
            <option value="vous">Vouvoyer</option>
            <option value="tu">Tutoyer</option>
          </select>
        </label>
        {localReady ? (
          <span className="text-sm inline-block bg-green-700 px-2 py-1 rounded">IA locale prête ✅</span>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={downloadModel}
              className="rounded bg-[#2563eb] text-white px-4 py-2 w-full"
            >
              Télécharger modèle
            </button>
            {progress > 0 && (
              <progress value={progress} max={100} className="w-full">
                {progress}%
              </progress>
            )}
          </div>
        )}
        <button
          type="submit"
          className="rounded bg-[#2563eb] text-white px-4 py-2 w-full"
        >
          Sauvegarder
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>
    </div>
  );
};

export default SettingsPage;
