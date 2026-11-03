import React, { useState, useEffect } from 'react';
import {
  Folder,
  Search,
  Filter,
  Star,
  Trash2,
  Edit3,
  Copy,
  Download,
  Check,
  Calendar,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { ContentItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { EditorWorkspace } from '../studio/EditorWorkspace.tsx';

interface ContentLibraryViewProps {
  onSelectItem?: (item: ContentItem) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = () => {
  const { updateCredits } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.getContent({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
        favorite: onlyFavorites || undefined,
      });
      setItems(res.items);
      if (res.items.length > 0 && !selectedItem) {
        setSelectedItem(res.items[0]);
      } else if (selectedItem) {
        const updated = res.items.find(i => i.id === selectedItem.id);
        if (updated) setSelectedItem(updated);
        else setSelectedItem(res.items[0] || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, onlyFavorites]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleCopy = async (item: ContentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setIsDeleting(true);
    try {
      await api.deleteContent(id);
    } catch (err) {
      console.warn('Delete request returned error, removing locally:', err);
    } finally {
      const remaining = items.filter(i => i.id !== id);
      setItems(remaining);
      if (selectedItem?.id === id) {
        setSelectedItem(remaining.length > 0 ? remaining[0] : null);
      }
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await api.toggleFavorite(id);
    setItems(prev => prev.map(i => (i.id === id ? { ...i, isFavorite: res.isFavorite } : i)));
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, isFavorite: res.isFavorite });
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left List & Filters Column */}
      <div className="w-full lg:w-5/12 flex flex-col space-y-4">
        {/* Search & Filter Header */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-white tracking-tight">Content Library</h1>
            <span className="text-xs text-slate-400 font-semibold">{items.length} Items</span>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, titles..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs custom-scrollbar">
            {['all', 'instagram', 'youtube', 'marketing', 'universal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-1.5 rounded-lg border transition-all ${
                onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Show Favorites Only"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Content Items Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[600px] custom-scrollbar pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading saved content...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/30 rounded-3xl border border-slate-800/80">
              <p className="text-xs text-slate-400 mb-1">No content found matching your filters.</p>
              <p className="text-[11px] text-slate-500">Generate your first content piece in the Studios!</p>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">
                          {item.contentType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] text-slate-500">{item.language}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`p-1 rounded-lg ${
                        item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{item.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className="p-1 hover:text-white transition-colors"
                        title="Copy content"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Full Editor Workspace */}
      <div className="w-full lg:w-7/12 flex flex-col min-h-[500px]">
        <EditorWorkspace
          item={selectedItem}
          onUpdateItem={(updated) => {
            setSelectedItem(updated);
            setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
          }}
          onRefineContent={async (type, options) => {
            if (!selectedItem) return;
            setIsRefining(true);
            try {
              const res = await api.refine({
                contentId: selectedItem.id,
                currentContent: selectedItem.content,
                refinementType: type,
                options,
              });
              updateCredits(res.remainingCredits);
              const updated = {
                ...selectedItem,
                content: res.content,
                version: selectedItem.version + 1,
                versionsHistory: [
                  {
                    versionNumber: selectedItem.version,
                    content: selectedItem.content,
                    timestamp: new Date().toISOString(),
                    summary: `Refined: ${type}`,
                  },
                  ...(selectedItem.versionsHistory || []),
                ],
              };
              setSelectedItem(updated);
              setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
            } catch (err: any) {
              alert(err?.message || 'Refinement failed.');
            } finally {
              setIsRefining(false);
            }
          }}
          isRefining={isRefining}
          onDeleteItem={() => selectedItem && setItemToDelete(selectedItem)}
        />
      </div>

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Delete Content Item?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <span className="text-white font-semibold">"{itemToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
