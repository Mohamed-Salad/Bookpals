import { cn } from "./cn";

// a11y: bg-accent/text-accent (the base amber token) fails WCAG AA contrast
// for text - white-on-bg-accent computes to ~3.2:1 (needs 4.5:1), text-accent
// on paper/surface to ~3:1. accent-dark passes both (~5:1 / ~4.7:1 resp.) in
// light mode; verify again if the palette in index.css @theme ever changes.
const VARIANTS = {
  primary: "bg-accent-dark text-white hover:brightness-110",
  secondary: "bg-surface-raised text-ink hover:bg-surface-raised/70 border border-ink/10",
  outline: "border-2 border-accent-dark text-accent-dark hover:bg-accent-dark hover:text-white",
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
