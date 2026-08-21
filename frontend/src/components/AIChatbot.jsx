import { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';

function AIChatbot({ isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am your BudgetBuddy AI assistant. Ask me anything about your budget, income, expenses, or financial goals!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || isLoading) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: query }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseData = await aiService.chat(query);
      const aiReply = responseData.response || "Sorry, I didn't receive a response from the server.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: aiReply }
      ]);
    } catch (err) {
      console.error(err);
      let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again.";
      if (err.response?.data?.response) {
        errorMsg = err.response.data.response;
      }
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard support: Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Styles based on theme
  const panelBg = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' 
    : 'bg-white border-slate-200 text-slate-800 shadow-xl';
  const chatHeaderBg = 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white';
  const userMsgBg = 'bg-rose-500 text-white self-end';
  const aiMsgBg = isDark 
    ? 'bg-slate-800 border-slate-750 text-slate-100 self-start' 
    : 'bg-slate-100 border-slate-200 text-slate-800 self-start';
  const inputBg = isDark 
    ? 'bg-slate-950 border-slate-800 text-white focus:border-rose-500' 
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500 focus:bg-white';
  const disclaimerColor = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div 
          className={`w-[92vw] sm:w-[400px] h-[500px] rounded-2xl border flex flex-col mb-4 overflow-hidden transition-all duration-300 ${panelBg}`}
        >
          {/* Header */}
          <div className={`px-4 py-3.5 flex items-center justify-between shrink-0 ${chatHeaderBg}`}>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight">AI Financial Assistant</h4>
                <p className="text-[10px] text-rose-100 font-semibold leading-none">Powered by Llama 3</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-rose-100 text-xl font-bold cursor-pointer transition-colors p-1"
              title="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-medium border border-transparent whitespace-pre-line ${
                  msg.role === 'user' ? userMsgBg : aiMsgBg
                }`}
              >
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-bold border italic animate-pulse ${aiMsgBg}`}>
                💬 AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800/10 dark:border-slate-800/60 flex flex-col gap-2 shrink-0">
            {/* Disclaimer */}
            <p className={`text-[9px] text-center leading-normal italic px-2 ${disclaimerColor}`}>
              BudgetBuddy provides general financial guidance and is not a professional financial advisor.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a financial question..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all font-semibold ${inputBg}`}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
                title="Send Message"
              >
                ➡️
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:to-fuchsia-400 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-rose-500/20 active:scale-95 transition-all duration-200 cursor-pointer text-2xl relative group ${
          isOpen ? 'rotate-90' : ''
        }`}
        title="Chat with AI Assistant"
      >
        {isOpen ? '❌' : '💬'}
        {!isOpen && (
          <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-right bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md border border-slate-800">
            Ask AI Assistant
          </span>
        )}
      </button>
    </div>
  );
}

export default AIChatbot;
