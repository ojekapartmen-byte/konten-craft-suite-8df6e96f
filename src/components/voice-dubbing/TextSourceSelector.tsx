import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditableField } from "@/components/scheduling/EditableField";
import { FileText, Edit3, History } from "lucide-react";
import { TextSourceType } from "@/types/voiceDubbing";
import { DraftHistory } from "@/types/textGenerator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TextSourceSelectorProps {
  sourceType: TextSourceType;
  onSourceTypeChange: (type: TextSourceType) => void;
  manualText: string;
  onManualTextChange: (text: string) => void;
  drafts: DraftHistory[];
  selectedDraftId?: string;
  onSelectDraft: (draft: DraftHistory) => void;
}

export const TextSourceSelector = ({
  sourceType,
  onSourceTypeChange,
  manualText,
  onManualTextChange,
  drafts,
  selectedDraftId,
  onSelectDraft,
}: TextSourceSelectorProps) => {
  const sources = [
    { id: 'history' as TextSourceType, label: 'Dari Riwayat', icon: History, description: 'Gunakan script dari Text Generator' },
    { id: 'manual' as TextSourceType, label: 'Input Manual', icon: Edit3, description: 'Ketik atau paste teks' },
  ];

  const selectedDraft = drafts.find(d => d.id === selectedDraftId);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-foreground">Sumber Teks</Label>
      
      {/* Source Type Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSourceTypeChange(source.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 md:p-4 text-left transition-all min-w-0",
              sourceType === source.id
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <source.icon className={cn(
              "h-5 w-5 shrink-0",
              sourceType === source.id ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="min-w-0">
              <p className={cn(
                "font-medium text-sm truncate",
                sourceType === source.id ? "text-primary" : "text-foreground"
              )}>
                {source.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{source.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Content based on source type */}
      {sourceType === 'history' && (
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada draft tersimpan
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate konten di Text Generator terlebih dahulu
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => onSelectDraft(draft)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all",
                      selectedDraftId === draft.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:bg-secondary/50"
                    )}
                  >
                    <p className="font-medium text-sm truncate">{draft.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(draft.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {selectedDraft && (
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <Label className="text-xs text-muted-foreground">Preview Teks Terpilih</Label>
              <p className="text-sm mt-1 line-clamp-3">
                {selectedDraft.content.content.mainScript}
              </p>
            </div>
          )}
        </div>
      )}

      {sourceType === 'manual' && (
        <div className="space-y-2">
          <EditableField
            value={manualText}
            onChange={onManualTextChange}
            multiline
            placeholder="Ketik atau paste naskah voice over di sini..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {manualText.length} karakter • {manualText.split(/\s+/).filter(w => w).length} kata
          </p>
        </div>
      )}
    </div>
  );
};
