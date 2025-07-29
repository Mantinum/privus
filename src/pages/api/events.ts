import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'list'], {
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
    const { title, time, date } = req.body || {};
    if (!title || !time || !date) {
      return res.status(400).json({ error: 'Title, date and time required' });
    }
    const dt = new Date(`${date}T${time}:00`);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time format' });
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

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).end();
}
