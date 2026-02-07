import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import Threat from "./pages/threat";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

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
      </Routes>
    </div>
  );
}

export default App;
