import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon, PrinterIcon, MailIcon } from 'lucide-react';
import { updateBookingStatus, sendTicketEmail, Booking, BookingResponse, updateBooking } from '../../utils/booking';

type ConfirmationDetails = {
  bookingId: string;
  movieTitle?: string;
  moviePoster?: string;
  screeningTime?: string;
  theaterName?: string; // Thêm trường này
  roomName?: string;
  seatNumbers: string[];
  totalPrice: number;
  basePrice?: number;
  discount?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt?: string;
  qrCodeDataUrl?: string;
};

const BookingConfirmation: React.FC = () => {
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy vnp_ResponseCode từ URL
  const query = new URLSearchParams(location.search);
  const responseCode = query.get('vnp_ResponseCode');

  let message = '';
  let isSuccess = false;
  if (responseCode === '00') {
    message = 'Thanh toán thành công! Cảm ơn bạn đã đặt vé.';
    isSuccess = true;
  } else if (responseCode) {
    message = 'Thanh toán thất bại hoặc bị hủy. Vui lòng thử lại.';
    isSuccess = false;
  }

  useEffect(() => {
    const handleBookingConfirmation = async () => {
      try {
        setIsLoading(true);
        const storedDetails = sessionStorage.getItem('confirmationDetails');
        let bookingId: string | undefined;
        let storedConfirmationDetails: any = null;

        if (storedDetails) {
          storedConfirmationDetails = JSON.parse(storedDetails);
          bookingId = storedConfirmationDetails.bookingId;
        }

        if (!bookingId) {
          navigate('/');
          return;
        }

        // Nếu thanh toán thất bại hoặc bị hủy, cập nhật trạng thái booking
        if (responseCode && responseCode !== '00') {
          await updateBooking(bookingId, { paymentStatus: 'failed', status: 'cancelled' } as any);
          setIsLoading(false);
          return;
        }

        // Nếu thanh toán thành công, cập nhật trạng thái như cũ
        const updatedBookingResponse = await updateBookingStatus(bookingId) as BookingResponse;
        if (!updatedBookingResponse || !updatedBookingResponse.booking) {
          throw new Error('Không tìm thấy chi tiết đặt chỗ trong phản hồi.');
        }
        const updatedBooking = updatedBookingResponse.booking;
        const confirmedDetails: ConfirmationDetails = {
          bookingId: updatedBooking._id,
          movieTitle: updatedBooking.movieTitle || storedConfirmationDetails?.movieTitle,
          moviePoster: updatedBooking.moviePoster || storedConfirmationDetails?.moviePoster,
          screeningTime: updatedBooking.screeningTime || storedConfirmationDetails?.screeningTime,
          theaterName: updatedBooking.theaterName || storedConfirmationDetails?.theaterName,
          roomName: updatedBooking.roomName || storedConfirmationDetails?.roomName,
          seatNumbers: Array.isArray(updatedBooking.seatNumbers) ? updatedBooking.seatNumbers : [],
          totalPrice: updatedBooking.totalPrice || storedConfirmationDetails?.totalPrice || 0,
          basePrice: storedConfirmationDetails?.basePrice || updatedBooking.basePrice,
          discount: storedConfirmationDetails?.discount || updatedBooking.discount || 0,
          paymentStatus: updatedBooking.paymentStatus,
          createdAt: updatedBooking.bookingDate || updatedBooking.createdAt,
          qrCodeDataUrl: updatedBooking.qrCodeDataUrl
        };
        setConfirmationDetails(confirmedDetails);
        sessionStorage.removeItem('currentBookingId');
        sessionStorage.removeItem('confirmationDetails');
      } catch (err) {
        setError('Không thể xác nhận đặt chỗ. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };
    handleBookingConfirmation();
  }, [navigate, responseCode]);

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

  // Nếu thanh toán thất bại hoặc bị hủy, chỉ hiển thị thông báo lỗi
  if (responseCode && responseCode !== '00') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">{message}</h2>
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
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return 'Ngày không hợp lệ';
    }
  };

  const formatDateVN = (dateString: string) => {
    if (!dateString) return 'Ngày không hợp lệ';
    // Hỗ trợ cả dạng có T và không có T
    const [datePart, timePart] = dateString.split(/[T ]/);
    if (!datePart || !timePart) return 'Ngày không hợp lệ';
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    return `${parseInt(day)}/${parseInt(month)}/${year} lúc ${hour}:${minute}`;
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
              {message}
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
                    ? formatDateVN(confirmationDetails.screeningTime)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rạp chiếu</p>
                <p className="font-medium">{confirmationDetails.theaterName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phòng chiếu</p>
                <p className="font-medium">{confirmationDetails.roomName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ghế</p>
                <p className="font-medium">
                  {seatNumbers.length > 0 ? seatNumbers.join(', ') : 'Chưa chọn ghế'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Giá gốc</p>
                <p className="font-medium">
                  {((confirmationDetails.basePrice || 0) * seatNumbers.length).toLocaleString('vi-VN')} VND
                </p>
              </div>
              {(confirmationDetails?.discount || 0) > 0 && (
                <div>
                  <p className="text-gray-600 text-sm">Giảm giá</p>
                  <p className="font-medium text-green-600">
                    -{(confirmationDetails?.discount || 0).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm">Tổng tiền</p>
                <p className="font-bold text-lg">
                  {(confirmationDetails.totalPrice || 0).toLocaleString('vi-VN')} VND
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
                      ? formatDateVN(confirmationDetails.screeningTime)
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