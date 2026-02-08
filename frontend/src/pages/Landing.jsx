import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Asteroid from "@/components/asteroid";

const subtitleText =
  "Monitoring Near-Earth Objects with Precision & Real-Time Intelligence";

const Landing = () => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  // Typing animation
  useEffect(() => {
    if (index < subtitleText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + subtitleText[index]);
        setIndex(index + 1);
      }, 35);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  const features = [
  {
    title: "Real Time Tracking",
    description:
      "Continuously monitor near Earth objects with live orbital updates and positional accuracy.",
  },
  {
    title: "Threat Scoring",
    description:
      "AI-driven risk assessment based on asteroid size, velocity, and proximity to Earth.",
  },
  {
    title: "Smart Alerts",
    description:
      "Instant notifications when objects cross predefined danger thresholds.",
  },
  {
    title: "Visual Analytics",
    description:
      "Interactive charts and 3D visualizations for deeper asteroid analysis.",
  },
];


  return (
    <>
      
      <section className="w-screen min-h-screen bg-[url('/LandingSpace.png')] bg-cover bg-center">
        <div className="w-full min-h-screen bg-black/60">
          <div className="max-w-7xl mx-auto min-h-screen flex items-center px-4 md:px-12">
            <div className="w-full md:w-1/2">

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="
                  text-5xl md:text-6xl lg:text-7xl
                  font-medium
                  bg-gradient-to-r
                  from-[#EDEDED]
                  via-[#FFB089]
                  to-[#FF6A2A]
                  bg-clip-text
                  text-transparent
                "
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                Cosmic Watch
              </motion.h1>

              <p
                className="
                  mt-6
                  max-w-lg
                  text-sm md:text-base
                  text-gray-300
                  tracking-wide
                "
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {text}
                <span className="animate-pulse">|</span>
              </p>

            </div>
          </div>
        </div>
      </section>

   
<section className="relative w-screen bg-black py-28 bg-[url('/stars-bg.png')]
    bg-cover
    bg-center">
  <div className="max-w-7xl mx-auto px-4 md:px-12">

 
    <h2
      className="
        text-center
        text-4xl md:text-5xl
        font-medium
        bg-gradient-to-r
        from-[#EDEDED]
        via-[#FFB089]
        to-[#FF6A2A]
        bg-clip-text
        text-transparent
        mb-4
      "
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      3D Asteroid Model
    </h2>

    
    <p className="text-center text-gray-400 max-w-xl mx-auto mb-16">
      Interactive near-Earth asteroid visualization used for real-time
      monitoring and threat analysis.
    </p>

   
    <div
      className="
        relative
        h-[300px]
        md:h-[400px]
        lg:h-[460px]
        mb-24
      "
    >
     
      <div className="absolute inset-0 -translate-y-6">
        <Asteroid />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,106,42,0.08),transparent_70%)]" />
    </div>

  </div>
</section>

{/* ================= FEATURES SECTION ================= */}
<section 
 id="features"
className="relative w-screen bg-black py-32">
  <div className="max-w-7xl mx-auto px-4 md:px-12">

    {/* SECTION TITLE */}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="
        text-center
        text-4xl md:text-5xl
        font-medium
        bg-gradient-to-r
        from-[#EDEDED]
        via-[#FFB089]
        to-[#FF6A2A]
        bg-clip-text
        text-transparent
        mb-6
      "
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      Platform Capabilities
    </motion.h2>

    {/* SUBTITLE */}
    <p className="text-center text-gray-400 max-w-2xl mx-auto mb-20">
      Advanced monitoring tools designed to analyze, visualize, and assess
      near-Earth objects in real time.
    </p>

    {/* FEATURE CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: index * 0.1,
          }}
          whileHover={{
            y: -8,
            boxShadow: "0 0 40px rgba(255,106,42,0.25)",
          }}
          className="
            relative
            rounded-2xl
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            p-6
            transition
          "
        >
          {/* Glow layer */}
          <div className="
            pointer-events-none
            absolute inset-0
            rounded-2xl
            bg-[radial-gradient(circle_at_top,rgba(255,106,42,0.15),transparent_70%)]
            opacity-0
            hover:opacity-100
            transition
          " />

          {/* CONTENT */}
          <h3
            className="text-lg font-semibold text-white mb-3"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {feature.title}
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}

    </div>
  </div>
</section>




    </>
  );
};

export default Landing;
