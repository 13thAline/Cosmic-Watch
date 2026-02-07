import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import ThreatScore from "./pages/threat";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
import Register from "./pages/register";
import Login from "./pages/login";
import Chat from "./pages/Chat";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/register" ||
    location.pathname === "/login";

  return (
    <div className="w-screen min-h-screen bg-black text-white overflow-x-hidden">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/threat" element={<ThreatScore />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
