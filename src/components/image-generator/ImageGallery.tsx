import { useState } from 'react';
import { GeneratedImage } from '@/hooks/useGeneratedImages';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MoreVertical,
  Trash2,
  Pencil,
  Heart,
  Download,
  Eye,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ImageGalleryProps {
  images: GeneratedImage[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; isFavorite?: boolean }) => void;
  onToggleFavorite: (id: string) => void;
}

export const ImageGallery = ({
  images,
  isLoading,
  onDelete,
  onUpdate,
  onToggleFavorite,
}: ImageGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [viewImage, setViewImage] = useState<GeneratedImage | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = showFavoritesOnly ? img.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleStartEdit = (image: GeneratedImage) => {
    setEditingId(image.id);
    setEditTitle(image.title || image.prompt.substring(0, 50));
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      if (image.imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = image.imageUrl;
        link.download = `${image.title || 'image'}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${image.title || 'image'}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStyleLabel = (style: string) => {
    const styles: Record<string, string> = {
      realistic: 'Photorealistic',
      anime: 'Anime',
      'digital-art': 'Digital Art',
      'oil-painting': 'Oil Painting',
      watercolor: 'Watercolor',
      '3d-render': '3D Render',
    };
    return styles[style] || style;
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Galeri Gambar ({images.length})
            </Label>
            <p className="text-xs text-muted-foreground">
              Semua gambar tersimpan realtime
            </p>
          </div>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-1"
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorit
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan prompt atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[500px]">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {searchQuery || showFavoritesOnly
                  ? 'Tidak ada gambar ditemukan'
                  : 'Belum ada gambar'}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery || showFavoritesOnly
                  ? 'Coba kata kunci lain'
                  : 'Generate gambar pertamamu!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-secondary/30"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.title || image.prompt}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onClick={() => setViewImage(image)}
                    />
                  </div>

                  {/* Favorite indicator */}
                  {image.isFavorite && (
                    <div className="absolute left-2 top-2">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="w-full p-3">
                      {editingId === image.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveEdit(image.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(image.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="h-7 text-xs"
                        />
                      ) : (
                        <p className="truncate text-xs font-medium text-white">
                          {image.title || image.prompt.substring(0, 40)}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-white/70">
                        {getStyleLabel(image.style)} • {image.aspectRatio}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewImage(image)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartEdit(image)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Judul
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleFavorite(image.id)}>
                          <Heart className={`mr-2 h-4 w-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                          {image.isFavorite ? 'Hapus Favorit' : 'Tambah Favorit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(image)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(image.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {viewImage?.title || viewImage?.prompt.substring(0, 50)}
            </DialogTitle>
          </DialogHeader>
          {viewImage && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={viewImage.imageUrl}
                  alt={viewImage.title || viewImage.prompt}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">Prompt:</span>
                  <p className="text-muted-foreground">{viewImage.prompt}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium text-foreground">Style:</span>{' '}
                    <span className="text-muted-foreground">
                      {getStyleLabel(viewImage.style)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Ratio:</span>{' '}
                    <span className="text-muted-foreground">{viewImage.aspectRatio}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Dibuat:</span>{' '}
                  <span className="text-muted-foreground">
                    {format(viewImage.createdAt, 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDownload(viewImage)} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(viewImage.imageUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka di Tab Baru
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
