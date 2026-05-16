import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { PlusCircle, Play, RefreshCw, CheckCircle2, AlertCircle, Clock, Trash2, Eye, Terminal, Sparkles, FileText, LayoutGrid, Activity } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operation, setOperation] = useState('uppercase');

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { API_BASE_URL, token } = useAuth();
  const pollInterval = useRef(null);

  const fetchTasks = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for task status updates every 3 seconds
  useEffect(() => {
    fetchTasks(true);
    pollInterval.current = setInterval(() => {
      fetchTasks(false);
    }, 3000);

    return () => clearInterval(pollInterval.current);
  }, []);

  // Poll modal task details if open and not success/failed
  useEffect(() => {
    let modalInterval;
    if (isModalOpen && selectedTaskId) {
      const fetchDetails = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/tasks/${selectedTaskId}`);
          setModalTask(res.data.task);
        } catch (err) {
          console.error('Error fetching modal task details:', err);
        }
      };
      fetchDetails();
      modalInterval = setInterval(fetchDetails, 2000);
    }
    return () => clearInterval(modalInterval);
  }, [isModalOpen, selectedTaskId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !inputText) {
      setError('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        title,
        inputText,
        operation
      });
      
      setSuccessMsg('Task successfully dispatched to background worker queue!');
      setTitle('');
      setInputText('');
      fetchTasks(false);
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectTask = (id) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task record?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
        );
      case 'running':
        return (
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse shadow-sm shadow-blue-500/10">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-rose-500/10">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-amber-500/10">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary-500 animate-pulse" />
            <span>Asynchronous Control Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch high-throughput AI operations and track distributed worker execution in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-dark-800 border border-slate-700 rounded-xl flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-medium text-slate-300">Workers Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Form, Right Column Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Task Form (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-primary-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span>Create New AI Task</span>
            </h2>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Task Title / Identifier</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Document Sentiment Analysis"
                  className="glass-input w-full py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Operation Type</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="glass-input w-full py-2.5 text-sm bg-dark-900 border-slate-700 text-slate-200"
                >
                  <option value="uppercase">Uppercase Transformation</option>
                  <option value="lowercase">Lowercase Transformation</option>
                  <option value="reverse">String Reversal</option>
                  <option value="word_count">Advanced Word & Character Count</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Input Text Payload</label>
                <textarea
                  required
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter the raw text input payload for processing..."
                  className="glass-input w-full py-2.5 text-sm font-mono resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-xl shadow-primary-500/20"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching to Queue...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Task Asynchronously</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Task List Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-accent-500" />
              <span>Execution Queue & Status</span>
            </h2>
            <button
              onClick={() => fetchTasks(true)}
              className="p-2 bg-dark-800 hover:bg-dark-700 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center border border-slate-800 rounded-3xl bg-dark-800/40 backdrop-blur-sm">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-slate-400 font-medium">Syncing with distributed task cluster...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-3xl bg-dark-800/40 p-6 text-center">
              <Terminal className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Tasks Dispatched Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Create your first AI task from the control panel to see real-time asynchronous background execution.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleInspectTask(task._id)}
                  className="glass-card p-4 hover:border-slate-600 cursor-pointer transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                          {task.title}
                        </h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="px-2 py-0.5 bg-dark-900 border border-slate-700/80 rounded-md uppercase font-mono text-[10px] text-accent-400">
                          {task.operation}
                        </span>
                        <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspectTask(task._id); }}
                        className="px-3 py-1.5 bg-dark-900 hover:bg-primary-500/20 border border-slate-700 hover:border-primary-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary-400" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteTask(task._id, e)}
                        className="p-1.5 bg-dark-900 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 rounded-xl text-slate-400 hover:text-rose-400 transition-all"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details & Logs Inspector Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={modalTask}
      />
    </div>
  );
};

export default Dashboard;
