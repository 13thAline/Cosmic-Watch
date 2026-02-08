/**
 * Orbit Lines - Asteroid Trajectory Visualization
 *
 * Renders orbital paths using Keplerian elements.
 * Shows past and future trajectory with color gradients.
 */

import { useMemo } from "react";
import * as THREE from "three";

// Colors for trajectory segments
const TRAJECTORY_COLORS = {
    past: new THREE.Color("#666688"),
    present: new THREE.Color("#FFFFFF"),
    future: new THREE.Color("#88AAFF"),
    perihelion: new THREE.Color("#FFAA00"),
    aphelion: new THREE.Color("#4488FF")
};

/**
 * Calculate orbit points from Keplerian elements
 */
function calculateOrbitPoints(elements, scaleFactor, segments = 360) {
    const {
        semiMajorAxis: a,
        eccentricity: e,
        inclination: i,
        longitudeAscNode: omega,
        argPerihelion: w
    } = elements;

    const DEG_TO_RAD = Math.PI / 180;
    const iRad = (i || 0) * DEG_TO_RAD;
    const omegaRad = (omega || 0) * DEG_TO_RAD;
    const wRad = (w || 0) * DEG_TO_RAD;

    const points = [];

    for (let j = 0; j <= segments; j++) {
        const trueAnomaly = (j / segments) * 2 * Math.PI;

        // Calculate radius at this true anomaly
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));

        // Position in orbital plane
        const xOrbital = r * Math.cos(trueAnomaly);
        const yOrbital = r * Math.sin(trueAnomaly);

        // Rotation to ecliptic coordinates
        const cosOmega = Math.cos(omegaRad);
        const sinOmega = Math.sin(omegaRad);
        const cosI = Math.cos(iRad);
        const sinI = Math.sin(iRad);
        const cosW = Math.cos(wRad);
        const sinW = Math.sin(wRad);

        const Px = cosOmega * cosW - sinOmega * sinW * cosI;
        const Py = sinOmega * cosW + cosOmega * sinW * cosI;
        const Pz = sinW * sinI;

        const Qx = -cosOmega * sinW - sinOmega * cosW * cosI;
        const Qy = -sinOmega * sinW + cosOmega * cosW * cosI;
        const Qz = cosW * sinI;

        const x = (xOrbital * Px + yOrbital * Qx) * scaleFactor;
        const y = (xOrbital * Pz + yOrbital * Qz) * scaleFactor;
        const z = (xOrbital * Py + yOrbital * Qy) * scaleFactor;

        points.push(new THREE.Vector3(x, y, z));
    }

    return points;
}

/**
 * Main Orbit Line Component
 */
export default function OrbitLines({
    asteroid,
    scaleFactor = 10,
    currentDate = new Date(),
    showFullOrbit = true,
    trajectoryPoints = null // Pre-computed trajectory from API
}) {
    // Use orbital elements if available
    const orbitPath = useMemo(() => {
        if (!asteroid?.orbitalElements) return null;

        return calculateOrbitPoints(asteroid.orbitalElements, scaleFactor);
    }, [asteroid?.orbitalElements, scaleFactor]);

    // Line geometry
    const orbitGeometry = useMemo(() => {
        if (!orbitPath) return null;
        return new THREE.BufferGeometry().setFromPoints(orbitPath);
    }, [orbitPath]);

    // Trajectory line (from API data)
    const trajectoryGeometry = useMemo(() => {
        if (!trajectoryPoints || trajectoryPoints.length === 0) return null;

        const points = trajectoryPoints.map(pt =>
            new THREE.Vector3(
                pt.geocentric.x * scaleFactor,
                pt.geocentric.z * scaleFactor,
                pt.geocentric.y * scaleFactor
            )
        );

        return new THREE.BufferGeometry().setFromPoints(points);
    }, [trajectoryPoints, scaleFactor]);

    // Current position marker
    const currentPosition = useMemo(() => {
        if (!asteroid?.position) return null;

        return new THREE.Vector3(
            asteroid.position.x * scaleFactor,
            asteroid.position.z * scaleFactor,
            asteroid.position.y * scaleFactor
        );
    }, [asteroid?.position, scaleFactor]);

    if (!orbitGeometry && !trajectoryGeometry) return null;

    return (
        <group>
            {/* Full orbital ellipse */}
            {showFullOrbit && orbitGeometry && (
                <line geometry={orbitGeometry}>
                    <lineBasicMaterial
                        color="#556688"
                        transparent
                        opacity={0.4}
                        linewidth={1}
                    />
                </line>
            )}

            {/* Trajectory path (from ephemeris) */}
            {trajectoryGeometry && (
                <line geometry={trajectoryGeometry}>
                    <lineBasicMaterial
                        color="#88AAFF"
                        transparent
                        opacity={0.7}
                        linewidth={2}
                    />
                </line>
            )}

            {/* Current position marker */}
            {currentPosition && (
                <group position={currentPosition}>
                    {/* Pulsing ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.15, 0.2, 32]} />
                        <meshBasicMaterial
                            color="#00FF88"
                            transparent
                            opacity={0.8}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Position dot */}
                    <mesh>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                </group>
            )}

            {/* Perihelion marker (closest to sun) */}
            {orbitPath && orbitPath.length > 0 && (
                <mesh position={orbitPath[0]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshBasicMaterial color={TRAJECTORY_COLORS.perihelion} />
                </mesh>
            )}

            {/* Aphelion marker (farthest from sun) */}
            {orbitPath && orbitPath.length > 180 && (
                <mesh position={orbitPath[180]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshBasicMaterial color={TRAJECTORY_COLORS.aphelion} />
                </mesh>
            )}
        </group>
    );
}

/**
 * Velocity Vector Component
 * Shows the direction and magnitude of asteroid velocity
 */
export function VelocityVector({ position, velocity, scaleFactor = 10, scale = 5 }) {
    if (!position || !velocity) return null;

    const startPos = new THREE.Vector3(
        position.x * scaleFactor,
        position.z * scaleFactor,
        position.y * scaleFactor
    );

    const direction = new THREE.Vector3(
        velocity.vx,
        velocity.vz,
        velocity.vy
    ).normalize();

    const speed = Math.sqrt(
        velocity.vx ** 2 + velocity.vy ** 2 + velocity.vz ** 2
    );

    const length = Math.min(speed * scale, 2); // Cap length

    return (
        <arrowHelper
            args={[
                direction,
                startPos,
                length,
                0xFF6600,
                length * 0.2,
                length * 0.1
            ]}
        />
    );
}

/**
 * Distance Line Component
 * Shows distance between asteroid and Earth
 */
export function DistanceLine({ asteroidPosition, earthPosition, scaleFactor = 10 }) {
    if (!asteroidPosition || !earthPosition) return null;

    const points = useMemo(() => [
        new THREE.Vector3(
            asteroidPosition.x * scaleFactor,
            asteroidPosition.z * scaleFactor,
            asteroidPosition.y * scaleFactor
        ),
        new THREE.Vector3(
            earthPosition.x * scaleFactor,
            earthPosition.z * scaleFactor,
            earthPosition.y * scaleFactor
        )
    ], [asteroidPosition, earthPosition, scaleFactor]);

    const geometry = useMemo(() =>
        new THREE.BufferGeometry().setFromPoints(points),
        [points]
    );

    return (
        <line geometry={geometry}>
            <lineDashedMaterial
                color="#FFFF00"
                dashSize={0.1}
                gapSize={0.05}
                transparent
                opacity={0.5}
            />
        </line>
    );
}
