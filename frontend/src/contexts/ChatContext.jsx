import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [prefs, setPrefs] = useState({ tone: 'empathetic', detail: 'high' });
  const [analytics, setAnalytics] = useState({ msgs: 0, topics: [] });
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('chatPrefs');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      setPrefs(parsed);
      setIsPersonalized(true);
    }
  }, []);

  const addMessage = (role, content) =>
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);

  const clearMessages = () => setMessages([]);

  const updatePrefs = (newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('chatPrefs', JSON.stringify(newPrefs));
    setIsPersonalized(true);
  };

  const value = {
    messages, addMessage, clearMessages,
    prefs, updatePrefs, isPersonalized,
    analytics, setAnalytics,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
