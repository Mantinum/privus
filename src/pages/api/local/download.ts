import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export const config = { api: { responseLimit: false } };

const env = { PYTHONPATH: 'src', ...process.env };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const model = typeof req.query.model === 'string' ? req.query.model : 'ggml-gpt4all-j';
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const py = spawn('python3', ['src/assistant/web_bridge.py', 'model_download', model], { env });
  py.stdout.on('data', (d) => {
    res.write(`data: ${d.toString().trim()}\n\n`);
  });
  py.on('close', () => res.end());
}
