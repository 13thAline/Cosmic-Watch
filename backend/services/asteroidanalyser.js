function analyzeAsteroid(asteroid) {
  if (asteroid.isHazardous || asteroid.missDistanceKm < 1_000_000) {
    return {
      severity: asteroid.missDistanceKm < 500_000 ? "critical" : "warning",
      message: `Asteroid ${asteroid.name} is passing unusually close to Earth.`,
    };
  }
  return null;
}

const alert = analyzeAsteroid(asteroid);

if (alert) {
  await Alert.create({
    asteroidId: asteroid.nasaId,
    asteroidName: asteroid.name,
    missDistanceKm: asteroid.missDistanceKm,
    severity: alert.severity,
    message: alert.message,
  });
}
