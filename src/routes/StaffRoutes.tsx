import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import TheaterManagement from '../pages/dashboard/TheaterManagement';
import ScreeningManagement from '../pages/dashboard/ScreeningManagement';
import PromotionManager from '../pages/dashboard/PromotionManager';

const StaffRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<StaffDashboard />} />
      <Route path="movies" element={<StaffDashboard />} />
      <Route path="screenings" element={<ScreeningManagement />} />
      <Route path="promotions" element={<PromotionManager />} />
      <Route path="theaters" element={<TheaterManagement />} />
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
};

export default StaffRoutes;