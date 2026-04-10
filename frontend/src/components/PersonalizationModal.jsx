import React from 'react';
import { useChat } from '../contexts/ChatContext';

const PersonalizationModal = () => {
  const { prefs, updatePrefs, isPersonalized } = useChat();
  const [tone, setTone] = React.useState(prefs.tone);
  const [detail, setDetail] = React.useState(prefs.detail);

  const savePrefs = () => {
    updatePrefs({ tone, detail });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in-slide">
      <div className="bg-white/80 dark:bg-gray-900/90 border border-white/40 dark:border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
          Personalize Me
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tone</label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="empathetic">Empathetic & Friendly</option>
              <option value="professional">Professional</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Detail Level</label>
            <select 
              value={detail} 
              onChange={(e) => setDetail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="high">High Detail</option>
              <option value="medium">Medium</option>
              <option value="low">Brief</option>
            </select>
          </div>
        <button
          onClick={savePrefs}
          className="w-full mt-8 p-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Let's Begin!
        </button>
      </div>
  );
};

export default PersonalizationModal;
