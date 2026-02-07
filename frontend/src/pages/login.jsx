import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-black text-white">

      {/* ================= LEFT PANEL ================= */}
      <div className="relative flex flex-col gap-6 p-6 md:p-10">

        {/* BRAND */}
        <div className="flex justify-center md:justify-start">
          <span
            className="
              text-xl font-semibold tracking-tight
              bg-gradient-to-r
              from-[#EDEDED]
              via-[#FFB089]
              to-[#FF6A2A]
              bg-clip-text text-transparent
            "
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Cosmic Watch
          </span>
        </div>

        {/* FORM CONTAINER */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="
              w-full max-w-sm
              rounded-2xl
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              p-8
            "
          >
            <LoginForm />
          </div>
        </div>

        {/* SUBTLE LEFT GLOW */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,106,42,0.08),transparent_60%)]" />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="relative hidden lg:block overflow-hidden">

        {/* ASTEROID IMAGE */}
        <img
          src="/RegisterImage.png"
          alt="Asteroid near Earth"
          className="
            absolute inset-0
            h-full w-full
            object-cover
            scale-105
            brightness-110
            contrast-110
            saturate-110
          "
        />

        {/* SEAM GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/30 to-transparent" />

        {/* COSMIC FIRE GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(255,106,42,0.18),transparent_65%)]" />
      </div>

    </div>
  )
}
