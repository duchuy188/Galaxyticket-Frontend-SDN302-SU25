import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import MovieDetail from '../pages/MovieDetail';
import SeatSelection from '../pages/SeatSelection';
import Checkout from '../pages/Checkout';
import BookingConfirmation from '../pages/BookingConfirmation';
import BookingHistory from '../pages/BookingHistory';
import AdminDashboard from '../pages/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import PrivateRoute from '../components/PrivateRoute';
import { PublicRouteGuard, AuthRouteGuard } from './auth';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthRouteGuard>
                <MainLayout hideNavigation />
            </AuthRouteGuard>}>
                <Route path="signin" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
            </Route>

            {/* Public Routes */}
            <Route element={<PublicRouteGuard>
                <MainLayout />
            </PublicRouteGuard>}>
                <Route index element={<Home />} />
                <Route path="movie/:id" element={<MovieDetail />} />
                <Route path="seats/:id" element={<SeatSelection />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="confirmation" element={<BookingConfirmation />} />
                <Route path="bookings" element={<PrivateRoute allowedRoles={['user']}>
                    <BookingHistory />
                </PrivateRoute>} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="admin/*" element={<PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout>
                    <AdminDashboard />
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Staff Dashboard Routes */}
            <Route path="staff/*" element={<PrivateRoute allowedRoles={['staff']}>
                <DashboardLayout>
                    <StaffDashboard />
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}; 