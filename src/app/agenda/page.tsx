'use client'

import React, { useState, useEffect, FormEvent } from 'react';

interface EventItem {
  id: number;
  title: string;
  datetime: string;
}

const AgendaPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
      if (!navigator.onLine) {
        setMessage('Lecture offline');
      }
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    fetchEvents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time || !date) return;
    setLoading(true);
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, time, date }),
    });
    if (res.ok) {
      setTitle('');
      setTime('');
      setMessage("\u00c9v\u00e9nement ajout\u00e9");
      fetchEvents();
    } else {
      setMessage("Erreur lors de l'ajout");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet \u00e9v\u00e9nement ?')) return;
    setDeleteId(id);
    const res = await fetch('/api/events?id=' + id, { method: 'DELETE' });
    if (res.ok) {
      setMessage("\u00c9v\u00e9nement supprim\u00e9");
      fetchEvents();
    } else {
      setMessage('Erreur de suppression');
    }
    setDeleteId(null);
  };

  return (
    <div className="agenda-container">
      <h1>Agenda</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button type="submit" disabled={loading}>Ajouter</button>
      </form>
      {message && <p>{message}</p>}
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            {new Date(ev.datetime).toLocaleDateString('fr-FR')} à{' '}
            {new Date(ev.datetime).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' '}– {ev.title}{' '}
            <button
              onClick={() => handleDelete(ev.id)}
              disabled={deleteId === ev.id}
              style={{ marginLeft: '0.5rem' }}
            >
              {deleteId === ev.id ? '...' : 'Supprimer'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaPage;
