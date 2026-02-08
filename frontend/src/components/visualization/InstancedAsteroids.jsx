/**
 * Instanced Asteroids - GPU-Accelerated Batch Rendering
 *
 * Renders 30,000+ asteroids at 60 FPS using THREE.InstancedMesh.
 * Features dynamic LOD, hazard color coding, and hover/selection.
 */

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Hazard classification colors
const HAZARD_COLORS = {
    critical: new THREE.Color("#FF3333"),    // Red - Potentially Hazardous
    warning: new THREE.Color("#FFAA00"),     // Orange - Close approach
    safe: new THREE.Color("#88AACC"),        // Blue-gray - Normal NEO
    selected: new THREE.Color("#00FF88")     // Green - Selected
};

/**
 * Custom shader material for asteroid points
 * Handles size scaling, color, and opacity based on distance
 */
const asteroidShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        cameraDistance: { value: 10 },
        selectedIndex: { value: -1 }
    },
    vertexShader: `
    attribute vec3 instanceColor;
    attribute float instanceSize;
    attribute float isHazardous;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vHazardous;
    
    uniform float time;
    uniform float cameraDistance;
    
    void main() {
      vColor = instanceColor;
      vHazardous = isHazardous;
      
      // Calculate distance to camera for LOD
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = -mvPosition.z;
      
      // Size attenuation with distance
      float size = instanceSize * (300.0 / dist);
      size = clamp(size, 1.0, 20.0);
      
      // Hazardous asteroids pulse slightly
      if (isHazardous > 0.5) {
        size *= 1.0 + 0.15 * sin(time * 3.0);
      }
      
      // Alpha fadeout for distant asteroids
      vAlpha = clamp(1.0 - (dist / 500.0), 0.2, 1.0);
      
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size;
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vHazardous;
    
    void main() {
      // Circular point with soft edge
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft glow for hazardous
      float glow = vHazardous > 0.5 ? 0.3 : 0.0;
      float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist) + glow);
      
      // Add slight glow around edge
      vec3 finalColor = vColor + glow * vec3(0.2, 0.0, 0.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

/**
 * InstancedAsteroids Component
 */
export default function InstancedAsteroids({
    asteroids = [],
    currentDate = new Date(),
    scaleFactor = 10,
    selectedId = null,
    onSelect = () => { }
}) {
    const meshRef = useRef();
    const { camera, raycaster, pointer } = useThree();
    const [hoveredIndex, setHoveredIndex] = useState(-1);

    // Pre-calculate instance attributes
    const { positions, colors, sizes, hazardous } = useMemo(() => {
        const count = asteroids.length;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const hazardous = new Float32Array(count);

        asteroids.forEach((asteroid, i) => {
            // Position from geocentric coordinates (already computed by ephemeris)
            const pos = asteroid.position || { x: 0, y: 0, z: 0 };
            positions[i * 3] = pos.x * scaleFactor;
            positions[i * 3 + 1] = pos.y * scaleFactor;
            positions[i * 3 + 2] = pos.z * scaleFactor;

            // Color based on hazard classification
            let color;
            if (asteroid.id === selectedId) {
                color = HAZARD_COLORS.selected;
            } else if (asteroid.isPHA) {
                color = HAZARD_COLORS.critical;
            } else if (asteroid.missDistanceKm && asteroid.missDistanceKm < 1000000) {
                color = HAZARD_COLORS.warning;
            } else {
                color = HAZARD_COLORS.safe;
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Size based on absolute magnitude (brighter = larger)
            const H = asteroid.absoluteMagnitude || 25;
            sizes[i] = Math.max(0.5, 30 - H) * 0.15;

            // Hazardous flag for shader
            hazardous[i] = asteroid.isPHA ? 1.0 : 0.0;
        });

        return { positions, colors, sizes, hazardous };
    }, [asteroids, scaleFactor, selectedId]);

    // Create instanced buffer geometry
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("instanceColor", new THREE.BufferAttribute(colors, 3));
        geo.setAttribute("instanceSize", new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute("isHazardous", new THREE.BufferAttribute(hazardous, 1));

        return geo;
    }, [positions, colors, sizes, hazardous]);

    // Animation and interaction
    useFrame((state) => {
        if (meshRef.current) {
            // Update shader time uniform
            meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;

            // Update camera distance for LOD
            meshRef.current.material.uniforms.cameraDistance.value = camera.position.length();
        }
    });

    // Handle click selection
    const handleClick = (event) => {
        event.stopPropagation();

        if (hoveredIndex >= 0 && hoveredIndex < asteroids.length) {
            onSelect(asteroids[hoveredIndex]);
        }
    };

    // Handle hover detection
    const handlePointerMove = (event) => {
        event.stopPropagation();

        // Raycast to find intersected point
        raycaster.setFromCamera(pointer, camera);

        if (meshRef.current) {
            const intersects = raycaster.intersectObject(meshRef.current);

            if (intersects.length > 0) {
                const index = intersects[0].index;
                setHoveredIndex(index);
                document.body.style.cursor = "pointer";
            } else {
                setHoveredIndex(-1);
                document.body.style.cursor = "default";
            }
        }
    };

    if (asteroids.length === 0) {
        return null;
    }

    return (
        <points
            ref={meshRef}
            geometry={geometry}
            material={asteroidShaderMaterial}
            onClick={handleClick}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
                setHoveredIndex(-1);
                document.body.style.cursor = "default";
            }}
        />
    );
}

/**
 * Alternative: InstancedMesh for more detailed asteroid rendering
 * Use this when you need actual 3D asteroid meshes instead of points
 */
export function InstancedAsteroidMeshes({
    asteroids = [],
    scaleFactor = 10,
    selectedId = null,
    onSelect = () => { }
}) {
    const meshRef = useRef();
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Update instance matrices and colors
    useEffect(() => {
        if (!meshRef.current) return;

        asteroids.forEach((asteroid, i) => {
            const pos = asteroid.position || { x: 0, y: 0, z: 0 };

            // Set position
            tempObject.position.set(
                pos.x * scaleFactor,
                pos.y * scaleFactor,
                pos.z * scaleFactor
            );

            // Set scale based on size
            const H = asteroid.absoluteMagnitude || 25;
            const scale = Math.max(0.01, (30 - H) * 0.005);
            tempObject.scale.set(scale, scale, scale);

            // Random rotation
            tempObject.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);

            // Set color
            if (asteroid.id === selectedId) {
                tempColor.copy(HAZARD_COLORS.selected);
            } else if (asteroid.isPHA) {
                tempColor.copy(HAZARD_COLORS.critical);
            } else {
                tempColor.copy(HAZARD_COLORS.safe);
            }
            meshRef.current.setColorAt(i, tempColor);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }, [asteroids, scaleFactor, selectedId, tempObject, tempColor]);

    // Slow rotation animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        }
    });

    if (asteroids.length === 0) return null;

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, asteroids.length]}
            onClick={(e) => {
                e.stopPropagation();
                const idx = e.instanceId;
                if (idx !== undefined && asteroids[idx]) {
                    onSelect(asteroids[idx]);
                }
            }}
        >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                roughness={0.8}
                metalness={0.1}
                vertexColors
            />
        </instancedMesh>
    );
}
