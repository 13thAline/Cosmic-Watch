export default function ThreatBlock({ name, score, level }) {
  const color =
    level === "CRITICAL"
      ? "#ff4d4d"
      : level === "HIGH"
      ? "#FF6A2A"
      : level === "MEDIUM"
      ? "#38bdf8"
      : "#22c55e"

  return (
    <div className="relative w-full h-72 flex items-center justify-center">

      {/* ARC */}
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
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${score * 1.8} 360`}
        />
      </svg>

      {/* CENTER CONTENT */}
      <div className="text-center flex flex-col items-center gap-3">

        {/* ASTEROID NAME */}
        <p
          className="
            text-sm
            tracking-wide
            text-gray-400
            uppercase
          "
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {name}
        </p>

        {/* SCORE */}
        <p
          className="
            text-4xl
            font-semibold
            tracking-tight
          "
          style={{
            color,
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          {score}
        </p>

        {/* LEVEL BADGE */}
        <div
          className="
            mt-1
            px-4 py-1
            text-xs
            rounded-full
            border
            tracking-wider
          "
          style={{
            borderColor: color,
            color,
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          {level}
        </div>
      </div>
    </div>
  )
}
