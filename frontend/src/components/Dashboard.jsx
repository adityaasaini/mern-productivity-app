import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, CircleDashed, BarChart3, User } from 'lucide-react';
import List from './List';
import AddTask from './AddTask';
import AIChatWidget from './AIChatWidget';

const Dashboard = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem('userEmail') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tasks/stats', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (_) {
      // Silently fail — stats are non-critical
    }
  };

  const handleTaskAdded = () => {
    setIsAddModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-600 dark:from-teal-400 dark:to-indigo-400 tracking-tight"
            >
              Task Nexus
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 flex flex-wrap items-center gap-2"
            >
              {userInfo.email && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full font-medium">
                  <User size={12} /> {userInfo.email}
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Master your day with AI-powered task management.
              </span>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/progress"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl shadow-sm transition-all font-medium"
              >
                <span>📈 View Progress</span>
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              id="dashboard-add-task-btn"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl shadow-lg shadow-teal-500/30 transition-all font-medium"
            >
              <Plus size={20} />
              <span>New Task</span>
            </motion.button>
          </div>
        </header>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-[2rem] shadow-2xl p-6 md:p-8"
            >
              <List refreshTrigger={refreshTrigger} onStatsChange={fetchStats} />
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                <BarChart3 size={20} className="text-teal-500" /> Quick Insights
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Live stats from your tasks</p>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CircleDashed className="text-amber-500" size={20} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending</span>
                  </div>
                  <span className="font-bold text-xl text-amber-500">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-teal-500" size={20} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completed</span>
                  </div>
                  <span className="font-bold text-xl text-teal-500">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-teal-50 dark:from-teal-900/20 to-indigo-50 dark:to-indigo-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Tasks</span>
                  <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-600">{stats.total}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 p-4 bg-teal-600 text-white rounded-full shadow-[0_8px_30px_rgb(13,148,136,0.5)] z-40"
      >
        <Plus size={24} />
      </motion.button>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddTask 
             onClose={() => setIsAddModalOpen(false)} 
             onSuccess={handleTaskAdded} 
          />
        )}
      </AnimatePresence>

      {/* The floating AI agent */}
      <AIChatWidget />
    </div>
  );
};

export default Dashboard;
