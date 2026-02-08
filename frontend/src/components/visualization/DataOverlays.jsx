/**
 * Data Overlays - HUD Elements
 *
 * Displays real-time data including:
 * - Velocity vectors
 * - Distance indicators
 * - Closest approach markers
 * - Status information
 */

import { useMemo } from "react";
import { IconArrowUpRight, IconRuler2, IconClock, IconAlertTriangle, IconWorld } from "@tabler/icons-react";

// Format large numbers with SI prefixes
function formatDistance(km) {
    if (km > 1e9) return `${(km / 1e9).toFixed(2)} billion km`;
    if (km > 1e6) return `${(km / 1e6).toFixed(2)} million km`;
    if (km > 1e3) return `${(km / 1e3).toFixed(1)}k km`;
    return `${km.toFixed(0)} km`;
}

function formatVelocity(kms) {
    return `${kms.toFixed(2)} km/s`;
}

export default function DataOverlays({
    selectedAsteroid = null,
    currentDate = new Date(),
    asteroidCount = 0,
    earthPosition = null
}) {
    // Calculate distance and velocity for selected asteroid
    const asteroidData = useMemo(() => {
        if (!selectedAsteroid?.position) return null;

        const { x, y, z } = selectedAsteroid.position;
        const distAU = Math.sqrt(x * x + y * y + z * z);
        const distKm = distAU * 149597870.7;

        // Lunar distance comparison
        const lunarDistances = distKm / 384400;

        return {
            distanceKm: distKm,
            distanceAU: distAU,
            lunarDistances: lunarDistances,
            velocity: selectedAsteroid.velocity || null
        };
    }, [selectedAsteroid]);

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {/* Top Left - Status info */}
            <div className="absolute top-4 left-4 space-y-2">
                {/* Date/Time HUD */}
                <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                        <IconClock size={14} />
                        <span>EPOCH</span>
                    </div>
                    <div className="font-mono text-lg text-white">
                        {currentDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })}
                    </div>
                    <div className="font-mono text-sm text-white/60">
                        JD {(2451545.0 + (currentDate - new Date("2000-01-01T12:00:00Z")) / (1000 * 60 * 60 * 24)).toFixed(2)}
                    </div>
                </div>

                {/* NEO Count */}
                <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <IconWorld size={14} />
                        <span>TRACKED OBJECTS</span>
                    </div>
                    <div className="font-mono text-xl text-cyan-400">
                        {asteroidCount.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Selected Asteroid Overlay (shows when asteroid is selected) */}
            {selectedAsteroid && asteroidData && (
                <>
                    {/* Top Right - Distance Info */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-3 min-w-[200px]">
                        <div className="text-cyan-400 text-sm font-semibold mb-2 flex items-center gap-2">
                            <IconRuler2 size={16} />
                            DISTANCE TO EARTH
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-white">
                                <span className="text-white/60">km:</span>
                                <span className="font-mono">{formatDistance(asteroidData.distanceKm)}</span>
                            </div>
                            <div className="flex justify-between text-white">
                                <span className="text-white/60">AU:</span>
                                <span className="font-mono">{asteroidData.distanceAU.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between text-white">
                                <span className="text-white/60">LD:</span>
                                <span className="font-mono">{asteroidData.lunarDistances.toFixed(1)} lunar dist</span>
                            </div>
                        </div>

                        {/* Close approach warning */}
                        {asteroidData.lunarDistances < 1 && (
                            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                                <IconAlertTriangle size={16} />
                                <span>Within lunar orbit!</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Left - Velocity Vector Info */}
                    {asteroidData.velocity && (
                        <div className="absolute bottom-32 left-4 bg-black/60 backdrop-blur-sm border border-orange-500/30 rounded-lg px-4 py-3">
                            <div className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-2">
                                <IconArrowUpRight size={16} />
                                RELATIVE VELOCITY
                            </div>

                            <div className="font-mono text-xl text-white">
                                {formatVelocity(asteroidData.velocity.speed || 0)}
                            </div>

                            <div className="text-xs text-white/40 mt-1">
                                {((asteroidData.velocity.speed || 0) * 3600).toFixed(0)} km/h
                            </div>
                        </div>
                    )}

                    {/* Target Reticle (CSS-based) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* This would ideally be positioned at the 3D screen position of the asteroid */}
                        {/* For now, it's a placeholder that could be connected to the 3D scene */}
                    </div>
                </>
            )}

            {/* Bottom Status Bar */}
            <div className="absolute bottom-32 right-4 flex items-center gap-4 text-xs text-white/40 font-mono">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>EPHEMERIS ACTIVE</span>
                </div>
                <div>|</div>
                <div>60 FPS</div>
                <div>|</div>
                <div>LOG DEPTH: ON</div>
            </div>

            {/* Hazard Legend */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF3333]" />
                    <span className="text-white/60">PHA (Hazardous)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFAA00]" />
                    <span className="text-white/60">Close Approach</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#88AACC]" />
                    <span className="text-white/60">Standard NEO</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00FF88]" />
                    <span className="text-white/60">Selected</span>
                </div>
            </div>
        </div>
    );
}

/**
 * Velocity Arrow Overlay
 * Shows velocity direction in screen space
 */
export function VelocityArrow({ velocity, screenPosition }) {
    if (!velocity || !screenPosition) return null;

    const angle = Math.atan2(velocity.vy, velocity.vx) * (180 / Math.PI);
    const magnitude = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
    const length = Math.min(100, magnitude * 20);

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: screenPosition.x,
                top: screenPosition.y,
                transform: `rotate(${angle}deg)`
            }}
        >
            <div
                className="h-0.5 bg-gradient-to-r from-orange-500 to-yellow-400"
                style={{ width: length }}
            />
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-yellow-400"
            />
        </div>
    );
}
