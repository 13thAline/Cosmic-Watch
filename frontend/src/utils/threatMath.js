const normalize = (value, min, max) =>
  Math.min(1, Math.max(0, (value - min) / (max - min)))

 export function calculateThreatScore({ diameter, distance }) {
  if (!diameter || !distance) return 0

  // Normalize values
  const sizeFactor = Math.min(diameter / 100, 1) // cap at 100m
  const distanceFactor = Math.max(1 - distance / 10_000_000, 0)

  // Weighted score
  const score = (sizeFactor * 0.6 + distanceFactor * 0.4) * 100

  return Math.round(score)
}

export function threatLevel(score) {
  if (score >= 70) return "HIGH"
  if (score >= 40) return "MEDIUM"
  return "LOW"
}

 export function threatLevel(score) {
  if (score >= 80) return "CRITICAL"
  if (score >= 60) return "HIGH"
  if (score >= 35) return "MEDIUM"
  return "LOW"
}

