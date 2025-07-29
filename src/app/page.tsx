'use client'

import React, { useEffect, useState } from 'react';
import Chat from '@/components/Chat';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.name === 'string') setName(data.name);
      });
  }, []);

  return (
    <div>
      <h1>{name ? `Bonjour ${name} !` : 'Bienvenue sur Privus'}</h1>
      <Chat />
    </div>
  );
};

export default HomePage;
