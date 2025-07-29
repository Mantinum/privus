import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnSync } from 'child_process';

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
    return res.status(400).json({ error: 'Messages are required' });
  }

  const profPy = spawnSync('python3', ['src/assistant/web_bridge.py', 'profile_get'], {
    encoding: 'utf-8',
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

  if (lastContent.includes('demain') && lastContent.includes("que j'ai")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    const py = spawnSync('python3', ['src/assistant/web_bridge.py', 'get', dateStr], {
      encoding: 'utf-8',
    });
    if (py.error) {
      return res.status(500).json({ error: 'Failed to access agenda' });
    }
    try {
      const events = JSON.parse(py.stdout.trim() || '[]');
      if (!events.length) {
        return res
          .status(200)
          .json({ reply: "Vous n'avez aucun événement prévu pour demain." });
      }
      const lines = events.map(
        (ev: { title: string; datetime: string }) =>
          `- ${ev.title} à ${new Date(ev.datetime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
      );
      const reply = `Demain, vous avez :\n${lines.join('\n')}`;
      return res.status(200).json({ reply });
    } catch {
      return res.status(500).json({ error: 'Invalid agenda data' });
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
    ]);
    return res.status(200).json({
      reply: `D'accord, je vous rappellerai de ${note} à ${hour}h aujourd'hui.`,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
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
      const errorText = await response.text();
      return res.status(500).json({ error: 'OpenAI error', detail: errorText });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Request failed' });
  }
}
