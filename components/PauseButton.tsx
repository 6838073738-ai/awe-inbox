"use client";

/**
 * Small circular play/pause control. Used by both the Globe and the
 * SolarSystem scene. The parent owns the pause state — this component is
 * a presentational button + keyboard binding only.
 */
import { useEffect } from "react";

function PlayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.4 2.2 L13.4 8 L4.4 13.8 Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3.5" y="2.5" width="3" height="11" rx="0.6" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="0.6" />
    </svg>
  );
}

export function PauseButton({
  paused,
  onToggle,
  label = "scene",
}: {
  paused: boolean;
  onToggle: () => void;
  /** What is paused — used in the screen-reader label. */
  label?: string;
}) {
  // Space-bar toggles play/pause, except when typing in an input/textarea.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        t?.isContentEditable
      )
        return;
      e.preventDefault();
      onToggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onToggle]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={paused ? `Resume ${label}` : `Pause ${label}`}
      aria-pressed={paused}
      title={paused ? "Resume (Space)" : "Pause (Space)"}
      className="pause-button absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30"
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </button>
  );
}
