import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi! I am your BudgetBuddy AI advisor. Ask me about your spending, budget status, or savings goals.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai-chat/', { message: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Unable to get advice right now. Please check your backend connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end">
      {/* Expanded Chat Window Popup */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[460px] md:w-[480px] h-[620px] max-h-[82vh] rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base font-bold">
                AI
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">BudgetBuddy AI Advisor</h3>
                <p className="text-xs text-emerald-400 font-medium">Real-Time Financial Intelligence</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-medium py-2 px-1">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                Analyzing your transactions...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: 'Where am I overspending this month?'"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center font-extrabold hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">✨</span>
        )}
      </button>
    </div>
  );
}