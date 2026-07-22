"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface FloatingProductBitesProps {
  images: string[];
  fallbackEmoji: string;
  alt: string;
}

const POSITIONS = [
  { left: "6%", top: "15%", size: 76, delay: 0, drift: 34 },
  { left: "21%", top: "28%", size: 56, delay: -1.4, drift: -28 },
  { left: "12%", top: "48%", size: 68, delay: -2.7, drift: 42 },
  { left: "24%", top: "72%", size: 84, delay: -2.2, drift: -38 },
  { left: "42%", top: "61%", size: 50, delay: -1.1, drift: 30 },
  { left: "58%", top: "20%", size: 54, delay: -3.2, drift: -36 },
  { left: "72%", top: "11%", size: 70, delay: -0.8, drift: 32 },
  { left: "86%", top: "25%", size: 58, delay: -2.1, drift: -44 },
  { left: "91%", top: "46%", size: 52, delay: -1.9, drift: 36 },
  { left: "78%", top: "67%", size: 78, delay: -2.8, drift: -30 },
  { left: "62%", top: "82%", size: 60, delay: -3.7, drift: 46 },
  { left: "35%", top: "87%", size: 48, delay: -0.5, drift: -24 },
];

export function FloatingProductBites({
  images,
  fallbackEmoji,
  alt,
}: FloatingProductBitesProps) {
  const items = useMemo(
    () =>
      POSITIONS.map((position, index) => ({
        ...position,
        image: images.length > 0 ? images[index % images.length] : null,
        id: `${images[index % Math.max(images.length, 1)] ?? fallbackEmoji}-${index}`,
      })),
    [fallbackEmoji, images]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[20] overflow-hidden">
      {items.map((item, index) => (
        <FloatingBite
          key={item.id}
          image={item.image}
          fallbackEmoji={fallbackEmoji}
          alt={`${alt} ${index + 1}`}
          left={item.left}
          top={item.top}
          size={item.size}
          delay={item.delay}
          drift={item.drift}
          index={index}
        />
      ))}
    </div>
  );
}

function FloatingBite({
  image,
  fallbackEmoji,
  alt,
  left,
  top,
  size,
  delay,
  drift,
  index,
}: {
  image: string | null;
  fallbackEmoji: string;
  alt: string;
  left: string;
  top: string;
  size: number;
  delay: number;
  drift: number;
  index: number;
}) {
  const [burst, setBurst] = useState(0);
  const [pos, setPos] = useState({ left, top });
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");
  const isVisible = phase === "visible";

  const respawn = () => {
    // Random spot away from the very edges so the bite stays fully on screen.
    const nextLeft = `${4 + Math.random() * 88}%`;
    const nextTop = `${8 + Math.random() * 80}%`;
    setPos({ left: nextLeft, top: nextTop });
  };

  const handleClick = () => {
    if (!isVisible) return;
    setBurst((value) => value + 1);
    setPhase("fading");
    window.setTimeout(() => {
      respawn();
      setPhase("hidden");
      window.setTimeout(() => setPhase("visible"), 220);
    }, 800);
  };

  return (
    <motion.button
      type="button"
      disabled={!isVisible}
      className="pointer-events-auto absolute rounded-full border bg-black/60 p-2 shadow-[0_18px_42px_rgba(0,0,0,0.16)] backdrop-blur-sm"
      style={{
        left: pos.left,
        top: pos.top,
        width: size,
        height: size,
        borderColor: "color-mix(in srgb, var(--accent) 34%, transparent)",
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: isVisible ? 0.5 : 0,
        scale: isVisible ? [1, 1.13, 0.96, 1] : 0.6,
        x: isVisible ? [0, drift, drift * -0.42, 0] : 0,
        y: isVisible ? [0, -28 - (index % 3) * 8, 18, 0] : 0,
        rotate: isVisible ? [0, index % 2 === 0 ? 16 : -16, index % 2 === 0 ? -8 : 8, 0] : 0,
      }}
      whileHover={isVisible ? { scale: 1.22, opacity: 0.88, zIndex: 50 } : undefined}
      whileTap={isVisible ? { scale: 0.82, rotate: index % 2 === 0 ? 22 : -22 } : undefined}
      transition={{
        opacity: { duration: phase === "fading" ? 0.55 : 0.5 },
        scale: { duration: 3.4, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay },
        x: { duration: 5.2, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay },
        y: { duration: 4.1, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay },
        rotate: { duration: 4.8, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay },
      }}
      onClick={handleClick}
      aria-label={alt}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="h-full w-full object-contain" draggable={false} />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-3xl">
          {fallbackEmoji}
        </span>
      )}

      {burst > 0 && <BiteBurst key={burst} image={image} fallbackEmoji={fallbackEmoji} />}
    </motion.button>
  );
}

function BiteBurst({
  image,
  fallbackEmoji,
}: {
  image: string | null;
  fallbackEmoji: string;
}) {
  const vectors = [
    [-72, -44],
    [68, -38],
    [-54, 46],
    [58, 50],
    [0, -72],
    [0, 66],
    [-96, 4],
    [92, 10],
    [-34, -92],
    [38, 94],
  ];

  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {vectors.map(([x, y], index) => (
        <motion.span
          key={`${x}-${y}`}
          className="absolute left-1/2 top-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 p-1"
          initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.35, rotate: 0 }}
          animate={{
            x,
            y,
            opacity: [0, 1, 0],
            scale: [0.35, 1, 0.55],
            rotate: index % 2 === 0 ? 42 : -42,
          }}
          transition={{ duration: 0.76, ease: "easeOut" }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-contain" draggable={false} />
          ) : (
            <span className="text-sm">{fallbackEmoji}</span>
          )}
        </motion.span>
      ))}
    </span>
  );
}
