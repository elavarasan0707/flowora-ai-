import React, { useState } from 'react';
import {
  FileText,
  Megaphone,
  BookOpen,
  MessageSquare,
  Linkedin,
  Mail,
  Repeat,
  Send,
  Coins,
  Globe,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { EditorWorkspace } from './EditorWorkspace.tsx';

export const MarketingStudio: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { brands, activeBrand } = useBrand();

  const [tool, setTool] = useState<'ad_copy' | 'blog_draft' | 'whatsapp_promo' | 'linkedin_post' | 'email_campaign' | 'repurpose'>('ad_copy');
  const [topic, setTopic] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>(activeBrand?.preferredLanguage || 'English');
  const [tone, setTone] = useState('High-Converting & Persuasive');
  const [targetAudience, setTargetAudience] = useState(activeBrand?.targetAudience || '');
  const [keywords, setKeywords] = useState('');
  const [preferredCta, setPreferredCta] = useState(activeBrand?.preferredCta || 'Click here to claim your offer');
  const [selectedBrandId, setSelectedBrandId] = useState(activeBrand?.id || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toolCosts: Record<string, number> = {
    ad_copy: 4,
    blog_draft: 12,
    whatsapp_promo: 2,
    linkedin_post: 3,
    email_campaign: 4,
    repurpose: 6,
  };

  const currentCost = toolCosts[tool] || 4;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTopic = topic.trim() || (productOrService.trim() ? productOrService.trim().split('\n')[0].slice(0, 100) : '');
    if (!effectiveTopic) {
      setError('Please provide a campaign objective, topic, or product details.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const res = await api.generate({
        contentType: tool,
        category: 'marketing',
        topic: effectiveTopic,
        language,
        tone,
        targetAudience,
        keywords,
        preferredCta,
        additionalInstructions: productOrService ? `Product/Service Focus: ${productOrService}` : undefined,
        brandId: selectedBrandId || undefined,
        idempotencyKey: `gen_mkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      });

      updateCredits(res.remainingCredits);
      if (res.savedItem) {
        setGeneratedItem(res.savedItem);
      } else {
        setGeneratedItem({
          id: 'temp_mkt_' + Date.now(),
          userId: user?.id || '',
          title: `Marketing ${tool.replace(/_/g, ' ')}: ${topic.slice(0, 30)}`,
          contentType: tool,
          category: 'marketing',
          prompt: topic,
          inputs: {},
          content: res.content,
          language,
          version: 1,
          versionsHistory: [],
          isFavorite: false,
          isDraft: false,
          tags: ['marketing', tool],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate marketing copy.');
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
      {/* Form Left Column */}
      <div className="w-full lg:w-5/12 flex flex-col space-y-4">
        {/* Header Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">Marketing Copy Studio</h1>
                <p className="text-xs text-slate-400">Ads, SEO articles, WhatsApp, LinkedIn, & Emails</p>
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
              onClick={() => setTool('ad_copy')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'ad_copy'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4 text-teal-400" />
              <span>Ad Copy</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('blog_draft')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'blog_draft'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>SEO Blog</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('whatsapp_promo')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'whatsapp_promo'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('linkedin_post')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'linkedin_post'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('email_campaign')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'email_campaign'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('repurpose')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                tool === 'repurpose'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Repeat className="w-4 h-4 text-amber-400" />
              <span>Repurpose</span>
            </button>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Campaign Topic or Offer *</span>
              <span className="text-[10px] text-slate-500 font-normal">What are you promoting?</span>
            </label>
            <textarea
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Special festive 30% discount on our annual AI automation consulting package"
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
                { id: 'English', label: 'English', desc: 'Global market' },
                { id: 'Tamil', label: 'தமிழ்', desc: 'Regional impact' },
                { id: 'Tanglish', label: 'Tanglish', desc: 'Conversational' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id as any)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    language === lang.id
                      ? 'bg-teal-600/20 border-teal-500 text-white font-bold shadow-sm'
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product / Brand</label>
              <input
                type="text"
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="e.g. Flowora SaaS"
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. content creation, save time"
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="High-Converting & Persuasive">High-Converting & Persuasive</option>
                <option value="Direct Response & Urgent">Direct Response & Urgent</option>
                <option value="Informative & Thought-Leading">Informative & Thought-Leading</option>
                <option value="Friendly & Welcoming">Friendly & Welcoming</option>
                <option value="Story-Driven Case Study">Story-Driven Case Study</option>
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
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Crafting High-Converting Copy with Gemini...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate Marketing Copy ({currentCost} Credits)</span>
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
