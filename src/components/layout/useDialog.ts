"use client";
import { useEffect, useRef } from "react";

/** Keep keyboard focus in the active dialog and return it to its opener. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    const focusTimer = requestAnimationFrame(() => (focusable()[0] ?? dialog).focus());
    const key = (event: KeyboardEvent) => {
      // Nested dialogs own their keyboard events.
      if (document.activeElement instanceof Element && document.activeElement.closest('[aria-modal="true"]') !== dialog) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key === "Tab") {
        const items = focusable(), first = items[0], last = items.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener("keydown", key);
    return () => { cancelAnimationFrame(focusTimer); dialog.removeEventListener("keydown", key); if (previous?.isConnected) previous.focus(); };
  }, [open]);
  return ref;
}
