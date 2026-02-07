import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere } from "@react-three/drei"
import { useRef } from "react"

function Asteroid() {
  const ref = useRef()
  let angle = 0

  useFrame(() => {
    angle += 0.01
    ref.current.position.x = Math.cos(angle) * 3
    ref.current.position.z = Math.sin(angle) * 3
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial color="#FF6A2A" emissive="#FF6A2A" />
    </mesh>
  )
}

export default function OrbitScene() {
  return (
    <Canvas camera={{ position: [0, 3, 6] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} />

      {/* Earth */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial color="#1E3A8A" />
      </Sphere>

      {/* Asteroid */}
      <Asteroid />

      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
