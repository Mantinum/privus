import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'profile_get'], {
      encoding: 'utf-8',
      env,
    });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to load profile' });
    }
    try {
      const profile = JSON.parse(py.stdout.trim() || '{}');
      return res.status(200).json(profile);
    } catch {
      return res.status(500).json({ error: 'Invalid profile data' });
    }
  }

  if (req.method === 'POST') {
    const payload = JSON.stringify(req.body || {});
    const py = spawnSync(
      'python3',
      ['src/assistant/web_bridge.py', 'profile_set', payload],
      { encoding: 'utf-8', env }
    );
    if (py.error) {
      return res.status(500).json({ error: 'Failed to save profile' });
    }
    if (py.status !== 0) {
      return res.status(500).json({ error: 'Profile save error' });
    }
    return res.status(200).json({ status: 'ok' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
