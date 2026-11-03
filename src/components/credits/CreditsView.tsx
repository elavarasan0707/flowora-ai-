import React, { useState, useEffect } from 'react';
import {
  Coins,
  Sparkles,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  ShieldCheck,
  History,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CreditTransaction } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import confetti from 'canvas-confetti';

export const CreditsView: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [creditCosts, setCreditCosts] = useState<Record<string, number>>({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCreditData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        api.getCreditBalance(),
        api.getCreditTransactions(),
      ]);
      setCreditCosts(balRes.creditCosts);
      setTransactions(txRes.transactions);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCreditData();
  }, [user?.credits]);

  const handlePurchase = async (pkgId: string) => {
    setIsPurchasing(true);
    setSuccessMsg(null);
    try {
      const res = await api.purchaseCredits(pkgId);
      updateCredits(res.credits);
      setSuccessMsg(res.message);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      await fetchCreditData();
    } catch (e: any) {
      alert(e?.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const packages = [
    {
      id: 'starter_pack',
      name: 'Creator Spark',
      credits: 200,
      price: '$9.99',
      unitPrice: '$0.05 / credit',
      popular: false,
      features: ['~40 Viral Reels scripts', '~100 Hook variations', 'Tamil & Tanglish AI models', 'Brand Brain integration'],
    },
    {
      id: 'pro_pack',
      name: 'Pro Growth',
      credits: 650,
      price: '$24.99',
      unitPrice: '$0.038 / credit',
      popular: true,
      features: ['~130 Reels or ~65 YouTube scripts', '50+ SEO Blog drafts', 'Unlimited Brand Profiles', 'High-priority AI inference'],
    },
    {
      id: 'agency_pack',
      name: 'Agency Scale',
      credits: 2000,
      price: '$69.99',
      unitPrice: '$0.035 / credit',
      popular: false,
      features: ['~400 Short-form video scripts', 'Unlimited multi-client Brands', 'Export to Markdown & CSV', 'Dedicated audit ledger'],
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Server-Authoritative Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Credit Balance & Transparent Usage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
            Never pay for failed generations. All operations are atomic, idempotency-protected, and refunded on error.
          </p>
        </div>

        {/* Live Balance Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl flex items-center space-x-4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available</div>
            <div className="text-2xl font-black text-white">{user?.credits ?? 0} <span className="text-xs font-normal text-slate-400">Credits</span></div>
            <span className="text-[10px] font-medium text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{user?.plan.toUpperCase()} Plan</span>
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Credit Top-up Packages */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Top-Up Credit Packages</h2>
          <p className="text-xs text-slate-400">Credits never expire. Top up anytime without recurring lock-in.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between relative transition-all ${
                pkg.popular
                  ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-white mb-1">{pkg.name}</h3>
                <div className="flex items-baseline space-x-1.5 mb-1">
                  <span className="text-2xl font-black text-white">{pkg.price}</span>
                  <span className="text-xs text-slate-400">/ one-time</span>
                </div>
                <div className="text-xs font-semibold text-indigo-400 mb-4">
                  {pkg.credits} Credits <span className="text-[11px] text-slate-500 font-normal">({pkg.unitPrice})</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={isPurchasing}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  pkg.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isPurchasing ? 'Processing...' : `Get ${pkg.credits} Credits`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Pricing Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Standard Credit Cost Chart</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Cost per generation is strictly transparent and configured on the server.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Reel Script', cost: 5 },
              { label: '10 Viral Hooks', cost: 2 },
              { label: 'Carousel (8 Slides)', cost: 6 },
              { label: 'Caption & Tags', cost: 2 },
              { label: 'YouTube Shorts', cost: 5 },
              { label: 'YouTube Long-form', cost: 10 },
              { label: 'Ad Copy (AIDA/PAS)', cost: 4 },
              { label: 'SEO Blog Draft', cost: 12 },
              { label: 'WhatsApp Broadcast', cost: 2 },
              { label: 'LinkedIn Post', cost: 3 },
              { label: 'Content Repurpose', cost: 6 },
              { label: 'AI Refinement/Rewrite', cost: 2 },
            ].map((c) => (
              <div key={c.label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium truncate pr-1">{c.label}</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {c.cost}c
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Audit Ledger & History</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Recent deductions, welcome credits, and transaction hashes.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[280px] custom-scrollbar pr-1">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No transactions recorded yet.</div>
            ) : (
              transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 line-clamp-1">{tx.description}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()} • Balance: {tx.balanceAfter}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
