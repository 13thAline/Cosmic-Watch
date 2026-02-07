import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or loader

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
