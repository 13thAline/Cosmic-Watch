/**
 * Control Center - Professional Asteroid Monitoring HUD
 *
 * Main page integrating:
 * - 3D NEO Visualization
 * - Timeline scrubber for time travel
 * - Command Line Interface overlay
 * - Data overlays and info panels
 */

import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import NEOVisualization from "../components/visualization/NEOVisualization";
import TimelineScrubber from "../components/visualization/TimelineScrubber";
import CommandLine from "../components/visualization/CommandLine";
import DataOverlays from "../components/visualization/DataOverlays";
import AsteroidInfoPanel from "../components/visualization/AsteroidInfoPanel";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ControlCenter() {
    // State
    const [asteroids, setAsteroids] = useState([]);
    const [selectedAsteroid, setSelectedAsteroid] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCLI, setShowCLI] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [celestialData, setCelestialData] = useState(null);
    const [cameraTarget, setCameraTarget] = useState(null);

    // Settings
    const [showOrbits, setShowOrbits] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [showOverlays, setShowOverlays] = useState(true);

    // Load NEO catalog on mount
    useEffect(() => {
        loadNEOCatalog();
    }, []);

    // Time playback animation
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                // Add days based on playback speed
                newDate.setDate(newDate.getDate() + playbackSpeed);
                return newDate;
            });
        }, 50); // 20 FPS for smooth animation

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed]);

    // Update asteroid positions when date changes
    useEffect(() => {
        if (asteroids.length > 0) {
            updatePositions();
        }
    }, [currentDate]);

    // Load NEO catalog from API
    const loadNEOCatalog = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/ephemeris/neo-catalog`, {
                params: { limit: 2000 }
            });

            // Calculate initial positions
            const catalog = response.data.asteroids || [];
            setAsteroids(catalog);
            updatePositions(catalog);
            setError(null);
        } catch (err) {
            console.error("Failed to load NEO catalog:", err);
            setError("Failed to load asteroid data. Using mock data.");
            // Load mock data for demo
            setAsteroids(generateMockAsteroids(500));
        } finally {
            setIsLoading(false);
        }
    };

    // Update positions for current date
    const updatePositions = async (asteroidList = asteroids) => {
        try {
            // Calculate positions client-side using orbital elements
            const updatedAsteroids = asteroidList.map(asteroid => {
                if (!asteroid.orbitalElements) return asteroid;

                const pos = calculatePosition(asteroid.orbitalElements, currentDate);
                return { ...asteroid, position: pos };
            });

            setAsteroids(updatedAsteroids);

            // Also get celestial body positions
            const bodies = await axios.get(`${API_URL}/api/ephemeris/celestial-bodies`, {
                params: { date: currentDate.toISOString() }
            });
            setCelestialData(bodies.data);
        } catch (err) {
            console.error("Failed to update positions:", err);
        }
    };

    // CLI Command handlers
    const handleCommand = useCallback(async (command) => {
        const parts = command.toLowerCase().trim().split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case "focus":
                return handleFocusCommand(args.join(" "));

            case "goto":
                return handleGotoCommand(args.join(" "));

            case "track":
                return handleTrackCommand(args.join(" "));

            case "distance":
                return handleDistanceCommand(args);

            case "info":
                return handleInfoCommand();

            case "list":
                return handleListCommand(args);

            case "search":
                return handleSearchCommand(args.join(" "));

            case "help":
                return getHelpText();

            case "clear":
                return { clear: true };

            default:
                return { error: `Unknown command: ${cmd}. Type 'help' for available commands.` };
        }
    }, [asteroids, selectedAsteroid, currentDate]);

    // Command: focus <asteroid_name>
    const handleFocusCommand = (name) => {
        if (!name) {
            return { error: "Usage: focus <asteroid_name>" };
        }

        const asteroid = asteroids.find(a =>
            a.name?.toLowerCase().includes(name) ||
            a.designation?.toLowerCase() === name ||
            a.spkId === name
        );

        if (asteroid) {
            setSelectedAsteroid(asteroid);
            setCameraTarget(asteroid);
            return { success: `Focused on ${asteroid.name || asteroid.designation}` };
        }

        return { error: `Asteroid "${name}" not found in catalog` };
    };

    // Command: goto <date>
    const handleGotoCommand = (dateStr) => {
        if (!dateStr) {
            return { error: "Usage: goto <date> (e.g., 2029-04-13 or 'now')" };
        }

        if (dateStr === "now") {
            setCurrentDate(new Date());
            setIsPlaying(false);
            return { success: "Jumped to current date" };
        }

        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
            }
            setCurrentDate(date);
            setIsPlaying(false);
            return { success: `Jumped to ${date.toDateString()}` };
        } catch (err) {
            return { error: `Invalid date format: ${dateStr}` };
        }
    };

    // Command: track <asteroid_name>
    const handleTrackCommand = (name) => {
        const result = handleFocusCommand(name);
        if (result.success) {
            // Enable tracking mode
            return { success: `Now tracking ${selectedAsteroid?.name}. Camera will follow.` };
        }
        return result;
    };

    // Command: distance [asteroid1] [asteroid2]
    const handleDistanceCommand = (args) => {
        if (args.length === 0 && selectedAsteroid) {
            // Distance from selected asteroid to Earth
            if (selectedAsteroid.position) {
                const { x, y, z } = selectedAsteroid.position;
                const distAU = Math.sqrt(x * x + y * y + z * z);
                const distKm = distAU * 149597870.7;
                return {
                    success: `Distance from ${selectedAsteroid.name} to Earth: ${distKm.toLocaleString()} km (${distAU.toFixed(4)} AU)`
                };
            }
        }
        return { error: "Select an asteroid first or specify: distance <asteroid1> <asteroid2>" };
    };

    // Command: info
    const handleInfoCommand = () => {
        if (!selectedAsteroid) {
            return { error: "No asteroid selected. Use 'focus <name>' first." };
        }

        const a = selectedAsteroid;
        const lines = [
            `=== ${a.name || a.designation} ===`,
            `SPK-ID: ${a.spkId || 'N/A'}`,
            `Class: ${a.orbitClass || 'NEO'}`,
            `PHA: ${a.isPHA ? 'YES ⚠️' : 'No'}`,
            `Abs. Magnitude: ${a.absoluteMagnitude?.toFixed(1) || 'N/A'}`,
            `Diameter: ${a.diameter ? `${a.diameter.toFixed(1)} km` : 'Unknown'}`,
            a.orbitalElements ? [
                `Semi-major axis: ${a.orbitalElements.semiMajorAxis?.toFixed(3)} AU`,
                `Eccentricity: ${a.orbitalElements.eccentricity?.toFixed(4)}`,
                `Inclination: ${a.orbitalElements.inclination?.toFixed(2)}°`
            ].join('\n') : ''
        ].filter(Boolean);

        return { info: lines.join('\n') };
    };

    // Command: list [hazardous|close|all]
    const handleListCommand = (args) => {
        const filter = args[0] || 'close';
        let filtered = [];

        switch (filter) {
            case 'hazardous':
            case 'pha':
                filtered = asteroids.filter(a => a.isPHA).slice(0, 20);
                break;
            case 'close':
                filtered = asteroids
                    .filter(a => a.position)
                    .sort((a, b) => {
                        const distA = Math.sqrt(a.position.x ** 2 + a.position.y ** 2 + a.position.z ** 2);
                        const distB = Math.sqrt(b.position.x ** 2 + b.position.y ** 2 + b.position.z ** 2);
                        return distA - distB;
                    })
                    .slice(0, 20);
                break;
            default:
                filtered = asteroids.slice(0, 20);
        }

        const lines = filtered.map((a, i) =>
            `${i + 1}. ${a.name || a.designation}${a.isPHA ? ' ⚠️' : ''}`
        );

        return { info: `=== ${filter.toUpperCase()} Asteroids ===\n${lines.join('\n')}` };
    };

    // Command: search <query>
    const handleSearchCommand = (query) => {
        if (!query) {
            return { error: "Usage: search <query>" };
        }

        const matches = asteroids.filter(a =>
            a.name?.toLowerCase().includes(query) ||
            a.designation?.toLowerCase().includes(query)
        ).slice(0, 10);

        if (matches.length === 0) {
            return { error: `No asteroids found matching "${query}"` };
        }

        const lines = matches.map(a => `• ${a.name || a.designation}${a.isPHA ? ' ⚠️' : ''}`);
        return { info: `Found ${matches.length} matches:\n${lines.join('\n')}` };
    };

    // Help text
    const getHelpText = () => ({
        info: `=== CONTROL CENTER COMMANDS ===
focus <name>     - Center camera on asteroid
goto <date>      - Jump to date (YYYY-MM-DD or 'now')
track <name>     - Follow asteroid with camera
distance         - Show distance to Earth
info             - Show selected asteroid details
list [filter]    - List asteroids (hazardous|close|all)
search <query>   - Search asteroid names
help             - Show this help
clear            - Clear console`
    });

    // Toggle CLI with backtick key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '`' || e.key === 'Escape') {
                e.preventDefault();
                setShowCLI(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* Main 3D Visualization */}
            <NEOVisualization
                asteroids={asteroids}
                selectedAsteroid={selectedAsteroid}
                onSelectAsteroid={setSelectedAsteroid}
                currentDate={currentDate}
                showOrbits={showOrbits}
                showLabels={showLabels}
                cameraTarget={cameraTarget}
            />

            {/* Timeline Scrubber */}
            <TimelineScrubber
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
            />

            {/* Data Overlays */}
            {showOverlays && (
                <DataOverlays
                    selectedAsteroid={selectedAsteroid}
                    currentDate={currentDate}
                    asteroidCount={asteroids.length}
                />
            )}

            {/* Asteroid Info Panel */}
            {selectedAsteroid && (
                <AsteroidInfoPanel
                    asteroid={selectedAsteroid}
                    currentDate={currentDate}
                    onClose={() => setSelectedAsteroid(null)}
                />
            )}

            {/* Command Line Interface */}
            <CommandLine
                isOpen={showCLI}
                onClose={() => setShowCLI(false)}
                onCommand={handleCommand}
            />

            {/* HUD Hint */}
            <div className="absolute bottom-4 right-4 text-white/40 text-sm font-mono">
                Press ` to open command console
            </div>

            {/* Loading/Error Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                    <div className="text-white text-xl flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        Loading NEO Catalog...
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-4 right-4 bg-red-500/80 text-white px-4 py-2 rounded z-50">
                    {error}
                </div>
            )}
        </div>
    );
}

// Simple position calculation (client-side fallback)
function calculatePosition(elements, date) {
    if (!elements || !elements.semiMajorAxis) return { x: 0, y: 0, z: 0 };

    const { semiMajorAxis: a, eccentricity: e, inclination: i,
        longitudeAscNode: omega, argPerihelion: w, meanAnomaly: M0, epoch } = elements;

    const DEG_TO_RAD = Math.PI / 180;

    // Days since epoch
    const j2000 = new Date("2000-01-01T12:00:00Z");
    const jd = 2451545.0 + (date - j2000) / (1000 * 60 * 60 * 24);
    const dt = jd - epoch;

    // Mean motion (radians per day)
    const n = 0.0172 / Math.pow(a, 1.5);

    // Current mean anomaly
    let M = ((M0 || 0) * DEG_TO_RAD + n * dt) % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    // Solve Kepler's equation (simplified)
    let E = M;
    for (let j = 0; j < 10; j++) {
        E = M + e * Math.sin(E);
    }

    // True anomaly
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // Radius
    const r = a * (1 - e * Math.cos(E));

    // Position in orbital plane
    const xOrbital = r * Math.cos(nu);
    const yOrbital = r * Math.sin(nu);

    // Rotation to ecliptic
    const iRad = (i || 0) * DEG_TO_RAD;
    const omegaRad = (omega || 0) * DEG_TO_RAD;
    const wRad = (w || 0) * DEG_TO_RAD;

    const cosO = Math.cos(omegaRad);
    const sinO = Math.sin(omegaRad);
    const cosI = Math.cos(iRad);
    const sinI = Math.sin(iRad);
    const cosW = Math.cos(wRad);
    const sinW = Math.sin(wRad);

    const Px = cosO * cosW - sinO * sinW * cosI;
    const Py = sinO * cosW + cosO * sinW * cosI;
    const Qx = -cosO * sinW - sinO * cosW * cosI;
    const Qy = -sinO * sinW + cosO * cosW * cosI;

    return {
        x: xOrbital * Px + yOrbital * Qx,
        y: xOrbital * Py + yOrbital * Qy,
        z: (xOrbital * sinW + yOrbital * cosW) * sinI
    };
}

// Generate mock data for demo
function generateMockAsteroids(count) {
    const asteroids = [];

    for (let i = 0; i < count; i++) {
        const a = 0.5 + Math.random() * 3;
        const e = Math.random() * 0.6;
        const isPHA = Math.random() < 0.1;

        asteroids.push({
            id: `mock-${i}`,
            spkId: `MOCK${i.toString().padStart(5, '0')}`,
            name: `Mock Asteroid ${i}`,
            isPHA,
            absoluteMagnitude: 15 + Math.random() * 15,
            orbitalElements: {
                semiMajorAxis: a,
                eccentricity: e,
                inclination: Math.random() * 30,
                longitudeAscNode: Math.random() * 360,
                argPerihelion: Math.random() * 360,
                meanAnomaly: Math.random() * 360,
                epoch: 2451545.0
            }
        });
    }

    return asteroids;
}
