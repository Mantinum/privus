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

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, time }),
    });
    if (res.ok) {
      setTitle('');
      setTime('');
      fetchEvents();
    }
  };

  return (
    <div>
      <h1>Agenda</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            {new Date(ev.datetime).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}– {ev.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaPage;
