'use client';

import { useMemo, useRef, useState } from 'react';
import type { MenuCategory, MenuItem, RestaurantProfile } from '@/types/menu';
import { MenuCategory as MenuCategoryBlock } from './MenuCategory';
import { MenuCard } from './MenuCard';

interface Props {
  restaurant: RestaurantProfile;
  categories: MenuCategory[];
  featuredItems?: MenuItem[];
  isFreePlan: boolean;
  isFallback?: boolean;
}

export function PublicMenuClient({ restaurant, categories, featuredItems = [], isFreePlan, isFallback }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, searchTerm]);

  const displayedCategories = activeCategory === 'all'
    ? filteredCategories
    : filteredCategories.filter((category) => category.id === activeCategory);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (sectionRefs.current[categoryId]) {
      sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const showFeatured = featuredItems.length > 0 && !searchTerm && activeCategory === 'all';
  const noResults = displayedCategories.length === 0;

  return (
    <div className="flex-1 space-y-10">
      {isFallback && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-semibold">Preview menu</p>
          <p>This content is based on the default MenuByte sample until the owner publishes their live dishes.</p>
        </div>
      )}
      <div className="sticky top-4 z-10 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Search menu
        </label>
        <input
          type="search"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder={'Try "pasta", "salad", or "dessert"'}
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setActiveCategory('all');
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <button
            className={`rounded-full px-3 py-1 ${activeCategory === 'all' ? 'bg-dark text-white' : 'bg-slate-100'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-full px-3 py-1 ${
                activeCategory === category.id ? 'bg-dark text-white' : 'bg-slate-100'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {showFeatured && (
        <section className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary">Highlights</p>
            <h2 className="text-2xl font-semibold text-dark">Chef&rsquo;s favorites</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {noResults ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No dishes match &ldquo;{searchTerm}&rdquo;. Try adjusting your search.
        </div>
      ) : (
        displayedCategories.map((category) => (
          <div
            key={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="space-y-6"
          >
            <MenuCategoryBlock category={category} />
            {/* Free plan notice intentionally removed; ads/upgrade promos deferred for future work. */}
          </div>
        ))
      )}
    </div>
  );
}
