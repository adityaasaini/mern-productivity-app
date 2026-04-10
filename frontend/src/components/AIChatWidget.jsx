/**
 * AIChatWidget.jsx — Premium Glassmorphism AI Chat Panel
 *
 * API Contract (agreed with Agent 1 / Backend Architect):
 *   Endpoint : POST /api/ai
 *   Auth     : HTTP-only cookie (credentials: 'include') — NO userId in body
 *   Request  : { message: string }
 *   Response : { success: boolean, response: string }
 *
 * The widget lives in the bottom-right corner of the screen.
 * It uses ChatContext for persistent message history across re-renders.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

// ── Typing Indicator ──────────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 py-1 px-1">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-teal-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

// ── Single Message Bubble ─────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Bot size={14} className="text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={`group max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-teal-500 to-indigo-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-600 rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
      </div>
    </motion.div>
  );
};

// ── Suggestion Chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'List my pending tasks',
  'What should I focus on first?',
  'How many tasks do I have?',
  'Summarize my workload',
];

// ── Main Widget ───────────────────────────────────────────────────────────────
const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, addMessage, clearMessages } = useChat();

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation settle before focusing
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 100);
  };

  // ── Send Message ────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || isLoading) return;

    addMessage('user', userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Auth via httpOnly JWT cookie — do NOT send userId in body (security fix)
        credentials: 'include',
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('agent', data.response);
      } else {
        addMessage('agent', `⚠️ ${data.error || 'AI service unavailable right now.'}`);
      }
    } catch (err) {
      addMessage('agent', '⚠️ Network error. Please check if the backend is running on port 3200.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => clearMessages();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[420px] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-white/10 dark:border-slate-700/60"
            style={{ maxHeight: 'min(560px, 80vh)' }}
          >
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-teal-600 to-indigo-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold leading-tight">Jarvis AI</p>
                  <p className="text-white/60 text-xs">Your task intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 px-4 py-4 space-y-4 scroller"
            >
              {/* Welcome screen */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 flex items-center justify-center border border-teal-500/20">
                    <Bot size={32} className="text-teal-500" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Hello! I'm Jarvis</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ask me anything about your tasks.
                  </p>

                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center mt-5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl rounded-tl-sm px-3 py-1.5 shadow-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll-to-bottom pill */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-[80px] left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-600"
                >
                  <ChevronDown size={13} /> New messages
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── Input ── */}
            <div className="flex-shrink-0 px-4 pb-4 pt-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-transparent focus-within:border-teal-500 transition-colors px-1 py-1">
                <textarea
                  ref={inputRef}
                  id="ai-chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your tasks…"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent resize-none border-none outline-none py-2.5 px-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 max-h-32 min-h-[44px] disabled:opacity-60"
                />
                <motion.button
                  id="ai-chat-send-btn"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-gradient-to-br from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl mb-1 mr-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-2">
                Powered by Gemini AI · Your tasks are private
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Toggle Button ── */}
      <motion.button
        id="ai-chat-toggle-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="relative bg-gradient-to-br from-teal-500 to-indigo-600 text-white p-4 rounded-full shadow-[0_8px_32px_rgba(99,102,241,0.45)] flex items-center justify-center pulse-glow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={26} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot — shows when chat is closed and there are messages */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChatWidget;
