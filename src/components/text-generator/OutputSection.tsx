import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GeneratedContent } from '@/types/textGenerator';
import { Copy, Check, FileText, Hash, Eye, Camera, Subtitles, Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OutputSectionProps {
  content: GeneratedContent | null;
  isLoading?: boolean;
}

export const OutputSection = ({ content, isLoading }: OutputSectionProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({
      title: "Disalin!",
      description: `${section} sudah disalin ke clipboard`,
    });
  };

  const handleExport = (format: 'txt' | 'md') => {
    if (!content) return;
    
    let text = content.content.mainScript;
    if (content.content.caption) {
      text += `\n\n---\n\nCaption:\n${content.content.caption}`;
    }
    if (content.content.hashtags?.length) {
      text += `\n\nHashtags:\n${content.content.hashtags.join(' ')}`;
    }
    if (content.content.onScreenText?.length) {
      text += `\n\n---\n\nOn-Screen Text:\n${content.content.onScreenText.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    }
    if (content.content.shotList?.length) {
      text += `\n\n---\n\nShot List:\n${content.content.shotList.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title || 'script'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Berhasil diexport!",
      description: `File ${format.toUpperCase()} telah diunduh`,
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card h-full rounded-xl p-6">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-3 text-sm text-muted-foreground">Sedang generate konten dalam Bahasa Indonesia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="glass-card h-full rounded-xl p-6">
        <div className="flex h-[400px] flex-col items-center justify-center text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Hasil generate akan muncul di sini
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Pilih template, isi form, lalu klik Generate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-full rounded-xl p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{content.title}</h3>
          <p className="text-xs text-muted-foreground">
            {content.metadata.wordCount} kata • {content.metadata.duration} detik
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => handleExport('txt')} className="h-8 gap-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            TXT
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport('md')} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            MD
          </Button>
        </div>
      </div>

      <Tabs defaultValue="script" className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="script" className="gap-1 text-xs px-2 py-1.5">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Script</span>
          </TabsTrigger>
          <TabsTrigger value="caption" className="gap-1 text-xs px-2 py-1.5">
            <Hash className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Caption</span>
          </TabsTrigger>
          <TabsTrigger value="onscreen" className="gap-1 text-xs px-2 py-1.5">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">On-Screen</span>
          </TabsTrigger>
          <TabsTrigger value="shots" className="gap-1 text-xs px-2 py-1.5">
            <Camera className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Shots</span>
          </TabsTrigger>
          <TabsTrigger value="subtitle" className="gap-1 text-xs px-2 py-1.5">
            <Subtitles className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Subtitle</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="mt-0">
          <OutputBlock
            title="Script Utama"
            content={content.content.mainScript}
            copied={copiedSection === 'script'}
            onCopy={() => handleCopy(content.content.mainScript, 'script')}
          />
        </TabsContent>

        <TabsContent value="caption" className="mt-0 space-y-4">
          {content.content.caption && (
            <OutputBlock
              title="Caption"
              content={content.content.caption}
              copied={copiedSection === 'caption'}
              onCopy={() => handleCopy(content.content.caption!, 'caption')}
            />
          )}
          {content.content.hashtags && content.content.hashtags.length > 0 && (
            <OutputBlock
              title="Hashtags"
              content={content.content.hashtags.join(' ')}
              copied={copiedSection === 'hashtags'}
              onCopy={() => handleCopy(content.content.hashtags!.join(' '), 'hashtags')}
            />
          )}
        </TabsContent>

        <TabsContent value="onscreen" className="mt-0">
          {content.content.onScreenText && content.content.onScreenText.length > 0 ? (
            <OutputBlock
              title="On-Screen Text"
              content={content.content.onScreenText.map((t, i) => `${i + 1}. ${t}`).join('\n')}
              copied={copiedSection === 'onscreen'}
              onCopy={() => handleCopy(content.content.onScreenText!.join('\n'), 'onscreen')}
            />
          ) : (
            <EmptyState message="Tidak ada on-screen text" />
          )}
        </TabsContent>

        <TabsContent value="shots" className="mt-0">
          {content.content.shotList && content.content.shotList.length > 0 ? (
            <OutputBlock
              title="Shot List / B-Roll Suggestions"
              content={content.content.shotList.map((s, i) => `${i + 1}. ${s}`).join('\n')}
              copied={copiedSection === 'shots'}
              onCopy={() => handleCopy(content.content.shotList!.join('\n'), 'shots')}
            />
          ) : (
            <EmptyState message="Tidak ada shot list" />
          )}
        </TabsContent>

        <TabsContent value="subtitle" className="mt-0">
          {content.content.subtitleFriendly ? (
            <OutputBlock
              title="Subtitle Friendly (Kalimat Pendek)"
              content={content.content.subtitleFriendly}
              copied={copiedSection === 'subtitle'}
              onCopy={() => handleCopy(content.content.subtitleFriendly!, 'subtitle')}
            />
          ) : (
            <EmptyState message="Tidak ada subtitle friendly version" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface OutputBlockProps {
  title: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}

const OutputBlock = ({ title, content, copied, onCopy }: OutputBlockProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCopy}
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Disalin
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Salin
          </>
        )}
      </Button>
    </div>
    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border bg-secondary/30 p-4">
      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{content}</pre>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
