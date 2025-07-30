import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const model = typeof req.query.model === 'string' ? req.query.model : 'ggml-gpt4all-j';
  const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'model_exists', model], { encoding: 'utf-8', env });
  const exists = py.stdout.toString().trim() === '1';
  res.status(200).json({ exists });
}
