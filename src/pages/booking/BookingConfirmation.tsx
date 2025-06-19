import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, PrinterIcon, MailIcon } from 'lucide-react';
import { updateBookingStatus, sendTicketEmail, Booking, BookingResponse } from '../../utils/booking';

type ConfirmationDetails = {
  bookingId: string;
  movieTitle?: string;
  moviePoster?: string;
  screeningTime?: string;
  roomName?: string;
  seatNumbers: string[];
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt?: string;
  qrCodeDataUrl?: string;
};

const BookingConfirmation: React.FC = () => {
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBookingConfirmation = async () => {
      try {
        setIsLoading(true);
        const storedDetails = sessionStorage.getItem('confirmationDetails');
        console.log('Chi tiết lưu trữ từ sessionStorage:', storedDetails);
        let bookingId: string | undefined;

        if (storedDetails) {
          const details = JSON.parse(storedDetails);
          bookingId = details.bookingId;
        }

        console.log('ID đặt chỗ đã trích xuất:', bookingId);

        if (!bookingId) {
          navigate('/'); // Chuyển hướng nếu không tìm thấy ID đặt chỗ
          return;
        }

        // Cập nhật trạng thái đặt chỗ thành đã xác nhận bằng endpoint POST
        const updatedBookingResponse = await updateBookingStatus(bookingId) as BookingResponse;
        console.log('Phản hồi từ updateBookingStatus:', updatedBookingResponse);

        if (!updatedBookingResponse || !updatedBookingResponse.booking) {
          throw new Error('Không tìm thấy chi tiết đặt chỗ trong phản hồi.');
        }

        const updatedBooking = updatedBookingResponse.booking;

        console.log('Đối tượng Đặt chỗ đã cập nhật từ API:', updatedBooking);

        // Ánh xạ updatedBooking sang kiểu ConfirmationDetails
        const confirmedDetails: ConfirmationDetails = {
          bookingId: updatedBooking._id,
          movieTitle: updatedBooking.movieTitle,
          moviePoster: updatedBooking.moviePoster,
          screeningTime: updatedBooking.screeningTime,
          roomName: updatedBooking.roomName,
          seatNumbers: Array.isArray(updatedBooking.seatNumbers) ? updatedBooking.seatNumbers : [],
          totalPrice: updatedBooking.totalPrice || 0,
          paymentStatus: updatedBooking.paymentStatus,
          createdAt: updatedBooking.bookingDate || updatedBooking.createdAt,
          qrCodeDataUrl: updatedBooking.qrCodeDataUrl
        };
        setConfirmationDetails(confirmedDetails);
        console.log('Chi tiết xác nhận cuối cùng đã đặt trong state:', confirmedDetails);

        // Xóa ID đặt chỗ hiện tại khỏi sessionStorage sau khi xác nhận thành công
        sessionStorage.removeItem('currentBookingId');

      } catch (err) {
        setError('Không thể xác nhận đặt chỗ. Vui lòng thử lại.');
        console.error('Lỗi xác nhận đặt chỗ:', err);
      } finally {
        setIsLoading(false);
      }
    };

    handleBookingConfirmation();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-2xl font-bold mt-4">Đang xác nhận đặt chỗ của bạn...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">{error}</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  if (!confirmationDetails) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy chi tiết đặt chỗ</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      const formattedDate = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return 'Ngày không hợp lệ';
    }
  };

  const handleEmailTicket = async () => {
    try {
      if (!confirmationDetails?.bookingId) {
        throw new Error('Không tìm thấy mã đặt vé');
      }

      const response = await sendTicketEmail(confirmationDetails.bookingId);

      if (response.success) {
        alert('Đã gửi vé qua email thành công!');
      } else {
        throw new Error(response.message || 'Không thể gửi email');
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi gửi email');
      console.error('Lỗi gửi email:', error);
    }
  };

  // Đảm bảo seatNumbers luôn là một mảng
  const seatNumbers = Array.isArray(confirmationDetails.seatNumbers)
    ? confirmationDetails.seatNumbers
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Đặt chỗ thành công!
            </h1>
            <p className="text-gray-600 mt-2">
              Vé của bạn đã được đặt thành công.
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chi tiết đặt chỗ</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {confirmationDetails.bookingId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Phim</p>
                <p className="font-medium">{confirmationDetails.movieTitle || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ngày & Giờ</p>
                <p className="font-medium">
                  {confirmationDetails.screeningTime
                    ? `${confirmationDetails.screeningTime.slice(0, 10)} lúc ${confirmationDetails.screeningTime.slice(11, 16)}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rạp chiếu</p>
                <p className="font-medium">{confirmationDetails.roomName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ghế</p>
                <p className="font-medium">
                  {seatNumbers.length > 0 ? seatNumbers.join(', ') : 'Chưa chọn ghế'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Số tiền đã thanh toán</p>
                <p className="font-medium">
                  {(confirmationDetails.totalPrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ngày đặt chỗ</p>
                <p className="font-medium">{formatDateTime(confirmationDetails.createdAt || '')}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Vé của bạn</h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-lg">
                    {confirmationDetails.movieTitle || 'N/A'}
                  </h4>
                  <p className="text-sm">
                    {confirmationDetails.screeningTime
                      ? `${confirmationDetails.screeningTime.slice(0, 10)} lúc ${confirmationDetails.screeningTime.slice(11, 16)}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{confirmationDetails.roomName || 'N/A'}</p>
                  <p className="text-sm">
                    Ghế: {seatNumbers.length > 0 ? seatNumbers.join(', ') : 'Chưa chọn ghế'}
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4 mt-4 flex justify-center">
                {confirmationDetails.qrCodeDataUrl ? (
                  <img
                    src={confirmationDetails.qrCodeDataUrl}
                    alt="Mã QR vé"
                    className="h-32 w-32"
                  />
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center bg-gray-100">
                    <p className="text-sm text-gray-500">Đang tải mã QR...</p>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Quét mã QR này tại cửa vào rạp chiếu
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={handleEmailTicket}
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <MailIcon size={18} className="mr-2" />
              Gửi vé qua email
            </button>

          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;