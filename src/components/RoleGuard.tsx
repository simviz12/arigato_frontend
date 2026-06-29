import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { accessToken, role } = useAuthStore();

  if (!accessToken || !role) {
    // Unauthenticated -> Replace history to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Insufficient permissions -> Replace history to default protected route (e.g. POS)
    return <Navigate to="/pos" replace />;
  }

  // Authorized
  return <Outlet />;
};
