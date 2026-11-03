import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Bookmark,
  Coins,
  Globe,
  Sliders,
  ChevronDown,
  ChevronRight,
  Flame,
  MessageSquare,
  Zap,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBrand } from '../../context/BrandContext.tsx';
import { api } from '../../lib/api.ts';
import confetti from 'canvas-confetti';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const MiniChatGPTView: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { activeBrand } = useBrand();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('flowora_mini_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        content: `👋 **Vanakkam & Welcome to Flowora Mini ChatGPT!**\n\nI am your dedicated conversational creator AI. Paste your raw notes, article, or business context in the **Context Panel** on the left (or click a Quick Preset), and ask me anything:\n\n- *"Convert this context into a 30s viral Tanglish Reel script with hooks and timestamps"*  \n- *"Give me 10 scroll-stopping curiosity hooks from this topic"*  \n- *"Make a high-retention YouTube Shorts blueprint"*  \n- *"Rewrite scene 2 to be punchier and more humorous"*  \n\nWhat would you like to create right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [contextText, setContextText] = useState(() => {
    return localStorage.getItem('flowora_mini_chat_context') || '';
  });
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(true);
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Tanglish'>(
    (activeBrand?.preferredLanguage as any) || 'Tanglish'
  );
  const [tone, setTone] = useState('Conversational & Engaging');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPresets = [
    {
      title: '🦷 Dental Clinic Care',
      context:
        'Topic: 3 common brushing mistakes causing yellow teeth and enamel erosion. Mistake 1: Brushing too hard with hard bristles. Mistake 2: Brushing immediately after acidic coffee. Mistake 3: Skipping night brushing and flossing. Clinic: Sparkle Dental.',
      prompt:
        'Convert this dental clinic context into a viral 30-second Tanglish Instagram Reel script with audio vibe, 3 hooks, scene table, caption and hashtags.',
    },
    {
      title: '🚀 SaaS & Business Growth',
      context:
        'Topic: Why 90% of solo creators fail to monetize in 2026. Problem: Chasing vanity follower metrics instead of an email list and high-ticket service offer. Solution: Free lead magnet + automated WhatsApp followup + 1:1 consultation.',
      prompt:
        'Create a punchy Alex Hormozi style video script breakdown from this context in Tanglish with jump cuts and bold on-screen text.',
    },
    {
      title: '📱 AI Tools for Creators',
      context:
        'Topic: 3 Free AI tools saving 15 hours a week. Tool 1: Gemini for fast script writing. Tool 2: CapCut auto-captions with trending yellow keywords. Tool 3: Notion AI content calendar for batch scheduling.',
      prompt:
        'Turn this context into 10 scroll-stopping hooks and an 8-slide carousel breakdown.',
    },
    {
      title: '💰 Freelancer Money Hack',
      context:
        'Topic: Stop charging hourly rates. If you complete a project in 1 hour because you are skilled, hourly pricing punishes you. Switch to value-based pricing based on client ROI.',
      prompt:
        'Write a viral LinkedIn thought-leadership post and a conversational Tanglish Reel from this context.',
    },
  ];

  useEffect(() => {
    localStorage.setItem('flowora_mini_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('flowora_mini_chat_context', contextText);
  }, [contextText]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context: contextText.trim(),
        language,
        tone,
        idempotencyKey: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };

      const res = await api.chat(payload);
      updateCredits(res.remainingCredits);

      const modelMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setError(err?.message || 'Mini ChatGPT could not generate a response. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToLibrary = async (msg: ChatMessage) => {
    try {
      const title =
        msg.content
          .split('\n')[0]
          .replace(/[#*]/g, '')
          .trim()
          .slice(0, 45) || 'Mini ChatGPT Saved Script';

      await api.saveContent({
        title,
        contentType: 'mini_chatgpt_script',
        category: 'universal',
        content: msg.content,
        language,
        tags: ['mini-chatgpt', language.toLowerCase()],
      });

      setSavedId(msg.id);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setSavedId(null), 2500);
    } catch (e: any) {
      alert(e?.message || 'Failed to save script to library');
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear entire Mini ChatGPT conversation?')) {
      const welcome: ChatMessage = {
        id: 'msg_welcome_' + Date.now(),
        role: 'model',
        content: 'Conversation cleared! Provide your context and let me know what you would like to generate next.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
      localStorage.removeItem('flowora_mini_chat_history');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row max-w-7xl mx-auto p-3 sm:p-5 gap-4 overflow-hidden">
      {/* LEFT COLUMN: Persistent Context Knowledge Base Drawer */}
      <div
        className={`${
          isContextDrawerOpen ? 'w-full lg:w-4/12 flex' : 'hidden lg:flex lg:w-16'
        } flex-col transition-all duration-300 space-y-3.5`}
      >
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col shadow-xl overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
                  <span>Context Knowledge Base</span>
                </h2>
                <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active in AI Memory</span>
                </span>
              </div>
            </div>
            {contextText.trim() && (
              <button
                type="button"
                onClick={() => setContextText('')}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                title="Clear Context"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Context Presets */}
          <div className="my-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>1-Click Sample Contexts</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setContextText(preset.context);
                    setInputPrompt(preset.prompt);
                  }}
                  className="p-2 rounded-xl bg-slate-950/70 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                    {preset.title}
                  </div>
                  <div className="text-[9px] text-slate-500 line-clamp-1">Click to populate</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context Textarea */}
          <div className="flex-1 flex flex-col min-h-[160px] mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Paste Raw Context / Notes / Transcript
              </label>
              <span className="text-[10px] text-slate-500">
                {contextText.trim() ? `${contextText.trim().split(/\s+/).length} words` : 'Empty'}
              </span>
            </div>
            <textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Paste your article snippet, rough notes, clinic/business info, or bullet points here. Mini ChatGPT will treat this as the source of truth for all scripts and responses..."
              className="flex-1 w-full p-3 bg-slate-950/90 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Language & Tone Settings */}
          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>Response Language Cadence</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Tanglish', label: 'Tanglish', sub: 'Spoken viral' },
                  { id: 'Tamil', label: 'தமிழ்', sub: 'Pure Tamil' },
                  { id: 'English', label: 'English', sub: 'International' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-center border transition-all ${
                      language === l.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px]">{l.label}</div>
                    <div className="text-[8px] text-slate-500">{l.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Conversational Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Conversational & Engaging">Conversational & Engaging</option>
                <option value="High-Energy & Viral (Hormozi style)">High-Energy & Viral</option>
                <option value="Humorous & Relatable (Skit vibe)">Humorous & Relatable</option>
                <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                <option value="Professional & Authoritative">Professional & Authoritative</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive ChatGPT Conversational Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Chat Canvas Top Bar */}
        <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/60 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-white tracking-tight">Flowora Mini ChatGPT</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  Context-Aware
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                <span>Fast Gemini Flash</span>
                <span>•</span>
                <span>Sub-5s generation</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>2 Credits / Turn</span>
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => handleSendMessage()}
              className="px-2.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[10px] font-bold ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 border border-slate-700 text-indigo-400'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body Card */}
                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-lg ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-950/80 border border-slate-800/90 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {/* Timestamp & Role Header */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : 'Flowora Mini ChatGPT'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Render Message with clean line formatting */}
                  <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans break-words space-y-2">
                    {msg.content}
                  </div>

                  {/* Action Toolbar on Model Messages */}
                  {!isUser && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center space-x-1 border border-slate-800 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveToLibrary(msg)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center space-x-1 border border-slate-800 transition-colors"
                        >
                          {savedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Saved to Library!</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3 text-indigo-400" />
                              <span>Save Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {msg.content.split(/\s+/).length} words
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-lg flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150" />
                  <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce delay-300" />
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  Analyzing context & drafting response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Follow-Up Prompt Suggestions Bar */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto custom-scrollbar flex items-center space-x-1.5 text-nowrap">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Prompt Ideas:
          </span>
          {[
            '🎬 Convert into 30s Reel',
            '⚡ 10 Viral Hooks',
            '🎥 YouTube Shorts Script',
            '🔥 Make it punchier',
            '🗣️ Convert to Tanglish',
            '🏷️ Give 15 Viral Hashtags',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(suggestion)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-slate-300 hover:text-indigo-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Chat Input Container */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
          {/* Active Context indicator */}
          {contextText.trim() && (
            <div className="mb-2 flex items-center justify-between text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-2.5 py-1">
              <span className="flex items-center space-x-1.5 truncate">
                <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span className="truncate">
                  Active Context: {contextText.slice(0, 70)}...
                </span>
              </span>
              <span className="text-indigo-400 font-semibold ml-2 flex-shrink-0">
                {contextText.split(/\s+/).length} words loaded
              </span>
            </div>
          )}

          <div className="relative flex items-center">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Flowora Mini ChatGPT... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              className="w-full p-3.5 pr-14 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-none custom-scrollbar"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
