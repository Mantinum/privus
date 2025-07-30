'use client'

import React, { useState, useEffect, FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { set, get, del } from 'idb-keyval';

interface EventItem {
  id: number;
  title: string;
  datetime: string;
}

const AgendaPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);

  useEffect(() => {
    Notification.requestPermission().catch(() => {});
  }, []);

  const scheduleNotification = async (ev: EventItem) => {
    const handle = await get<number>(`timeout-${ev.id}`);
    if (handle) clearTimeout(handle);
    const delay = new Date(ev.datetime).getTime() - Date.now();
    if (delay > 0 && delay <= 86400000) {
      const id = window.setTimeout(() => {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(`\ud83d\udd14 Rappel: ${ev.title}`);
        });
      }, delay);
      await set(`timeout-${ev.id}`, id);
    } else {
      await del(`timeout-${ev.id}`);
    }
  };

  const cancelNotification = async (id: number) => {
    const handle = await get<number>(`timeout-${id}`);
    if (handle) clearTimeout(handle);
    await del(`timeout-${id}`);
  };

  const fetchEvents = async () => {
    const url = '/api/events' + (filterDate ? `?date=${filterDate}` : '');
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
      for (const ev of data.events || []) {
        scheduleNotification(ev);
      }
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    setFilterDate(today);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filterDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time || !date) return;
    setLoading(true);
    const dtISO = `${date}T${time}:00`;
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dateISO: dtISO }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle('');
      toast.success('\u00c9v\u00e9nement ajout\u00e9');
      fetchEvents();
    } else {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet \u00e9v\u00e9nement ?')) return;
    setDeleteId(id);
    const res = await fetch('/api/events?id=' + id, { method: 'DELETE' });
    setDeleteId(null);
    if (res.ok) {
      toast.success('\u00c9v\u00e9nement supprim\u00e9');
      cancelNotification(id);
      fetchEvents();
    } else {
      toast.error('Erreur de suppression');
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const res = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, title: editing.title, dateISO: editing.datetime }),
    });
    if (res.ok) {
      toast.success('\u00c9v\u00e9nement mis \u00e0 jour');
      setEditing(null);
      fetchEvents();
    } else {
      toast.error("Erreur lors de la modification");
    }
  };

  const grouped = events.reduce<Record<string, EventItem[]>>((acc, ev) => {
    const day = ev.datetime.slice(0, 10);
    (acc[day] = acc[day] || []).push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Toaster />
      <h1 className="text-xl font-bold">Agenda</h1>
      <div className="flex gap-2 items-end">
        <label htmlFor="filter" className="sr-only">
          Filtre
        </label>
        <input
          id="filter"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-[#2563eb] rounded p-2"
        />
      </div>
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
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, list]) => (
          <div key={day} className="border-l-2 border-[#2563eb] pl-4">
            <h2 className="font-semibold mb-2">
              {new Date(day).toLocaleDateString('fr-FR')}
            </h2>
            <ul className="space-y-2">
              {list.map((ev) => (
                <li
                  key={ev.id}
                  onDoubleClick={() =>
                    setEditing({ ...ev, datetime: ev.datetime.slice(0, 16) })
                  }
                  className="flex items-center justify-between"
                >
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
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#111827] p-4 rounded-lg space-y-2 w-72">
            <label htmlFor="edit-title" className="sr-only">
              Titre
            </label>
            <input
              id="edit-title"
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="border border-[#2563eb] rounded p-2 w-full"
            />
            <label htmlFor="edit-date" className="sr-only">
              Date
            </label>
            <input
              id="edit-date"
              type="datetime-local"
              value={editing.datetime}
              onChange={(e) => setEditing({ ...editing, datetime: e.target.value })}
              className="border border-[#2563eb] rounded p-2 w-full"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="border border-[#2563eb] rounded px-3"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                className="bg-[#2563eb] text-white rounded px-3"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;
