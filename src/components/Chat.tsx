'use client'

import React, { useState, FormEvent } from 'react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setMessages((prev) => [...prev, { sender: 'user', text: content }]);
    setInput('');
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}
        {loading && (
          <div className="message assistant">Assistant en train de répondre...</div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>Envoyer</button>
      </form>
    </div>
  );
};

export default Chat;
