import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ isLoggedIn = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const scrollToFeatures = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("features")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 150);
    } else {
      document.getElementById("features")?.scrollIntoView({
        behavior: "smooth",
      });
    }
    setOpen(false);
  };

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          className="
            relative
            flex items-center
            gap-3
            px-10 py-3
            whitespace-nowrap
            rounded-full
            backdrop-blur-md
            bg-white/10
            border border-white/15
          "
          style={{
            fontFamily: "General Sans, sans-serif",
            boxShadow:
              "0 0 40px rgba(255,140,90,0.18), inset 0 0 18px rgba(255,140,90,0.1)",
          }}
        >
          <Logo />

          <Divider />

          <NavItem label="Features" onClick={scrollToFeatures} />
          <NavItem label="Threat Score" onClick={() => navigate("/threat")} />
          <NavItem
            label="Notifications"
            onClick={() => navigate("/notifications")}
          />

          <Divider />

          {isLoggedIn ? (
            <ProfileIcon onClick={() => navigate("/profile")} />
          ) : (
            <GetStarted onClick={() => navigate("/register")} />
          )}
        </motion.div>
      </nav>

      {/* ================= MOBILE TOP BAR ================= */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div
          className="
            flex items-center justify-between
            px-5 py-3
            rounded-full
            bg-white/10
            backdrop-blur-md
            border border-white/15
          "
          style={{ fontFamily: "General Sans, sans-serif" }}
        >
          <Logo />
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-white"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* ================= MOBILE BOTTOM SHEET ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              bg-black/90 backdrop-blur-xl
              rounded-t-3xl
              p-6
            "
            style={{ fontFamily: "General Sans, sans-serif" }}
          >
            <MobileItem onClick={scrollToFeatures}>Features</MobileItem>
            <MobileItem onClick={() => navigate("/threat")}>
              Threat Score
            </MobileItem>
            <MobileItem onClick={() => navigate("/notifications")}>
              Notifications
            </MobileItem>

            <div className="mt-6">
              {isLoggedIn ? (
                <MobileItem onClick={() => navigate("/profile")}>
                  Profile
                </MobileItem>
              ) : (
                <button
                  onClick={() => navigate("/register")}
                  className="
                    w-full mt-4 py-3
                    rounded-xl
                    bg-white text-black
                    text-base font-semibold
                    tracking-tight
                  "
                >
                  Get Started
                </button>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full text-gray-400 text-sm"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

/* ================= HELPER COMPONENTS ================= */

const Logo = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="px-3 text-sm font-semibold tracking-tight text-white hover:text-gray-200 transition"
      style={{ fontFamily: "General Sans, sans-serif" }}
    >
      Cosmic Watch
    </button>
  );
};

const NavItem = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="
      px-3 py-2
      text-sm
      font-semibold
      tracking-tight
      rounded-full
      text-[#CFCFCF]
      transition
      hover:text-white
      hover:bg-white/10
    "
  >
    {label}
  </button>
);

const MobileItem = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full py-4
      text-left
      text-lg
      font-semibold
      tracking-tight
      text-white
      border-b border-white/10
    "
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="h-5 w-px bg-white/20" />
);

const GetStarted = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      px-4 py-2
      rounded-full
      text-sm
      font-semibold
      tracking-tight
      bg-white text-black
      hover:bg-gray-200
      transition
    "
  >
    Get Started
  </button>
);

const ProfileIcon = ({ onClick }) => (
  <div
    onClick={onClick}
    className="
      w-9 h-9
      rounded-full
      bg-white/20
      flex items-center justify-center
      text-sm
      font-semibold
      tracking-tight
      text-white
      cursor-pointer
      hover:bg-white/30
      transition
    "
  >
    A
  </div>
);
