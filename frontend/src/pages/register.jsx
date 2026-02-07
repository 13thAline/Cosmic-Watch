import SignupForm from "../components/signup-form";

export default function Register() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black">

      {/* ================= LEFT PANEL ================= */}
      <div className="relative flex flex-col justify-center px-8 sm:px-16">

        {/* BRAND */}
        <div className="absolute top-8 left-8">
          <h1
            className="
              text-xl font-semibold tracking-tight
              bg-gradient-to-r
              from-[#EDEDED]
              via-[#FFB089]
              to-[#FF6A2A]
              bg-clip-text text-transparent
            "
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Cosmic Watch
          </h1>
        </div>

        {/* CONTENT */}
        <div className="max-w-md mx-auto space-y-10">

          {/* INTRO */}
          <div className="space-y-3">
            <h2 className="text-3xl text-center font-semibold text-white/90">
              Create account
            </h2>
            <p className="text-gray-400 text-center text-sm leading-relaxed">
              Monitor near-Earth objects with real-time intelligence,
              precision tracking, and threat analysis.
            </p>
          </div>

          {/* FORM CARD */}
          <div
            className="
              rounded-2xl
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              p-8
            "
          >
            <SignupForm />
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="relative hidden lg:block overflow-hidden">

        {/* ASTEROID IMAGE */}
        <img
          src="/RegisterImage.png"
          alt="Asteroid near Earth"
          className="
            absolute inset-0
            w-full h-full
            object-cover
            scale-105
            brightness-110
            contrast-110
            saturate-110
          "
        />

        {/* SOFT EDGE GRADIENT (ONLY AT SEAM) */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/30 to-transparent" />

        {/* SUBTLE FIRE GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(255,106,42,0.15),transparent_65%)]" />

      </div>

    </div>
  );
}
