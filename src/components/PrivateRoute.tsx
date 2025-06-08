import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
type PrivateRouteProps = {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'staff' | 'user'>;
};
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles
}) => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
export default PrivateRoute;