/**
 * Timeline Scrubber - Temporal Navigation Component
 *
 * Allows scrubbing through time from 1900 to 2200.
 * Features playback controls and precise date picker.
 */

import { useState, useRef, useEffect } from "react";
import { IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward, IconPlayerSkipBack, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Time range constants
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;
const REFERENCE_DATE = new Date("2000-01-01");

// Playback speed options
const SPEED_OPTIONS = [
    { value: 0.1, label: "0.1x" },
    { value: 1, label: "1x" },
    { value: 7, label: "1 week/s" },
    { value: 30, label: "1 month/s" },
    { value: 365, label: "1 year/s" }
];

export default function TimelineScrubber({
    currentDate = new Date(),
    onDateChange,
    isPlaying = false,
    onPlayPause,
    playbackSpeed = 1,
    onSpeedChange
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const sliderRef = useRef(null);

    // Convert date to slider position (0-1)
    const dateToPosition = (date) => {
        const year = date.getFullYear();
        return (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
    };

    // Convert slider position to date
    const positionToDate = (position) => {
        const year = MIN_YEAR + position * (MAX_YEAR - MIN_YEAR);
        const fullYear = Math.floor(year);
        const dayOfYear = (year - fullYear) * 365;

        const date = new Date(fullYear, 0, 1);
        date.setDate(date.getDate() + dayOfYear);
        return date;
    };

    // Handle mouse drag on slider
    const handleMouseDown = (e) => {
        setIsDragging(true);
        updateFromMouse(e);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        updateFromMouse(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const updateFromMouse = (e) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onDateChange(positionToDate(x));
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging]);

    // Navigation helpers
    const jumpDays = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    const jumpToNow = () => {
        onDateChange(new Date());
    };

    const position = dateToPosition(currentDate);

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-12">
            <div className="max-w-6xl mx-auto">
                {/* Current Date Display */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause Controls */}
                        <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                            <button
                                onClick={() => jumpDays(-30)}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Back 30 days"
                            >
                                <IconPlayerSkipBack size={18} className="text-white" />
                            </button>

                            <button
                                onClick={() => jumpDays(-1)}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Back 1 day"
                            >
                                <IconChevronLeft size={18} className="text-white" />
                            </button>

                            <button
                                onClick={onPlayPause}
                                className="p-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <IconPlayerPause size={18} className="text-white" />
                                ) : (
                                    <IconPlayerPlay size={18} className="text-white" />
                                )}
                            </button>

                            <button
                                onClick={() => jumpDays(1)}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Forward 1 day"
                            >
                                <IconChevronRight size={18} className="text-white" />
                            </button>

                            <button
                                onClick={() => jumpDays(30)}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Forward 30 days"
                            >
                                <IconPlayerSkipForward size={18} className="text-white" />
                            </button>
                        </div>

                        {/* Speed Control */}
                        <select
                            value={playbackSpeed}
                            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                            className="bg-white/10 text-white text-sm rounded px-2 py-1 border border-white/20"
                        >
                            {SPEED_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Display */}
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="font-mono text-white text-lg hover:text-blue-400 transition-colors"
                    >
                        {currentDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })}
                    </button>

                    {/* Jump to Now */}
                    <button
                        onClick={jumpToNow}
                        className="text-sm text-white/60 hover:text-white px-3 py-1 bg-white/10 rounded transition-all hover:bg-white/20"
                    >
                        NOW
                    </button>
                </div>

                {/* Timeline Slider */}
                <div
                    ref={sliderRef}
                    className="relative h-10 cursor-pointer group"
                    onMouseDown={handleMouseDown}
                >
                    {/* Track background */}
                    <div className="absolute top-4 left-0 right-0 h-2 bg-white/20 rounded-full overflow-hidden">
                        {/* Progress fill */}
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                            style={{ width: `${position * 100}%` }}
                        />
                    </div>

                    {/* Year markers */}
                    <div className="absolute top-8 left-0 right-0 flex justify-between text-xs text-white/40">
                        {[1900, 1950, 2000, 2050, 2100, 2150, 2200].map(year => (
                            <span key={year} className="relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-2 bg-white/30" />
                                {year}
                            </span>
                        ))}
                    </div>

                    {/* Current position handle */}
                    <div
                        className="absolute top-2 w-6 h-6 -ml-3 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-transform group-hover:scale-110"
                        style={{ left: `${position * 100}%` }}
                    />

                    {/* Today marker */}
                    <div
                        className="absolute top-3 w-1 h-4 bg-green-500 rounded-full"
                        style={{ left: `${dateToPosition(new Date()) * 100}%` }}
                        title="Today"
                    />
                </div>

                {/* Date Picker Modal */}
                {showDatePicker && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 rounded-lg p-4 shadow-xl z-50">
                        <input
                            type="date"
                            value={currentDate.toISOString().split("T")[0]}
                            onChange={(e) => {
                                onDateChange(new Date(e.target.value));
                                setShowDatePicker(false);
                            }}
                            className="bg-gray-800 text-white px-3 py-2 rounded border border-white/20"
                        />
                        <button
                            onClick={() => setShowDatePicker(false)}
                            className="ml-2 text-white/60 hover:text-white"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
