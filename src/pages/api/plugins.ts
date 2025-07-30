import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'plugins_list'], { encoding: 'utf-8', env });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to list plugins' });
    }
    try {
      const plugins = JSON.parse(py.stdout.trim() || '[]');
      return res.status(200).json({ plugins });
    } catch {
      return res.status(500).json({ error: 'Invalid data' });
    }
  }

  if (req.method === 'POST') {
    const { slug, enabled } = req.body || {};
    if (typeof slug !== 'string') {
      return res.status(400).json({ error: 'slug required' });
    }
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'plugin_set', slug, String(Boolean(enabled))], { encoding: 'utf-8', env });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to update plugin' });
    }
    if (py.status !== 0) {
      return res.status(500).json({ error: 'Update error' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
