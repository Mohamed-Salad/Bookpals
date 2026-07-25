import { cn } from "./cn";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center text-center py-12 px-4", className)}>
      {Icon && <Icon className="w-10 h-10 text-ink-muted mb-4" aria-hidden="true" />}
      <h3 className="font-display text-lg font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
