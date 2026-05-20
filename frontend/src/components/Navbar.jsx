import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, User, LogOut, Coins, Home, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
              <Sparkles className="w-6 h-6 text-primary animate-pulse-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Nexus<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm hidden sm:flex">
                  <Home className="w-4 h-4" /> Home
                </Link>
                <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                
                <Link to="/create" className="btn-primary flex items-center gap-2 py-2 px-4 text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Create
                </Link>
                
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-yellow-500/90">{user.credits}</span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      Profile & History
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm font-semibold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
