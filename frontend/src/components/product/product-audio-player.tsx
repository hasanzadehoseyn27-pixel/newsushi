"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Locale } from "@/lib/types";

interface ProductAudioPlayerProps {
  src: string;
  title: string;
  locale: Locale;
}

const LABELS = {
  fa: { play: "پخش", pause: "مکث", aria: "پخش توضیحات صوتی محصول" },
  en: { play: "Play", pause: "Pause", aria: "Play product audio description" },
  ja: { play: "再生", pause: "停止", aria: "商品説明の音声を再生" },
} satisfies Record<Locale, { play: string; pause: string; aria: string }>;

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ProductAudioPlayer({ src, title, locale }: ProductAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const labels = LABELS[locale];
  const progress = duration > 0 ? Math.min((current / duration) * 100, 100) : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => setCurrent(audio.currentTime);
    const syncDuration = () => setDuration(audio.duration || 0);
    const stop = () => setPlaying(false);

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("ended", stop);
    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("ended", stop);
    };
  }, [src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await audio.play();
    setPlaying(true);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = (value / 100) * duration;
    audio.currentTime = next;
    setCurrent(next);
  };

  return (
    <section
      className="relative mt-6 overflow-hidden rounded-[var(--radius-lg)] border p-5"
      style={{
        borderColor: "color-mix(in srgb, var(--accent) 34%, var(--line))",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, black), color-mix(in srgb, var(--accent-soft) 44%, var(--surface)))",
        boxShadow: "0 24px 70px rgba(0,0,0,0.16)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div
        className="pointer-events-none absolute -end-12 -top-16 h-36 w-36 rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
      />

      <div className="relative flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Audio
          </p>
          <h2 className="mt-1 font-display text-xl" style={{ color: "var(--ink)" }}>
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={labels.aria}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-bold transition-transform hover:scale-105"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {playing ? "II" : "▶"}
        </button>
      </div>

      <div className="relative mt-5 flex h-16 items-end justify-center gap-1.5">
        {Array.from({ length: 28 }).map((_, index) => (
          <motion.span
            key={index}
            className="w-1.5 rounded-full"
            style={{ background: index / 28 <= progress / 100 ? "var(--accent)" : "var(--line)" }}
            animate={{
              height: playing
                ? [10 + (index % 5) * 6, 42 - (index % 7) * 3, 16 + (index % 4) * 5]
                : 10 + (index % 6) * 4,
              opacity: playing ? [0.55, 1, 0.72] : 0.45,
            }}
            transition={{
              duration: 0.9 + (index % 5) * 0.11,
              repeat: playing ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative mt-5">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--ink-soft)" }}>
          <span>{formatTime(current)}</span>
          <span>{playing ? labels.pause : labels.play}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </section>
  );
}
