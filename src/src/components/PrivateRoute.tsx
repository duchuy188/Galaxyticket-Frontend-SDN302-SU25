import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  // Lấy thông tin user từ localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Kiểm tra đăng nhập
  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  // Kiểm tra roles nếu có
  if (roles && roles.length > 0) {
    // Đảm bảo user.role tồn tại trước khi kiểm tra
    const userRole = user.role || '';
    if (!roles.includes(userRole)) {
      // Nếu không có quyền, chuyển về trang chủ
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;