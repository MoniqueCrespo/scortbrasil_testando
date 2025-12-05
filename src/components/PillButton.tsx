import { cn } from "@/lib/utils";

interface PillButtonProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export const PillButton = ({ children, selected, onClick, className }: PillButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full border transition-all text-xs font-medium whitespace-nowrap",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:border-primary/60 hover:bg-accent text-foreground/90 dark:text-foreground dark:border-border/60",
        className
      )}
    >
      {children}
    </button>
  );

};
