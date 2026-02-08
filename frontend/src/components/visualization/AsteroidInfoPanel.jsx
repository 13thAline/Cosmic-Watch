/**
 * Asteroid Info Panel - Detailed Information Display
 *
 * Shows comprehensive asteroid data:
 * - Orbital elements
 * - Risk analysis
 * - Close approach history
 * - Physical properties
 */

import { useState, useEffect } from "react";
import { IconX, IconAlertTriangle, IconInfoCircle, IconRoute, IconAtom } from "@tabler/icons-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AsteroidInfoPanel({
    asteroid,
    currentDate = new Date(),
    onClose
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const [trajectory, setTrajectory] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!asteroid) return null;

    const isHazardous = asteroid.isPHA;

    // Load trajectory data when orbital tab is selected
    useEffect(() => {
        if (activeTab === "orbital" && asteroid.designation && !trajectory) {
            loadTrajectory();
        }
    }, [activeTab, asteroid]);

    const loadTrajectory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/ephemeris/trajectory/${asteroid.designation || asteroid.spkId}`, {
                params: { steps: 50 }
            });
            setTrajectory(response.data.trajectory);
        } catch (err) {
            console.error("Failed to load trajectory:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate derived values
    const distanceKm = asteroid.position ?
        Math.sqrt(asteroid.position.x ** 2 + asteroid.position.y ** 2 + asteroid.position.z ** 2) * 149597870.7 :
        null;

    // Estimate diameter from absolute magnitude if not provided
    const estimatedDiameter = asteroid.diameter ||
        (asteroid.absoluteMagnitude ? Math.pow(10, (3.1236 - 0.5 * asteroid.absoluteMagnitude)) : null);

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 w-[90vw] md:w-96 max-h-[80vh] bg-gray-900/95 border border-white/20 rounded-lg shadow-2xl overflow-hidden z-30 backdrop-blur-sm">
            {/* Header */}
            <div className={`px-4 py-3 border-b ${isHazardous ? 'bg-red-900/50 border-red-500/30' : 'bg-blue-900/50 border-blue-500/30'}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                            {asteroid.name || asteroid.designation}
                            {isHazardous && (
                                <IconAlertTriangle size={18} className="text-red-400" />
                            )}
                        </h3>
                        <p className="text-white/60 text-sm">
                            {asteroid.orbitClass || 'Near-Earth Object'}
                            {asteroid.spkId && ` • SPK-ID: ${asteroid.spkId}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white p-1"
                    >
                        <IconX size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {[
                    { id: "overview", label: "Overview", icon: IconInfoCircle },
                    { id: "orbital", label: "Orbital", icon: IconRoute },
                    { id: "physical", label: "Physical", icon: IconAtom }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
                {activeTab === "overview" && (
                    <div className="space-y-4">
                        {/* Hazard Status */}
                        <div className={`p-3 rounded-lg ${isHazardous ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">Hazard Classification</span>
                                <span className={`font-semibold ${isHazardous ? 'text-red-400' : 'text-green-400'}`}>
                                    {isHazardous ? 'POTENTIALLY HAZARDOUS' : 'NOT HAZARDOUS'}
                                </span>
                            </div>
                        </div>

                        {/* Current Distance */}
                        {distanceKm && (
                            <DataRow
                                label="Current Distance"
                                value={formatNumber(distanceKm) + ' km'}
                                subValue={`${(distanceKm / 384400).toFixed(1)} lunar distances`}
                            />
                        )}

                        {/* Absolute Magnitude */}
                        <DataRow
                            label="Absolute Magnitude (H)"
                            value={asteroid.absoluteMagnitude?.toFixed(2) || 'Unknown'}
                            subValue="Lower = brighter/larger"
                        />

                        {/* Estimated Size */}
                        {estimatedDiameter && (
                            <DataRow
                                label="Estimated Diameter"
                                value={estimatedDiameter > 1
                                    ? `${estimatedDiameter.toFixed(1)} km`
                                    : `${(estimatedDiameter * 1000).toFixed(0)} m`
                                }
                            />
                        )}

                        {/* Risk Score (if available) */}
                        {asteroid.riskScore !== undefined && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white/60">Risk Score</span>
                                    <span className="text-white">{asteroid.riskScore}/100</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${asteroid.riskScore > 70 ? 'bg-red-500' :
                                                asteroid.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${asteroid.riskScore}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "orbital" && (
                    <div className="space-y-3">
                        {asteroid.orbitalElements ? (
                            <>
                                <DataRow
                                    label="Semi-major Axis (a)"
                                    value={`${asteroid.orbitalElements.semiMajorAxis?.toFixed(4)} AU`}
                                />
                                <DataRow
                                    label="Eccentricity (e)"
                                    value={asteroid.orbitalElements.eccentricity?.toFixed(6)}
                                />
                                <DataRow
                                    label="Inclination (i)"
                                    value={`${asteroid.orbitalElements.inclination?.toFixed(2)}°`}
                                />
                                <DataRow
                                    label="Long. Asc. Node (Ω)"
                                    value={`${asteroid.orbitalElements.longitudeAscNode?.toFixed(2)}°`}
                                />
                                <DataRow
                                    label="Arg. Perihelion (ω)"
                                    value={`${asteroid.orbitalElements.argPerihelion?.toFixed(2)}°`}
                                />
                                <DataRow
                                    label="Mean Anomaly (M)"
                                    value={`${asteroid.orbitalElements.meanAnomaly?.toFixed(2)}°`}
                                />

                                {/* Orbital Period */}
                                {asteroid.orbitalElements.semiMajorAxis && (
                                    <DataRow
                                        label="Orbital Period"
                                        value={`${(Math.pow(asteroid.orbitalElements.semiMajorAxis, 1.5)).toFixed(2)} years`}
                                    />
                                )}

                                {/* Perihelion/Aphelion */}
                                {asteroid.orbitalElements.semiMajorAxis && asteroid.orbitalElements.eccentricity && (
                                    <>
                                        <DataRow
                                            label="Perihelion"
                                            value={`${(asteroid.orbitalElements.semiMajorAxis * (1 - asteroid.orbitalElements.eccentricity)).toFixed(4)} AU`}
                                        />
                                        <DataRow
                                            label="Aphelion"
                                            value={`${(asteroid.orbitalElements.semiMajorAxis * (1 + asteroid.orbitalElements.eccentricity)).toFixed(4)} AU`}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="text-white/60 text-sm">Orbital elements not available</p>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "physical" && (
                    <div className="space-y-3">
                        <DataRow
                            label="NEO Classification"
                            value={asteroid.isNEO ? 'Yes' : 'Unknown'}
                        />
                        <DataRow
                            label="PHA Classification"
                            value={asteroid.isPHA ? 'Yes' : 'No'}
                        />

                        {asteroid.diameter && (
                            <DataRow
                                label="Measured Diameter"
                                value={`${asteroid.diameter.toFixed(2)} km`}
                            />
                        )}

                        {estimatedDiameter && !asteroid.diameter && (
                            <DataRow
                                label="Estimated Diameter"
                                value={estimatedDiameter > 1
                                    ? `~${estimatedDiameter.toFixed(1)} km`
                                    : `~${(estimatedDiameter * 1000).toFixed(0)} m`
                                }
                                subValue="From absolute magnitude"
                            />
                        )}

                        {asteroid.absoluteMagnitude && (
                            <DataRow
                                label="Absolute Magnitude"
                                value={`H = ${asteroid.absoluteMagnitude.toFixed(2)}`}
                            />
                        )}

                        {/* Size comparison */}
                        {estimatedDiameter && (
                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                                <p className="text-white/60 text-xs mb-2">Size Comparison</p>
                                <div className="text-white/80 text-sm">
                                    {estimatedDiameter > 1
                                        ? `About ${(estimatedDiameter / 8.848).toFixed(1)}x the height of Mt. Everest`
                                        : estimatedDiameter * 1000 > 100
                                            ? `About ${Math.round(estimatedDiameter * 1000 / 100)} football fields`
                                            : `About ${Math.round(estimatedDiameter * 1000)} meters across`
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Quick Actions */}
            <div className="border-t border-white/10 px-4 py-2 flex gap-2">
                <button className="flex-1 text-sm py-2 px-3 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors">
                    Track
                </button>
                <button className="flex-1 text-sm py-2 px-3 bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors">
                    Show Orbit
                </button>
            </div>
        </div>
    );
}

// Helper Components
function DataRow({ label, value, subValue }) {
    return (
        <div className="flex justify-between items-start">
            <span className="text-white/60 text-sm">{label}</span>
            <div className="text-right">
                <span className="text-white font-mono">{value}</span>
                {subValue && (
                    <p className="text-white/40 text-xs">{subValue}</p>
                )}
            </div>
        </div>
    );
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toFixed(0);
}
