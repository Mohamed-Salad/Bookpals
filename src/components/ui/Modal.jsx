import { useEffect, useRef } from "react";
import { cn } from "./cn";

// Native <dialog> gives us focus trapping, Escape-to-close, and a real
// backdrop for free - showModal()/close() must be called imperatively to get
// that behavior (just setting the `open` attribute renders a plain,
// non-modal box with no backdrop or focus trap).
export function Modal({ isOpen, onClose, title, className, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose?.();
      }}
      className={cn(
        "bg-surface text-ink rounded-xl shadow-xl p-6 max-w-md w-full",
        "backdrop:bg-black/50",
        className
      )}
    >
      {title && <h2 className="text-lg font-display font-semibold mb-4">{title}</h2>}
      {children}
    </dialog>
  );
}
