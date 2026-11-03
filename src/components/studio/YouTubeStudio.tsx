import React, { useState } from 'react';
import {
  Youtube,
  Sparkles,
  Video,
  ListOrdered,
  FileSearch,
  Clock,
  Send,
  Coins,
  Globe,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { EditorWorkspace } from './EditorWorkspace.tsx';

export const YouTubeStudio: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { brands, activeBrand } = useBrand();

  const [tool, setTool] = useState<'youtube_shorts' | 'youtube_longform' | 'youtube_titles_desc'>('youtube_shorts');
  const [topic, setTopic] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [channelNiche, setChannelNiche] = useState('Tech, SaaS & Business');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>(
    (activeBrand?.preferredLanguage as any) || 'Tanglish'
  );
  const [tone, setTone] = useState('Engaging & Educational');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [preferredCta, setPreferredCta] = useState('Subscribe and click the bell icon!');
  const [selectedBrandId, setSelectedBrandId] = useState(activeBrand?.id || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toolCosts: Record<string, number> = {
    youtube_shorts: 5,
    youtube_longform: 10,
    youtube_titles_desc: 3,
  };

  const currentCost = toolCosts[tool] || 5;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTopic = topic.trim() || (contextNotes.trim() ? contextNotes.trim().split('\n')[0].slice(0, 100) : '');
    if (!effectiveTopic) {
      setError('Please provide your context or a topic for the YouTube video.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const additionalInstructions = [
        `Channel Niche: ${channelNiche}`,
        contextNotes ? `PROVIDED CONTEXT / TALKING POINTS:\n${contextNotes}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await api.generate({
        contentType: tool,
        category: 'youtube',
        topic: effectiveTopic,
        referenceText: contextNotes || undefined,
        language,
        tone,
        keywords: primaryKeyword,
        preferredCta,
        additionalInstructions,
        brandId: selectedBrandId || undefined,
        idempotencyKey: `gen_yt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      });

      updateCredits(res.remainingCredits);
      if (res.savedItem) {
        setGeneratedItem(res.savedItem);
      } else {
        setGeneratedItem({
          id: 'temp_yt_' + Date.now(),
          userId: user?.id || '',
          title: `YouTube ${tool.replace(/_/g, ' ')}: ${topic.slice(0, 30)}`,
          contentType: tool,
          category: 'youtube',
          prompt: topic,
          inputs: {},
          content: res.content,
          language,
          version: 1,
          versionsHistory: [],
          isFavorite: false,
          isDraft: false,
          tags: ['youtube', tool],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate YouTube content.');
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
      {/* Configuration Column */}
      <div className="w-full lg:w-5/12 flex flex-col space-y-4">
        {/* Header Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-lg shadow-red-600/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">YouTube Studio</h1>
                <p className="text-xs text-slate-400">Shorts, long-form scripts, titles, & SEO</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentCost} Credits</span>
            </div>
          </div>

          {/* Tool selector buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={() => setTool('youtube_shorts')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'youtube_shorts'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Video className="w-4 h-4 text-red-400" />
              <span>YT Shorts</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('youtube_longform')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'youtube_longform'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Long-Form</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('youtube_titles_desc')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'youtube_titles_desc'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileSearch className="w-4 h-4 text-amber-400" />
              <span>Titles & SEO</span>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">

          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col space-y-2">
              <div className="flex items-start space-x-2">
                <span className="leading-relaxed">{error}</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-500/40 transition-colors"
                >
                  🔄 Retry Generation
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Your Context, Raw Notes, or Talking Points *</span>
              <span className="text-[10px] text-indigo-400 font-medium">
                {contextNotes.trim() ? `${contextNotes.trim().split(/\s+/).length} words` : 'Paste context here'}
              </span>
            </label>
            <textarea
              rows={4}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Paste any detailed facts, clinic procedures, advice, or transcript. Flowora AI will convert this exact context into high-retention video beats, titles, hooks, and timestamps..."
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Specific Video Topic or Title Angle (Optional)</span>
              <span className="text-[10px] text-slate-500 font-normal">Auto-derived if left empty</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 3 brushing mistakes causing yellow teeth (or leave empty to use context directly)"
              className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Language Cadence */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Language Cadence</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'English', label: 'English', desc: 'Global audience' },
                { id: 'Tamil', label: 'தமிழ்', desc: 'Tamil script' },
                { id: 'Tanglish', label: 'Tanglish', desc: 'Spoken viral' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id as any)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    language === lang.id
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">{lang.label}</div>
                  <div className="text-[9px] text-slate-500">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Channel Niche</label>
              <input
                type="text"
                value={channelNiche}
                onChange={(e) => setChannelNiche(e.target.value)}
                placeholder="e.g. Tech, Finance, Vlogging"
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Keyword</label>
              <input
                type="text"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. AI tools tutorial"
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Engaging & Educational">Engaging & Educational</option>
                <option value="Fast-Paced & Energetic">Fast-Paced & Energetic</option>
                <option value="Storytelling & Deep Dive">Storytelling & Deep Dive</option>
                <option value="Casual & Authentic">Casual & Authentic</option>
                <option value="High-Retention Punchy">High-Retention Punchy</option>
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

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Designing YouTube Script with Gemini...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate Video Blueprint ({currentCost} Credits)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Column */}
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
