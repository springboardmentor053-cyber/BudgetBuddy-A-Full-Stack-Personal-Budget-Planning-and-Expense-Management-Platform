import React, { useState } from 'react';
import api from '../api/axios';

export default function AIPortal() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your BudgetBuddy AI advisor. Ask me anything about your spending habits, budgets, or how to save more!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai-chat/', { message: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: "Sorry, I couldn't process that right now. Check your API key connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 flex flex-col h-[calc(100vh-2rem)]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>✨</span> AI Financial Advisor Portal
        </h1>
        <p className="text-xs text-slate-400">Powered by Gemini AI • Real-time financial insights</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none whitespace-pre-wrap'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-emerald-400 flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Analyzing your finances...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask: 'Where am I spending too much?' or 'How can I save ₹2000?'"
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}