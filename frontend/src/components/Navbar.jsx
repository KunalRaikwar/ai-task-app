import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 p-0.5 shadow-lg shadow-primary-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary-500 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI Task Processor
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Asynchronous Engine</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-dark-800 border border-slate-700/50 px-4 py-2 rounded-full shadow-inner">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-red-500/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 font-medium transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
