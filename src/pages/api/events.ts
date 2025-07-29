import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'list'], {
      encoding: 'utf-8',
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
    const { title, time } = req.body || {};
    if (!title || !time) {
      return res.status(400).json({ error: 'Title and time required' });
    }
    const now = new Date();
    const [h, m] = String(time).split(':').map((s: string) => parseInt(s, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return res.status(400).json({ error: 'Invalid time format' });
    }
    const dt = new Date(now);
    dt.setHours(h, m, 0, 0);
    const py = spawnSync(
      'python3',
      ['src/assistant/web_bridge.py', 'add', title, dt.toISOString()],
      { encoding: 'utf-8' }
    );
    if (py.error) {
      return res.status(500).json({ error: 'Failed to add event' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
