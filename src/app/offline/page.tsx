'use client'

import React from 'react';

const OfflinePage: React.FC = () => (
  <div>
    <h1>Pas de connexion</h1>
    <p>Les données locales restent accessibles.</p>
    <a href="/agenda">
      <button>Ouvrir l'agenda</button>
    </a>
  </div>
);

export default OfflinePage;
