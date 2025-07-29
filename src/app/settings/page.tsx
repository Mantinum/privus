'use client'

import React, { useEffect, useState, FormEvent } from 'react';

const SettingsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [tone, setTone] = useState('vous');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (typeof data.name === 'string') setName(data.name);
        if (typeof data.model === 'string') setModel(data.model);
        if (typeof data.tone === 'string') setTone(data.tone);
      });
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

  return (
    <div>
      <h1>Paramètres</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '20rem' }}
      >
        <label>
          Nom
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Modèle IA
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="local">Modèle local</option>
          </select>
        </label>
        <label>
          Ton
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="vous">Vouvoyer</option>
            <option value="tu">Tutoyer</option>
          </select>
        </label>
        <button type="submit">Sauvegarder</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default SettingsPage;
