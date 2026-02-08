import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

/* ======================================================
   ASTEROID MODEL
   ====================================================== */
function AsteroidModel() {
  const ref = useRef();
  const { scene } = useGLTF("/asteroid.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // 🪨 CLEAR, UNAMBIGUOUS GREY
        child.material.color = new THREE.Color("#9E9E9E");

        // Very matte, rocky surface
        child.material.metalness = 0.02;
        child.material.roughness = 0.72;

        // Neutral depth only (NO warmth)
        child.material.emissive = new THREE.Color("#0f0f0f");
        child.material.emissiveIntensity = 0.025;

        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  // Slow, steady rotation
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0018;
      ref.current.rotation.x += 0.0006;
    }
  });

  return <primitive ref={ref} object={scene} scale={1.12} />;
}

/* ======================================================
   CANVAS
   ====================================================== */
export default function Asteroid() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 38 }}
      dpr={[1, 1.5]}
      className="w-full h-full"
    >
      {/* ================= LIGHTING ================= */}

      {/* Neutral ambient */}
      <ambientLight intensity={0.42} />

      {/* Primary neutral key light */}
      <directionalLight
        position={[6, 6, 6]}
        intensity={1.35}
        color="#FFFFFF"
      />

      {/* Cool shadow sculpting */}
      <directionalLight
        position={[-6, -4, -6]}
        intensity={0.65}
        color="#B0B0B0"
      />

      {/* Subtle neutral rim (NOT warm) */}
      <pointLight
        position={[2, 1, 4]}
        intensity={0.45}
        color="#E0E0E0"
      />

      {/* MODEL */}
      <AsteroidModel />

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
      />
    </Canvas>
  );
}
