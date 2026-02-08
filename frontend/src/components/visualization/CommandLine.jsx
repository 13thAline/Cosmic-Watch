/**
 * Command Line Interface - Terminal Overlay
 *
 * Professional CLI overlay for quick navigation and control.
 * Supports commands like: focus, goto, track, distance, info
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { IconTerminal2, IconX } from "@tabler/icons-react";

// Maximum lines to keep in history
const MAX_HISTORY = 100;

export default function CommandLine({
    isOpen = false,
    onClose,
    onCommand
}) {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([
        { type: "system", text: "COSMIC-WATCH CONTROL CENTER v1.0" },
        { type: "system", text: "Type 'help' for available commands." }
    ]);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    // Submit command
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const cmd = input.trim();
        if (!cmd) return;

        // Add to history
        setHistory(prev => [...prev, { type: "input", text: `> ${cmd}` }]);
        setCommandHistory(prev => [cmd, ...prev].slice(0, 50));
        setInput("");
        setHistoryIndex(-1);

        try {
            const result = await onCommand(cmd);

            if (result.clear) {
                setHistory([
                    { type: "system", text: "Console cleared." }
                ]);
            } else if (result.error) {
                setHistory(prev => [...prev, { type: "error", text: result.error }]);
            } else if (result.success) {
                setHistory(prev => [...prev, { type: "success", text: result.success }]);
            } else if (result.info) {
                setHistory(prev => [...prev, { type: "info", text: result.info }]);
            }
        } catch (err) {
            setHistory(prev => [...prev, { type: "error", text: `Error: ${err.message}` }]);
        }

        // Trim history if too long
        setHistory(prev => prev.slice(-MAX_HISTORY));
    }, [input, onCommand]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        // Command history navigation
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput("");
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            // Simple tab completion for commands
            const commands = ["focus", "goto", "track", "distance", "info", "list", "search", "help", "clear"];
            const match = commands.find(c => c.startsWith(input.toLowerCase()));
            if (match) {
                setInput(match + " ");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4">
            <div className="w-full max-w-3xl bg-black/95 border border-green-500/30 rounded-lg shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-green-500/10 border-b border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400">
                        <IconTerminal2 size={18} />
                        <span className="font-mono text-sm">CONTROL CENTER CONSOLE</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-green-400/60 hover:text-green-400 transition-colors"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                {/* Output Area */}
                <div
                    ref={scrollRef}
                    className="h-64 overflow-y-auto p-4 font-mono text-sm"
                >
                    {history.map((line, i) => (
                        <div
                            key={i}
                            className={`mb-1 whitespace-pre-wrap ${line.type === "input" ? "text-white" :
                                    line.type === "error" ? "text-red-400" :
                                        line.type === "success" ? "text-green-400" :
                                            line.type === "info" ? "text-cyan-400" :
                                                "text-green-400/60"
                                }`}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="border-t border-green-500/20">
                    <div className="flex items-center px-4 py-3">
                        <span className="text-green-400 mr-2 font-mono">&gt;</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter command..."
                            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-white/30"
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                </form>

                {/* Quick Commands */}
                <div className="flex items-center gap-2 px-4 py-2 border-t border-green-500/20 text-xs font-mono text-green-400/40 overflow-x-auto">
                    {["help", "list hazardous", "goto now", "info"].map(cmd => (
                        <button
                            key={cmd}
                            onClick={() => {
                                setInput(cmd);
                                inputRef.current?.focus();
                            }}
                            className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors whitespace-nowrap"
                        >
                            {cmd}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Minimal CLI Indicator - Shows when CLI is available
 */
export function CLIIndicator({ onOpen }) {
    return (
        <button
            onClick={onOpen}
            className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-green-500/50 transition-all group"
        >
            <IconTerminal2 size={16} />
            <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Press `
            </span>
        </button>
    );
}
