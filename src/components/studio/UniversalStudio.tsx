import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Send,
  Coins,
  Globe,
  Sliders,
  FileCode,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { EditorWorkspace } from './EditorWorkspace.tsx';

export const UniversalStudio: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { brands, activeBrand } = useBrand();

  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Multi-Platform');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>(activeBrand?.preferredLanguage || 'English');
  const [tone, setTone] = useState('Authentic & Engaging');
  const [targetAudience, setTargetAudience] = useState(activeBrand?.targetAudience || '');
  const [requiredFacts, setRequiredFacts] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [preferredCta, setPreferredCta] = useState(activeBrand?.preferredCta || '');
  const [selectedBrandId, setSelectedBrandId] = useState(activeBrand?.id || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cost = 4;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTopic = topic.trim() || (referenceText.trim() ? referenceText.trim().split('\n')[0].slice(0, 100) : '');
    if (!effectiveTopic) {
      setError('Please provide a topic or paste your context.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const res = await api.generate({
        contentType: 'universal',
        category: 'universal',
        topic: effectiveTopic,
        platform,
        language,
        tone,
        targetAudience,
        requiredFacts,
        referenceText,
        preferredCta,
        brandId: selectedBrandId || undefined,
        idempotencyKey: `gen_uni_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      });

      updateCredits(res.remainingCredits);
      if (res.savedItem) {
        setGeneratedItem(res.savedItem);
      } else {
        setGeneratedItem({
          id: 'temp_uni_' + Date.now(),
          userId: user?.id || '',
          title: `Universal Content: ${topic.slice(0, 30)}`,
          contentType: 'universal',
          category: 'universal',
          prompt: topic,
          inputs: {},
          content: res.content,
          language,
          version: 1,
          versionsHistory: [],
          isFavorite: false,
          isDraft: false,
          tags: ['universal'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (refinementType: any, options?: any) => {
    if (!generatedItem) return;
    setIsRefining(true);
    try {
      const res = await api.refine({
        contentId: generatedItem.id,
        currentContent: generatedItem.content,
        refinementType,
        options,
      });
      updateCredits(res.remainingCredits);
      setGeneratedItem({
        ...generatedItem,
        content: res.content,
        version: generatedItem.version + 1,
        versionsHistory: [
          {
            versionNumber: generatedItem.version,
            content: generatedItem.content,
            timestamp: new Date().toISOString(),
            summary: `Refined: ${refinementType}`,
          },
          ...generatedItem.versionsHistory,
        ],
      });
    } catch (err: any) {
      setError(err?.message || 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Input Parameters Form */}
      <div className="w-full lg:w-5/12 flex flex-col space-y-4">
        {/* Header Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">AI Content Studio</h1>
                <p className="text-xs text-slate-400">Universal generator for any custom brief & format</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{cost} Credits</span>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Topic, Prompt or Assignment *
            </label>
            <textarea
              required
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Write a comprehensive customer case study narrative about how our productivity tool saved an agency 15 hours a week"
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Language Cadence</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'English', label: 'English' },
                { id: 'Tamil', label: 'தமிழ்' },
                { id: 'Tanglish', label: 'Tanglish' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id as any)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    language === lang.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Target</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Multi-Platform">Multi-Platform</option>
                <option value="Social Media">Social Media</option>
                <option value="Website & Blog">Website & Blog</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Presentation / Pitch">Presentation / Pitch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Brain</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Default Voice</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Required Facts or Key Points
            </label>
            <input
              type="text"
              value={requiredFacts}
              onChange={(e) => setRequiredFacts(e.target.value)}
              placeholder="e.g. 500+ active beta testers, launch date Nov 1"
              className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Generating Universal Content with Gemini...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate Content ({cost} Credits)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Editor Output Column */}
      <div className="w-full lg:w-7/12 flex flex-col min-h-[500px]">
        <EditorWorkspace
          item={generatedItem}
          onUpdateItem={(updated) => setGeneratedItem(updated)}
          onRefineContent={handleRefine}
          isRefining={isRefining}
        />
      </div>
    </div>
  );
};
