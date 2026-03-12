import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/admin/Loading";

type ProtectedRouteProps = {
  requireAdmin?: boolean;
  loginPath?: string;
};

export default function ProtectedRoute({ requireAdmin = false, loginPath = "/register" }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user" replace />;
  }

  return <Outlet />;
}
