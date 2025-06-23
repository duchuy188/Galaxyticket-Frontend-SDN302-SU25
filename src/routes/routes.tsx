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
import UserManagement from '../pages/dashboard/UserManagement';
import RevenueReports from '../pages/dashboard/RevenueReports';

console.log('Profile component imported:', Profile);

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
                <Route path="bookings" element={<PrivateRoute allowedRoles={['admin', 'staff', 'manager', 'member']}>
                    <BookingHistory />
                </PrivateRoute>} />
                <Route path="profile" element={<PrivateRoute allowedRoles={['admin', 'staff', 'manager', 'member']}>
                    <Profile />
                </PrivateRoute>} />
                <Route path="test-profile" element={<div>Test Profile Page - Working!</div>} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="admin/*" element={<PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout>
                    <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement/>} />
                        <Route path="reports" element={<RevenueReports/>} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Staff Dashboard Routes */}
            <Route path="staff/*" element={<PrivateRoute allowedRoles={['staff']}>
                <DashboardLayout>
                    <Routes>
                        <Route index element={<StaffDashboard />} />
                        <Route path="movies" element={<div>Movie Management</div>} />
                        <Route path="screenings" element={<div>Screening Management</div>} />
                        <Route path="payments" element={<div>Payment Issues</div>} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </DashboardLayout>
            </PrivateRoute>} />
            {/* Manager Dashboard Routes */}
            <Route path="manager/*" element={<PrivateRoute allowedRoles={['manager']}>
                <DashboardLayout>
                    <Routes>
                        <Route index element={<ManagerDashboard />} />
                        <Route path="movies" element={<div>Movie Requests</div>} />
                        <Route path="promotions" element={<div>Promotion Requests</div>} />
                        <Route path="showtimes" element={<div>Showtime Requests</div>} />
                        <Route path="seatmaps" element={<div>Seat Map Requests</div>} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </DashboardLayout>
            </PrivateRoute>} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}; 