import React, { useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Building2,
  Globe,
  Sliders,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext.tsx';
import { BrandProfile } from '../../types/index.ts';

export const BrandBrainView: React.FC = () => {
  const { brands, activeBrand, setActiveBrand, createBrand, updateBrand, deleteBrand } = useBrand();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [tone, setTone] = useState('Professional & Conversational');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>('English');
  const [brandVoiceExamples, setBrandVoiceExamples] = useState('');
  const [preferredCta, setPreferredCta] = useState('');
  const [wordsToAvoid, setWordsToAvoid] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<BrandProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setIndustry('');
    setDescription('');
    setTargetAudience('');
    setPainPoints('');
    setTone('Professional & Conversational');
    setPreferredLanguage('English');
    setBrandVoiceExamples('');
    setPreferredCta('');
    setWordsToAvoid('');
    setWebsite('');
    setIsEditing(true);
  };

  const openEditModal = (b: BrandProfile) => {
    setEditingId(b.id);
    setName(b.name);
    setIndustry(b.industry);
    setDescription(b.description);
    setTargetAudience(b.targetAudience);
    setPainPoints(b.painPoints);
    setTone(b.tone);
    setPreferredLanguage(b.preferredLanguage);
    setBrandVoiceExamples(b.brandVoiceExamples);
    setPreferredCta(b.preferredCta);
    setWordsToAvoid(b.wordsToAvoid);
    setWebsite(b.website || '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setMessage('Brand name and description are required.');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateBrand(editingId, {
          name,
          industry,
          description,
          targetAudience,
          painPoints,
          tone,
          preferredLanguage,
          brandVoiceExamples,
          preferredCta,
          wordsToAvoid,
          website,
        });
      } else {
        await createBrand({
          name,
          industry,
          description,
          targetAudience,
          painPoints,
          tone,
          preferredLanguage,
          brandVoiceExamples,
          preferredCta,
          wordsToAvoid,
          website,
        });
      }
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to save brand profile');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBrand(brandToDelete.id);
      setBrandToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete brand profile');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Brand Brain™ Personalization</h1>
            <p className="text-xs text-slate-400">
              Teach Flowora AI your unique brand voice, banned words, audience persona, and guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Brand Brain</span>
        </button>
      </div>

      {/* Brand Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {brands.map((b) => {
          const isActive = activeBrand?.id === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setActiveBrand(b)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {b.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">{b.industry || 'General Industry'}</span>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 mb-4">{b.description}</p>

                {/* Details Badges */}
                <div className="space-y-1.5 mb-4 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Language:</span>
                    <span className="font-semibold text-slate-300">{b.preferredLanguage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tone:</span>
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">{b.tone}</span>
                  </div>
                  {b.wordsToAvoid && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Words Avoided:</span>
                      <span className="font-mono text-rose-300 truncate max-w-[150px]">{b.wordsToAvoid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(b);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandToDelete(b);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Create Card Placeholder */}
        <button
          onClick={openCreateModal}
          className="p-6 rounded-3xl border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/20 hover:bg-slate-900/40 transition-all flex flex-col items-center justify-center text-center space-y-2 min-h-[220px] group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 text-slate-400 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-300 group-hover:text-white">Add Another Brand Brain</span>
          <span className="text-[10px] text-slate-500 max-w-xs">
            Manage agency clients or multiple personal projects with isolated personas.
          </span>
        </button>
      </div>

      {/* Edit / Create Brand Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-lg font-bold text-white mb-1">
              {editingId ? 'Edit Brand Brain Profile' : 'Create New Brand Brain Profile'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Flowora AI injects this context into all generation requests to personalize voice and compliance.
            </p>

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Digital or Dr. Ravi Dental"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry / Niche</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Health & Wellness, B2B SaaS"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business & Product Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this brand do, sell, or offer? What problem does it solve?"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Busy startup founders aged 25-45"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Pain Points</label>
                  <input
                    type="text"
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    placeholder="e.g. Lack of time, inconsistent leads"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Voice & Tone</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. Witty, energetic, authoritative"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Tanglish">Tanglish (Viral Spoken)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Words or Buzzwords to Avoid (Banned)
                </label>
                <input
                  type="text"
                  value={wordsToAvoid}
                  onChange={(e) => setWordsToAvoid(e.target.value)}
                  placeholder="e.g. delve, game-changer, synergy, cheap"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={preferredCta}
                    onChange={(e) => setPreferredCta(e.target.value)}
                    placeholder="e.g. DM 'FLOW' to start your free trial"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Voice Examples (Copy & Paste an excerpt of your best writing)
                </label>
                <textarea
                  rows={2}
                  value={brandVoiceExamples}
                  onChange={(e) => setBrandVoiceExamples(e.target.value)}
                  placeholder="Paste a paragraph that captures the rhythm and soul of this brand..."
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving Profile...' : 'Save Brand Brain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Delete Confirmation Modal */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Delete Brand Brain Profile?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <span className="text-white font-semibold">"{brandToDelete.name}"</span>? AI will no longer use these guidelines.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBrandToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBrand}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
