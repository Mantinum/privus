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

  const grouped = events.reduce<Record<string, EventItem[]>>((acc, ev) => {
    const day = ev.datetime.slice(0, 10);
    (acc[day] = acc[day] || []).push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Agenda</h1>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
        <label htmlFor="title" className="sr-only">
          Titre
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="border border-[#2563eb] rounded p-2 flex-1 min-w-[8rem]"
        />
        <label htmlFor="date" className="sr-only">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-[#2563eb] rounded p-2"
        />
        <label htmlFor="time" className="sr-only">
          Heure
        </label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border border-[#2563eb] rounded p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#2563eb] text-white px-4 py-2"
        >
          Ajouter
        </button>
      </form>
      {message && <p className="text-sm">{message}</p>}
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, list]) => (
          <div key={day} className="border-l-2 border-[#2563eb] pl-4">
            <h2 className="font-semibold mb-2">
              {new Date(day).toLocaleDateString('fr-FR')}
            </h2>
            <ul className="space-y-2">
              {list.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between">
                  <span>
                    {new Date(ev.datetime).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    – {ev.title}
                  </span>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={deleteId === ev.id}
                    aria-label="Supprimer"
                    className="ml-2 text-red-600"
                  >
                    {deleteId === ev.id ? '…' : '🗑️'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaPage;
