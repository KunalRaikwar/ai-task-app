import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, RefreshCw, Terminal, FileText } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/80 flex items-center justify-between bg-dark-900/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
              {getStatusBadge(task.status)}
            </div>
            <p className="text-xs text-slate-400">Task ID: <span className="font-mono text-slate-300">{task._id}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-900/60 border border-slate-700/50 rounded-2xl">
              <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Operation</span>
              <span className="font-mono text-primary-400 font-semibold px-2.5 py-1 bg-primary-500/10 rounded-lg border border-primary-500/20 inline-block">
                {task.operation}
              </span>
            </div>
            <div className="p-4 bg-dark-900/60 border border-slate-700/50 rounded-2xl">
              <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Created At</span>
              <span className="text-slate-200 font-medium text-sm">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Input Text */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary-500" /> Input Payload
            </h3>
            <div className="p-4 bg-dark-900 border border-slate-700 rounded-2xl text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {task.inputText}
            </div>
          </div>

          {/* Output Result */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Final Result
            </h3>
            <div className="p-4 bg-dark-900 border border-slate-700 rounded-2xl text-slate-200 text-sm font-mono whitespace-pre-wrap min-h-20 max-h-60 overflow-y-auto">
              {task.result ? (
                typeof task.result === 'object' ? JSON.stringify(task.result, null, 2) : String(task.result)
              ) : (
                <span className="text-slate-500 italic">No result generated yet...</span>
              )}
            </div>
          </div>

          {/* Execution Logs */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-accent-500" /> Execution Step Logs
            </h3>
            <div className="p-4 bg-dark-900 border border-slate-700 rounded-2xl font-mono text-xs space-y-2.5 max-h-60 overflow-y-auto">
              {task.logs && task.logs.length > 0 ? (
                task.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 text-slate-300 border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500 text-[10px] pt-0.5 select-none shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="flex-1 text-slate-300 leading-relaxed">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">No logs available...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/80 bg-dark-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
