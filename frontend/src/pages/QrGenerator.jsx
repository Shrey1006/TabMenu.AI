import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function QrGenerator() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/admin" replace />;
}
