import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';

const Navbar = () => {
  const navigate = useNavigate();
  // ── Bug Fix: Theme Toggle State ──────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  // ── Bug Fix: Reactive auth state ─────────────────────────────
  // The old code did `!!localStorage.getItem('token')` directly in the component
  // body — this only runs ONCE per render cycle and never re-evaluates when
  // localStorage changes (e.g. after login/logout). Fix: useState + listeners.
  const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const sync = () => setIsLogged(!!localStorage.getItem('token'));
    // Native storage event fires for cross-tab changes
    window.addEventListener('storage', sync);
    // Custom event fired by Login.jsx and the logout handler below
    window.addEventListener('storageChange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('storageChange', sync);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Server-side: clear httpOnly cookie
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {
      // Proceed with client-side cleanup even if network fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('storageChange'));
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-slate-900/50 rounded-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
            <Bot size={16} />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">
            Task Nexus
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Dark/Light Mode Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {isLogged ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              id="navbar-logout-btn"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          ) : (
            <>
              <Link
                to="/login"
                id="navbar-login-link"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors px-3 py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/signup"
                id="navbar-signup-link"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-lg shadow-sm shadow-teal-500/20 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

