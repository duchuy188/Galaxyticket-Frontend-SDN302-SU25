import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, Booking } from '../../utils/booking';

const ITEMS_PER_PAGE = 5;

const BookingHistory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated || !user) {
        setError('Vui lòng đăng nhập để xem vé của bạn');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getUserBookings();
        if (response.bookings) {
          setBookings(response.bookings);
          setError(null);
        } else {
          setError('Không thể tải danh sách vé');
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Không thể tải danh sách vé');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Vui lòng đăng nhập để xem vé của bạn</h2>
        <Link to="/signin" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Đăng Nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Đang tải danh sách vé...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Lỗi: {error}</h2>
      </div>
    );
  }

  // Tính toán số trang
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  
  // Lấy bookings cho trang hiện tại
  const currentBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vé Của Tôi</h1>
        </div>

        {currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Bạn chưa có vé nào.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Đặt Vé Ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-end mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                        booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <div className="flex items-center">
                          {booking.paymentStatus === 'paid' ? (
                            <CheckCircleIcon size={16} className="mr-1" />
                          ) : (
                            <XCircleIcon size={16} className="mr-1" />
                          )}
                          {booking.paymentStatus === 'paid' ? 'Đã Thanh Toán' :
                           booking.paymentStatus === 'pending' ? 'Chờ Thanh Toán' :
                           booking.paymentStatus === 'cancelled' ? 'Đã Hủy' : 'Thất Bại'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Thời Gian Chiếu</p>
                        <p className="font-medium">
                          {booking.screeningTime 
                            ? `${booking.screeningTime.slice(0, 10)} lúc ${booking.screeningTime.slice(11, 16)}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Phòng & Ghế</p>
                        <p className="font-medium">{booking.roomName} - {booking.seatNumbers.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Số Tiền Đã Thanh Toán</p>
                        <p className="font-medium">{booking.totalPrice.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      {booking.qrCodeDataUrl && (
                        <img src={booking.qrCodeDataUrl} alt="Mã QR Vé" className="w-40 h-40" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;