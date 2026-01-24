import { Label } from "@/components/ui/label";
import { TransitionType } from "@/types/videoGenerator";

interface TransitionSelectorProps {
  transition: TransitionType;
  onTransitionChange: (transition: TransitionType) => void;
}

const transitions: { value: TransitionType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No transition between slides' },
  { value: 'fade', label: 'Fade', description: 'Smooth fade between slides' },
  { value: 'slide', label: 'Slide', description: 'Slide from right to left' },
  { value: 'zoom', label: 'Zoom', description: 'Zoom in/out effect' },
];

export const TransitionSelector = ({
  transition,
  onTransitionChange,
}: TransitionSelectorProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <Label className="text-sm font-medium text-foreground">Transition Effect</Label>
      <p className="mb-4 text-xs text-muted-foreground">
        Choose how slides transition
      </p>

      <div className="grid grid-cols-2 gap-2">
        {transitions.map((t) => (
          <button
            key={t.value}
            onClick={() => onTransitionChange(t.value)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              transition === t.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/30 hover:bg-secondary/50'
            }`}
          >
            <p className="text-sm font-medium text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
