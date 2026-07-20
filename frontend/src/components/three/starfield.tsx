"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/** Reads --accent-2 from :root and re-reads it whenever data-accent changes. */
function useAccentColor() {
  const [color, setColor] = useState("#6fb1fc");

  useEffect(() => {
    const read = () =>
      setColor(
        getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() || "#6fb1fc"
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent", "class"] });
    return () => observer.disconnect();
  }, []);

  return color;
}

const COUNT = 420;

function StarPoints({ accentColor }: { accentColor: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(COUNT * 3));

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      // gentle ambient drift
      arr[ix + 1] += Math.sin(t * 0.3 + i) * 0.0006;
      arr[ix] += velocities.current[ix] * 0.02;
      arr[ix + 1] += velocities.current[ix + 1] * 0.02;
      velocities.current[ix] *= 0.94;
      velocities.current[ix + 1] *= 0.94;
    }
    posAttr.needsUpdate = true;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(t * 0.02) * 0.05;
    }
  });

  const scatter = (e: ThreeEvent<PointerEvent>) => {
    const point = e.point;
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const dx = arr[ix] - point.x;
      const dy = arr[ix + 1] - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      if (dist < 3) {
        const force = (3 - dist) * 0.6;
        velocities.current[ix] += (dx / dist) * force;
        velocities.current[ix + 1] += (dy / dist) * force;
      }
    }
  };

  return (
    <points ref={pointsRef} onClick={scatter} onPointerMove={scatter}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={accentColor}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.55}
      />
    </points>
  );
}

/**
 * Ambient interactive starfield used behind hero / product sections.
 * Stars drift slowly and scatter away from the pointer, then ease back.
 * Respects prefers-reduced-motion by rendering a static gradient instead.
 */
export function Starfield() {
  const accentColor = useAccentColor();
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    setReady(true);
  }, []);

  if (!ready || reducedMotion) {
    return <div className="absolute inset-0" aria-hidden />;
  }

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <StarPoints accentColor={accentColor} />
      </Canvas>
    </div>
  );
}
