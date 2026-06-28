import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {

  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // ou splash loader depois

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;

}

export default PrivateRoute;