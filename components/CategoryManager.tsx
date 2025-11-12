'use client';

// NOTE: Handles add/edit/delete/reorder of categories; keep drag logic in sync with API PATCH handler expectations.
import { useEffect, useState } from 'react';
import type { MenuCategory } from '@/types/menu';
import { InlineSpinner } from './InlineSpinner';

interface Props {
  categories: MenuCategory[];
  activeCategoryId: string;
  setActiveCategory: (id: string) => void;
  restaurantId: string;
  onChange?: () => void;
}

export function CategoryManager({ categories, activeCategoryId, setActiveCategory, restaurantId, onChange }: Props) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    setError('');

    const response = await fetch('/api/menu-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, title: newCategoryName.trim() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Unable to create category');
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsAdding(false);
    setNewCategoryName('');
    onChange?.();
  };

  const startEditing = (category: MenuCategory) => {
    setEditingId(category.id);
    setEditingValue(category.title);
    setIsAdding(false);
    setError('');
  };

  const handleEditSave = async () => {
    if (!editingId || !editingValue.trim()) return;
    setEditingSaving(true);
    setError('');

    const response = await fetch('/api/menu-categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, title: editingValue.trim() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Unable to update category');
      setEditingSaving(false);
      return;
    }

    setEditingSaving(false);
    setEditingId(null);
    setEditingValue('');
    onChange?.();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and its items?')) return;
    setDeletingId(id);
    setError('');

    const response = await fetch(`/api/menu-categories?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Unable to delete category');
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    setLocalCategories((prev) => prev.filter((cat) => cat.id !== id));
    if (activeCategoryId === id && categories.length > 0) {
      const fallback = categories.find((cat) => cat.id !== id);
      if (fallback) {
        setActiveCategory(fallback.id);
      }
    }
    onChange?.();
  };

  const persistPositions = async (ordered: MenuCategory[]) => {
    setReordering(true);
    const response = await fetch('/api/menu-categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: ordered.map((cat, index) => ({ id: cat.id, position: index })),
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Unable to reorder categories');
    } else {
      onChange?.();
    }
    setReordering(false);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    event.preventDefault();
    if (!draggedId || draggedId === overId) return;
    setLocalCategories((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((cat) => cat.id === draggedId);
      const toIndex = next.findIndex((cat) => cat.id === overId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDragEnd = () => {
    if (!draggedId) return;
    setDraggedId(null);
    persistPositions(localCategories);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
        {reordering && <InlineSpinner label="Saving order…" />}
        {localCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2"
            draggable={!isAdding && !editingId && !reordering}
            onDragStart={() => handleDragStart(category.id)}
            onDragOver={(event) => handleDragOver(event, category.id)}
            onDragEnd={handleDragEnd}
          >
            <button
              className={`rounded-full px-4 py-2 ${
                activeCategoryId === category.id ? 'bg-dark text-white' : 'bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.title}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              onClick={() => startEditing(category)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
              onClick={() => handleDelete(category.id)}
              disabled={deletingId === category.id}
            >
              {deletingId === category.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setError('');
          }}
        >
          + Category
        </button>
      </div>
      {isAdding && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="Desserts"
          />
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            onClick={handleAddCategory}
            disabled={saving}
          >
            {saving ? <InlineSpinner /> : 'Save'}
          </button>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={() => {
              setIsAdding(false);
              setError('');
              setNewCategoryName('');
            }}
          >
            Cancel
          </button>
        </div>
      )}
      {editingId && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            placeholder="Category name"
          />
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            onClick={handleEditSave}
            disabled={editingSaving}
          >
            {editingSaving ? <InlineSpinner /> : 'Save changes'}
          </button>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={() => {
              setEditingId(null);
              setEditingValue('');
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400">
        Drag categories to reorder how they appear on your public menu.
      </p>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
