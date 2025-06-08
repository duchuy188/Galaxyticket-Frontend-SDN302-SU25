import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Route guard for public routes
export const PublicRouteGuard: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { user } = useAuth();

    // Redirect admin/staff to their respective dashboards
    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'staff') {
        return <Navigate to="/staff" replace />;
    }
    return <>{children}</>;
};

// Route guard for auth pages
export const AuthRouteGuard: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { user } = useAuth();

    // Redirect authenticated users based on their role
    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'staff') return <Navigate to="/staff" replace />;
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}; 