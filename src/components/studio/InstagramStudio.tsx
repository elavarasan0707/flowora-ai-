import React, { useState } from 'react';
import {
  Instagram,
  Sparkles,
  Flame,
  Layers,
  Hash,
  Clock,
  Globe,
  Sliders,
  Send,
  Coins,
  CheckCircle,
  HelpCircle,
  FileText,
  Bot,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { EditorWorkspace } from './EditorWorkspace.tsx';

export const InstagramStudio: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { brands, activeBrand } = useBrand();

  const [tool, setTool] = useState<'reel_script' | 'hook_generator' | 'carousel_copy' | 'caption_hashtags'>('reel_script');
  const [topic, setTopic] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [reelStyle, setReelStyle] = useState('⚡ High-Retention Hormozi Style (Bold Text, Jump Cuts, Rapid Value)');
  const [duration, setDuration] = useState<'15s' | '30s' | '45s' | '60s'>('30s');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>(
    (activeBrand?.preferredLanguage as any) || 'Tanglish'
  );
  const [tone, setTone] = useState('Conversational & Engaging');
  const [targetAudience, setTargetAudience] = useState(activeBrand?.targetAudience || '');
  const [objective, setObjective] = useState('Drive follower growth & saves');
  const [preferredCta, setPreferredCta] = useState(activeBrand?.preferredCta || "Comment 'REEL' to get the full link!");
  const [selectedBrandId, setSelectedBrandId] = useState(activeBrand?.id || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toolCosts: Record<string, number> = {
    reel_script: 5,
    hook_generator: 2,
    carousel_copy: 6,
    caption_hashtags: 2,
  };

  const currentCost = toolCosts[tool] || 5;

  const presets = [
    {
      label: '🚀 SaaS / Business Growth',
      topic: 'Why 90% of creators fail to monetize their audience in 2026',
      context: 'Creators focus on follower counts instead of email lists and high-ticket offers. 3-step fix: build lead magnet, offer 1:1 consulting, automate follow-up on WhatsApp.',
    },
    {
      label: '🤖 AI Automation Hack',
      topic: 'How to automate your entire social media with free AI tools',
      context: 'Step 1: Use Gemini for scripts. Step 2: Use CapCut auto-captions with yellow highlights. Step 3: Schedule with Notion calendar. Saves 15 hours a week.',
    },
    {
      label: '💰 Freelancing / Money Tip',
      topic: 'Stop charging per hour as a freelancer. Do this instead.',
      context: 'Charging hourly punishes efficiency. If you do it in 1 hour, you make less. Switch to value-based pricing: quote on project outcomes and client revenue impact.',
    },
    {
      label: '🔥 Tamil Creator Skit (Tanglish)',
      topic: 'Office-la salary credited aanavudane nadakkura kalavaram',
      context: '1st of the month: Swiggy, Zomato, iPhone EMI, Zara shopping. 5th of the month: Maggie noodles, balance checking with crying face. Save money with 50-30-20 rule.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTopic(p.topic);
    setContextNotes(p.context);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTopic = topic.trim() || (contextNotes.trim() ? contextNotes.trim().split('\n')[0].slice(0, 100) : '');
    if (!effectiveTopic) {
      setError('Please provide your context or a topic for the reel.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const combinedTopic = effectiveTopic;
      const additionalInstructions = [
        contextNotes ? `PROVIDED RAW CONTEXT / NOTES:\n${contextNotes}` : '',
        `CREATOR REEL STYLE: ${reelStyle}`,
      ].filter(Boolean).join('\n\n');

      const res = await api.generate({
        contentType: tool,
        category: 'instagram',
        topic: combinedTopic,
        referenceText: contextNotes || undefined,
        duration: tool === 'reel_script' ? duration : undefined,
        language,
        tone,
        targetAudience,
        objective,
        preferredCta,
        additionalInstructions,
        brandId: selectedBrandId || undefined,
        idempotencyKey: `gen_ig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      });

      updateCredits(res.remainingCredits);
      if (res.savedItem) {
        setGeneratedItem(res.savedItem);
      } else {
        setGeneratedItem({
          id: 'temp_' + Date.now(),
          userId: user?.id || '',
          title: `Instagram ${tool.replace(/_/g, ' ')}: ${topic.slice(0, 30)}`,
          contentType: tool,
          category: 'instagram',
          prompt: topic,
          inputs: {},
          content: res.content,
          language,
          version: 1,
          versionsHistory: [],
          isFavorite: false,
          isDraft: false,
          tags: ['instagram', tool],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate content. Please try again.');
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
      {/* Left Input Configuration Column */}
      <div className="w-full lg:w-5/12 flex flex-col space-y-4">
        {/* Tool Header Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base font-bold text-white tracking-tight">Instagram & Reels Studio</h1>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    ChatGPT Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400">Context to viral reels, scene timing, audio & captions</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentCost} Credits</span>
            </div>
          </div>

          {/* Tool selector buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => setTool('reel_script')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                tool === 'reel_script'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-rose-400" />
              <span>Context-to-Reel</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('hook_generator')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                tool === 'hook_generator'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>10 Viral Hooks</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('carousel_copy')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                tool === 'carousel_copy'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-violet-400" />
              <span>8-Slide Carousel</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('caption_hashtags')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                tool === 'caption_hashtags'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Hash className="w-4 h-4 text-amber-400" />
              <span>Caption & Tags</span>
            </button>
          </div>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col space-y-2">
              <div className="flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
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

          {/* Quick Context Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quick Test Contexts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-slate-300 hover:text-indigo-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deep Context / Notes Box (Primary Input) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Context, Raw Notes, or Story *</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                {contextNotes.trim() ? `${contextNotes.trim().split(/\s+/).length} words` : 'Paste context here'}
              </span>
            </label>
            <textarea
              rows={4}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Paste your raw thoughts, article snippet, business points, or story. Flowora AI will convert this exact context into a structured, beat-by-beat viral reel script (audio vibe, 3 hooks, timestamps, dialogue, on-screen text, caption & hashtags)..."
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Topic / Core Hook */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Specific Topic or Custom Angle (Optional)</span>
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

          {/* Language Selector: Tanglish, Tamil, English */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Language Cadence</span>
              <span className="text-[10px] text-slate-500 font-normal">(Authentic Spoken Phrasing)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Tanglish', label: 'Tanglish', desc: 'Spoken viral Tamil' },
                { id: 'Tamil', label: 'தமிழ்', desc: 'Pure Tamil script' },
                { id: 'English', label: 'English', desc: 'Global punch' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id as any)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    language === lang.id
                      ? 'bg-indigo-600/25 border-indigo-500 text-white font-bold shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">{lang.label}</div>
                  <div className="text-[9px] text-slate-500">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reel Duration */}
          {tool === 'reel_script' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Video Duration & Pacing</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['15s', '30s', '45s', '60s'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      duration === d
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Creator Reel Style */}
          {tool === 'reel_script' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Creator Reel Format</label>
              <select
                value={reelStyle}
                onChange={(e) => setReelStyle(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="⚡ High-Retention Hormozi Style (Bold Text, Jump Cuts, Rapid Value)">
                  ⚡ Fast-Paced Hormozi Style (Bold on-screen text, jump cuts)
                </option>
                <option value="🎙️ Storytelling Breakdown (Hook -> Problem -> Aha Moment -> Lesson)">
                  🎙️ Storytelling Breakdown (Hook → Problem → Aha Moment)
                </option>
                <option value="⚠️ Contrarian Warning ('Stop Doing This Common Mistake!')">
                  ⚠️ Contrarian Warning ("Stop Doing This Common Mistake!")
                </option>
                <option value="💡 3-Step Actionable Tutorial / Framework">
                  💡 3-Step Actionable Tutorial / Framework
                </option>
                <option value="🎭 Relatable POV / Conversational Skit">
                  🎭 Relatable POV / Conversational Skit
                </option>
              </select>
            </div>
          )}

          {/* Tone & Brand Brain */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Conversational & Engaging">Conversational & Engaging</option>
                <option value="High-Energy & Bold">High-Energy & Bold</option>
                <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                <option value="Humorous & Relatable">Humorous & Relatable</option>
                <option value="Emotional & Storytelling">Emotional & Storytelling</option>
                <option value="Professional & Authoritative">Professional & Authoritative</option>
                <option value="Urgent Promotional">Urgent Promotional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Brain</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Default Brand Voice</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred CTA */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Call to Action (CTA)</label>
            <input
              type="text"
              value={preferredCta}
              onChange={(e) => setPreferredCta(e.target.value)}
              placeholder="e.g. Comment 'GUIDE' to get the full PDF blueprint"
              className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Converting Context to Viral Reel...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate ChatGPT-Style Reel ({currentCost} Credits)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Content Editor & Output Column */}
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
