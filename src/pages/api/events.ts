import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;
    const args = date
      ? ['get', String(Array.isArray(date) ? date[0] : date)]
      : ['list'];
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', ...args], {
      encoding: 'utf-8',
      env,
    });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to access agenda' });
    }
    try {
      const events = JSON.parse(py.stdout.trim() || '[]');
      return res.status(200).json({ events });
    } catch {
      return res.status(500).json({ error: 'Invalid agenda data' });
    }
  }

  if (req.method === 'POST') {
    const { title, dateISO } = req.body || {};
    if (!title || !dateISO) {
      return res.status(400).json({ error: 'Title and dateISO required' });
    }
    const dt = new Date(dateISO);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    const py = spawnSync(
      'python3',
      ['src/assistant/web_bridge.py', 'add', title, dt.toISOString()],
      { encoding: 'utf-8', env }
    );
    if (py.error) {
      return res.status(500).json({ error: 'Failed to add event' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method === 'PUT') {
    const { id, title, dateISO } = req.body || {};
    const idNum = parseInt(id ?? '', 10);
    if (!id || Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID required' });
    }
    const payload: Record<string, string> = {};
    if (title) payload.title = title;
    if (dateISO) payload.dateISO = dateISO;
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No update fields' });
    }
    const py = spawnSync(
      'python3',
      [
        'src/assistant/web_bridge.py',
        'update',
        String(idNum),
        JSON.stringify(payload),
      ],
      { encoding: 'utf-8', env }
    );
    if (py.error) {
      return res.status(500).json({ error: 'Failed to update event' });
    }
    if (py.status !== 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const idNum = parseInt(Array.isArray(id) ? id[0] : id || '', 10);
    if (!id || Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID required' });
    }
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'delete', String(idNum)], { encoding: 'utf-8', env });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to delete event' });
    }
    if (py.status !== 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).end();
}
