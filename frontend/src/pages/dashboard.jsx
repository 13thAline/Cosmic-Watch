import OrbitScene from "@/components/OrbitScene"
import SearchHistory from "@/components/SearchHistory"
import ThreatScore from "./threat"

export default function Dashboard() {
  return (
    <div
      className="
        min-h-screen
        bg-black
        text-white
        px-6
        pt-32   /* 👈 THIS IS THE FIX */
        pb-10
      "
    >
      {/* PAGE TITLE */}
      <h1
        className="
          text-3xl font-semibold mb-6
          bg-gradient-to-r
          from-[#EDEDED]
          via-[#FFB089]
          to-[#FF6A2A]
          bg-clip-text text-transparent
        "
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
      >
        Dashboard
      </h1>

      {/* 3D ORBIT */}
      <div
        className="
          h-[420px]
          rounded-3xl
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          overflow-hidden
          mb-10
        "
      >
        <OrbitScene />
      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">Search History</h2>
          <SearchHistory />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">Threat Status</h2>
          <ThreatScore/>
        </div>
      </div>
    </div>
  )
}
