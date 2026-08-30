import { cn } from "./cn";

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-24 h-24 text-2xl",
};

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ src, name, size = "md", className }) {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-accent/20 text-accent-dark flex items-center justify-center font-medium shrink-0",
        SIZES[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  );
}
