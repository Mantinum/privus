'use client'
import { useEffect, useState } from 'react';

interface PluginInfo {
  slug: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
}

export default function StorePage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);

  const load = async () => {
    const res = await fetch('/api/plugins');
    if (res.ok) {
      const data = await res.json();
      setPlugins(data.plugins || []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (slug: string, enabled: boolean) => {
    await fetch('/api/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, enabled }),
    });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      {plugins.map((p) => (
        <div key={p.slug} className="border border-[#2563eb] p-4 rounded">
          <h3 className="font-semibold mb-1">{p.name}</h3>
          <p className="text-sm mb-2">{p.description}</p>
          <button
            onClick={() => toggle(p.slug, !p.enabled)}
            className={`rounded px-3 py-1 text-white ${p.enabled ? 'bg-red-600' : 'bg-[#2563eb]'}`}
          >
            {p.enabled ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      ))}
    </div>
  );
}
