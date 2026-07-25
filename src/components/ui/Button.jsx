import { cn } from "./cn";

const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  secondary: "bg-surface-raised text-ink hover:bg-surface-raised/70 border border-ink/10",
  outline: "border-2 border-accent text-accent hover:bg-accent hover:text-white",
  ghost: "text-ink hover:bg-surface-raised",
};

// Exported so non-<button> elements that need to look like a button (e.g. a
// react-router <Link> used as a CTA) can share the exact same styling
// instead of duplicating it.
export function buttonVariants(variant = "primary", className) {
  return cn(
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium",
    "transition-colors duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant],
    className
  );
}

// React 19: ref is a normal prop on function components, no forwardRef needed.
export function Button({ variant = "primary", className, ref, ...props }) {
  return <button ref={ref} className={buttonVariants(variant, className)} {...props} />;
}
