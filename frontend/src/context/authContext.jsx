import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("accessToken")
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

  // LOGIN
  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });

    if (!res.success) throw new Error(res.message);

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("user", JSON.stringify({ email }));

    setToken(res.accessToken);
    setUser({ email });
  };

  // REGISTER (no auto-login, backend doesn’t send token)
  const register = async ({ email, password }) => {
    const res = await registerUser({ email, password });

    if (!res.success) throw new Error(res.message);
    // after register → redirect to login
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
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
