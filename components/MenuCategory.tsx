import type { MenuCategory as MenuCategoryType } from '@/types/menu';
import { MenuCard } from './MenuCard';

interface Props {
  category: MenuCategoryType;
}

export function MenuCategory({ category }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">Category</p>
        <h2 className="text-2xl font-semibold text-dark">{category.title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
