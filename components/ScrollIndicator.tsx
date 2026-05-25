"use client";

import { m, useReducedMotion } from "framer-motion";

export function ScrollIndicator({ label = "Scroll" }: { label?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="true">
      <span className="small-caps text-[var(--color-faded)]">{label}</span>
      <div
        className="relative"
        style={{ width: 1, height: 56 }}
      >
        {reduce ? (
          <span
            className="absolute left-0 top-0 block bg-[var(--color-faded)]"
            style={{ width: 1, height: 40 }}
          />
        ) : (
          <m.span
            className="absolute left-0 top-0 block bg-[var(--color-faded)]"
            style={{ width: 1, transformOrigin: "top" }}
            initial={{ scaleY: 0.43, opacity: 0.55 }}
            animate={{ scaleY: [0.43, 1, 0.43], opacity: [0.55, 1, 0.55] }}
            transition={{
              duration: 4,
              ease: [0.16, 1, 0.3, 1],
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        )}
      </div>
    </div>
  );
}
