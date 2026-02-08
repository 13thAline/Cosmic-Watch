import { useState } from "react";
import axios from "axios";

export default function AsteroidSearch() {
  const [query, setQuery] = useState("");
  const [asteroid, setAsteroid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  /* ---------- HELPERS ---------- */
  const isPastEvent = (date) => {
    return new Date(date) < new Date();
  };

  /* ---------- SEARCH ---------- */
  const searchAsteroid = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setStatus("");
      setAsteroid(null);

      const res = await axios.get(
        `http://localhost:5000/api/asteroids/search?name=${query}`
      );

      setAsteroid(res.data);
    } catch (err) {
      setStatus("No matching asteroid found.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- TRACK & ALERT ---------- */
  const trackAsteroid = async () => {
    if (isPastEvent(asteroid.closeApproachDate)) {
      setStatus("This asteroid has already passed Earth. Alerts are not generated for past events.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/alerts/track", asteroid);
      setStatus("Early warnings scheduled for this asteroid.");
    } catch {
      setStatus("Failed to schedule alerts.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-20">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#EDEDED] via-[#FFB089] to-[#FF6A2A] bg-clip-text text-transparent">
          Asteroid Intelligence
        </h1>
        <p className="text-white/60 mt-2">
          Search near-Earth objects and view approach intelligence.
        </p>
      </div>

      {/* SEARCH */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex gap-3">
          <input
            className="
              flex-1
              bg-black
              border border-white/20
              rounded-xl
              px-5 py-3
              outline-none
              focus:border-[#FF6A2A]
            "
            placeholder="Search asteroid by name (e.g. Apollo)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchAsteroid()}
          />

          <button
            onClick={searchAsteroid}
            className="
              px-6 py-3
              rounded-xl
              bg-[#FF6A2A]
              text-black
              font-semibold
              hover:opacity-90
            "
          >
            {loading ? "Scanning…" : "Search"}
          </button>
        </div>
      </div>

      {/* ASTEROID CARD */}
      {asteroid && (
        <div className="max-w-3xl mx-auto mb-8">
          <div
            className="
              rounded-3xl
              bg-white/5
              backdrop-blur-xl
              border border-white/15
              p-8
            "
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              {asteroid.name}
              {isPastEvent(asteroid.closeApproachDate) && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                  Past Event
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <Data
                label="Closest Approach"
                value={new Date(asteroid.closeApproachDate).toDateString()}
              />
              <Data
                label="Miss Distance"
                value={`${Number(asteroid.distanceKm).toLocaleString()} km`}
              />
              <Data
                label="Velocity"
                value={
                  asteroid.velocity
                    ? `${Number(asteroid.velocity).toLocaleString()} km/h`
                    : "Data unavailable"
                }
              />
              <Data
                label="Hazard Status"
                value={
                  asteroid.hazardous
                    ? "Potentially Hazardous"
                    : "No Immediate Threat"
                }
                danger={asteroid.hazardous}
              />
            </div>

            {/* ACTION / INFO */}
            {isPastEvent(asteroid.closeApproachDate) ? (
              <div className="mt-8 text-center">
                <p className="text-orange-400 font-medium">
                  Closest approach already occurred
                </p>
                <p className="text-sm text-white/50 mt-1">
                  No alerts are generated for past asteroid events.
                </p>
              </div>
            ) : (
              <button
                onClick={trackAsteroid}
                className="
                  mt-8
                  w-full
                  py-3
                  rounded-xl
                  bg-white
                  text-black
                  font-semibold
                  hover:bg-gray-200
                "
              >
                Track & Generate Alerts
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATUS */}
      {status && (
        <p className="text-center text-white/70 mt-6">
          {status}
        </p>
      )}
    </div>
  );
}

/* ---------- SMALL UI COMPONENT ---------- */
function Data({ label, value, danger }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p
        className={`text-lg font-semibold mt-1 ${
          danger ? "text-red-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
