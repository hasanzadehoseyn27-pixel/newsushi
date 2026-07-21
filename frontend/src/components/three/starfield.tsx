"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/** Reads accent tokens from :root and re-reads them whenever theme attributes change. */
function useAccentColors() {
  const [colors, setColors] = useState({ accent: "#b83228", accent2: "#ff8f78" });

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      setColors({
        accent: styles.getPropertyValue("--accent").trim() || "#b83228",
        accent2: styles.getPropertyValue("--accent-2").trim() || "#ff8f78",
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent", "class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

const COUNT = 760;

function seededNoise(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function StarPoints({ accentColor }: { accentColor: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(COUNT * 3));
  const pointerRef = useRef(new THREE.Vector3(0, 0, 0));
  const pointerPower = useRef(0);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (seededNoise(i, 1) - 0.5) * 24;
      arr[i * 3 + 1] = (seededNoise(i, 2) - 0.5) * 13;
      arr[i * 3 + 2] = (seededNoise(i, 3) - 0.5) * 9;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;
    const pointer = pointerRef.current;
    pointerPower.current *= 0.96;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const dx = arr[ix] - pointer.x;
      const dy = arr[ix + 1] - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const influence = Math.max(0, 3.8 - dist) * 0.004 * (1 + pointerPower.current);

      arr[ix + 1] += Math.sin(t * 0.42 + i) * 0.0012;
      arr[ix] += Math.cos(t * 0.28 + i * 0.7) * 0.0009;
      arr[ix] += (dx / dist) * influence;
      arr[ix + 1] += (dy / dist) * influence;
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
    pointerRef.current.copy(point);
    pointerPower.current = e.type === "click" ? 2.7 : 1;
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const dx = arr[ix] - point.x;
      const dy = arr[ix + 1] - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      if (dist < 4) {
        const force = (4 - dist) * (e.type === "click" ? 1.18 : 0.62);
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
        size={0.058}
        sizeAttenuation
        transparent
        opacity={0.74}
      />
    </points>
  );
}

function DreamRings({ accentColor, hotColor }: { accentColor: string; hotColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const rings = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: (i % 6) * 3.35 - 8.4,
        y: Math.floor(i / 6) * 3.1 - 2.2,
        z: -2 - (i % 3) * 0.5,
        radius: 0.62 + (i % 4) * 0.16,
        speed: 0.18 + i * 0.018,
      })),
    []
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    group.rotation.z = Math.sin(t * 0.08) * 0.08;
    group.children.forEach((child, i) => {
      child.position.y = rings[i].y + Math.sin(t * rings[i].speed + i) * 0.28;
      child.rotation.z = t * (0.08 + i * 0.008);
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[ring.x, ring.y, ring.z]} rotation={[Math.PI / 2.5, 0, i * 0.12]}>
          <torusGeometry args={[ring.radius, 0.006, 8, 80]} />
          <meshBasicMaterial color={i % 3 === 0 ? hotColor : accentColor} transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

const MOTIFS = ["寿", "切", "朱", "鮨", "波", "新", "一", "巻", "光", "職", "匠", "米"];

function usePointerVars() {
  const [vars, setVars] = useState<CSSProperties>({
    "--mx": 0.5,
    "--my": 0.5,
  } as CSSProperties);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setVars({ "--mx": x, "--my": y } as CSSProperties);
  };

  return { vars, handlePointerMove };
}

function FloatingMotifs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {MOTIFS.map((motif, i) => {
        const style = {
          left: `${(i * 9 + 5) % 96}%`,
          top: `${(i * 17 + 8) % 78}%`,
          "--dream-x": `${i % 2 === 0 ? 34 + i * 2 : -30 - i}px`,
          "--dream-delay": `${i * -0.72}s`,
          "--dream-duration": `${8 + (i % 5) * 1.4}s`,
        } as CSSProperties;

        return (
          <span
            key={`${motif}-${i}`}
            className="dream-motif absolute select-none font-display text-xl blur-[0.2px] md:text-3xl"
            style={{ ...style, color: i % 3 === 0 ? "var(--accent)" : "var(--rice-white)", opacity: i % 3 === 0 ? 0.48 : 0.32 }}
          >
            {motif}
          </span>
        );
      })}
    </div>
  );
}

function PolygonStage({ vars }: { vars: CSSProperties }) {
  const shards = [
    "polygon(0 8%, 36% 0, 22% 58%, 0 82%)",
    "polygon(22% 0, 52% 0, 44% 72%, 13% 100%)",
    "polygon(50% 0, 92% 0, 70% 52%, 44% 72%)",
    "polygon(72% 0, 100% 0, 100% 72%, 82% 52%)",
    "polygon(10% 62%, 44% 72%, 32% 100%, 0 100%)",
    "polygon(44% 72%, 70% 52%, 92% 100%, 32% 100%)",
    "polygon(70% 52%, 100% 72%, 100% 100%, 92% 100%)",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={vars} aria-hidden>
      <div
        className="absolute inset-y-[-14%] right-[-18%] w-[78%] opacity-90"
        style={{
          transform:
            "translate3d(calc((var(--mx, 0.5) - 0.5) * -48px), calc((var(--my, 0.5) - 0.5) * -34px), 0) rotate(-4deg)",
          transition: "transform 120ms ease-out",
        }}
      >
        {shards.map((clipPath, i) => (
          <span
            key={clipPath}
            className="absolute inset-0"
            style={{
              clipPath,
              background:
                i % 2 === 0
                  ? "linear-gradient(135deg, var(--lacquer-red-deep), var(--lacquer-red-hot))"
                  : "linear-gradient(135deg, #280407, var(--lacquer-red))",
              opacity: 0.62 - i * 0.035,
            }}
          />
        ))}
      </div>
      <div
        className="absolute left-[-12%] top-[8%] h-[64%] w-[52%]"
        style={{
          clipPath: "polygon(0 0, 72% 10%, 48% 100%, 0 84%)",
          background: "linear-gradient(128deg, rgba(255,255,255,0.88), rgba(255,255,255,0.08))",
          transform: "translate3d(calc((var(--mx, 0.5) - 0.5) * 30px), calc((var(--my, 0.5) - 0.5) * 20px), 0)",
          transition: "transform 120ms ease-out",
        }}
      />
      <div
        className="absolute left-[9%] top-[18%] h-[3px] w-[76%] origin-left"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.78), var(--accent), transparent)",
          transform: "rotate(-21deg) translateX(calc((var(--mx, 0.5) - 0.5) * 80px))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at calc(var(--mx, 0.5) * 100%) calc(var(--my, 0.5) * 100%), rgba(255,255,255,0.2), transparent 18%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

/**
 * Ambient interactive starfield used behind hero / product sections.
 * Particles drift, scatter away from the pointer, and share the stage with
 * slow lacquer-red rings and floating NewSushi motifs.
 * Respects prefers-reduced-motion by rendering a static gradient instead.
 */
export function Starfield({ soft = false }: { soft?: boolean }) {
  const { accent, accent2 } = useAccentColors();
  const { vars, handlePointerMove } = usePointerVars();

  return (
    <div
      className="absolute inset-0"
      style={vars}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      aria-hidden
    >
      <div
        className="soft-pulse pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl md:h-96 md:w-96"
        style={{
          background: `color-mix(in srgb, var(--accent) ${soft ? 14 : 28}%, transparent)`,
          transform: "translate3d(calc((var(--mx, 0.5) - 0.5) * 80px), calc((var(--my, 0.5) - 0.5) * 52px), 0)",
        }}
      />
      {!soft && <PolygonStage vars={vars} />}
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <DreamRings accentColor={accent} hotColor={accent2} />
        <StarPoints accentColor={accent2} />
      </Canvas>
      <FloatingMotifs />
    </div>
  );
}
