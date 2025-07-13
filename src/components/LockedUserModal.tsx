import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from 'lucide-react';

interface LockedUserModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const LockedUserModal: React.FC<LockedUserModalProps> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      // Tự động redirect sau 3 giây
      const timer = setTimeout(() => {
        navigate('/signin');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, navigate]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <LockIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tài khoản đã bị khóa</h3>
          <p className="text-sm text-gray-500 mb-4">
            Tài khoản của bạn đã bị khóa bởi quản trị viên. 
            Bạn sẽ được chuyển hướng về trang đăng nhập trong vài giây.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Đi đến trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 