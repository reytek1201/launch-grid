"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** A submit button that says what it is doing while the action runs. */
export function Submit({ children, busy = "Saving…", className }: { children: ReactNode; busy?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${className ?? ""} disabled:opacity-60`}>
      {pending ? busy : children}
    </button>
  );
}
