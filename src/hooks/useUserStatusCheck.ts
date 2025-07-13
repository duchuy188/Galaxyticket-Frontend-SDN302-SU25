import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function useUserStatusCheck() {
  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');
      if (!token || !currentUser) return;
      
      try {
        // Thử endpoint đơn giản hơn
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Check status response:', res.data); // Debug log
        
        if (res.data && res.data.status === false) {
          console.log('User is locked, logging out...'); // Debug log
          // Chỉ logout nếu user thực sự bị khóa (không phải do session sharing)
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.id === res.data.id) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Tài khoản của bạn đã bị khóa!');
            window.location.href = '/signin';
          }
        }
      } catch (error: any) {
        console.log('Check status error:', error); // Debug log
        // Log chi tiết lỗi
        if (error.response) {
          console.log('Error response:', error.response.data);
        }
      }
    };
    // Check mỗi 5s
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);
} 