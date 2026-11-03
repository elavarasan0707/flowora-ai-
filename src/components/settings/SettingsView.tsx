import React, { useState } from 'react';
import {
  User,
  Shield,
  Download,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';

interface SettingsViewProps {
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenLegal }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await updateProfile(name);
      setSuccessMsg('Profile information updated successfully.');
    } catch (e: any) {
      alert(e?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.getContent();
      const blob = new Blob([JSON.stringify(res.items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowora_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export data');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h1 className="text-lg font-bold text-white tracking-tight">Account & Privacy Settings</h1>
        <p className="text-xs text-slate-400">
          Manage your personal details, AI model cadence defaults, and data retention policies.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Identity tied to verified authenticated session
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Export & Privacy */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Data Privacy & Portability (GDPR / CCPA)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Flowora AI never sells your private brand context or drafts to third parties. You own all generated outputs.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export All Generated Content (JSON)</span>
          </button>

          <button
            onClick={() => onOpenLegal('privacy')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Read Privacy Policy</span>
          </button>

          <button
            onClick={() => onOpenLegal('terms')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Terms of Service</span>
          </button>
        </div>
      </div>
    </div>
  );
};
