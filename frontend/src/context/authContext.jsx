import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    setLoading(false);
  }, [token]);


  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });

    if (!res.success) {
      throw new Error(res.message || "Login failed");
    }

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify({ email }));

    setToken(res.token);
    setUser({ email });

    return res.token;
  };

  const register = async ({ email, password }) => {
    const res = await registerUser({ email, password });

    if (!res.success) {
      throw new Error(res.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
