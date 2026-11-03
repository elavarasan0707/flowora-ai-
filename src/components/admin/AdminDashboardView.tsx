import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Coins,
  Activity,
  DollarSign,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Search,
  PlusCircle,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';
import { AdminStats, User } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'pricing'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Credit Adjustment Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>('Courtesy customer success credit');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLogs(),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users);
      setLogs(logsRes.logs);
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsAdjusting(true);
    setStatusMsg(null);
    try {
      const res = await api.adjustUserCredits(selectedUser.id, Number(adjustAmount), adjustReason);
      setStatusMsg(res.message);
      setSelectedUser(null);
      await fetchAdminData();
    } catch (e: any) {
      alert(e?.message || 'Adjustment failed');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Flowora AI Administrator Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage accounts, credit ledger anomalies, model cost telemetry, and generation logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Stats KPI Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white">{stats.totalUsers}</div>
            <span className="text-[10px] text-slate-500">{stats.activeUsersCount} Active (7d)</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>AI Generations</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">{stats.totalGenerations}</div>
            <span className="text-[10px] text-emerald-400">{stats.successRate}% Success Rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Credits Consumed</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white">{stats.totalCreditsCharged}</div>
            <span className="text-[10px] text-slate-500">Atomic ledger debits</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Est. Gemini Cost</span>
              <DollarSign className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-bold text-white">{stats.estimatedModelCost}</div>
            <span className="text-[10px] text-slate-500">Flash 3.8 token usage</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Error Anomaly</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-white">{100 - stats.successRate}%</div>
            <span className="text-[10px] text-rose-400">Auto-refunded to users</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'users' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'logs' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Generation Logs ({logs.length})
        </button>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Credits</th>
                <th className="pb-3 font-semibold">Plan</th>
                <th className="pb-3 font-semibold">Registered</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-amber-300">{u.credits}c</td>
                  <td className="py-3 capitalize text-slate-300">{u.plan}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold text-[11px] transition-colors"
                    >
                      Adjust Credits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs Table */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">User ID</th>
                <th className="pb-3 font-semibold">Credits</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 text-slate-200 uppercase">{l.contentType}</td>
                  <td className="py-2.5 text-slate-500 truncate max-w-[100px]">{l.userId}</td>
                  <td className="py-2.5 text-amber-300">{l.creditsCharged}c</td>
                  <td className="py-2.5 text-slate-400">{l.durationMs}ms</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Credit Adjustment Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Adjust User Credits</h3>
            <p className="text-xs text-slate-400 mb-4">
              Modifying balance for <span className="text-white font-semibold">{selectedUser.email}</span> (Current: {selectedUser.credits}c)
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="e.g. 100 or -50"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Promotional upgrade or manual refund"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  {isAdjusting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
