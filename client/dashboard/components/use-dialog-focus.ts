"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocus<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const overlay = dialog.parentElement;
    const localSiblings = overlay?.parentElement
      ? Array.from(overlay.parentElement.children).filter(
          (element) => element !== overlay,
        )
      : [];
    const externalBackground = Array.from(
      document.querySelectorAll<HTMLElement>("[data-dialog-background]"),
    ).filter((element) => !element.contains(dialog));
    const siblings = Array.from(new Set([...localSiblings, ...externalBackground]));
    const previousInert = siblings.map((element) => ({
      element: element as HTMLElement,
      inert: (element as HTMLElement).inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    for (const { element } of previousInert) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }

    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hidden,
      );
    const initialFocus = focusable()[0] ?? dialog;
    initialFocus.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      for (const { element, inert, ariaHidden } of previousInert) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      previousFocus?.focus();
    };
  }, [active]);

  return dialogRef;
}
