'use client';

import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment } from 'react';
import type { MenuItemOption } from '@/types/menu';

interface DraftItem {
  name: string;
  description: string;
  price: number;
  categoryLabel?: string;
  imageUrl: string;
  priceMode: 'fixed' | 'per_weight' | 'per_quantity';
  unitLabel?: string | null;
  isAvailable?: boolean;
  options?: MenuItemOption[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  draft: DraftItem;
  saving?: boolean;
  error?: string;
  isEditing?: boolean;
}

export function EditItemModal({ open, onClose, onSave, draft, saving, error, isEditing }: Props) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <Dialog.Title className="text-lg font-semibold text-dark">
                {isEditing ? 'Review changes' : 'Confirm new item'}
              </Dialog.Title>
              <p className="mt-2 text-sm text-slate-500">
                {isEditing
                  ? 'Preview how the updated dish will appear before saving.'
                  : 'This is a preview of what will be published in the QR menu.'}
              </p>
              <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-xl font-semibold text-dark">{draft.name || 'Untitled dish'}</h3>
                <p className="text-sm text-slate-500">{draft.description || 'Add a description to help guests decide.'}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 font-semibold">
                    ${draft.price.toFixed(2)}
                    {draft.unitLabel && draft.priceMode !== 'fixed' ? ` · ${draft.unitLabel}` : ''}
                  </span>
                  {draft.categoryLabel && (
                    <span className="rounded-full bg-white px-3 py-1">{draft.categoryLabel}</span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      draft.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {draft.isAvailable ? 'Available' : 'Sold out'}
                  </span>
                </div>
                {draft.options && draft.options.length > 0 && (
                  <div className="space-y-1 rounded-xl bg-white p-3 text-sm text-slate-600">
                    {draft.options.map((option) => (
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
                {draft.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-xl">
                    <Image
                      src={draft.imageUrl}
                      alt={draft.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                )}
              </div>
              {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
              <div className="mt-6 flex justify-end gap-3 text-sm font-semibold">
                <button className="rounded-full border border-slate-200 px-4 py-2" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="rounded-full bg-dark px-5 py-2 text-white disabled:opacity-70"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : isEditing ? 'Update item' : 'Save item'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
