"use client";

import { btn } from "./ui";

/** Folds the open panel it sits in and scrolls back to its title, so a long editor never leaves you stranded at the bottom. */
export function CloseDetails({ label = "Close" }: { label?: string }) {
  return (
    <button
      type="button"
      className={btn}
      onClick={(e) => {
        const panel = e.currentTarget.closest("details");
        if (!panel) return;
        panel.open = false;
        panel.querySelector("summary")?.scrollIntoView({ block: "center", behavior: "smooth" });
      }}
    >
      {label}
    </button>
  );
}
