import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useRef, useEffect } from "react";

function AsteroidModel() {
  const ref = useRef();
  const { scene } = useGLTF("/asteroid.glb");

  // Improve material clarity
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.55;
        child.material.roughness = 0.38;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  // Slow premium rotation
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0018;
      ref.current.rotation.x += 0.0006;
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={1.05}   // 🔥 reduced size for clarity
    />
  );
}

export default function Asteroid() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 38 }}
      dpr={[1, 1.5]}
      className="w-full h-full"
    >
      {/* === LIGHTING (CRUCIAL FOR CLARITY) === */}
      <ambientLight intensity={0.55} />

      <directionalLight
        position={[6, 6, 6]}
        intensity={1.6}
      />

      <directionalLight
        position={[-6, -4, -6]}
        intensity={0.8}
      />

      <pointLight
        position={[0, 3, 2]}
        intensity={0.6}
        color="#FF8A50"
      />

      {/* MODEL */}
      <AsteroidModel />

      {/* Controls (rotation only, no zoom) */}
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
