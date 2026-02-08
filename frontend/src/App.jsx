import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import Landing from "./pages/Landing";
import Dashboard from "./pages/dashboard";
import Threat from "./pages/threat";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
import Register from "./pages/register";
import Login from "./pages/login";
import Chat from "./pages/chat";

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/register" ||
    location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden">

      {!hideLayout && <Navbar />}

      <main className="flex-1">
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
      </main>

      {!hideLayout && <Footer />}

    </div>
  );
}

export default App;
