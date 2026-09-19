"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div onClick={onClose} className="absolute inset-0" />
      <div className={cn("relative w-full rounded-t-3xl bg-white shadow-pop sm:rounded-3xl", maxWidth, "max-h-[90vh] overflow-y-auto")}>
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
            <h3 className="text-base font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function BottomSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink-950/50 backdrop-blur-sm">
      <div onClick={onClose} className="absolute inset-0" />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-pop">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-200" />
        {title && <h3 className="mb-3 text-base font-bold text-ink-900">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body
  );
}
