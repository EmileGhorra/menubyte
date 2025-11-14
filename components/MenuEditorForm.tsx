'use client';

import type { DragEvent } from 'react';
import type { MenuCategory, MenuItemOption, PlanTier, PriceMode } from '@/types/menu';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InlineSpinner } from './InlineSpinner';
import { useRouter } from 'next/navigation';
import { EditItemModal } from './EditItemModal';
import { ImageUploader } from './ImageUploader';
import { FREE_ITEM_LIMIT } from '@/menuData';
import { CategoryManager } from './CategoryManager';

type DraftItem = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  priceMode: PriceMode;
  unitLabel: string;
  isAvailable: boolean;
  options: MenuItemOption[];
};

interface Props {
  categories: MenuCategory[];
  planType: PlanTier;
  restaurantId: string;
}

export function MenuEditorForm({ categories, planType, restaurantId }: Props) {
  const router = useRouter();
  const itemNameRef = useRef<HTMLInputElement>(null);
  const createEmptyDraft = (): DraftItem => ({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id ?? '',
    imageUrl: '',
    priceMode: 'fixed',
    unitLabel: '',
    isAvailable: true,
    options: [] as MenuItemOption[],
  });

  const [draft, setDraft] = useState<DraftItem>(createEmptyDraft);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; price?: string; options?: string }>({});
  const totalItems = categories.reduce((count, category) => count + category.items.length, 0);
  const reachedFreeLimit = planType === 'free' && totalItems >= FREE_ITEM_LIMIT;
  const canUploadImages = planType === 'pro';
  const isVariablePricing = draft.priceMode !== 'fixed';
  const [orderedItems, setOrderedItems] = useState<MenuCategory['items'][number][]>(
    () => categories.find((category) => category.id === activeCategory)?.items ?? categories[0]?.items ?? []
  );
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [itemReorderSaving, setItemReorderSaving] = useState(false);
  const [itemReorderError, setItemReorderError] = useState('');
  const priceInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryLabel = useMemo(() => {
    return categories.find((category) => category.id === draft.categoryId)?.title ?? 'Uncategorized';
  }, [categories, draft.categoryId]);

  useEffect(() => {
    const activeItems = categories.find((category) => category.id === activeCategory)?.items ?? [];
    setOrderedItems(activeItems);
  }, [categories, activeCategory]);


const addOption = () => {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    setDraft((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: tempId,
          label: '',
          price: 0,
          unitLabel: prev.priceMode === 'per_weight' ? prev.unitLabel : '',
          position: prev.options.length,
        },
      ],
    }));
    setFieldErrors((prev) => ({ ...prev, options: undefined }));
};

const updateOption = (optionId: string, index: number, field: 'label' | 'price' | 'unitLabel', value: string) => {
    setDraft((prev) => {
      const next = [...prev.options];
      const option = { ...next[index] };
      if (field === 'price') {
        option.price = parseFloat(value) || 0;
      } else {
        option[field] = value;
      }
      option.id = optionId;
      next[index] = option;
      return { ...prev, options: next };
    });
};

  const removeOption = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }));
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.options.length) {
        return prev;
      }
      const next = [...prev.options];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return {
        ...prev,
        options: next.map((opt, idx) => ({ ...opt, position: idx })),
      };
    });
  };

  const [availabilityUpdating, setAvailabilityUpdating] = useState<string | null>(null);
  const handleItemDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleItemDragOver = (event: DragEvent<HTMLDivElement>, overId: string) => {
    event.preventDefault();
    if (!draggedItemId || draggedItemId === overId) {
      return;
    }
    setOrderedItems((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((item) => item.id === draggedItemId);
      const toIndex = next.findIndex((item) => item.id === overId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const persistItemPositions = async (items: MenuCategory['items'][number][]) => {
    if (items.length === 0) return;
    setItemReorderSaving(true);
    setItemReorderError('');
    try {
      const response = await fetch('/api/menu-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: items.map((item, index) => ({ id: item.id, position: index })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Unable to reorder items');
      }
      router.refresh();
    } catch (error) {
      setItemReorderError((error as Error).message);
    } finally {
      setItemReorderSaving(false);
    }
  };

  const handleItemDragEnd = () => {
    if (!draggedItemId) return;
    setDraggedItemId(null);
    persistItemPositions(orderedItems);
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setOrderedItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      persistItemPositions(next);
      return next;
    });
  };

  const toggleItemAvailability = async (itemId: string, current: boolean) => {
    setAvailabilityUpdating(itemId);
    try {
      const response = await fetch('/api/menu-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isAvailable: !current }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error ?? 'Unable to update availability.');
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage('Network error while updating availability.');
    } finally {
      setAvailabilityUpdating(null);
    }
  };

  const handleSave = async () => {
    setFieldErrors({});
    setErrorMessage('');
    const trimmedName = draft.name.trim();

    if (!trimmedName) {
      setFieldErrors({ name: 'Give this dish a name.' });
      setErrorMessage('Please name the dish before saving.');
      itemNameRef.current?.focus();
      return;
    }
    if (!draft.categoryId) {
      setErrorMessage('Choose a category for this item.');
      return;
    }
    if (!Number.isFinite(draft.price) || draft.price < 0) {
      setFieldErrors({ price: 'Enter a valid price (use 0 for complimentary items).' });
      setErrorMessage('Please enter a valid price.');
      priceInputRef.current?.focus();
      return;
    }
    if (draft.priceMode !== 'fixed' && draft.options.length === 0) {
      setFieldErrors({ options: 'Add at least one variant for weight/quantity pricing.' });
      setErrorMessage('Add at least one option for weight/quantity pricing.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/menu-items' + (editingItemId ? `?id=${editingItemId}` : ''), {
        method: editingItemId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: editingItemId,
          categoryId: draft.categoryId,
          name: trimmedName,
          description: draft.description,
          price: draft.price,
          priceMode: draft.priceMode,
          unitLabel: draft.priceMode === 'fixed' ? null : draft.unitLabel,
          imageUrl: draft.imageUrl,
          isAvailable: draft.isAvailable,
          options:
            draft.priceMode === 'fixed'
              ? []
              : draft.options.map((option, index) => ({
                  id: option.id?.startsWith('temp-') ? undefined : option.id,
                  label: option.label,
                  price: option.price,
                  unitLabel: option.unitLabel,
                  position: option.position ?? index,
                })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error ?? 'Unable to save item');
        setIsSaving(false);
        return;
      }
    } catch {
      setErrorMessage('Network error while saving. Please try again.');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingItemId(null);
    setFieldErrors({});
    setDraft(createEmptyDraft());
    router.refresh();
  };

  const startEdit = (item: MenuCategory['items'][number], categoryId: string) => {
    setDraft({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId,
      imageUrl: item.imageUrl ?? '',
      priceMode: item.priceMode,
      unitLabel: item.unitLabel ?? '',
      isAvailable: item.isAvailable,
      options:
        item.priceMode === 'fixed'
          ? []
          : item.options?.map((option, index) => ({ ...option, position: option.position ?? index })) ?? [],
    });
    setEditingItemId(item.id);
    setFieldErrors({});
    setErrorMessage('');
    setIsModalOpen(false);
    requestAnimationFrame(() => {
      itemNameRef.current?.focus();
      itemNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      const response = await fetch(`/api/menu-items?id=${itemId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error ?? 'Unable to delete menu item.');
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage('Network error while deleting. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-slate-400">Add menu item</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Item name
            <input
              ref={itemNameRef}
              className={`mt-2 rounded-xl border px-3 py-2 text-sm focus:ring-1 ${
                fieldErrors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-primary focus:ring-primary'
              }`}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Truffle Carbonara"
            />
            {fieldErrors.name && <span className="mt-1 text-xs text-rose-600">{fieldErrors.name}</span>}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Price (USD)
            <input
              type="number"
              ref={priceInputRef}
              className={`mt-2 rounded-xl border px-3 py-2 text-sm focus:ring-1 ${
                fieldErrors.price ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-primary focus:ring-primary'
              }`}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
              placeholder="24"
            />
            {fieldErrors.price && <span className="mt-1 text-xs text-rose-600">{fieldErrors.price}</span>}
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Description
          <textarea
            className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Tagliatelle, guanciale, pecorino..."
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Category
            <select
              className="mt-2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              value={draft.categoryId}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Pricing mode
            <select
              className="mt-2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              value={draft.priceMode}
              onChange={(e) => {
                const nextMode = e.target.value as PriceMode;
                setDraft((prev) => ({
                  ...prev,
                  priceMode: nextMode,
                  options: nextMode === 'fixed' ? [] : prev.options,
                }));
                if (nextMode === 'fixed') {
                  setFieldErrors((prev) => ({ ...prev, options: undefined }));
                }
              }}
            >
              <option value="fixed">Fixed price</option>
              <option value="per_weight">Per weight</option>
              <option value="per_quantity">Per quantity</option>
            </select>
          </label>
          <ImageUploader
            value={draft.imageUrl}
            onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
            disabled={!canUploadImages}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={draft.isAvailable}
              onChange={(event) => setDraft({ ...draft, isAvailable: event.target.checked })}
            />
            Available
          </label>
          <span className="text-xs text-slate-500">Uncheck to mark the dish as sold out on the public menu.</span>
        </div>
        {draft.priceMode !== 'fixed' && (
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Unit label
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              value={draft.unitLabel}
              onChange={(e) => setDraft({ ...draft, unitLabel: e.target.value })}
              placeholder={draft.priceMode === 'per_weight' ? 'per 100g' : 'per piece'}
            />
          </label>
        )}
        {isVariablePricing && (
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-dark">Variants / portions</p>
                <p className="text-xs text-slate-500">Add size or weight-based prices.</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={addOption}
              >
                + Option
              </button>
            </div>
            {draft.options.length === 0 ? (
              <p className="text-xs text-slate-500">No options yet. Add at least one for weight/quantity pricing.</p>
            ) : (
              draft.options.map((option, index) => (
                <div key={option.id ?? index} className="grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col text-xs font-semibold text-slate-700">
                    Label
                    <input
                      className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      value={option.label}
                      onChange={(event) => updateOption(option.id ?? `temp-${index}`, index, 'label', event.target.value)}
                      placeholder="Large"
                    />
                  </label>
                  <label className="flex flex-col text-xs font-semibold text-slate-700">
                    Price
                    <input
                      type="number"
                      className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      value={option.price}
                      onChange={(event) => updateOption(option.id ?? `temp-${index}`, index, 'price', event.target.value)}
                      placeholder="18"
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      value={option.unitLabel ?? ''}
                      onChange={(event) => updateOption(option.id ?? `temp-${index}`, index, 'unitLabel', event.target.value)}
                      placeholder={draft.priceMode === 'per_weight' ? 'per 500g' : 'per portion'}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600"
                        onClick={() => moveOption(index, -1)}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600"
                        onClick={() => moveOption(index, 1)}
                        disabled={index === draft.options.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
            {fieldErrors.options && <p className="text-xs text-rose-600">{fieldErrors.options}</p>}
          </div>
        )}
        {!canUploadImages && (
          <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Image uploads are available on the Pro plan. Upgrade in Billing to unlock photos and remove ads.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={`rounded-full px-6 py-2 text-sm font-semibold text-white ${
              reachedFreeLimit && !editingItemId ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary'
            }`}
            onClick={() => setIsModalOpen(true)}
            disabled={reachedFreeLimit && !editingItemId}
          >
            {editingItemId ? 'Update item' : 'Preview & save'}
          </button>
          {reachedFreeLimit && (
            <p className="text-sm font-semibold text-amber-600">
              Free plan limit reached ({FREE_ITEM_LIMIT} items). Upgrade to add more dishes.
            </p>
          )}
          <button
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600"
          onClick={() => {
            setDraft(createEmptyDraft());
            setEditingItemId(null);
            setFieldErrors({});
            setErrorMessage('');
          }}
        >
          Clear
        </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
        <CategoryManager
          categories={categories}
          activeCategoryId={activeCategory}
          setActiveCategory={setActiveCategory}
          restaurantId={restaurantId}
          onChange={() => router.refresh()}
        />
        <p className="mt-4 text-xs text-slate-500">Drag cards to reorder dishes within this category.</p>
        <div className="mt-4 space-y-3">
          {itemReorderSaving && <InlineSpinner label="Saving item order…" />}
          {itemReorderError && <p className="text-sm text-rose-600">{itemReorderError}</p>}
          {orderedItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
              No items yet. Add a dish using the form above.
            </p>
          ) : (
            orderedItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center ${
                  draggedItemId === item.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={() => handleItemDragStart(item.id)}
                onDragOver={(event) => handleItemDragOver(event, item.id)}
                onDragEnd={handleItemDragEnd}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm uppercase tracking-wide text-slate-400">{item.category}</p>
                  <h3 className="text-lg font-semibold text-dark">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                  {item.unitLabel && (
                    <p className="text-xs font-semibold text-slate-400">
                      {item.priceMode === 'fixed' ? 'Fixed price' : item.unitLabel}
                    </p>
                  )}
                  {item.options && item.options.length > 0 && (
                    <div className="space-y-1 rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                      {item.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between">
                          <span>{option.label}</span>
                          <span className="font-semibold">
                            ${option.price.toFixed(2)}
                            {option.unitLabel ? ` · ${option.unitLabel}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-dark">
                    ${item.price.toFixed(2)}
                    {item.unitLabel && item.priceMode !== 'fixed' ? ` · ${item.unitLabel}` : ''}
                  </span>
                  <div className="flex gap-2">
                    <div className="flex rounded-full border border-slate-200">
                      <button
                        type="button"
                        className="px-2 text-xs text-slate-500 disabled:opacity-50"
                        onClick={() => moveItem(item.id, -1)}
                        disabled={orderedItems[0]?.id === item.id || itemReorderSaving}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-2 text-xs text-slate-500 disabled:opacity-50"
                        onClick={() => moveItem(item.id, 1)}
                        disabled={orderedItems[orderedItems.length - 1]?.id === item.id || itemReorderSaving}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        item.isAvailable
                          ? 'border-emerald-200 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      } disabled:opacity-70`}
                      onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                      disabled={availabilityUpdating === item.id}
                    >
                      {availabilityUpdating === item.id ? (
                        <InlineSpinner label="Saving" />
                      ) : item.isAvailable ? (
                        'Mark sold out'
                      ) : (
                        'Mark available'
                      )}
                    </button>
                    <button
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      onClick={() => startEdit(item, activeCategory)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <EditItemModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMessage('');
        }}
        onSave={handleSave}
        draft={{ ...draft, categoryLabel: selectedCategoryLabel }}
        saving={isSaving}
        error={errorMessage}
        isEditing={Boolean(editingItemId)}
      />
    </div>
  );
}
