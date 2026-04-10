import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UpdateTask = () => {
  const [taskData, setTaskData] = useState({ title: '', description: '' });
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getTaskDetail();
  }, []);

  const getTaskDetail = async () => {
    try {
      let result = await fetch(`/api/task/${params.id}`, {
        method: 'GET',
        credentials: 'include'
      });
      let response = await result.json();

      if (response.success) {
        setTaskData({
          title: response.result.title,
          description: response.result.description
        });
      } else {
        toast.error("Failed to load task details");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      let result = await fetch(`/api/update-task/${params.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      let response = await result.json();

      if (response.success) {
        toast.success("Task updated successfully!");
        navigate('/');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Update failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-teal-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 relative overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative z-10"
      >
        <div className="p-8 md:p-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-600 mb-8 tracking-tight">
            Update Task
          </h1>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input 
                type="text" 
                name="title" 
                value={taskData.title}
                onChange={handleInput} 
                className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white shadow-sm"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea 
                name="description" 
                value={taskData.description}
                onChange={handleInput} 
                rows="5" 
                className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none dark:text-white shadow-sm"
                required
              />
            </div>

            <div className="pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-[0_8px_30px_rgb(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateTask;
