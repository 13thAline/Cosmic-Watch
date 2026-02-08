/**
 * Celestial Bodies - Earth, Moon, Sun Visualization
 *
 * Accurate relative positions from ephemeris data with 
 * visual scaling for effective display.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Ring } from "@react-three/drei";
import * as THREE from "three";

// Visual scale factors (actual sizes would be invisible at solar system scale)
const VISUAL_SCALES = {
    sun: 0.5,      // Visual sun radius in scene units
    earth: 0.1,   // Visual earth radius
    moon: 0.025   // Visual moon radius
};

// Actual ratios for reference
const ACTUAL_RATIOS = {
    sunToEarth: 109,
    earthToMoon: 3.67,
    moonOrbitRadius: 0.00257 // AU
};

/**
 * Sun Component - Central light source
 */
function Sun({ scaleFactor }) {
    const meshRef = useRef();
    const glowRef = useRef();

    // Subtle pulsing animation
    useFrame((state) => {
        if (meshRef.current) {
            const pulse = 1 + 0.02 * Math.sin(state.clock.elapsedTime * 0.5);
            meshRef.current.scale.setScalar(VISUAL_SCALES.sun * pulse);
        }
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.3 + 0.1 * Math.sin(state.clock.elapsedTime * 0.3);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Main sun sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[VISUAL_SCALES.sun, 64, 64]} />
                <meshBasicMaterial color="#FFF5D4" />
            </mesh>

            {/* Glow effect */}
            <mesh ref={glowRef} scale={1.3}>
                <sphereGeometry args={[VISUAL_SCALES.sun, 32, 32]} />
                <meshBasicMaterial
                    color="#FFCC66"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Corona rays */}
            <pointLight
                color="#FFFFFF"
                intensity={2}
                distance={100}
                decay={0.5}
            />
        </group>
    );
}

/**
 * Earth Component - Our home planet
 */
function Earth({ position, scaleFactor }) {
    const meshRef = useRef();
    const cloudsRef = useRef();

    // Earth rotation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.12;
        }
    });

    return (
        <group position={[position.x * scaleFactor, position.y * scaleFactor, position.z * scaleFactor]}>
            {/* Earth sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[VISUAL_SCALES.earth, 64, 64]} />
                <meshStandardMaterial
                    color="#4A90D9"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Atmosphere glow */}
            <mesh scale={1.05}>
                <sphereGeometry args={[VISUAL_SCALES.earth, 32, 32]} />
                <meshBasicMaterial
                    color="#87CEEB"
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Equator ring (for orientation) */}
            <Ring
                args={[VISUAL_SCALES.earth * 1.1, VISUAL_SCALES.earth * 1.15, 64]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} side={THREE.DoubleSide} />
            </Ring>
        </group>
    );
}

/**
 * Moon Component
 */
function Moon({ earthPosition, moonOffset, scaleFactor }) {
    const meshRef = useRef();

    // Calculate absolute moon position
    const moonPosition = useMemo(() => ({
        x: (earthPosition.x + moonOffset.x) * scaleFactor,
        y: (earthPosition.y + moonOffset.y) * scaleFactor,
        z: (earthPosition.z + moonOffset.z) * scaleFactor
    }), [earthPosition, moonOffset, scaleFactor]);

    // Slow rotation (tidally locked, but we show some rotation for visual interest)
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <mesh ref={meshRef} position={[moonPosition.x, moonPosition.y, moonPosition.z]}>
            <sphereGeometry args={[VISUAL_SCALES.moon, 32, 32]} />
            <meshStandardMaterial
                color="#C0C0C0"
                roughness={0.9}
                metalness={0.0}
            />
        </mesh>
    );
}

/**
 * Earth Orbit Path - Visual reference
 */
function EarthOrbitPath({ scaleFactor }) {
    const points = useMemo(() => {
        const pts = [];
        const segments = 128;
        const a = 1.0; // 1 AU semi-major axis
        const e = 0.0167; // Earth's eccentricity

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
            pts.push(new THREE.Vector3(
                r * Math.cos(angle) * scaleFactor,
                0,
                r * Math.sin(angle) * scaleFactor
            ));
        }

        return pts;
    }, [scaleFactor]);

    const geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial
                color="#334466"
                transparent
                opacity={0.4}
                linewidth={1}
            />
        </line>
    );
}

/**
 * Main CelestialBodies Component
 */
export default function CelestialBodies({
    currentDate = new Date(),
    scaleFactor = 10,
    showOrbits = true,
    celestialData = null // Optional pre-computed positions
}) {
    // Default positions if no ephemeris data provided
    // In production, these come from the ephemeris API
    const positions = useMemo(() => {
        if (celestialData) {
            return celestialData;
        }

        // Simplified fallback calculation
        // Days since J2000.0
        const j2000 = new Date("2000-01-01T12:00:00Z");
        const daysSinceJ2000 = (currentDate - j2000) / (1000 * 60 * 60 * 24);

        // Earth's approximate position (simplified circular orbit)
        const earthAngle = (daysSinceJ2000 / 365.25) * 2 * Math.PI;
        const earthPos = {
            x: Math.cos(earthAngle),
            y: 0,
            z: Math.sin(earthAngle)
        };

        // Moon's approximate position relative to Earth
        const moonAngle = (daysSinceJ2000 / 27.3) * 2 * Math.PI;
        const moonOrbitRadius = 0.00257; // AU
        const moonOffset = {
            x: Math.cos(moonAngle) * moonOrbitRadius,
            y: Math.sin(moonAngle * 0.1) * moonOrbitRadius * 0.2, // slight inclination
            z: Math.sin(moonAngle) * moonOrbitRadius
        };

        return {
            earth: earthPos,
            moon: moonOffset,
            sun: { x: 0, y: 0, z: 0 }
        };
    }, [currentDate, celestialData]);

    return (
        <group>
            {/* Sun at origin */}
            <Sun scaleFactor={scaleFactor} />

            {/* Earth */}
            <Earth position={positions.earth} scaleFactor={scaleFactor} />

            {/* Moon */}
            <Moon
                earthPosition={positions.earth}
                moonOffset={positions.moon}
                scaleFactor={scaleFactor}
            />

            {/* Earth's orbit path */}
            {showOrbits && <EarthOrbitPath scaleFactor={scaleFactor} />}
        </group>
    );
}
