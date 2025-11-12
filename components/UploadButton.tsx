'use client';

import { useRef, useState } from 'react';
import { InlineSpinner } from './InlineSpinner';

interface Props {
  onUpload: (url: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function UploadButton({ onUpload, disabled, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const triggerInput = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', `uploads/${Date.now()}-${file.name}`);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Upload failed');
      setIsUploading(false);
      return;
    }

    const { url } = await response.json();
    setIsUploading(false);
    onUpload(url);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-60"
        onClick={triggerInput}
        disabled={disabled || isUploading}
      >
        {isUploading ? 'Uploading…' : children ?? 'Upload image'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {isUploading && <InlineSpinner label="Uploading" />}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
