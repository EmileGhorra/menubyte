'use client';

// NOTE: Handles add/edit/delete/reorder of categories; keep drag logic in sync with API PATCH handler expectations.
import { useEffect, useRef, useState } from 'react';
import type { MenuCategory } from '@/types/menu';
import { InlineSpinner } from './InlineSpinner';
import { slugify } from '@/lib/utils/slugify';

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
  const [newCategoryError, setNewCategoryError] = useState('');
  const [editingError, setEditingError] = useState('');
  const [alert, setAlert] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleAddCategory = async () => {
    const title = newCategoryName.trim();
    if (!title) {
      setNewCategoryError('Please enter a category name.');
      newCategoryInputRef.current?.focus();
      return;
    }
    setSaving(true);
    setNewCategoryError('');
    setAlert(null);

    const response = await fetch('/api/menu-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, title }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setNewCategoryError(data.error ?? 'Unable to create category');
      newCategoryInputRef.current?.focus();
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsAdding(false);
    setNewCategoryName('');
    setAlert({ tone: 'success', text: 'Category added.' });
    onChange?.();
  };

  const startEditing = (category: MenuCategory) => {
    setEditingId(category.id);
    setEditingValue(category.title);
    setIsAdding(false);
    setAlert(null);
    setEditingError('');
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const title = editingValue.trim();
    if (!title) {
      setEditingError('Category name cannot be empty.');
      editingInputRef.current?.focus();
      return;
    }
    setEditingSaving(true);
    setEditingError('');
    setAlert(null);

    const response = await fetch('/api/menu-categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, title }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setEditingError(data.error ?? 'Unable to update category');
      editingInputRef.current?.focus();
      setEditingSaving(false);
      return;
    }

    setEditingSaving(false);
    setEditingId(null);
    setEditingValue('');
    setAlert({ tone: 'success', text: 'Category updated.' });
    onChange?.();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and its items?')) return;
    setDeletingId(id);
    setAlert(null);

    const response = await fetch(`/api/menu-categories?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setAlert({ tone: 'error', text: data.error ?? 'Unable to delete category' });
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
    setAlert({ tone: 'success', text: 'Category deleted.' });
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
      setAlert({ tone: 'error', text: data.error ?? 'Unable to reorder categories' });
    } else {
      setAlert({ tone: 'success', text: 'Category order updated.' });
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

  const moveCategory = (id: string, direction: -1 | 1) => {
    setLocalCategories((prev) => {
      const index = prev.findIndex((cat) => cat.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      persistPositions(next);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {alert && (
        <div
          className={`rounded-2xl border px-4 py-2 text-sm ${
            alert.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {alert.text}
        </div>
      )}
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
            <div className="flex rounded-full border border-slate-200">
              <button
                type="button"
                className="px-2 text-xs text-slate-500 disabled:opacity-50"
                onClick={() => moveCategory(category.id, -1)}
                disabled={reordering || localCategories[0]?.id === category.id}
              >
                ↑
              </button>
              <button
                type="button"
                className="px-2 text-xs text-slate-500 disabled:opacity-50"
                onClick={() => moveCategory(category.id, 1)}
                disabled={reordering || localCategories[localCategories.length - 1]?.id === category.id}
              >
                ↓
              </button>
            </div>
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
            setAlert(null);
            setNewCategoryError('');
          }}
        >
          + Category
        </button>
      </div>
      {isAdding && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            className={`flex-1 rounded-2xl border px-3 py-2 text-sm focus:ring-1 ${
              newCategoryError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-primary focus:ring-primary'
            }`}
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="Desserts"
            ref={newCategoryInputRef}
          />
          {newCategoryError && <p className="text-xs text-rose-600">{newCategoryError}</p>}
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
              setAlert(null);
              setNewCategoryName('');
              setNewCategoryError('');
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
            className={`flex-1 rounded-2xl border px-3 py-2 text-sm focus:ring-1 ${
              editingError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-primary focus:ring-primary'
            }`}
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            placeholder="Category name"
            ref={editingInputRef}
          />
          {editingError && <p className="text-xs text-rose-600">{editingError}</p>}
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
              setEditingError('');
              setAlert(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400">
        Drag categories to reorder how they appear on your public menu.
      </p>
    </div>
  );
}
