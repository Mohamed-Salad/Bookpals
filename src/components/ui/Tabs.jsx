import { Tabs as RadixTabs } from "radix-ui";
import { cn } from "./cn";

// Thin styled wrapper over Radix's Tabs primitive - roving tabindex, arrow-key
// navigation, and aria-selected wiring are exactly the kind of thing that's
// easy to get subtly wrong by hand, so we lean on Radix for the behavior and
// only own the styling.
export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }) {
  return (
    <RadixTabs.List
      className={cn("flex gap-1 border-b border-ink/10", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "px-4 py-2 text-sm font-medium text-ink-muted border-b-2 border-transparent",
        "hover:text-ink data-[state=active]:text-accent data-[state=active]:border-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-t",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <RadixTabs.Content className={cn("pt-4", className)} {...props} />;
}
