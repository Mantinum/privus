'use client'

import React, { useState, FormEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10),
        }),
      });
      const data = await res.json();
      const reply = res.ok && data.reply ? data.reply : 'Erreur du serveur.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erreur de réseau.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>{msg.content}</div>
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
