import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Instagram,
  Youtube,
  Megaphone,
  BrainCircuit,
  Coins,
  Globe,
  CheckCircle2,
  ChevronDown,
  Layers,
  Zap,
  Play,
  ShieldCheck,
  Repeat,
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
  onOpenSignIn: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onOpenSignIn,
  onOpenLegal,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTabPreview, setActiveTabPreview] = useState<'reel' | 'youtube' | 'ads'>('reel');

  const faqs = [
    {
      q: 'How does Flowora AI maintain my unique brand voice?',
      a: 'With Brand Brain™, you save your brand guidelines, preferred tone, target audience persona, and even banned buzzwords once. Every generation dynamically embodies your persona without repetitive prompting.',
    },
    {
      q: 'Does Flowora AI really support conversational Tamil and Tanglish?',
      a: 'Yes! Unlike generic translators that sound robotic, our models generate authentic, contemporary Tamil script and natural Tanglish (Latin alphabet spoken Tamil, e.g. "Indha trick kandippa try pannunga!") optimized for viral reels and marketing.',
    },
    {
      q: 'How does the credit system protect me against failed requests?',
      a: 'Our server ledger uses atomic reservations. If an AI provider call times out or fails, your credits are refunded immediately to your account with a clear transaction note.',
    },
    {
      q: 'Do I own the content generated on Flowora AI?',
      a: 'Yes, 100%. You retain full commercial and distribution rights to all scripts, hooks, carousels, ad copy, and articles generated on our platform.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Public Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              FLOWORA
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#tools" className="hover:text-white transition-colors">Content Tools</a>
          <a href="#multilingual" className="hover:text-white transition-colors">Multilingual</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSignIn}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onStartCreating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Start Creating
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow ambient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ideas Flow. Content Connects.</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
          Turn Your Ideas Into <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Content That Connects.</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Create scripts, captions, marketing copy, and content strategies with an AI assistant tailored to your brand.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
          <button
            onClick={onStartCreating}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Start Creating (50 Free Credits)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#preview"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            Explore Features
          </a>
        </div>

        {/* Real Product Interface Preview */}
        <div id="preview" className="mt-14 w-full max-w-5xl rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">flowora-ai-studio // live-workspace</span>
            </div>

            {/* Preview switcher tabs */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTabPreview('reel')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTabPreview === 'reel' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Reel Script
              </button>
              <button
                onClick={() => setActiveTabPreview('youtube')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTabPreview === 'youtube' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                YouTube Blueprint
              </button>
              <button
                onClick={() => setActiveTabPreview('ads')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTabPreview === 'ads' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Ad Copy
              </button>
            </div>
          </div>

          {/* Interactive Workspace Preview Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Generation Setup</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Brand Brain</span>
                <span className="text-xs font-semibold text-white">Apex Growth Labs (B2B SaaS)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Selected Language</span>
                <span className="text-xs font-semibold text-indigo-400">English + Tanglish Adaptations</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Tone of Voice</span>
                <span className="text-xs font-semibold text-slate-300">Punchy & Relatable Storytelling</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={onStartCreating}
                  className="w-full py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all text-center"
                >
                  Try In Live Studio
                </button>
              </div>
            </div>

            <div className="md:col-span-8 p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2.5">
              {activeTabPreview === 'reel' && (
                <>
                  <div className="text-indigo-400 font-bold">🎬 30s Reel Script: The 3 SaaS Traps Killing Your Churn Rate</div>
                  <div className="text-slate-400">⚡ Hook Option (0-3s): "Stop blaming your price. If people leave your software in 14 days, here is the real leak..."</div>
                  <div className="text-emerald-400">| 00:03-00:15 | On-Screen Graphic: 3 Red X Icons on dashboard | Spoken: Most teams onboard users like an encyclopedia...</div>
                  <div className="text-violet-400">📌 Caption: Save this reel before planning your Q4 roadmap! 👇 #saasgrowth #productmarketing</div>
                </>
              )}
              {activeTabPreview === 'youtube' && (
                <>
                  <div className="text-red-400 font-bold">🎥 YouTube Blueprint: How I Scaled Content Production by 10x with AI</div>
                  <div className="text-slate-400">🎯 Title 1: I Automated My Entire Content Pipeline (Here's The Exact System)</div>
                  <div className="text-slate-400">🎯 Title 2: 5 AI Workflow Secrets Most Marketers Won't Tell You</div>
                  <div className="text-indigo-300">⏱️ Chapter 01:20: The "Brand Brain" Architecture - Injecting Context without Hallucinations</div>
                  <div className="text-slate-500">🔎 SEO Tags: #ai #contentcreation #saas #youtubegrowth #marketing</div>
                </>
              )}
              {activeTabPreview === 'ads' && (
                <>
                  <div className="text-teal-400 font-bold">📣 High-Converting Ad Copy (PAS Framework)</div>
                  <div className="text-slate-300"><strong>Problem:</strong> Spending 6 hours drafting a single video script?</div>
                  <div className="text-slate-300"><strong>Agitation:</strong> Your competitors are posting 3x daily while your drafts sit in Google Docs.</div>
                  <div className="text-slate-300"><strong>Solution:</strong> Flowora AI matches your brand voice and writes authentic scripts in 15 seconds.</div>
                  <div className="text-amber-400">CTA Button: Start Free Trial (No Credit Card Required)</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered For Creators, Agencies, and Digital Marketers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Eliminate generic AI corporate slop. Flowora AI creates content tailored to real audiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Instagram className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instagram & Reels Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 15s to 60s reel scripts with audio/visual cues, 10 scroll-stopping hook formulas, and 8-slide high-save carousels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Youtube className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">YouTube Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shorts scripts, comprehensive video blueprints with timestamped chapters, CTR-optimized titles, and SEO tags.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Brand Brain™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store multiple client personas with distinct banned words, pain points, and writing samples. Complete privacy isolation.
            </p>
          </div>

          <div id="multilingual" className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multilingual Cadence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate native English, authentic Tamil (தமிழ்) script, or viral spoken Tanglish for relatable engagement across demographics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Marketing Copy Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-converting Facebook & Google ad copy (AIDA/PAS), SEO blog outlines, WhatsApp broadcasts, and LinkedIn posts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Credit-Based Usage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never pay for failed generations. Transparent per-tool costs, full audit ledger, and automatic instant refunds on timeouts.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Flowora AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            3 simple steps from initial spark to published content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <span className="text-3xl font-black text-indigo-500/40">01</span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">Select Tool & Persona</h3>
            <p className="text-xs text-slate-400">
              Pick your content channel (Reel, YouTube, Ad, or Blog) and select the active Brand Brain.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <span className="text-3xl font-black text-indigo-500/40">02</span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">Generate with Gemini</h3>
            <p className="text-xs text-slate-400">
              Our prompt templates structure hooks, spoken pacing, scene cues, captions, and hashtags.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <span className="text-3xl font-black text-indigo-500/40">03</span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">Refine, Export & Publish</h3>
            <p className="text-xs text-slate-400">
              Polish with one-click AI tools (improve, expand, translate) or copy markdown directly into your publisher.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transparent, Predictable Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Start with 50 free credits. Top up or upgrade whenever your production scales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Free */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Free Starter</h3>
              <div className="text-2xl font-black text-white mt-2 mb-1">$0</div>
              <div className="text-xs text-slate-400 mb-4">50 Free Welcome Credits</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>1 Brand Brain profile</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Instagram & YouTube Studios</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Tamil & Tanglish support</span></li>
              </ul>
            </div>
            <button
              onClick={onStartCreating}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Claim 50 Credits
            </button>
          </div>

          {/* Starter */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Creator Spark</h3>
              <div className="text-2xl font-black text-white mt-2 mb-1">$9.99</div>
              <div className="text-xs text-slate-400 mb-4">200 Credits / one-time</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>~40 Reel scripts</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>3 Brand Brain profiles</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Full version history</span></li>
              </ul>
            </div>
            <button
              onClick={onStartCreating}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500 shadow-xl ring-1 ring-indigo-500/50 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white">
              Most Popular
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Pro Growth</h3>
              <div className="text-2xl font-black text-white mt-2 mb-1">$24.99</div>
              <div className="text-xs text-indigo-400 mb-4 font-semibold">650 Credits / one-time</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>~130 Reels or ~65 YT scripts</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Unlimited Brand Brains</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Priority Gemini inference</span></li>
              </ul>
            </div>
            <button
              onClick={onStartCreating}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Agency */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Agency Scale</h3>
              <div className="text-2xl font-black text-white mt-2 mb-1">$69.99</div>
              <div className="text-xs text-slate-400 mb-4">2,000 Credits / one-time</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>~400 Short scripts</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Multi-client workspace</span></li>
                <li className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /><span>Bulk export & audit ledger</span></li>
              </ul>
            </div>
            <button
              onClick={onStartCreating}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Scale Agency
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-3xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Clear answers to common questions about Flowora AI.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-xs sm:text-sm font-semibold text-white flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-tight">FLOWORA AI</span>
            <span>—</span>
            <span>Ideas Flow. Content Connects.</span>
          </div>

          <div className="flex items-center space-x-5 text-slate-400">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <a href="mailto:support@flowora.ai" className="hover:text-white transition-colors">
              Contact Support
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} Flowora AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
