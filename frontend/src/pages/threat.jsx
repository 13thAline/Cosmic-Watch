import { useEffect, useState } from "react"
import { fetchAsteroids } from "@/services/neoService"
import ThreatBlock from "@/components/ThreatBlock"
import { calculateThreatScore, threatLevel } from "@/utils/threatMath"

export default function Threat() {
  const [asteroids, setAsteroids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadAsteroids = async () => {
      try {
        const data = await fetchAsteroids()

        const processed = data
          .filter(neo => neo.close_approach_data?.length)
          .slice(0, 10)
          .map(neo => {
            const diameter =
              neo.estimated_diameter?.meters?.estimated_diameter_max ?? 0

            const distance =
              Number(
                neo.close_approach_data[0]?.miss_distance?.kilometers
              ) || Infinity

            const score = calculateThreatScore({ diameter, distance })

            return {
              name: neo.name,
              score,
              level: threatLevel(score),
              diameter,
              distance,
            }
          })

        if (isMounted) setAsteroids(processed)
      } catch (err) {
        console.error(err)
        if (isMounted) setError("Failed to load asteroid data")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAsteroids()
    return () => (isMounted = false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Scanning near-Earth objects…
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-10 pt-24">
      <h1 className="mb-12 text-4xl font-semibold bg-gradient-to-r from-[#EDEDED] via-[#FFB089] to-[#FF6A2A] bg-clip-text text-transparent">
        Threat Detection
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {asteroids.map(a => (
          <ThreatBlock key={a.name} {...a} />
        ))}
      </div>
    </div>
  )
}
