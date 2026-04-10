import React from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  let timeStr = "";
  if (message.timestamp) {
     timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 fade-in-slide`}>
      <div 
        className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-3xl shadow-sm backdrop-blur-md transition-all hover:shadow-md ${
          isUser 
          ? 'bg-teal-500 text-white rounded-br-md' 
          : 'bg-white/60 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-bl-md text-slate-800 dark:text-slate-100'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {timeStr && (
          <span className={`text-xs opacity-75 mt-2 block ${isUser ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {timeStr}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
