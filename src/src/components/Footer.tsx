import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a237e] mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Film className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-white">Galaxy Cinema</h3>
            </div>
            <p className="text-gray-300">
              Điểm đến hàng đầu của bạn với những bộ phim mới nhất và trải nghiệm điện ảnh đáng nhớ.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Truy Cập Nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Trang Chủ</Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-300 hover:text-white">Phim</Link>
              </li>
              <li>
                <Link to="/theaters" className="text-gray-300 hover:text-white">Rạp Chiếu</Link>
              </li>
              <li>
                <Link to="/bookings" className="text-gray-300 hover:text-white">Vé Của Tôi</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">Trung Tâm Hỗ Trợ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Liên Hệ</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">Điều Khoản Dịch Vụ</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">Chính Sách Bảo Mật</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Kết Nối</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">YouTube</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Galaxy Cinema. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 