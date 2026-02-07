import { useEffect, useState } from "react";

/* ---------- HELPERS ---------- */
function formatTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const severityStyles = {
  critical: "bg-red-500/10 border-red-500/30 text-red-400",
  warning: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  info: "bg-white/5 border-white/20 text-white/80",
};

/* ---------- MAIN ---------- */
export default function Notification() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH ALERTS ---------- */
  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  /* ---------- MARK AS READ ---------- */
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}/read`, {
        method: "PATCH",
      });

      setAlerts((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, isRead: true } : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- FILTERED ALERTS ---------- */
  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === filter);

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-12">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#EDEDED] via-[#FFB089] to-[#FF6A2A] bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-white/60 mt-2">
          System alerts and asteroid event updates
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 mb-8">
        {["all", "critical", "warning", "info"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              ${
                filter === type
                  ? "bg-orange-600 text-black"
                  : "bg-white/10 hover:bg-white/20"
              }
            `}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* ALERT LIST */}
      <div className="space-y-4">
        {loading && (
          <p className="text-white/40">Loading notifications…</p>
        )}

        {!loading && filteredAlerts.length === 0 && (
          <p className="text-white/40">
            No notifications for this category
          </p>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert._id}
            className={`
              rounded-2xl border p-5 transition
              ${severityStyles[alert.severity]}
              ${alert.isRead ? "opacity-60" : ""}
            `}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide opacity-70">
                  {alert.severity}
                </p>
                <h3 className="text-lg font-semibold mt-1">
                  {alert.asteroidName}
                </h3>
                <p className="text-sm mt-2 text-white/80">
                  {alert.message}
                </p>
                <p className="text-xs text-white/40 mt-3">
                  {formatTime(alert.createdAt)}
                </p>
              </div>

              {!alert.isRead && (
                <button
                  onClick={() => markAsRead(alert._id)}
                  className="
                    text-xs px-3 py-1
                    rounded-full
                    bg-white/10
                    border border-white/20
                    hover:bg-white/20
                  "
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
