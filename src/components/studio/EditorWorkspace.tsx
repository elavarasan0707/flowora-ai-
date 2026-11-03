import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Star,
  Edit3,
  Eye,
  History,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronDown,
  FileText,
  Clock,
  Type,
  Share2,
  Bookmark,
  Volume2,
  Film,
  Hash,
  MessageSquare,
  Sparkle,
  Trash2,
} from 'lucide-react';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import confetti from 'canvas-confetti';

interface EditorWorkspaceProps {
  item: ContentItem | null;
  onUpdateItem: (item: ContentItem) => void;
  onRefineContent: (
    type: 'rewrite' | 'improve' | 'expand' | 'shorten' | 'tone' | 'translate',
    options?: any
  ) => Promise<void>;
  isRefining: boolean;
  onDeleteItem?: () => void;
}

// Clean text helper: strips all '#' or '##' or '###' and markdown artifacts
export function cleanRawMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s*(.+)$/gm, '$1')
    .replace(/^#{1,6}\s*$/gm, '')
    .trim();
}

// Extract clean teleprompter spoken script only
export function extractTeleprompterScript(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const spokenLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match table spoken lines e.g. | 00:00 - 00:03 | [Visual] | "[Spoken words]" | ...
    if (trimmed.startsWith('|') && trimmed.includes('"')) {
      const parts = trimmed.split('|').map((p) => p.trim());
      if (parts.length >= 4) {
        const time = parts[1];
        const spoken = parts[3].replace(/^"+|"+$/g, '').replace(/[\[\]]/g, '');
        if (spoken && !spoken.toLowerCase().includes('spoken')) {
          spokenLines.push(`[${time}] ${spoken}`);
          continue;
        }
      }
    }

    // Match lines like 🗣️ Spoken Line: "..."
    if (trimmed.includes('Spoken Line') || trimmed.includes('🗣️')) {
      const clean = trimmed.replace(/^[-\s*]*[🗣️🎥🔤]*\s*\*?Spoken Line\*?:\s*/i, '').replace(/^"+|"+$/g, '');
      if (clean) spokenLines.push(clean);
      continue;
    }

    // If it's a hook line
    if (/^\d+\.\s+["'].+["']/.test(trimmed)) {
      spokenLines.push(trimmed);
      continue;
    }
  }

  if (spokenLines.length > 0) {
    return spokenLines.join('\n\n');
  }

  // Fallback: strip tables and headers
  return cleanRawMarkdown(text)
    .replace(/\|.*?\|/g, '')
    .replace(/---/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract only Instagram Caption & Hashtags
export function extractCaptionAndHashtags(text: string): string {
  if (!text) return '';
  const clean = cleanRawMarkdown(text);
  const captionIndex = clean.search(/(caption|ready-to-publish|instagram caption)/i);
  if (captionIndex !== -1) {
    return clean.slice(captionIndex).replace(/---/g, '').trim();
  }
  // fallback return hashtags if found
  const hashIndex = clean.search(/#\w+/);
  if (hashIndex !== -1) {
    return clean.slice(hashIndex).trim();
  }
  return clean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  item,
  onUpdateItem,
  onRefineContent,
  isRefining,
  onDeleteItem,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(cleanRawMarkdown(item?.content || ''));
  const [copyMode, setCopyMode] = useState<'full' | 'clean' | 'caption' | null>(null);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (item) {
      setEditedText(cleanRawMarkdown(item.content));
    }
  }, [item?.content]);

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Interactive Content Workspace</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a content generator or load an item from your Content Library to begin drafting, refining, and publishing.
        </p>
      </div>
    );
  }

  const rawContent = isEditing ? editedText : cleanRawMarkdown(item.content);
  const wordCount = rawContent.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadSec = Math.ceil((wordCount / 130) * 60);

  // Copy full script without raw ##
  const handleCopyFull = async () => {
    try {
      const clean = cleanRawMarkdown(rawContent);
      await navigator.clipboard.writeText(clean);
      setCopyMode('full');
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopyMode(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy teleprompter speech only
  const handleCopyTeleprompter = async () => {
    try {
      const tele = extractTeleprompterScript(rawContent);
      await navigator.clipboard.writeText(tele);
      setCopyMode('clean');
      confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopyMode(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy caption & hashtags only
  const handleCopyCaption = async () => {
    try {
      const caption = extractCaptionAndHashtags(rawContent);
      await navigator.clipboard.writeText(caption);
      setCopyMode('caption');
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopyMode(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download script
  const handleDownload = (format: 'txt' | 'md') => {
    const text = cleanRawMarkdown(rawContent);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(item.title || 'Flowora_Script').replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      const cleanText = cleanRawMarkdown(editedText);
      if (item.id.startsWith('temp_')) {
        const saved = await api.saveContent({
          title: item.title,
          contentType: item.contentType,
          category: item.category,
          content: cleanText,
          language: item.language,
          tags: item.tags,
        });
        onUpdateItem(saved.item);
      } else {
        const res = await api.updateContent(item.id, { content: cleanText });
        onUpdateItem(res.item);
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save edit:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Save to Library explicit button
  const handleSaveToLibrary = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      const cleanText = cleanRawMarkdown(rawContent);
      if (item.id.startsWith('temp_')) {
        const res = await api.saveContent({
          title: item.title,
          contentType: item.contentType,
          category: item.category,
          content: cleanText,
          language: item.language,
          tags: item.tags,
        });
        onUpdateItem(res.item);
      } else {
        await api.updateContent(item.id, { content: cleanText });
      }
      setSaveSuccess(true);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Save to library error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async () => {
    if (!item) return;
    try {
      if (item.id.startsWith('temp_')) {
        const saved = await api.saveContent({
          title: item.title,
          contentType: item.contentType,
          category: item.category,
          content: cleanRawMarkdown(rawContent),
          language: item.language,
          isFavorite: true,
        });
        onUpdateItem(saved.item);
        return;
      }
      const res = await api.toggleFavorite(item.id);
      onUpdateItem({ ...item, isFavorite: res.isFavorite });
    } catch (e) {
      console.error('Favorite error:', e);
    }
  };

  // Rollback version
  const handleRevertVersion = async (oldContent: string) => {
    if (!item) return;
    try {
      const cleanOld = cleanRawMarkdown(oldContent);
      if (item.id.startsWith('temp_')) {
        setEditedText(cleanOld);
        setShowHistoryModal(false);
        return;
      }
      const res = await api.updateContent(item.id, { content: cleanOld });
      onUpdateItem(res.item);
      setEditedText(cleanOld);
      setShowHistoryModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
              {item.contentType.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {item.language}
            </span>
            {item.brandName && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {item.brandName}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">v{item.version}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white truncate">{item.title}</h2>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-all ${
              item.isFavorite
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
            title={item.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
          >
            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Version History Button */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors relative"
            title="Version History"
          >
            <History className="w-4 h-4" />
            {item.versionsHistory && item.versionsHistory.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {/* Save to Library Button */}
          <button
            type="button"
            onClick={handleSaveToLibrary}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              saveSuccess
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Save Script to Content Library"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Edit / Preview Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSaveEdit();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                <span>Edit Text</span>
              </>
            )}
          </button>

          {/* Clean Teleprompter Copy Button */}
          <button
            type="button"
            onClick={handleCopyTeleprompter}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 transition-all shadow-sm"
            title="Copy voiceover lines only (no markdown, no symbols, clean for camera reading)"
          >
            {copyMode === 'clean' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Speech Copied!</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teleprompter</span>
              </>
            )}
          </button>

          {/* Copy Full Script Button */}
          <button
            type="button"
            onClick={handleCopyFull}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            title="Copy script without ## markdown hashes"
          >
            {copyMode === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1 z-30 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => handleDownload('txt')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Text (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('md')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Markdown (.md)</span>
                </button>
              </div>
            )}
          </div>

          {/* Delete Button (if onDeleteItem provided) */}
          {onDeleteItem && (
            <button
              type="button"
              onClick={onDeleteItem}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 bg-slate-950/60 border border-slate-800 hover:border-red-500/30 transition-colors cursor-pointer"
              title="Delete Content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AI Refinement & Utility Toolbar */}
      <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs custom-scrollbar">
        <span className="text-[11px] font-semibold text-indigo-400 flex items-center space-x-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick AI Refine:</span>
        </span>

        {/* Elevate Hook Button */}
        <button
          type="button"
          onClick={() => onRefineContent('improve')}
          disabled={isRefining}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Punchier Hook</span>
        </button>

        {/* Fresh Rewrite Button */}
        <button
          type="button"
          onClick={() => onRefineContent('rewrite')}
          disabled={isRefining}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Fresh Angle</span>
        </button>

        {/* Expand Button */}
        <button
          type="button"
          onClick={() => onRefineContent('expand')}
          disabled={isRefining}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0 transition-colors disabled:opacity-50"
        >
          <span>➕ Expand Details</span>
        </button>

        {/* Shorten Button */}
        <button
          type="button"
          onClick={() => onRefineContent('shorten')}
          disabled={isRefining}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0 transition-colors disabled:opacity-50"
        >
          <span>✂️ Shorten</span>
        </button>

        {/* Tone Selector Menu */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowToneMenu(!showToneMenu);
              setShowTranslateMenu(false);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <Sliders className="w-3 h-3 text-violet-400" />
            <span>Tone</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showToneMenu && (
            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-30 animate-in fade-in">
              {[
                'Conversational & Punchy',
                'High-Energy Hormozi Viral',
                'Humorous & Relatable Skit',
                'Authoritative & Professional',
                'Warm & Empathetic',
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setShowToneMenu(false);
                    onRefineContent('tone', { targetTone: t });
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Translation / Language Adapt Menu */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowTranslateMenu(!showTranslateMenu);
              setShowToneMenu(false);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <span>🌐 Adapt Language</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showTranslateMenu && (
            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-30 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setShowTranslateMenu(false);
                  onRefineContent('translate', { targetLanguage: 'Tanglish (Spoken viral Tamil in English letters)' });
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Tanglish</span>
                <span className="text-[10px] text-emerald-400 font-bold">Viral Spoken</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTranslateMenu(false);
                  onRefineContent('translate', { targetLanguage: 'Tamil' });
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Natural Tamil (தமிழ்)</span>
                <span className="text-[10px] text-indigo-400 font-bold">Script</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTranslateMenu(false);
                  onRefineContent('translate', { targetLanguage: 'English' });
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Global English</span>
                <span className="text-[10px] text-slate-400 font-bold">EN</span>
              </button>
            </div>
          )}
        </div>

        {/* Copy Caption & Hashtags Shortcut */}
        <button
          type="button"
          onClick={handleCopyCaption}
          className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center space-x-1 flex-shrink-0 transition-colors"
        >
          {copyMode === 'caption' ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Caption Copied!</span>
            </>
          ) : (
            <>
              <Hash className="w-3 h-3 text-pink-400" />
              <span>Copy Caption Only</span>
            </>
          )}
        </button>

        {isRefining && (
          <span className="text-[11px] text-indigo-400 font-semibold animate-pulse flex items-center space-x-1 flex-shrink-0 ml-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Refining with AI...</span>
          </span>
        )}
      </div>

      {/* Main Content Area (Clean view with ZERO raw ##) */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full flex-1 min-h-[380px] p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              placeholder="Edit your content here without ## hashes..."
            />
            <div className="mt-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditedText(cleanRawMarkdown(item.content));
                  setIsEditing(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <CleanScriptViewer content={rawContent} />
        )}
      </div>

      {/* Workspace Footer Statistics */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>{wordCount} Words</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{estimatedReadSec}s Spoken Delivery</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-medium flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Clean Text (No ## hashes)</span>
          </span>
        </div>
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Version History ({item.versionsHistory ? item.versionsHistory.length + 1 : 1} Versions)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Review previous iterations and rollback with one click if desired.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {/* Current version */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-300">Version {item.version} (Active)</span>
                  <span className="text-[10px] text-slate-400">Now</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{cleanRawMarkdown(item.content)}</p>
              </div>

              {item.versionsHistory &&
                item.versionsHistory.map((ver, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300">Version {ver.versionNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{cleanRawMarkdown(ver.content)}</p>
                    <button
                      type="button"
                      onClick={() => handleRevertVersion(ver.content)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition-colors"
                    >
                      Rollback to this version
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Formatted Clean Script Viewer that strips out any '#' or '##' and renders styled visual cards
interface CleanScriptViewerProps {
  content: string;
}

const CleanScriptViewer: React.FC<CleanScriptViewerProps> = ({ content }) => {
  const clean = cleanRawMarkdown(content);
  const lines = clean.split('\n');

  return (
    <div className="space-y-4 text-slate-200 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Horizontal separator
        if (trimmed === '---' || trimmed === '___' || trimmed === '***') {
          return <hr key={idx} className="border-slate-800 my-4" />;
        }

        // Major section header (e.g. 🎬 VIRAL REEL BLUEPRINT, ⚡ 3 SCROLL-STOPPING HOOKS)
        const isHeader =
          /^[🎬🎧⚡📜🔄📌🏷️💡🎯🪝🎥📑✉️💼📰]/.test(trimmed) ||
          trimmed.toUpperCase() === trimmed && trimmed.length > 5 && !trimmed.includes('|');

        if (isHeader) {
          return (
            <div
              key={idx}
              className="mt-5 mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900/80 border border-indigo-500/20 flex items-center justify-between"
            >
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                <span>{trimmed}</span>
              </h3>
            </div>
          );
        }

        // Table Rows
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const cells = trimmed
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

          // Skip table separator row |---|---|
          if (cells.every((c) => /^[-:]+$/.test(c))) {
            return null;
          }

          const isTableHeader = cells.some((c) =>
            ['timestamp', 'visual', 'spoken', 'text', 'sound'].some((k) => c.toLowerCase().includes(k))
          );

          if (isTableHeader) {
            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >
                <div className="col-span-2">{cells[0] || 'Time'}</div>
                <div className="col-span-3">{cells[1] || 'Visual'}</div>
                <div className="col-span-4">{cells[2] || 'Audio / Spoken'}</div>
                <div className="col-span-2">{cells[3] || 'On-Screen'}</div>
                <div className="col-span-1">{cells[4] || 'SFX'}</div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs items-center"
            >
              <div className="col-span-2 font-mono text-[11px] font-bold text-indigo-400">
                {cells[0]}
              </div>
              <div className="col-span-3 text-slate-400 text-[11px]">{cells[1]}</div>
              <div className="col-span-4 text-white font-medium bg-slate-900/70 p-2 rounded-xl border border-slate-800/60">
                {cells[2]?.replace(/^"+|"+$/g, '')}
              </div>
              <div className="col-span-2 text-amber-300 font-semibold text-[11px]">
                {cells[3]?.replace(/[\[\]]/g, '')}
              </div>
              <div className="col-span-1 text-[10px] text-cyan-400 font-mono">
                {cells[4]}
              </div>
            </div>
          );
        }

        // Bullet point lines
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start space-x-2 ml-1 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <div className="flex-1 text-slate-300 leading-relaxed font-sans">
                {bulletText}
              </div>
            </div>
          );
        }

        // Numbered item lines
        if (/^\d+\.\s+/.test(trimmed)) {
          return (
            <div key={idx} className="p-3 my-1.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <div className="font-semibold text-slate-100">{trimmed}</div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="my-1 text-slate-300 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
