export default function ThreatBlock({ name, score, level }) {
  const color =
    level === "CRITICAL"
      ? "#ff4d4d"
      : level === "HIGH"
      ? "#FF6A2A"
      : level === "MEDIUM"
      ? "#22d3ee"
      : "#22c55e"

  return (
    <div className="relative w-full h-72 flex items-center justify-center">

      {/* Arc */}
      <svg viewBox="0 0 200 100" className="absolute w-full h-full">
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke="#1f2937"
          strokeWidth="2"
        />
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={`${score * 1.8} 360`}
        />
      </svg>

      {/* Center */}
      <div className="text-center">
        <p className="text-sm text-gray-400">{name}</p>
        <p
          className="text-4xl font-mono"
          style={{ color }}
        >
          {score}
        </p>
        <div
          className="mt-2 px-3 py-1 text-xs border"
          style={{ borderColor: color, color }}
        >
          {level}
        </div>
      </div>
    </div>
  )
}
