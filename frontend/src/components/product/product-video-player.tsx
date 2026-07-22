"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/types";

interface ProductVideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  locale: Locale;
}

const LABELS = {
  fa: { play: "پخش ویدیو", pause: "مکث", label: "ویدیو محصول", mute: "بی‌صدا", unmute: "باصدا" },
  en: { play: "Play video", pause: "Pause", label: "Product video", mute: "Mute", unmute: "Unmute" },
  ja: { play: "再生", pause: "停止", label: "商品ビデオ", mute: "ミュート", unmute: "ミュート解除" },
} satisfies Record<Locale, { play: string; pause: string; label: string; mute: string; unmute: string }>;

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ProductVideoPlayer({ src, title, poster, locale }: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const labels = LABELS[locale];
  const progress = duration > 0 ? Math.min((current / duration) * 100, 100) : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTime = () => setCurrent(video.currentTime);
    const syncDuration = () => setDuration(video.duration || 0);
    const stop = () => setPlaying(false);

    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("ended", stop);
    return () => {
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("ended", stop);
    };
  }, [src]);

  const toggle = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
      return;
    }

    await video.play();
    setPlaying(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const next = (value / 100) * duration;
    video.currentTime = next;
    setCurrent(next);
  };

  return (
    <section
      className="relative mt-5 overflow-hidden rounded-[var(--radius-lg)] border"
      style={{
        borderColor: "color-mix(in srgb, var(--accent) 34%, var(--line))",
        boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
      }}
      onMouseEnter={() => setShowControls(true)}
    >
      <div
        className="relative aspect-video w-full cursor-pointer bg-black"
        onClick={toggle}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />

        {/* Top label */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span
            className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur"
            style={{ background: "color-mix(in srgb, var(--accent) 78%, black 10%)", color: "var(--accent-ink)" }}
          >
            {labels.label}
          </span>
        </div>

        {/* Center play button */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(0,0,0,0.15), rgba(0,0,0,0.45))" }}
            >
              <span
                className="grid h-16 w-16 place-items-center rounded-full text-2xl font-bold shadow-lg"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                aria-label={labels.play}
              >
                ▶
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls bar */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
            opacity: showControls || !playing ? 1 : 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex items-center justify-between gap-3 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? labels.pause : labels.play}
                className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                {playing ? "II" : "▶"}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? labels.unmute : labels.mute}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-sm"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <span className="font-mono">
                {formatTime(current)} / {formatTime(duration)}
              </span>
            </div>
            <span className="truncate opacity-80">{title}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
