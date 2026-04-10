import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Protected from './components/Protected';
import UpdateTask from './components/UpdateTask';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <Toaster position="top-right" richColors />
        <Navbar />
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/progress" element={<Protected><AnalyticsDashboard /></Protected>} />
          <Route path="/update/:id" element={<Protected><UpdateTask /></Protected>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </ChatProvider>
  );
}

export default App;
