import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/movie/Home';
import MovieDetail from '../pages/movie/MovieDetail';
import SeatSelection from '../pages/SeatSelection';
import Checkout from '../pages/booking/Checkout';
import BookingConfirmation from '../pages/booking/BookingConfirmation';
import BookingHistory from '../pages/booking/BookingHistory';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import PrivateRoute from '../components/PrivateRoute';
import { PublicRouteGuard, AuthRouteGuard } from './auth';
import Profile from '../pages/user/Profile';
import TheaterDetail from '../pages/theater/TheaterDetail';
import TheaterManagement from '../pages/dashboard/TheaterManagement';
import StaffRoutes from './StaffRoutes';
import ManagerRoutes from './ManagerRoutes';
import UserPromotions from '../pages/user/PromotionList';
import PromotionManager from '../pages/dashboard/PromotionManager';

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
                <Route path="theater/:id" element={<TheaterDetail />} />
                <Route path="bookings" element={<PrivateRoute allowedRoles={['user', 'member']}>
                    <BookingHistory />
                </PrivateRoute>} />
                <Route path="profile" element={<PrivateRoute allowedRoles={['user', 'member']}>
                    <Profile />
                </PrivateRoute>} />
                <Route path="promotions" element={<PrivateRoute>
                    <UserPromotions />
                </PrivateRoute>} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="admin/*" element={<PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout>
                    <AdminDashboard />
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Manager Dashboard Routes */}
            <Route path="manager/*" element={<PrivateRoute allowedRoles={['manager']}>
                <DashboardLayout>
                    <ManagerRoutes />
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Staff Dashboard Routes */}
            <Route path="staff/*" element={<PrivateRoute allowedRoles={['staff']}>
                <DashboardLayout>
                    <StaffRoutes />
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Promotion Manager Route */}
            <Route path="dashboard/promotions" element={<PrivateRoute roles={['manager', 'admin']}>
                <PromotionManager />
            </PrivateRoute>} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}; 