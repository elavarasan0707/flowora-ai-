import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Coins,
  Instagram,
  Youtube,
  Megaphone,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  Zap,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface DashboardOverviewProps {
  setCurrentTab: (tab: string) => void;
  onOpenCreditsModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setCurrentTab,
  onOpenCreditsModal,
}) => {
  const { user } = useAuth();
  const { brands, activeBrand } = useBrand();
  const [recentItems, setRecentItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, favorites: 0 });

  useEffect(() => {
    api.getContent().then(res => {
      setRecentItems(res.items.slice(0, 5));
      setStats({
        totalItems: res.items.length,
        favorites: res.items.filter(i => i.isFavorite).length,
      });
    }).catch(console.error);
  }, []);

  const quickLaunchers = [
    {
      title: 'Viral Reel Script',
      desc: '15-60s multi-scene script with hooks & captions',
      icon: Instagram,
      color: 'from-pink-500 to-rose-600',
      tab: 'studio-instagram',
      cost: '5 Credits',
    },
    {
      title: '10 Scroll-Stopping Hooks',
      desc: 'Psychological viral triggers to capture attention',
      icon: Sparkles,
      color: 'from-indigo-600 to-violet-600',
      tab: 'studio-instagram',
      cost: '2 Credits',
    },
    {
      title: 'YouTube Video Blueprint',
      desc: 'Shorts & Long-form with timestamps & SEO tags',
      icon: Youtube,
      color: 'from-red-600 to-rose-600',
      tab: 'studio-youtube',
      cost: '10 Credits',
    },
    {
      title: 'High-Converting Ad Copy',
      desc: 'AIDA / PAS copy for Facebook, Instagram & Google',
      icon: Megaphone,
      color: 'from-teal-600 to-emerald-600',
      tab: 'studio-marketing',
      cost: '4 Credits',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Content Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Creator'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed">
            What would you like to create today? Your active Brand Brain is{' '}
            <span className="text-indigo-400 font-semibold">{activeBrand?.name || 'Flowora Standard'}</span>{' '}
            in <span className="text-indigo-300 font-semibold">{activeBrand?.preferredLanguage || 'English'}</span>.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={() => setCurrentTab('studio-instagram')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>Create New Content</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits */}
        <div
          onClick={onOpenCreditsModal}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Credit Balance</span>
            <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user?.credits ?? 0}</div>
          <div className="text-[11px] text-indigo-400 mt-1 font-medium group-hover:underline">
            + Top Up Available
          </div>
        </div>

        {/* Content Created */}
        <div
          onClick={() => setCurrentTab('library')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Saved Content</span>
            <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalItems}</div>
          <div className="text-[11px] text-slate-500 mt-1">In your personal library</div>
        </div>

        {/* Favorites */}
        <div
          onClick={() => setCurrentTab('library')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Favorites</span>
            <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/20" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.favorites}</div>
          <div className="text-[11px] text-slate-500 mt-1">Starred masterpieces</div>
        </div>

        {/* Brand Brains */}
        <div
          onClick={() => setCurrentTab('brand-brain')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Brand Brains</span>
            <BrainCircuit className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{brands.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active client profiles</div>
        </div>
      </div>

      {/* Quick Launchpad Studio Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight">Quick-Create Launchpads</h2>
          <span className="text-xs text-slate-400">Select a tool to start immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLaunchers.map((ql, idx) => {
            const Icon = ql.icon;
            return (
              <div
                key={idx}
                onClick={() => setCurrentTab(ql.tab)}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${ql.color} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {ql.cost}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {ql.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug">{ql.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Generations & Content Shelf */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Generated Content</h2>
            <p className="text-xs text-slate-400">Pick up where you left off or copy to publish</p>
          </div>
          <button
            onClick={() => setCurrentTab('library')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 mb-2">You haven't generated any content yet.</p>
            <button
              onClick={() => setCurrentTab('studio-instagram')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Generate your first Reel Script
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentTab('library')}
                className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="uppercase">{item.contentType.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{item.language}</span>
                      <span>•</span>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 group-hover:text-white flex-shrink-0">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
