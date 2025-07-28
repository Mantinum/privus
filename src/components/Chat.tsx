'use client'

import React, { useState, FormEvent } from 'react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setMessages((prev) => [...prev, { sender: 'user', text: content }]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      const reply = res.ok && data.reply ? data.reply : 'Erreur du serveur.';
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Erreur de réseau.' },
      ]);
    }
  };

  return (
    <div>
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre message..."
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default Chat;
