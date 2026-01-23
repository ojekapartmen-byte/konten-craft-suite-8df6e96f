import { Loader2, Sparkles } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const GenerateButton = ({
  onClick,
  isLoading = false,
  disabled = false,
  children = "Generate",
  className,
}: GenerateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 px-6 py-2.5 font-semibold text-primary-foreground",
        "hover:from-primary/90 hover:to-blue-500/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/25",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
};
