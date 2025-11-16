'use client';

import Image from 'next/image';
import { UploadButton } from './UploadButton';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const placeholders = [
  '/assets/demo/dish9.png',
  '/assets/demo/dish6.png',
  '/assets/demo/dish4.png',
];

export function ImageUploader({ value, onChange, disabled = false }: Props) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 p-4 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <p className="text-sm font-semibold text-slate-700">Image</p>
      <p className="text-xs text-slate-500">
        {disabled ? 'Upgrade to add photos.' : 'Choose a placeholder or upload your own image.'}
      </p>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {placeholders.map((url) => (
          <button
            key={url}
            type="button"
            className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 ${
              value === url ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => !disabled && onChange(url)}
            disabled={disabled}
          >
            <Image src={url} alt="placeholder" width={80} height={80} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {!disabled && (
        <div className="mt-3">
          <UploadButton onUpload={onChange}>Upload image</UploadButton>
        </div>
      )}
      {value && <p className="mt-2 text-xs text-emerald-600">Selected image attached.</p>}
    </div>
  );
}
