import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import PersonalizationModal from './PersonalizationModal';
import Suggestions from './Suggestions';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, addMessage, prefs, isPersonalized, analytics, setAnalytics, isDark } = useChat();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    addMessage('user', userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg, userId: JSON.parse(localStorage.getItem('userEmail') || '{}').id || null }),
      });
      const data = await response.json();
      if (data.success) {
        addMessage('agent', data.response);
        setAnalytics(prev => ({ ...prev, msgs: prev.msgs + 1 }));
      } else {
        addMessage('agent', 'Sorry, AI service unavailable. Check backend /api/ai.');
      }
    } catch (error) {
      addMessage('agent', 'Network error. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('storageChange'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 flex flex-col">
      {!isPersonalized && <PersonalizationModal />}
      <header className="flex justify-between items-center mb-6 fade-in-slide">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Apex Omni-Agent
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 -mr-4 scroller">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20 fade-in-slide">
              <p className="text-2xl mb-4">Hello! I'm your Premium Omni-Agent.</p>
              <p>Ask about your tasks or anything else.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <Suggestions />

        <div className="input-area mt-6 fade-in-slide">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Enter to send)"
              className="flex-1 p-4 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/30 backdrop-blur-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder-gray-500"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
      </div>

      <AnalyticsDashboard />

      {isLoading && (
        <div className="fixed bottom-20 right-4 p-4 bg-teal-500 text-white rounded-full shadow-lg fade-in-slide">
          Agent is thinking...
        </div>
      )}
    </div>
  );
};
