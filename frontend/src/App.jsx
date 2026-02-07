import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import Threat from "./pages/threat";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
import Register from "./pages/register";
import Login from "./pages/login";
<<<<<<< HEAD
import Dashboard from "./pages/dashboard";
=======
import Chat from "./pages/Chat";
>>>>>>> c5af8521f4f24bead0518988b9e8bf0a512709ae

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/threat" element={<Threat />} />
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
