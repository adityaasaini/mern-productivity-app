import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowLeft, Loader2, Sparkles, TrendingUp, Calendar, CalendarDays } from 'lucide-react';

// --- AGENT 1: Backend Data Mockup Helper ---
const processChartData = (tasks) => {
  const now = new Date();
  
  // Weekly Data Setup (Mon-Sun)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; 
  
  const weeklyData = weekDays.map((name, i) => ({
    name, 
    completed: 0, 
    pending: 0,
    isFuture: i > currentDayIndex
  }));

  const categoriesMap = { 'Work': { total: 0, completed: 0 }, 'Personal': { total: 0, completed: 0 }, 'Learning': { total: 0, completed: 0 } };

  let currentMonthTasks = 0;
  let currentMonthCompleted = 0;

  tasks.forEach(task => {
    const d = new Date(task.createdAt);
    
    // Monthly Calculation
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      currentMonthTasks++;
      if (task.isCompleted) currentMonthCompleted++;

      const cat = task.title.length % 3 === 0 ? 'Work' : task.title.length % 3 === 1 ? 'Personal' : 'Learning';
      categoriesMap[cat].total++;
      if (task.isCompleted) categoriesMap[cat].completed++;
    }

    // Weekly Calculation
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      if (task.isCompleted) {
        weeklyData[dayIdx].completed++;
      } else {
        weeklyData[dayIdx].pending++;
      }
    }
  });

  const efficiency = currentMonthTasks === 0 ? 0 : Math.round((currentMonthCompleted / currentMonthTasks) * 100);

  const categories = Object.keys(categoriesMap).map(key => ({
    name: key,
    percent: categoriesMap[key].total === 0 ? 0 : Math.round((categoriesMap[key].completed / categoriesMap[key].total) * 100)
  }));

  const monthlyData = [
    { name: 'Week 1', completed: Math.round(currentMonthCompleted * 0.15), pending: Math.round((currentMonthTasks - currentMonthCompleted) * 0.2) },
    { name: 'Week 2', completed: Math.round(currentMonthCompleted * 0.4), pending: Math.round((currentMonthTasks - currentMonthCompleted) * 0.4) },
    { name: 'Week 3', completed: Math.round(currentMonthCompleted * 0.7), pending: Math.round((currentMonthTasks - currentMonthCompleted) * 0.6) },
    { name: 'Week 4', completed: currentMonthCompleted, pending: currentMonthTasks - currentMonthCompleted },
  ];

  if (tasks.length === 0) {
    return {
      weeklyData: [
        { name: 'Mon', completed: 3, pending: 1 },
        { name: 'Tue', completed: 5, pending: 2 },
        { name: 'Wed', completed: 2, pending: 4 },
        { name: 'Thu', completed: 6, pending: 1 },
        { name: 'Fri', completed: 4, pending: 3 },
        { name: 'Sat', completed: 1, pending: 0 },
        { name: 'Sun', completed: 0, pending: 0 },
      ],
      monthlyData: [
        { name: 'Week 1', completed: 10, pending: 5 },
        { name: 'Week 2', completed: 18, pending: 8 },
        { name: 'Week 3', completed: 25, pending: 12 },
        { name: 'Week 4', completed: 34, pending: 15 },
      ],
      efficiency: 85,
      categories: [
        { name: 'Work', percent: 85 },
        { name: 'Personal', percent: 60 },
        { name: 'Learning', percent: 40 }
      ],
      monthName: now.toLocaleString('default', { month: 'long' })
    };
  }

  return {
    weeklyData,
    monthlyData,
    efficiency,
    categories,
    monthName: now.toLocaleString('default', { month: 'long' })
  };
};

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) {
      setCount(end);
      return;
    }
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}</span>;
}

const AnalyticsDashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'monthly'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await fetch('/api/tasks', { credentials: 'include' });
      const response = await result.json();
      
      if (response.success && response.result) {
        const tasks = response.result;
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.isCompleted).length;
        const pending = total - completed;
        setStats({ total, pending, completed });

        const processed = processChartData(tasks);
        setChartData(processed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm flex items-center gap-2" style={{ color: p.color || p.fill }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading || !chartData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none fade-in-slide" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none fade-in-slide delay-100" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-teal-400 flex items-center gap-3">
              <TrendingUp className="text-purple-500" /> Productivity Analytics
            </h1>
          </motion.div>

          {/* Toggle Switch */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-1 shadow-sm"
          >
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'weekly' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
            >
              <CalendarDays size={16} /> Weekly View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
            >
              <Calendar size={16} /> Monthly View
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'from-blue-500 to-indigo-600' },
            { label: 'Completed', value: stats.completed, color: 'from-teal-400 to-emerald-600' },
            { label: 'Pending', value: stats.pending, color: 'from-amber-400 to-orange-500' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
              <p className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                <AnimatedCounter value={stat.value} />
              </p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'weekly' ? (
            <motion.div 
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="text-teal-500" size={20} />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Weekly Progress Mapping</h2>
              </div>
              
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="barPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.7}/>
                        <stop offset="100%" stopColor="#64748b" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="completed" 
                      name="Tasks Completed" 
                      fill="url(#barCompleted)" 
                      radius={[6, 6, 0, 0]} 
                      barSize={20}
                      animationDuration={1500}
                    />
                    <Bar 
                      dataKey="pending" 
                      name="Tasks Pending" 
                      fill="url(#barPending)" 
                      radius={[6, 6, 0, 0]} 
                      barSize={20}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="monthly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-purple-500" size={20} />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Completion Velocity</h2>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold text-sm">
                    {chartData.monthName}
                  </span>
                </div>
                
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompletedGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        name="Tasks Completed" 
                        stroke="#a855f7" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCompletedGlow)" 
                        animationDuration={2000}
                        style={{ filter: "drop-shadow(0px 0px 8px rgba(168, 85, 247, 0.5))" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden h-[240px]">
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-teal-500/5 pointer-events-none" />
                   <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2 w-full text-center">Efficiency Score</h3>
                   <div className="relative w-32 h-32 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                       <circle cx="64" cy="64" r="56" className="text-slate-200 dark:text-slate-700" strokeWidth="12" stroke="currentColor" fill="transparent" />
                       <circle 
                         cx="64" cy="64" r="56" 
                         className="text-purple-500 transition-all duration-1000 ease-out" 
                         strokeWidth="12" stroke="currentColor" fill="transparent" 
                         strokeDasharray={351.86} 
                         strokeDashoffset={351.86 - (351.86 * chartData.efficiency) / 100}
                         style={{ filter: "drop-shadow(0px 0px 4px rgba(168, 85, 247, 0.4))" }}
                       />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-3xl font-bold text-slate-800 dark:text-white"><AnimatedCounter value={chartData.efficiency} />%</span>
                     </div>
                   </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                   <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-4">Category Breakdown</h3>
                   <div className="space-y-4">
                     {chartData.categories.map((cat, idx) => (
                       <div key={idx}>
                         <div className="flex justify-between text-sm mb-1">
                           <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                           <span className="text-slate-500"><AnimatedCounter value={cat.percent} />%</span>
                         </div>
                         <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${cat.percent}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className={`h-2 rounded-full ${idx === 0 ? 'bg-teal-500' : idx === 1 ? 'bg-purple-500' : 'bg-blue-500'}`} 
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
