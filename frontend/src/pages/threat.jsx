import { useEffect, useState } from "react";
import { fetchAsteroids } from "@/services/neoService";
import ThreatBlock from "@/components/ThreatBlock";


export default function Threat() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAsteroids = async () => {
      try {
        const data = await fetchAsteroids();

        const processed = data
        .slice(0,9)
        .map(asteroid => ({
          id: asteroid.nasaId,
          name: asteroid.name,
          score: asteroid.riskScore,
          level: getThreatLevel(asteroid.riskScore), 
          diameter: asteroid.diameterMax,
          distance: asteroid.missDistanceKm,
        }));

        if (isMounted) setAsteroids(processed);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load asteroid data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAsteroids();
    return () => (isMounted = false);
  }, []);

  const getThreatLevel = (score) => {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 35) return "MEDIUM";
    return "LOW";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Scanning near-Earth objects…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-10 pt-24">
      <h1 className="m-12 text-4xl text-center font-semibold bg-gradient-to-r from-[#EDEDED] via-[#FFB089] to-[#FF6A2A] bg-clip-text text-transparent">
        Threat Detection
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {asteroids.map(a => (
          <ThreatBlock key={a.id} {...a} />
        ))}
      </div>
    </div>
  );
}