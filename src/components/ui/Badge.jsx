import { cn } from "./cn";

const VARIANTS = {
  default: "bg-surface-raised text-ink-muted",
  accent: "bg-accent/15 text-accent-dark",
};

export function Badge({ variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
