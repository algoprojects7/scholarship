"use client";

import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

const PRIMARY = "#2563eb";
const SECONDARY = "#06b6d4";
const ACCENT = "#60a5fa";
const DEEP = "#1e3a8a";
const GOLD = "#d97706";

export function HeroGradientFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="landing-aurora absolute inset-0 opacity-90" />
      <div className="landing-hero-glow absolute inset-0" />
    </div>
  );
}

function OrbitingRing({
  radius,
  tube,
  speed,
  color,
  rotation,
  emissiveIntensity = 0.35,
}: {
  radius: number;
  tube: number;
  speed: number;
  color: string;
  rotation: [number, number, number];
  emissiveIntensity?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
    ref.current.rotation.x =
      Math.sin(clock.getElapsedTime() * 0.2) * 0.15 + rotation[0];
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, tube, 96, 200]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.95}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

function GlassShell() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.06;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.18) * 0.05;
  });

  return (
    <mesh ref={ref} scale={2.35}>
      <icosahedronGeometry args={[1, 2]} />
      <meshPhysicalMaterial
        color="#dbeafe"
        emissive={SECONDARY}
        emissiveIntensity={0.08}
        metalness={0.2}
        roughness={0.05}
        transmission={0.88}
        thickness={0.8}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ScholarshipCore() {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);

  const floatingPositions = useMemo(
    () =>
      [
        [1.45, 0.55, 0.35],
        [-1.25, -0.48, 0.75],
        [0.45, -1.15, -0.85],
        [-0.75, 1.05, -0.45],
        [0.9, 0.95, 0.6],
        [-0.55, -0.9, 0.4],
      ] as [number, number, number][],
    [],
  );

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    const core = coreRef.current;
    const halo = haloRef.current;
    if (!group || !core || !halo) return;

    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.14 + pointer.x * 0.4;
    group.rotation.x = Math.sin(t * 0.22) * 0.1 + pointer.y * 0.22;
    group.position.y = Math.sin(t * 0.42) * 0.14;
    core.rotation.x = t * 0.18;
    core.rotation.z = t * 0.12;
    halo.rotation.y = -t * 0.08;
    halo.rotation.z = t * 0.05;
  });

  return (
    <group ref={groupRef}>
      <GlassShell />

      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh ref={coreRef} scale={1.2}>
          <icosahedronGeometry args={[1, 5]} />
          <MeshDistortMaterial
            color={PRIMARY}
            emissive={DEEP}
            emissiveIntensity={0.28}
            metalness={0.88}
            roughness={0.12}
            distort={0.32}
            speed={2}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
      </Float>

      <mesh ref={haloRef}>
        <torusGeometry args={[1.35, 0.018, 32, 160]} />
        <meshBasicMaterial color={SECONDARY} transparent opacity={0.55} />
      </mesh>

      <OrbitingRing
        radius={1.72}
        tube={0.035}
        speed={0.38}
        color={SECONDARY}
        rotation={[Math.PI / 2.1, 0.25, 0]}
        emissiveIntensity={0.45}
      />
      <OrbitingRing
        radius={2.12}
        tube={0.028}
        speed={-0.26}
        color={ACCENT}
        rotation={[Math.PI / 3.2, 0.75, 0.35]}
      />
      <OrbitingRing
        radius={2.55}
        tube={0.022}
        speed={0.17}
        color={PRIMARY}
        rotation={[Math.PI / 1.55, -0.35, 0.55]}
      />

      {floatingPositions.map((position, index) => (
        <Float
          key={position.join("-")}
          speed={1.3 + index * 0.18}
          floatIntensity={0.5}
          rotationIntensity={0.3}
        >
          <mesh position={position}>
            <octahedronGeometry args={[0.14, 0]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive={index % 2 === 0 ? GOLD : SECONDARY}
              emissiveIntensity={0.35}
              metalness={0.65}
              roughness={0.15}
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}

      <Sparkles
        count={140}
        scale={7}
        size={2.4}
        speed={0.28}
        opacity={0.65}
        color={ACCENT}
      />
      <Sparkles
        count={70}
        scale={5.5}
        size={1.8}
        speed={0.22}
        opacity={0.5}
        color={SECONDARY}
      />
      <Sparkles
        count={45}
        scale={4}
        size={1.2}
        speed={0.18}
        opacity={0.4}
        color={GOLD}
      />
    </group>
  );
}

function SceneContent({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <color attach="background" args={["#00000000"]} />
      <fog attach="fog" args={["#eef2ff", 8, 22]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight
        color="#ffffff"
        groundColor="#1e3a8a"
        intensity={0.65}
      />
      <directionalLight
        color="#ffffff"
        intensity={2}
        position={[7, 9, 6]}
        castShadow={false}
      />
      <directionalLight
        color={SECONDARY}
        intensity={0.55}
        position={[-6, 4, 5]}
      />
      <pointLight color={ACCENT} intensity={1.1} position={[3, 2, 4]} />
      <pointLight color={PRIMARY} intensity={0.65} position={[-4, -2, 3]} />
      <spotLight
        color="#ffffff"
        intensity={0.8}
        angle={0.4}
        penumbra={0.6}
        position={[0, 6, 2]}
      />

      <Stars
        radius={80}
        depth={40}
        count={isMobile ? 1200 : 2800}
        factor={3.5}
        saturation={0}
        fade
        speed={0.35}
      />

      <group
        position={isMobile ? [0, -0.4, 0] : [2.2, 0, 0]}
        scale={isMobile ? 0.72 : 1.05}
      >
        <ScholarshipCore />
      </group>

      <Environment preset="city" />
    </>
  );
}

function HeroCanvas({
  isMobile,
  dpr,
}: {
  isMobile: boolean;
  dpr: number;
}) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full max-w-full"
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{
        position: [0, 0, isMobile ? 7.8 : 6.8],
        fov: isMobile ? 50 : 40,
        near: 0.1,
        far: 120,
      }}
    >
      <SceneContent isMobile={isMobile} />
    </Canvas>
  );
}

export default function HeroScene() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setReducedMotion(motionQuery.matches);
      setIsMobile(mobileQuery.matches);
      const deviceDpr = window.devicePixelRatio || 1;
      setDpr(
        mobileQuery.matches
          ? Math.min(deviceDpr, 1.75)
          : Math.min(deviceDpr, 2.5),
      );
    };

    update();
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, []);

  if (reducedMotion === null || reducedMotion) {
    return <HeroGradientFallback />;
  }

  return <HeroCanvas isMobile={isMobile} dpr={dpr} />;
}
