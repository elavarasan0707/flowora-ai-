import React, { useState } from 'react';
import {
  Sparkles,
  Coins,
  ChevronDown,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Settings,
  Briefcase,
  Plus,
  Zap,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreditsModal: () => void;
  onOpenAuthModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setCurrentTab,
  onOpenCreditsModal,
  onOpenAuthModal,
  onToggleMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const { brands, activeBrand, setActiveBrand } = useBrand();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Hamburger Toggle for Phone & Tablet */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setCurrentTab('overview')}
          className="flex items-center space-x-2 sm:space-x-2.5 group text-left focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                FLOWORA
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 tracking-wide font-medium">
              Ideas Flow. Content Connects.
            </p>
          </div>
        </button>

        {/* Active Brand Brain Selector */}
        {user && (
          <div className="relative ml-4 hidden sm:block">
            <button
              onClick={() => {
                setBrandMenuOpen(!brandMenuOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[120px] truncate font-medium">
                {activeBrand ? activeBrand.name : 'No Brand Selected'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {brandMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setBrandMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Brand Brain
                </div>
                {brands.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center">
                    No brands created yet.
                  </div>
                ) : (
                  brands.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBrand(b)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                        activeBrand?.id === b.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-500">{b.preferredLanguage}</span>
                    </button>
                  ))
                )}
                <div className="p-1 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentTab('brand-brain')}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage Brands</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            {/* Credits Pill */}
            <button
              onClick={onOpenCreditsModal}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-950/30 transition-all duration-200"
              title="Click to view balance and top up credits"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {user.credits} <span className="text-slate-400 font-normal hidden sm:inline">Credits</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                + Top Up
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setBrandMenuOpen(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 pr-0.5" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                        {user.plan} plan
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setCurrentTab('overview')}
                      className="w-full px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2.5"
                    >
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>Dashboard Overview</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('settings')}
                      className="w-full px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2.5"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={onOpenCreditsModal}
                      className="w-full px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2.5"
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Credits & Plans</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="w-full px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 flex items-center space-x-2.5 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Administrator Panel</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => logout()}
                      className="w-full px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center space-x-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50"
            >
              Get Started Free
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
