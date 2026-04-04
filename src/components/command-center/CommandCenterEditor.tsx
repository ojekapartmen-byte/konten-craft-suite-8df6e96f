import { useMemo, useRef, useState } from "react";
import { Grid2X2, Pencil, Plus, RefreshCcw, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommandCenterStore } from "@/hooks/useCommandCenterStore";
import { CommandCenterLinkType } from "@/types/commandCenter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MAX_THUMBNAIL_BYTES = 450_000;

const parseTags = (value: string) =>
  value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const tagsToString = (tags?: string[]) => (tags ?? []).join(", ");

export const CommandCenterEditor = () => {
  const { toast } = useToast();
  const categories = useCommandCenterStore((s) => s.categories);
  const resetToDefault = useCommandCenterStore((s) => s.resetToDefault);
  const addCategory = useCommandCenterStore((s) => s.addCategory);
  const updateCategory = useCommandCenterStore((s) => s.updateCategory);
  const deleteCategory = useCommandCenterStore((s) => s.deleteCategory);
  const addItem = useCommandCenterStore((s) => s.addItem);
  const updateItem = useCommandCenterStore((s) => s.updateItem);
  const deleteItem = useCommandCenterStore((s) => s.deleteItem);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const categoryCount = categories.length;
  const itemCount = useMemo(
    () => categories.reduce((acc, c) => acc + c.items.length, 0),
    [categories]
  );

  const handleReset = () => {
    const ok = window.confirm("Reset Command Center ke default? Semua perubahan lokal akan hilang.");
    if (!ok) return;
    resetToDefault();
    toast({ title: "Command Center di-reset", description: "Daftar shortcut kembali ke default." });
  };

  const requestUpload = (categoryId: string, itemId: string) => {
    const key = `${categoryId}:${itemId}`;
    fileInputsRef.current[key]?.click();
  };

  const onUpload = async (categoryId: string, itemId: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "File tidak didukung", description: "Pilih file gambar (PNG/JPG/WebP).", variant: "destructive" });
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      toast({
        title: "Gambar terlalu besar",
        description: "Maks 450KB supaya aman tersimpan di browser.",
        variant: "destructive",
      });
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!dataUrl) {
      toast({ title: "Gagal upload", description: "Tidak bisa membaca file gambar.", variant: "destructive" });
      return;
    }

    updateItem(categoryId, itemId, { thumbnailUrl: dataUrl });
    toast({ title: "Thumbnail tersimpan", description: "Thumbnail akan tampil di tile Command Center." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" className="h-9 gap-2">
          <Pencil className="h-4 w-4" />
          Edit List
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(980px,calc(100vw-2rem))] max-w-none p-0">
        <div className="flex max-h-[85vh] flex-col overflow-hidden">
          <DialogHeader className="border-b border-border p-4 sm:p-6">
            <DialogTitle className="flex items-center gap-2">
              <Grid2X2 className="h-5 w-5" />
              Kelola Command Center
            </DialogTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              {categoryCount} kategori · {itemCount} shortcut · tersimpan lokal di browser
            </div>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" className="h-9 gap-2" onClick={() => addCategory()}>
                <Plus className="h-4 w-4" />
                Tambah Kategori
              </Button>
              <Button type="button" variant="outline" className="h-9 gap-2" onClick={handleReset}>
                <RefreshCcw className="h-4 w-4" />
                Reset Default
              </Button>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada kategori. Klik “Tambah Kategori”.
              </div>
            ) : null}

            <div className="space-y-4">
              {categories.map((category) => {
                const isExpanded = expanded[category.id] ?? true;
                return (
                  <div key={category.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Nama Kategori</Label>
                            <Input
                              value={category.title}
                              onChange={(e) => updateCategory(category.id, { title: e.target.value })}
                              placeholder="Contoh: Deploy & Hosting"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Warna Label</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={category.color ?? "#6366f1"}
                                onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                                className="h-10 w-16 p-1"
                              />
                              <Input
                                value={category.color ?? ""}
                                onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                                placeholder="#6366F1"
                              />
                              {category.color ? (
                                <Badge
                                  variant="secondary"
                                  className="h-8 rounded-md px-3"
                                  style={{
                                    backgroundColor: `${category.color}22`,
                                    borderColor: `${category.color}44`,
                                    color: category.color,
                                  }}
                                >
                                  {category.title}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Deskripsi (opsional)</Label>
                          <Input
                            value={category.description ?? ""}
                            onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                            placeholder="Contoh: Rilis, domain, dan environment"
                          />
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9"
                          onClick={() => setExpanded((prev) => ({ ...prev, [category.id]: !isExpanded }))}
                        >
                          {isExpanded ? "Tutup" : "Buka"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="h-9 gap-2"
                          onClick={() => {
                            const ok = window.confirm(`Hapus kategori “${category.title}”?`);
                            if (!ok) return;
                            deleteCategory(category.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    </div>

                    {!isExpanded ? null : (
                      <>
                        <Separator className="my-4" />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium text-foreground">
                            Shortcut ({category.items.length})
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-9 gap-2"
                            onClick={() => addItem(category.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Tambah Shortcut
                          </Button>
                        </div>

                        <div className="mt-3 space-y-3">
                          {category.items.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                              Belum ada shortcut di kategori ini.
                            </div>
                          ) : null}

                          {category.items.map((item) => {
                            const itemKey = `${category.id}:${item.id}`;
                            return (
                              <div key={item.id} className="rounded-lg border border-border p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-semibold text-foreground truncate">
                                        {item.title}
                                      </div>
                                      <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px]">
                                        {item.type}
                                      </Badge>
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-foreground truncate">{item.url}</div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const ok = window.confirm(`Hapus shortcut “${item.title}”?`);
                                      if (!ok) return;
                                      deleteItem(category.id, item.id);
                                    }}
                                    aria-label="Hapus shortcut"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <Label>Judul</Label>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => updateItem(category.id, item.id, { title: e.target.value })}
                                      placeholder="Contoh: Vercel"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Tipe</Label>
                                    <Select
                                      value={item.type}
                                      onValueChange={(v) =>
                                        updateItem(category.id, item.id, { type: v as CommandCenterLinkType })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="external">external (URL)</SelectItem>
                                        <SelectItem value="internal">internal (route)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="md:col-span-2 space-y-1.5">
                                    <Label>URL / Path</Label>
                                    <Input
                                      value={item.url}
                                      onChange={(e) => updateItem(category.id, item.id, { url: e.target.value })}
                                      placeholder={item.type === "internal" ? "/command-center" : "https://..."}
                                    />
                                  </div>
                                  <div className="md:col-span-2 space-y-1.5">
                                    <Label>Deskripsi (opsional)</Label>
                                    <Textarea
                                      value={item.description ?? ""}
                                      onChange={(e) =>
                                        updateItem(category.id, item.id, { description: e.target.value })
                                      }
                                      placeholder="Catatan singkat untuk tile"
                                    />
                                  </div>
                                  <div className="md:col-span-2 space-y-1.5">
                                    <Label>Tags (pisahkan dengan koma)</Label>
                                    <Input
                                      value={tagsToString(item.tags)}
                                      onChange={(e) => updateItem(category.id, item.id, { tags: parseTags(e.target.value) })}
                                      placeholder="deploy, vercel, domain"
                                    />
                                  </div>

                                  <div className="md:col-span-2 space-y-2">
                                    <Label>Thumbnail / Icon (upload gambar)</Label>
                                    <div className="flex flex-wrap items-center gap-2">
                                      {item.thumbnailUrl ? (
                                        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                                          <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-secondary">
                                            <img
                                              src={item.thumbnailUrl}
                                              alt={item.title}
                                              className="h-full w-full object-cover"
                                              loading="lazy"
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 gap-2"
                                            onClick={() => requestUpload(category.id, item.id)}
                                          >
                                            <Upload className="h-4 w-4" />
                                            Ganti
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-9 gap-2"
                                            onClick={() => updateItem(category.id, item.id, { thumbnailUrl: undefined })}
                                          >
                                            <X className="h-4 w-4" />
                                            Hapus
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="h-9 gap-2"
                                          onClick={() => requestUpload(category.id, item.id)}
                                        >
                                          <Upload className="h-4 w-4" />
                                          Upload
                                        </Button>
                                      )}
                                      <input
                                        ref={(el) => {
                                          fileInputsRef.current[itemKey] = el;
                                        }}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onUpload(category.id, item.id, e.target.files?.[0] ?? null)}
                                      />
                                      <div className="text-xs text-muted-foreground">
                                        Maks 450KB (disimpan sebagai data URL di browser).
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

