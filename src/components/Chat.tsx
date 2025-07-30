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
    const newMessages: Message[] = [...messages, { role: 'user' as const, content }];
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
      setMessages((prev) => [...prev, { role: 'assistant' as const, content: reply }]);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = 'fr-FR';
        window.speechSynthesis.speak(u);
      }
    } catch {
      const errMsg =
        "Mode hors-ligne : l\u2019IA distante est indisponible. Consultez ou ajoutez des \u00e9v\u00e9nements dans l\u2019Agenda.";
      setMessages((prev) => [...prev, { role: 'assistant' as const, content: errMsg }]);
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 p-4 rounded-lg border border-[#2563eb] bg-[#111827] max-h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-[#2563eb] text-white' : 'bg-[#111827] border border-[#2563eb]'}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg max-w-[80%] bg-[#111827] border border-[#2563eb]">
              Assistant en train de répondre...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <label htmlFor="msg" className="sr-only">
          Message
        </label>
        <input
          id="msg"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message..."
          disabled={loading}
          className="flex-1 rounded border border-[#2563eb] p-2 bg-transparent text-[#f3f4f6]"
        />
        <button
          type="button"
          onClick={startRecognition}
          disabled={loading}
          className="rounded border border-[#2563eb] px-3"
        >
          {recognizing ? '🎤…' : '🎤'}
        </button>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded bg-[#2563eb] text-white px-4"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default Chat;
