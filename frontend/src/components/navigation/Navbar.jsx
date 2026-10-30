import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plane,
  Building2,
  Train,
  Bus,
  Compass,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bookmark,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, demoSignIn } = useAuthStore();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleDemoLogin = async (role) => {
    try {
      await demoSignIn(role);
      showToast(`Welcome! Logged in as Demo ${role.toUpperCase()}`, 'success');
      setUserDropdownOpen(false);
      if (role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      showToast('Login failed: ' + err.message, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Flights', path: '/flights', icon: Plane },
    { name: 'Hotels', path: '/hotels', icon: Building2 },
    { name: 'Trains', path: '/trains', icon: Train },
    { name: 'Buses', path: '/buses', icon: Bus },
    { name: 'Trip Builder', path: '/trip-builder', icon: Compass, badge: 'Smart' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-ink-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-600 to-coral-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                NOMADLY
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block -mt-1 font-medium">
                Unified Travel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-ink-900/60 p-1.5 rounded-full border border-white/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-glow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Accounts Helper if not logged in */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDemoLogin('customer')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-ink-900 text-slate-200 hover:text-white border border-white/10 hover:border-coral-500/40 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-coral-400" />
                  Traveler Demo
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-glow transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Demo
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-ink-900/90 border border-white/10 hover:border-coral-500/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-coral-500 text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-200 max-w-[100px] truncate leading-tight">
                      {user.displayName}
                    </p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${user.role === 'admin' ? 'text-coral-400' : 'text-teal-400'}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-ink-900 border border-white/10 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-coral-400 hover:bg-coral-500/10 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Bookings & Profile
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Saved & Price Watchlist
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-white/5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-ink-900 text-slate-300 hover:text-white border border-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-ink-950 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-ink-900 border border-white/5 text-xs font-semibold text-slate-200"
                >
                  <Icon className="w-4 h-4 text-coral-500" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    handleDemoLogin('customer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl bg-ink-900 border border-white/10 text-slate-200"
                >
                  Traveler Demo
                </button>
                <button
                  onClick={() => {
                    handleDemoLogin('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl bg-coral-500 text-white"
                >
                  Admin Demo
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-xs font-semibold text-slate-200"
                >
                  My Account ({user.displayName})
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-xs font-semibold text-coral-400"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left p-2 text-xs font-semibold text-rose-400"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
