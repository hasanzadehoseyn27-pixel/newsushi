"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Product3DSliderProps {
  images: string[];
  fallbackEmoji?: string;
  alt: string;
}

const PLACEHOLDER_COUNT = 3;

/**
 * Coverflow-style 3D product slider. Center slide is large & flat-on,
 * side slides recede in perspective and can be clicked to bring forward.
 * Falls back to gradient "plates" with an emoji when no photos are uploaded yet,
 * so the layout looks intentional even before the admin adds real images.
 */
export function Product3DSlider({ images, fallbackEmoji = "🍣", alt }: Product3DSliderProps) {
  const slides = images.length > 0 ? images : Array.from({ length: PLACEHOLDER_COUNT });
  const [active, setActive] = useState(0);
  const count = slides.length;

  const go = (delta: number) => setActive((prev) => (prev + delta + count) % count);

  return (
    <div className="w-full">
      <div
        className="relative flex h-72 items-center justify-center sm:h-96"
        style={{ perspective: "1200px" }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > 20) go(e.deltaY > 0 ? 1 : -1);
        }}
      >
        {slides.map((src, i) => {
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          const isFar = abs > 2;

          return (
            <motion.button
              key={i}
              type="button"
              aria-label={`slide-${i}`}
              onClick={() => setActive(i)}
              className="absolute h-56 w-56 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border shadow-xl sm:h-80 sm:w-80"
              style={{
                borderColor: "var(--line)",
                background: "var(--surface)",
                zIndex: 10 - abs,
                pointerEvents: isFar ? "none" : "auto",
              }}
              animate={{
                x: offset * 150,
                rotateY: offset * -38,
                scale: 1 - abs * 0.16,
                opacity: isFar ? 0 : 1 - abs * 0.18,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {typeof src === "string" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-7xl"
                  style={{
                    background: `linear-gradient(135deg, var(--accent-soft), var(--surface-2))`,
                  }}
                >
                  {fallbackEmoji}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="previous"
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          ‹
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`go-to-${i}`}
              onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? "1.5rem" : "0.4rem",
                background: i === active ? "var(--accent)" : "var(--line)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="next"
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
