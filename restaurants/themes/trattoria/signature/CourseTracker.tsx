"use client";

import { useEffect, useState } from "react";

// Left edge on desktop: where you are in the meal.
export function CourseTracker({ stops }: { stops: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = stops.map((s) => document.querySelector(`[data-course="${s.id}"]`)).filter((e): e is Element => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.getAttribute("data-course"));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stops]);

  return (
    <nav
      aria-label="Courses on this page"
      className={`fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 min-[1400px]:block ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <ol className="space-y-3 border-l border-cream/30 pl-4">
        {stops.map((s) => (
          <li key={s.id}>
            <a
              href={`#course-${s.id}`}
              aria-current={active === s.id ? "step" : undefined}
              className={`block font-hand text-xl transition-all duration-[250ms] ${active === s.id ? "translate-x-1 text-[#f2b27a]" : "text-cream/55 hover:text-cream"}`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
