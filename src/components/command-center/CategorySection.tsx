import { CommandCenterCategory } from "@/types/commandCenter";
import { ShortcutTile } from "@/components/command-center/ShortcutTile";

interface CategorySectionProps {
  category: CommandCenterCategory;
  onInternalNavigate?: (path: string) => void;
}

export const CategorySection = ({ category, onInternalNavigate }: CategorySectionProps) => {
  return (
    <section className="animate-fade-in">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {category.color ? (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: category.color }}
                aria-label={`Warna kategori ${category.title}`}
              />
            ) : null}
            <h2 className="font-display text-base font-semibold text-foreground truncate">{category.title}</h2>
          </div>
          {category.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{category.description}</p>
          ) : null}
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">{category.items.length}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <ShortcutTile key={item.id} item={item} onInternalNavigate={onInternalNavigate} />
        ))}
      </div>
    </section>
  );
};
