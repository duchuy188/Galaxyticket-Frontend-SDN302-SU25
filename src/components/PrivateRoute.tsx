import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
type PrivateRouteProps = {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'staff' | 'manager' | 'member'>;
};
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles
}) => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  
  console.log('PrivateRoute Debug:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    userEmail: user?.email
  });
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (!user || !allowedRoles.includes(user.role)) {
    console.log('Access denied for role:', user?.role);
    // Redirect based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'staff') return <Navigate to="/staff" replace />;
    if (user?.role === 'manager') return <Navigate to="/manager" replace />;
    if (user?.role === 'member') return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
export default PrivateRoute;