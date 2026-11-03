import React, { useState } from 'react';
import { X, Coins, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import confetti from 'canvas-confetti';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLedger?: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose, onViewLedger }) => {
  const { user, updateCredits } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = async (pkgId: string) => {
    setIsPurchasing(true);
    setMessage(null);
    try {
      const res = await api.purchaseCredits(pkgId);
      updateCredits(res.credits);
      setMessage(res.message);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (e: any) {
      alert(e?.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Flowora AI Credits</h2>
            <p className="text-xs text-slate-400">
              Current Balance: <span className="text-white font-bold">{user?.credits ?? 0} Credits</span>
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Creator Spark</div>
              <div className="text-lg font-black text-white mt-1">$9.99</div>
              <div className="text-xs font-semibold text-indigo-400 mb-2">200 Credits</div>
              <span className="text-[10px] text-slate-400 block mb-3">~40 Viral Reels</span>
            </div>
            <button
              onClick={() => handleBuy('starter_pack')}
              disabled={isPurchasing}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Select
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500 shadow-lg flex flex-col justify-between relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.2 rounded-full bg-indigo-600 text-[9px] font-bold text-white uppercase">
              Best Value
            </span>
            <div>
              <div className="text-xs font-bold text-white">Pro Growth</div>
              <div className="text-lg font-black text-white mt-1">$24.99</div>
              <div className="text-xs font-semibold text-indigo-400 mb-2">650 Credits</div>
              <span className="text-[10px] text-slate-400 block mb-3">~130 Reels or 65 YT</span>
            </div>
            <button
              onClick={() => handleBuy('pro_pack')}
              disabled={isPurchasing}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              Select
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Agency Scale</div>
              <div className="text-lg font-black text-white mt-1">$69.99</div>
              <div className="text-xs font-semibold text-indigo-400 mb-2">2,000 Credits</div>
              <span className="text-[10px] text-slate-400 block mb-3">~400 Short Scripts</span>
            </div>
            <button
              onClick={() => handleBuy('agency_pack')}
              disabled={isPurchasing}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Select
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          {onViewLedger && (
            <button
              onClick={() => {
                onClose();
                onViewLedger();
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View Full Transaction Ledger →
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-slate-400 hover:text-white ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
