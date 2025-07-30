import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync, spawn } from 'child_process';

const env = { PYTHONPATH: 'src', ...process.env };

export const config = {
  api: { responseLimit: false },
};

// Load plugins once when the API file is first evaluated
const pl = spawnSync('python3', ['src/assistant/web_bridge.py', 'plugins_load'], {
  encoding: 'utf-8',
  env,
});
if (!pl.error && pl.stdout.trim()) {
  console.log(pl.stdout.trim());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    res.statusCode = 400;
    return res.end('data: error\n\n');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (text: string) => {
    res.write(`data: ${text}\n\n`);
  };

  const profPy = spawnSync('python3', ['src/assistant/web_bridge.py', 'profile_get'], {
    encoding: 'utf-8',
    env,
  });
  let profile: any = {};
  if (!profPy.error) {
    try {
      profile = JSON.parse(profPy.stdout.trim() || '{}');
    } catch {
      profile = {};
    }
  }
  const model = typeof profile.model === 'string' ? profile.model : 'gpt-3.5-turbo';
  const tone = profile.tone === 'tu' ? 'tu' : 'vous';

  const last = messages[messages.length - 1];
  const lastContent =
    typeof last?.content === 'string' ? last.content.toLowerCase() : '';

  const pluginPy = spawnSync(
    'python3',
    ['src/assistant/web_bridge.py', 'plugin_parse', lastContent],
    { encoding: 'utf-8', env }
  );
  if (!pluginPy.error) {
    try {
      const obj = JSON.parse(pluginPy.stdout.trim() || '{}');
      if (obj.reply) {
        send(obj.reply);
        return res.end();
      }
    } catch {}
  }

  if (lastContent.includes('demain') && lastContent.includes("que j'ai")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'get', dateStr], {
      encoding: 'utf-8',
      env,
    });
    if (py.error) {
      send('Erreur agenda');
      return res.end();
    }
    try {
      const events = JSON.parse(py.stdout.trim() || '[]');
      if (!events.length) {
        send("Vous n'avez aucun événement prévu pour demain.");
        return res.end();
      }
      const lines = events.map(
        (ev: { title: string; datetime: string }) =>
          `- ${ev.title} à ${new Date(ev.datetime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
      );
      const reply = `Demain, vous avez :\n${lines.join('\n')}`;
      send(reply);
      return res.end();
    } catch {
      send('Erreur lecture agenda');
      return res.end();
    }
  }

  const reminderMatch = lastContent.match(
    /rappelle[- ]?moi de (.+?)\s+a\s+(\d{1,2})h/
  );
  if (reminderMatch) {
    const note = reminderMatch[1];
    const hour = parseInt(reminderMatch[2], 10);
    const now = new Date();
    now.setHours(hour, 0, 0, 0);
    spawnSync('python3', [
      'src/assistant/web_bridge.py',
      'add',
      `Rappel: ${note}`,
      now.toISOString(),
    ], { env });
    send(`D'accord, je vous rappellerai de ${note} à ${hour}h aujourd'hui.`);
    return res.end();
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (model === 'local') {
    const py = spawnSync(
      'python3',
      ['src/assistant/web_bridge.py', 'local_chat', JSON.stringify(messages)],
      { encoding: 'utf-8', env }
    );
    send(py.stdout.toString().trim());
    return res.end();
  }
  if (!apiKey) {
    send('error');
    return res.end();
  }

  const requestMessages = tone === 'tu'
    ? [{ role: 'system', content: "Tutoye l'utilisateur dans tes réponses." }, ...messages]
    : messages;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
      }),
    });

    if (!response.ok) {
      send('error');
      return res.end();
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    send(reply);
    return res.end();
  } catch (err) {
    send('error');
    return res.end();
  }
}
