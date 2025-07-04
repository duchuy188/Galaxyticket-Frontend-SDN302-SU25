import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import TheaterManagement from '../pages/dashboard/TheaterManagement';
import ScreeningManagement from '../pages/dashboard/ScreeningManagement';
import PromotionManager from '../pages/dashboard/PromotionManager';
import StaffProfile from '../pages/dashboard/StaffProfile';

const StaffRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Chuyển hướng từ trang index đến trang movies */}
      <Route index element={<Navigate to="/staff/movies" replace />} />
      <Route path="movies" element={<StaffDashboard />} />
      <Route path="screenings" element={<ScreeningManagement />} />
      <Route path="promotions" element={<PromotionManager />} />
      <Route path="theaters" element={<TheaterManagement />} />
      {/* Cập nhật route mặc định để chuyển đến movies thay vì staff */}
      <Route path="*" element={<Navigate to="/staff/movies" replace />} />
      <Route path="profile" element={<StaffProfile />} />
    </Routes>
  );
};

export default StaffRoutes;