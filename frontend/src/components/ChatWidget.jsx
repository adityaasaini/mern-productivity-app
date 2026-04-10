import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Using context directly or state
  const { messages, addMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    addMessage('user', userMsg);
    setInput('');
    setIsLoading(true);

    try {
      let userEmailObj = {};
      try {
        userEmailObj = JSON.parse(localStorage.getItem('userEmail') || '{}');
      } catch(e) {}
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg, userId: userEmailObj.id || null }),
      });
      const data = await response.json();
      if (data.success) {
        addMessage('agent', data.response);
      } else {
        addMessage('agent', 'Sorry, AI service unavailable.');
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

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Bot size={24} />
                  <span className="font-semibold text-lg">Jarvis AI</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 space-y-4 scroller">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
                    <Bot size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Hello there!</p>
                    <p className="text-sm">I am Jarvis, your task assistant. How can I help you today?</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm animate-pulse ml-2">
                    <Bot size={16} /> Jarvis is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-row items-end gap-2 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-transparent focus-within:border-teal-500 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your tasks..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-4 outline-none text-slate-800 dark:text-slate-100"
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl mb-1 mr-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center transition-all"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </motion.button>
      </div>
    </>
  );
};

export default ChatWidget;
