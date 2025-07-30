'use client'

import React, {
  useState,
  FormEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRec =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRec) return;
    const recog = new SpeechRec();
    recog.lang = 'fr-FR';
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setRecognizing(false);
      sendMessage(transcript);
    };
    recog.onerror = () => {
      setRecognizing(false);
      alert('La reconnaissance vocale a échoué');
    };
    recog.onend = () => setRecognizing(false);
    recognitionRef.current = recog;
  }, []);

  const sendMessage = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content) return;
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = 'fr-FR';
        window.speechSynthesis.speak(u);
      }
    } catch {
      const errMsg = "Mode hors-ligne : l’IA distante est indisponible. Consultez ou ajoutez des événements dans l’Agenda.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(errMsg);
        u.lang = 'fr-FR';
        window.speechSynthesis.speak(u);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const startRecognition = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur");
      return;
    }
    setRecognizing(true);
    rec.start();
  };

  return (
    <div className="chat-wrapper chat-container">
      <div style={{ marginBottom: '0.5rem' }}>
        <a href="/agenda">Voir l'agenda</a> | <a href="/settings">Paramètres</a>
      </div>
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}><div className="bubble">{msg.content}</div></div>
        ))}
        {loading && (
          <div className="message assistant"><div className="bubble">Assistant en train de répondre...</div></div>
        )}
        <div ref={endRef}></div>
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message..."
          disabled={loading}
        />
        <button
          type="button"
          onClick={startRecognition}
          disabled={loading}
          style={{ marginLeft: '0.5rem' }}
        >
          {recognizing ? '🎤 Enregistrement…' : '🎤'}
        </button>
        <button type="submit" disabled={loading || !input.trim()}>Envoyer</button>
      </form>
    </div>
  );
};

export default Chat;
