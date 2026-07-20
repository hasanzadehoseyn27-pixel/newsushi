"use client";

import { motion } from "framer-motion";

/** Splits the headline into words and reveals them with a staggered 3D spring entrance. */
export function AnimatedHeadline({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <h1 className={className} style={{ color: "var(--ink)", perspective: "600px" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 30, rotateX: -50 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: i * 0.09, type: "spring", stiffness: 200, damping: 15 }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </h1>
  );
}
