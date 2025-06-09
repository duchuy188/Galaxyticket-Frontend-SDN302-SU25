import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/Auth/SignUp';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Home from '../pages/movie/Home';
import MovieDetail from '../pages/movie/MovieDetail';
import SeatSelection from '../pages/SeatSelection';
import Checkout from '../pages/booking/Checkout';
import BookingConfirmation from '../pages/booking/BookingConfirmation';
import BookingHistory from '../pages/booking/BookingHistory';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import PrivateRoute from '../components/PrivateRoute';
import { PublicRouteGuard, AuthRouteGuard } from './auth';
import Profile from '../pages/user/Profile';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthRouteGuard>
                <MainLayout hideNavigation hideFooter />
            </AuthRouteGuard>}>
                <Route path="signin" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
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
                <Route path="profile" element={<PrivateRoute allowedRoles={['user']}>
                    <Profile />
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