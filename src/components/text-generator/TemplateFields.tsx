import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EditableField } from '@/components/scheduling/EditableField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateField } from '@/types/textGenerator';
import { Plus, X } from 'lucide-react';

interface TemplateFieldsProps {
  fields: TemplateField[];
  values: Record<string, string | string[]>;
  onChange: (fieldId: string, value: string | string[]) => void;
}

export const TemplateFields = ({ fields, values, onChange }: TemplateFieldsProps) => {
  const [bulletInputs, setBulletInputs] = useState<Record<string, string>>({});

  const handleBulletAdd = (fieldId: string, maxBullets: number) => {
    const inputValue = bulletInputs[fieldId];
    if (!inputValue?.trim()) return;
    
    const currentBullets = (values[fieldId] as string[]) || [];
    if (currentBullets.length >= maxBullets) return;
    
    onChange(fieldId, [...currentBullets, inputValue.trim()]);
    setBulletInputs({ ...bulletInputs, [fieldId]: '' });
  };

  const handleBulletRemove = (fieldId: string, index: number) => {
    const currentBullets = (values[fieldId] as string[]) || [];
    onChange(fieldId, currentBullets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <Label className="text-sm font-medium text-foreground">
            {field.label}
            {field.required && <span className="ml-1 text-red-400">*</span>}
          </Label>
          
          {field.type === 'text' && (
            <Input
              value={(values[field.id] as string) || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5"
            />
          )}
          
          {field.type === 'textarea' && (
            <EditableField
              value={(values[field.id] as string) || ''}
              onChange={(val) => onChange(field.id, val)}
              multiline
              placeholder={field.placeholder}
              className="mt-1.5"
            />
          )}
          
          {field.type === 'select' && field.options && (
            <Select
              value={(values[field.id] as string) || ''}
              onValueChange={(value) => onChange(field.id, value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {field.type === 'bullets' && (
            <div className="mt-1.5 space-y-2">
              <div className="space-y-1.5">
                {((values[field.id] as string[]) || []).map((bullet, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-secondary/30 px-3 py-1.5 text-sm">
                    <span className="text-primary font-medium">{index + 1}.</span>
                    <span className="flex-1">{bullet}</span>
                    <X 
                      className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleBulletRemove(field.id, index)}
                    />
                  </div>
                ))}
              </div>
              {((values[field.id] as string[]) || []).length < (field.maxBullets || 5) && (
                <div className="flex gap-2">
                  <Input
                    value={bulletInputs[field.id] || ''}
                    onChange={(e) => setBulletInputs({ ...bulletInputs, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBulletAdd(field.id, field.maxBullets || 5);
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleBulletAdd(field.id, field.maxBullets || 5)}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {((values[field.id] as string[]) || []).length}/{field.maxBullets || 5} poin
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
