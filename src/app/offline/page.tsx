'use client'

import React from 'react';
import Link from 'next/link';

const OfflinePage: React.FC = () => (
  <div className="space-y-4">
    <h1 className="text-xl font-bold">Pas de connexion</h1>
    <p>Les données locales restent accessibles.</p>
    <Link href="/agenda" className="rounded bg-[#2563eb] text-white px-4 py-2 inline-block">
      Ouvrir l'agenda
    </Link>
  </div>
);

export default OfflinePage;
