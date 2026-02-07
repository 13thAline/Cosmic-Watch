import { useEffect, useMemo, useState } from "react";
import { fetchAsteroids } from "@/services/neoService";
import ThreatScore from "./threat";
import {
  ActivityTrend,
  DistanceDistribution
} from "@/components/AsteroidChart";
import { useNavigate } from "react-router-dom";

/* ---------- HELPERS ---------- */
function formatNumber(n) {
  return n?.toLocaleString("en-IN");
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ---------- MAIN ---------- */
export default function Dashboard() {
  const navigate = useNavigate();

  const [asteroids, setAsteroids] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH ASTEROIDS ---------- */
  useEffect(() => {
    fetchAsteroids()
      .then(data => {
        setAsteroids(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  /* ---------- FETCH ALERTS ---------- */
  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then(res => res.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  /* ---------- DERIVED DATA ---------- */
  const total = asteroids.length;
  const hazardous = asteroids.filter(a => a.isHazardous).length;

  const nextFlyby = useMemo(() => {
    if (!asteroids.length) return null;
    return asteroids
      .map(a => new Date(a.closeApproachDate))
      .sort((a, b) => a - b)[0];
  }, [asteroids]);

  const activityData = useMemo(() => {
    const map = {};
    asteroids.forEach(a => {
      const date = new Date(a.closeApproachDate).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short" }
      );
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({
      date,
      count
    }));
  }, [asteroids]);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-12 relative">

      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        className="
          absolute top-6 right-6
          px-4 py-2
          rounded-full
          bg-white/10
          border border-white/20
          text-white text-sm
          hover:bg-white/20
        "
      >
        Logout
      </button>

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#EDEDED] via-[#FFB089] to-[#FF6A2A] bg-clip-text text-transparent">
          Mission Dashboard
        </h1>
        <p className="text-white/60 mt-2">
          Real-time asteroid monitoring and alert system
        </p>
      </div>

      {/* ALERTS PANEL */}
      <Panel title="Active Alerts" subtitle="Upcoming hazardous events">
        {alerts.length === 0 ? (
          <p className="text-white/40">No active alerts</p>
        ) : (
          alerts.slice(0, 5).map(alert => (
            <div
              key={alert._id}
              onClick={() => navigate("/notifications")}
              className={`
                p-4 mb-3 rounded-xl border cursor-pointer
                ${
                  alert.severity === "critical"
                    ? "bg-red-500/10 border-red-500/30"
                    : alert.severity === "warning"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-white/5 border-white/20"
                }
              `}
            >
              <p className="font-semibold">{alert.asteroidName}</p>
              <p className="text-sm text-white/70">{alert.message}</p>
            </div>
          ))
        )}

        {alerts.length > 0 && (
          <button
            onClick={() => navigate("/notifications")}
            className="mt-3 text-sm text-orange-400 hover:underline"
          >
            View all notifications →
          </button>
        )}
      </Panel>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-14">
        <Stat label="Tracked Objects" value={formatNumber(total)} />
        <Stat label="Near-Earth Objects" value={formatNumber(total)} />
        <Stat label="Hazardous" value={hazardous} />
        <Stat
          label="Next Flyby"
          value={nextFlyby ? formatDate(nextFlyby) : "—"}
        />
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <Panel title="Asteroid Activity" subtitle="Close-approach trend">
          <ActivityTrend data={activityData} />
        </Panel>

        <Panel
          title="Miss Distance Distribution"
          subtitle="How close they pass Earth"
        >
          <DistanceDistribution asteroids={asteroids} />
        </Panel>
      </div>

      {/* THREAT STATUS */}
      <Panel title="Threat Status" subtitle="Risk assessment engine">
        <ThreatScore />
      </Panel>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 p-6">
      <p className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </p>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <div className="mt-4 h-[3px] w-12 bg-[#FF6A2A]/80 rounded-full" />
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-6 shadow-[0_0_40px_rgba(255,255,255,0.04)] mb-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-white/50 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}
