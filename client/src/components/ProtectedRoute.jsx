import { Navigate } from 'react-router-dom';
import { useAuth, useRole, hasPermission } from '../hooks/useAuth';

export function ProtectedRoute({ children, requiredRoles }) {
  const { token, loading } = useAuth();
  const role = useRole();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && !hasPermission(role, requiredRoles)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;
