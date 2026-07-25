import { cn } from "./cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-surface-raised rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
