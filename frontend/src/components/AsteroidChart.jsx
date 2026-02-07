import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

/* ======================================================
   ACTIVITY TREND — LINE GRAPH
   ====================================================== */
export function ActivityTrend({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-white/40">
        No activity data
      </div>
    );
  }

  // sort by date
  const sorted = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={sorted}>
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          tickMargin={10}
        />
        <YAxis
          stroke="#9CA3AF"
          allowDecimals={false}
        />

        <Tooltip
          contentStyle={{
            background: "#0B0B0B",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8
          }}
          labelStyle={{ color: "#9CA3AF" }}
          formatter={(value) => [`${value} objects`, "Count"]}
        />

        <Line
          type="monotone"
          dataKey="count"
          stroke="#FF6A2A"
          strokeWidth={3}
          dot={{
            r: 6,
            fill: "#FF6A2A",
            stroke: "#000",
            strokeWidth: 2
          }}
          activeDot={{
            r: 8,
            fill: "#FF6A2A"
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ======================================================
   MISS DISTANCE DISTRIBUTION — BAR GRAPH
   ====================================================== */
export function DistanceDistribution({ asteroids }) {
  if (!asteroids || !asteroids.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-white/40">
        No distance data
      </div>
    );
  }

  const buckets = [
    { label: "< 1M km", min: 0, max: 1_000_000 },
    { label: "1–10M km", min: 1_000_000, max: 10_000_000 },
    { label: "10–50M km", min: 10_000_000, max: 50_000_000 },
    { label: "> 50M km", min: 50_000_000, max: Infinity }
  ];

  const data = buckets.map(bucket => ({
    range: bucket.label,
    count: asteroids.filter(
      a =>
        a.missDistanceKm >= bucket.min &&
        a.missDistanceKm < bucket.max
    ).length
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis
          dataKey="range"
          stroke="#9CA3AF"
        />
        <YAxis
          stroke="#9CA3AF"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0B0B0B",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8
          }}
          formatter={(value) => [`${value} asteroids`, "Count"]}
        />
        <Bar
          dataKey="count"
          fill="#FFB089"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
