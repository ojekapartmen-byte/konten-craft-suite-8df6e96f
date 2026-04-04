import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid2X2, Search, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { commandCenterConfigFileHint } from "@/data/commandCenterLinks";
import { useCommandCenterStore } from "@/hooks/useCommandCenterStore";
import { CategorySection } from "@/components/command-center/CategorySection";
import { CommandCenterEditor } from "@/components/command-center/CommandCenterEditor";
import { countCommandCenterItems, filterCommandCenterCategories } from "@/utils/commandCenterSearch";

const CommandCenter = () => {
  const navigate = useNavigate();
  const categories = useCommandCenterStore((s) => s.categories);
  const query = useCommandCenterStore((s) => s.query);
  const setQuery = useCommandCenterStore((s) => s.setQuery);

  const filtered = useMemo(() => filterCommandCenterCategories(categories, query), [categories, query]);
  const totalItems = useMemo(() => countCommandCenterItems(categories), [categories]);
  const filteredItems = useMemo(() => countCommandCenterItems(filtered), [filtered]);

  return (
    <MainLayout>
      <PageHeader
        icon={Grid2X2}
        title="Command Center"
        description="Shortcut cepat ke dashboard dan tools penting"
      />

      <div className="glass-card rounded-xl border border-border p-4 md:p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari: vercel, supabase, analytics, domain..."
              className="pl-9 pr-10"
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div className="text-xs text-muted-foreground">
              {query.trim().length > 0 ? (
                <span>
                  {filteredItems} dari {totalItems}
                </span>
              ) : (
                <span>{totalItems} shortcut</span>
              )}
            </div>
            <CommandCenterEditor />
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => navigate("/")}
            >
              Kembali
            </Button>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Default list dari <span className="font-medium text-foreground">{commandCenterConfigFileHint}</span>, edit via tombol “Edit List” akan tersimpan lokal di browser.
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground animate-fade-in">
            Tidak ada hasil untuk <span className="text-foreground font-medium">{query.trim()}</span>
          </div>
        ) : (
          filtered.map((category, idx) => (
            <div key={category.id} style={{ animationDelay: `${0.05 * idx}s` }}>
              <CategorySection category={category} onInternalNavigate={(path) => navigate(path)} />
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default CommandCenter;
