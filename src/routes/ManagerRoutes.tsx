import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import ManagerProfile from '../pages/dashboard/ManagerProfile';

const ManagerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ManagerDashboard filterType="movie" />} />
      <Route path="movies" element={<ManagerDashboard filterType="movie" />} />
      <Route path="promotions" element={<ManagerDashboard filterType="promotion" />} />
      <Route path="showtimes" element={<ManagerDashboard filterType="screening" />} />
      <Route path="*" element={<Navigate to="/manager" replace />} />
      <Route path="profile" element={<ManagerProfile/>} />
    </Routes>
  );
};

export default ManagerRoutes;