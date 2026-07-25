import { useId } from "react";
import { cn } from "./cn";

export function Input({ label, error, className, id, ref, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "w-full px-4 py-2 rounded-lg border bg-surface text-ink placeholder:text-ink-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          error ? "border-red-500" : "border-ink/15",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
