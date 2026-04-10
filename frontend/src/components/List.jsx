import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Edit, CheckSquare, Square, Inbox, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const List = ({ refreshTrigger, onStatsChange }) => {
  const [taskData, setTaskData] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getListData();
  }, [refreshTrigger]);

  const getListData = async () => {
    setIsLoading(true);
    try {
      const result = await fetch('/api/tasks', {
        method: 'GET',
        credentials: 'include',
      });
      const response = await result.json();
      if (response.success) {
        setTaskData(response.result);
      } else {
        toast.error(response.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const result = await fetch(`/api/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const response = await result.json();
      if (response.success) {
        toast.success('Task deleted');
        getListData();
        onStatsChange?.();
      } else {
        toast.error(response.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      const result = await fetch(`/api/update-task/${task._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });
      const response = await result.json();
      if (response.success) {
        setTaskData(prev => prev.map(t => t._id === task._id ? response.result : t));
        onStatsChange?.();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteMultiple = async () => {
    if (selectedTasks.length === 0) return;
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;

    try {
      const result = await fetch('/api/delete-multiple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskIds: selectedTasks }),
      });
      const response = await result.json();
      if (response.success) {
        toast.success(`${selectedTasks.length} tasks deleted`);
        setSelectedTasks([]);
        getListData();
        onStatsChange?.();
      } else {
        toast.error(response.message || 'Bulk delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const selectAll = () => {
    if (selectedTasks.length === taskData.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(taskData.map(item => item._id));
    }
  };

  const selectSingleItem = (id) => {
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter(itemId => itemId !== id));
    } else {
      setSelectedTasks([...selectedTasks, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (taskData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 dark:text-slate-400">
        <Inbox size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
        <p>You're all caught up! Hit "New Task" to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your Tasks</h2>
        <AnimatePresence>
          {selectedTasks.length > 0 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
              onClick={deleteMultiple}
            >
              <Trash2 size={18} />
              <span>Delete ({selectedTasks.length})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Table Header */}
      <div className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50 mb-2">
        <button onClick={selectAll} className="mr-4 focus:outline-none transition-colors hover:text-teal-500">
          {selectedTasks.length === taskData.length && taskData.length > 0 ? (
             <CheckSquare className="text-teal-500" size={20} />
          ) : (
             <Square size={20} />
          )}
        </button>
        <div className="w-8">#</div>
        <div className="flex-1">Task Content</div>
        <div className="w-28 text-right">Actions</div>
      </div>

      <AnimatePresence>
        {taskData.map((item, index) => {
          const isSelected = selectedTasks.includes(item._id);
          return (
            <motion.div 
              key={item._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className={`group flex items-start gap-4 p-4 rounded-2xl transition-all border mb-2 ${
                isSelected 
                ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50' 
                : 'bg-white/40 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 hover:shadow-sm'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                <button onClick={() => selectSingleItem(item._id)} className="text-slate-400 hover:text-teal-500 transition-colors focus:outline-none">
                  {isSelected ? <CheckSquare className="text-teal-500" size={20} /> : <Square size={20} />}
                </button>
              </div>

              <div className="w-6 text-slate-400 font-mono text-sm mt-1">
                 {(index + 1).toString().padStart(2, '0')}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`text-lg font-semibold truncate mb-0.5 transition-colors ${
                  item.isCompleted 
                  ? 'line-through text-slate-400 dark:text-slate-500' 
                  : 'text-slate-800 dark:text-slate-100'
                }`}>
                   {item.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm break-words whitespace-pre-wrap">
                   {item.description}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {/* Toggle complete */}
                <button
                  onClick={() => toggleComplete(item)}
                  title={item.isCompleted ? 'Mark as pending' : 'Mark complete'}
                  className={`p-2 rounded-lg transition-colors ${
                    item.isCompleted 
                    ? 'text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                    : 'text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                  }`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <Link 
                  to={`/update/${item._id}`} 
                  className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => deleteTask(item._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default List;
