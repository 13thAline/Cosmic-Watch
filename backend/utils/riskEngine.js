const calculateRiskScore = (isHazardous, diameterMax, missDistanceKm) => {
  let score = 0;

  if (isHazardous) score += 40;

  const sizeScore = (diameterMax / 1000) * 30;
  score += Math.min(30, sizeScore);

  const distanceScore = 30 - (missDistanceKm / 7500000) * 30;
  score += Math.max(0, distanceScore);

  return Math.round(score);
};

module.exports = { calculateRiskScore };