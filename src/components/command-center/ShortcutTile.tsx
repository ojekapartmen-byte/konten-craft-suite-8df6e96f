import { ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CommandCenterLinkItem } from "@/types/commandCenter";

interface ShortcutTileProps {
  item: CommandCenterLinkItem;
  onInternalNavigate?: (path: string) => void;
}

export const ShortcutTile = ({ item, onInternalNavigate }: ShortcutTileProps) => {
  const isExternal = item.type === "external";

  const content = (
    <div
      className={cn(
        "glass-card group flex h-full w-full flex-col rounded-xl border border-border p-4 text-left transition-all",
        "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      <div className="flex items-start gap-3">
        {item.thumbnailUrl ? (
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            {isExternal ? <ExternalLink className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 font-display text-sm font-semibold text-foreground truncate">{item.title}</h3>
            <div className="ml-auto mt-0.5 text-muted-foreground opacity-80 group-hover:opacity-100">
              {isExternal ? <ExternalLink className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </div>
          </div>
          {item.description ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          ) : null}
        </div>
      </div>

      {item.tags && item.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="rounded-md px-2 py-0.5 text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (isExternal) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="block h-full w-full"
      onClick={() => onInternalNavigate?.(item.url)}
    >
      {content}
    </button>
  );
};
