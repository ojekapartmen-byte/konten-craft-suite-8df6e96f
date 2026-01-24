import { useState } from 'react';
import { 
  Scissors, 
  Maximize, 
  FileDown, 
  Image, 
  Volume2, 
  Music,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { VideoOperation, VideoOperationType } from '@/types/videoEditor';

interface OperationsPanelProps {
  operations: VideoOperation[];
  onOperationsChange: (operations: VideoOperation[]) => void;
  disabled?: boolean;
}

interface OperationConfig {
  type: VideoOperationType;
  icon: typeof Scissors;
  label: string;
  description: string;
}

const AVAILABLE_OPERATIONS: OperationConfig[] = [
  { type: 'trim', icon: Scissors, label: 'Trim', description: 'Cut video to specific duration' },
  { type: 'resize', icon: Maximize, label: 'Resize', description: 'Change resolution (max 1080p)' },
  { type: 'compress', icon: FileDown, label: 'Compress', description: 'Reduce file size' },
  { type: 'watermark', icon: Image, label: 'Watermark', description: 'Add image overlay' },
  { type: 'extract_audio', icon: Volume2, label: 'Extract Audio', description: 'Get audio track as MP3' },
  { type: 'add_audio', icon: Music, label: 'Add Audio', description: 'Replace or add audio track' },
];

export function OperationsPanel({ operations, onOperationsChange, disabled }: OperationsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addOperation = (type: VideoOperationType) => {
    const defaultParams = getDefaultParams(type);
    onOperationsChange([...operations, { type, params: defaultParams }]);
    setExpandedIndex(operations.length);
  };

  const removeOperation = (index: number) => {
    const updated = operations.filter((_, i) => i !== index);
    onOperationsChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const updateParams = (index: number, params: Record<string, unknown>) => {
    const updated = [...operations];
    updated[index] = { ...updated[index], params };
    onOperationsChange(updated);
  };

  const getDefaultParams = (type: VideoOperationType): Record<string, unknown> => {
    switch (type) {
      case 'trim':
        return { start: 0, duration: 10 };
      case 'resize':
        return { width: 1920, height: 1080, strategy: 'fit' };
      case 'compress':
        return { bitrate: 2500 };
      case 'watermark':
        return { imageUrl: '', position: 'bottom-right', size: '15%' };
      case 'add_audio':
        return { audioUrl: '' };
      default:
        return {};
    }
  };

  const getOperationConfig = (type: VideoOperationType) => 
    AVAILABLE_OPERATIONS.find(op => op.type === type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Operations</h3>
        <span className="text-sm text-muted-foreground">
          {operations.length} added
        </span>
      </div>

      {/* Added Operations */}
      {operations.length > 0 && (
        <div className="space-y-2">
          {operations.map((op, index) => {
            const config = getOperationConfig(op.type);
            if (!config) return null;
            const Icon = config.icon;

            return (
              <Collapsible
                key={`${op.type}-${index}`}
                open={expandedIndex === index}
                onOpenChange={(open) => setExpandedIndex(open ? index : null)}
              >
                <div className="rounded-lg border border-border bg-secondary/30">
                  <CollapsibleTrigger asChild>
                    <button
                      className="flex w-full items-center gap-3 p-3 text-left"
                      disabled={disabled}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="flex-1 font-medium text-sm">{config.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOperation(index);
                        }}
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {expandedIndex === index ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border p-3">
                      <OperationParams
                        type={op.type}
                        params={op.params || {}}
                        onChange={(params) => updateParams(index, params)}
                        disabled={disabled}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Available Operations */}
      <div className="grid grid-cols-2 gap-2">
        {AVAILABLE_OPERATIONS.map((config) => {
          const Icon = config.icon;
          return (
            <Button
              key={config.type}
              variant="outline"
              className="flex h-auto flex-col items-start gap-1 p-3"
              onClick={() => addOperation(config.type)}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {config.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

interface OperationParamsProps {
  type: VideoOperationType;
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
  disabled?: boolean;
}

function OperationParams({ type, params, onChange, disabled }: OperationParamsProps) {
  switch (type) {
    case 'trim':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Start Time (seconds)</Label>
            <Input
              type="number"
              min={0}
              value={params.start as number || 0}
              onChange={(e) => onChange({ ...params, start: Number(e.target.value) })}
              disabled={disabled}
            />
          </div>
          <div>
            <Label className="text-xs">Duration (seconds)</Label>
            <Input
              type="number"
              min={1}
              value={params.duration as number || 10}
              onChange={(e) => onChange({ ...params, duration: Number(e.target.value) })}
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'resize':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width (max 1920)</Label>
              <Input
                type="number"
                min={320}
                max={1920}
                value={params.width as number || 1920}
                onChange={(e) => onChange({ ...params, width: Math.min(1920, Number(e.target.value)) })}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Height (max 1080)</Label>
              <Input
                type="number"
                min={240}
                max={1080}
                value={params.height as number || 1080}
                onChange={(e) => onChange({ ...params, height: Math.min(1080, Number(e.target.value)) })}
                disabled={disabled}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Resize Strategy</Label>
            <Select
              value={params.strategy as string || 'fit'}
              onValueChange={(v) => onChange({ ...params, strategy: v })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Fit (preserve aspect ratio)</SelectItem>
                <SelectItem value="crop">Crop (fill frame)</SelectItem>
                <SelectItem value="pad">Pad (add letterbox)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'compress':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Bitrate: {(params.bitrate as number) || 2500} kbps</Label>
            <Slider
              value={[params.bitrate as number || 2500]}
              min={500}
              max={8000}
              step={100}
              onValueChange={([v]) => onChange({ ...params, bitrate: v })}
              disabled={disabled}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>500 (smaller)</span>
              <span>8000 (quality)</span>
            </div>
          </div>
        </div>
      );

    case 'watermark':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input
              placeholder="https://example.com/logo.png"
              value={params.imageUrl as string || ''}
              onChange={(e) => onChange({ ...params, imageUrl: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div>
            <Label className="text-xs">Position</Label>
            <Select
              value={params.position as string || 'bottom-right'}
              onValueChange={(v) => onChange({ ...params, position: v })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Size</Label>
            <Select
              value={params.size as string || '15%'}
              onValueChange={(v) => onChange({ ...params, size: v })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10%">Small (10%)</SelectItem>
                <SelectItem value="15%">Medium (15%)</SelectItem>
                <SelectItem value="25%">Large (25%)</SelectItem>
                <SelectItem value="35%">X-Large (35%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'add_audio':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Audio URL</Label>
            <Input
              placeholder="https://example.com/audio.mp3"
              value={params.audioUrl as string || ''}
              onChange={(e) => onChange({ ...params, audioUrl: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'extract_audio':
      return (
        <p className="text-xs text-muted-foreground">
          Extract audio track as MP3 file. No additional settings needed.
        </p>
      );

    default:
      return null;
  }
}
