import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardLink = user.role === 'THERAPIST' ? '/dashboard/therapist' : 
                         user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/patient';
    return <Navigate to={dashboardLink} replace />;
  }

  return children;
}
