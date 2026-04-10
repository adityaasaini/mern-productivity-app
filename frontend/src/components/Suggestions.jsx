import React from 'react';
import { useChat } from '../contexts/ChatContext';

const suggestions = [
  'Show my tasks',
  'Give productivity tips',
  'Analyze my task list',
  'More suggestions'
];

const Suggestions = () => {
  const { addMessage } = useChat();

  const handleSuggestion = (suggestion) => {
    addMessage('user', suggestion);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 rounded-2xl backdrop-blur-md fade-in-slide">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => handleSuggestion(suggestion)}
          className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all backdrop-blur-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default Suggestions;
