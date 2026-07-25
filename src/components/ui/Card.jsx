import { cn } from "./cn";

export function Card({ className, hover = false, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-xl shadow-sm border border-ink/10 p-6",
        hover && "transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}
