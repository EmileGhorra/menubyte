import Image from 'next/image';
import type { MenuItem } from '@/types/menu';

interface Props {
  item: MenuItem;
}

export function MenuCard({ item }: Props) {
  const hasImage = Boolean(item.imageUrl);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {hasImage && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={item.imageUrl as string}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-dark">
            ${item.price.toFixed(2)}
            {item.unitLabel && item.priceMode !== 'fixed' ? ` · ${item.unitLabel}` : ''}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {!hasImage && (
          <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-dark">
            ${item.price.toFixed(2)}
            {item.unitLabel && item.priceMode !== 'fixed' ? ` · ${item.unitLabel}` : ''}
          </span>
        )}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark">{item.name}</h3>
          <span
            className={`text-xs font-medium ${item.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {item.isAvailable ? 'Available' : 'Sold out'}
          </span>
        </div>
        <p className="text-sm text-slate-500">{item.description}</p>
        {item.unitLabel && (
          <p className="text-xs font-semibold text-slate-400">
            {item.priceMode === 'fixed' ? 'Fixed price' : item.unitLabel}
          </p>
        )}
        {item.options && item.options.length > 0 && (
          <div className="space-y-1 rounded-xl bg-slate-50 p-2 text-sm text-slate-600">
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
    </article>
  );
}
