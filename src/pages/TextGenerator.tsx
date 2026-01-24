import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Button } from "@/components/ui/button";
import { TemplateSelector } from "@/components/text-generator/TemplateSelector";
import { ToneSelector } from "@/components/text-generator/ToneSelector";
import { DurationControl } from "@/components/text-generator/DurationControl";
import { OutputFormatSelector } from "@/components/text-generator/OutputFormatSelector";
import { BrandVoicePanel } from "@/components/text-generator/BrandVoicePanel";
import { TemplateFields } from "@/components/text-generator/TemplateFields";
import { StructurePreview } from "@/components/text-generator/StructurePreview";
import { OutputSection } from "@/components/text-generator/OutputSection";
import { HistoryPanel } from "@/components/text-generator/HistoryPanel";
import { ProductionOptions, ProductionOutputOptions } from "@/components/text-generator/ProductionOptions";
import { templateConfigs, durationToWords } from "@/data/templateConfigs";
import { 
  TemplateType, 
  ToneType, 
  OutputFormat, 
  BrandVoice, 
  GeneratedContent,
  DraftHistory,
} from "@/types/textGenerator";
import { FileText, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContentDrafts } from "@/hooks/useContentDrafts";
import { supabase } from "@/integrations/supabase/client";

const TextGenerator = () => {
  const { toast } = useToast();
  const { drafts, saveDraft, deleteDraft, duplicateDraft, renameDraft } = useContentDrafts();
  
  // Core state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('tiktok-60s');
  const [tone, setTone] = useState<ToneType>('santai');
  const [duration, setDuration] = useState(60);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('bullet');
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  // Brand voice state
  const [brandVoice, setBrandVoice] = useState<BrandVoice>({
    targetAudience: { age: '', location: '', segment: '' },
    goal: 'edukasi',
    brandName: '',
    doWords: [],
    dontWords: [],
    glossary: [],
  });
  
  // Production options state
  const [productionOptions, setProductionOptions] = useState<ProductionOutputOptions>({
    includeCaption: true,
    includeHashtags: true,
    includeOnScreenText: true,
    includeShotList: true,
    includeSubtitleFriendly: true,
  });
  
  // Get current template config
  const currentTemplate = useMemo(() => 
    templateConfigs.find(t => t.id === selectedTemplate) || templateConfigs[0],
    [selectedTemplate]
  );

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template);
    setFieldValues({});
    setGeneratedContent(null);
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleGenerate = async () => {
    // Validate required fields
    const requiredFields = currentTemplate.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => {
      const value = fieldValues[f.id];
      return !value || (Array.isArray(value) ? value.length === 0 : value.trim() === '');
    });

    if (missingFields.length > 0) {
      toast({
        title: "Field wajib belum diisi",
        description: `Mohon isi: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const topik = fieldValues['topik'] || fieldValues['headline'] || fieldValues['produk'] || fieldValues['judul'] || 'Konten';

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          templateId: selectedTemplate,
          tone,
          duration,
          outputFormat,
          fieldValues,
          brandVoice,
          productionOptions,
          templateStructure: currentTemplate.structure,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Gagal generate konten");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const content: GeneratedContent = {
        id: generateId(),
        templateId: selectedTemplate,
        content: {
          mainScript: data.mainScript || "Konten tidak tersedia",
          caption: data.caption,
          hashtags: data.hashtags,
          onScreenText: data.onScreenText,
          shotList: data.shotList,
          subtitleFriendly: data.subtitleFriendly,
        },
        metadata: {
          duration,
          wordCount: durationToWords(duration),
          tone,
          format: outputFormat,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        title: `${currentTemplate.name} - ${topik}`,
        isDraft: false,
      };

      setGeneratedContent(content);
      
      toast({
        title: "Konten berhasil digenerate!",
        description: "Script dalam Bahasa Indonesia telah dibuat dengan AI",
      });
    } catch (error) {
      console.error("Generate error:", error);
      toast({
        title: "Gagal generate konten",
        description: error instanceof Error ? error.message : "Terjadi kesalahan, coba lagi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedContent) return;
    
    await saveDraft(
      generatedContent, 
      fieldValues, 
      brandVoice as unknown as Record<string, unknown>, 
      productionOptions as unknown as Record<string, unknown>
    );
  };

  const handleLoadDraft = (draft: DraftHistory) => {
    setSelectedTemplate(draft.templateId);
    setGeneratedContent(draft.content);
    toast({
      title: "Draft dimuat",
      description: draft.title,
    });
  };

  const handleDeleteDraft = async (id: string) => {
    await deleteDraft(id);
  };

  const handleDuplicateDraft = async (draft: DraftHistory) => {
    await duplicateDraft(draft);
  };

  const handleRenameDraft = async (id: string, newTitle: string) => {
    await renameDraft(id, newTitle);
  };

  const handleReset = () => {
    setFieldValues({});
    setGeneratedContent(null);
  };

  return (
    <MainLayout>
      <PageHeader
        icon={FileText}
        title="Text Generator"
        description="Buat script, artikel, dan konten kreatif dalam Bahasa Indonesia"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,450px]">
        {/* Left Column - Main Input & Output */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="space-y-6">
              {/* Template Selector */}
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateChange}
              />

              {/* Tone & Duration Row */}
              <div className="grid gap-6 md:grid-cols-2">
                <ToneSelector selectedTone={tone} onSelectTone={setTone} />
                <DurationControl 
                  duration={duration} 
                  onDurationChange={setDuration}
                  minDuration={15}
                  maxDuration={300}
                />
              </div>

              {/* Output Format */}
              <OutputFormatSelector
                selectedFormat={outputFormat}
                onSelectFormat={setOutputFormat}
              />

              {/* Template-specific Fields */}
              <div className="border-t border-border pt-6">
                <TemplateFields
                  fields={currentTemplate.fields}
                  values={fieldValues}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Structure Preview */}
              <StructurePreview template={currentTemplate} />

              {/* Brand Voice Panel */}
              <BrandVoicePanel
                brandVoice={brandVoice}
                onBrandVoiceChange={setBrandVoice}
              />

              {/* Production Options */}
              <ProductionOptions
                options={productionOptions}
                onChange={setProductionOptions}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <GenerateButton
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Generate Konten
                </GenerateButton>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                {generatedContent && (
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Simpan
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <OutputSection content={generatedContent} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Column - History */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="sticky top-6">
            <HistoryPanel
              drafts={drafts}
              onLoadDraft={handleLoadDraft}
              onDeleteDraft={handleDeleteDraft}
              onDuplicateDraft={handleDuplicateDraft}
              onRenameDraft={handleRenameDraft}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TextGenerator;
