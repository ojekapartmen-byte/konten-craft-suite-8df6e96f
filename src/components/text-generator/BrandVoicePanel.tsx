import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BrandVoice, ContentGoal } from '@/types/textGenerator';
import { ChevronDown, Plus, X, Users, Target, Building2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandVoicePanelProps {
  brandVoice: BrandVoice;
  onBrandVoiceChange: (brandVoice: BrandVoice) => void;
}

const goalOptions: { value: ContentGoal; label: string }[] = [
  { value: 'edukasi', label: 'Edukasi' },
  { value: 'penjualan', label: 'Penjualan' },
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'hiburan', label: 'Hiburan' },
];

export const BrandVoicePanel = ({ brandVoice, onBrandVoiceChange }: BrandVoicePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDoWord, setNewDoWord] = useState('');
  const [newDontWord, setNewDontWord] = useState('');
  const [newGlossaryTerm, setNewGlossaryTerm] = useState('');
  const [newGlossaryDef, setNewGlossaryDef] = useState('');

  const addDoWord = () => {
    if (newDoWord.trim()) {
      onBrandVoiceChange({
        ...brandVoice,
        doWords: [...brandVoice.doWords, newDoWord.trim()],
      });
      setNewDoWord('');
    }
  };

  const addDontWord = () => {
    if (newDontWord.trim()) {
      onBrandVoiceChange({
        ...brandVoice,
        dontWords: [...brandVoice.dontWords, newDontWord.trim()],
      });
      setNewDontWord('');
    }
  };

  const addGlossaryItem = () => {
    if (newGlossaryTerm.trim() && newGlossaryDef.trim()) {
      onBrandVoiceChange({
        ...brandVoice,
        glossary: [...brandVoice.glossary, { term: newGlossaryTerm.trim(), definition: newGlossaryDef.trim() }],
      });
      setNewGlossaryTerm('');
      setNewGlossaryDef('');
    }
  };

  const removeDoWord = (index: number) => {
    onBrandVoiceChange({
      ...brandVoice,
      doWords: brandVoice.doWords.filter((_, i) => i !== index),
    });
  };

  const removeDontWord = (index: number) => {
    onBrandVoiceChange({
      ...brandVoice,
      dontWords: brandVoice.dontWords.filter((_, i) => i !== index),
    });
  };

  const removeGlossaryItem = (index: number) => {
    onBrandVoiceChange({
      ...brandVoice,
      glossary: brandVoice.glossary.filter((_, i) => i !== index),
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 text-left transition-all hover:bg-secondary/50">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Brand & Audiens</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* Target Audience */}
        <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Target Audiens
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Usia</Label>
              <Input
                value={brandVoice.targetAudience.age}
                onChange={(e) => onBrandVoiceChange({
                  ...brandVoice,
                  targetAudience: { ...brandVoice.targetAudience, age: e.target.value }
                })}
                placeholder="18-25 tahun"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lokasi</Label>
              <Input
                value={brandVoice.targetAudience.location}
                onChange={(e) => onBrandVoiceChange({
                  ...brandVoice,
                  targetAudience: { ...brandVoice.targetAudience, location: e.target.value }
                })}
                placeholder="Jakarta, kota besar"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Segmen</Label>
              <Input
                value={brandVoice.targetAudience.segment}
                onChange={(e) => onBrandVoiceChange({
                  ...brandVoice,
                  targetAudience: { ...brandVoice.targetAudience, segment: e.target.value }
                })}
                placeholder="Mahasiswa, pekerja"
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Goal & Brand */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Tujuan Konten</Label>
            </div>
            <Select
              value={brandVoice.goal}
              onValueChange={(value: ContentGoal) => onBrandVoiceChange({ ...brandVoice, goal: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Nama Brand/Produk</Label>
            </div>
            <Input
              value={brandVoice.brandName}
              onChange={(e) => onBrandVoiceChange({ ...brandVoice, brandName: e.target.value })}
              placeholder="Nama brand Anda"
              className="h-9"
            />
          </div>
        </div>

        {/* Do/Don't Words */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">✓ Kata yang WAJIB dipakai</Label>
            <div className="flex flex-wrap gap-1.5">
              {brandVoice.doWords.map((word, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-green-500/20 text-green-400">
                  {word}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeDoWord(index)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newDoWord}
                onChange={(e) => setNewDoWord(e.target.value)}
                placeholder="Tambah kata"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addDoWord()}
              />
              <Button size="sm" variant="outline" onClick={addDoWord} className="h-8 px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">✗ Kata yang HARUS dihindari</Label>
            <div className="flex flex-wrap gap-1.5">
              {brandVoice.dontWords.map((word, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-red-500/20 text-red-400">
                  {word}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeDontWord(index)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newDontWord}
                onChange={(e) => setNewDontWord(e.target.value)}
                placeholder="Tambah kata"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addDontWord()}
              />
              <Button size="sm" variant="outline" onClick={addDontWord} className="h-8 px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Glossary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Kamus Istilah (Glossary)</Label>
          </div>
          <div className="space-y-2">
            {brandVoice.glossary.map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-md bg-secondary/30 p-2 text-sm">
                <span className="font-medium text-primary">{item.term}:</span>
                <span className="text-muted-foreground">{item.definition}</span>
                <X className="ml-auto h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => removeGlossaryItem(index)} />
              </div>
            ))}
            <div className="grid grid-cols-[1fr,2fr,auto] gap-2">
              <Input
                value={newGlossaryTerm}
                onChange={(e) => setNewGlossaryTerm(e.target.value)}
                placeholder="Istilah"
                className="h-8 text-sm"
              />
              <Input
                value={newGlossaryDef}
                onChange={(e) => setNewGlossaryDef(e.target.value)}
                placeholder="Definisi"
                className="h-8 text-sm"
              />
              <Button size="sm" variant="outline" onClick={addGlossaryItem} className="h-8 px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
