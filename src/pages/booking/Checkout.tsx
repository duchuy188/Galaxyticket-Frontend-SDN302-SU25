import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCardIcon, CheckCircleIcon, EditIcon, XCircleIcon } from 'lucide-react';
import { getTheaterById } from '../../utils/theater';
import { getRoomById } from '../../utils/room';
import { getScreeningById } from '../../utils/screening';
import { createBooking, cancelBooking, updateBooking } from '../../utils/booking';

type BookingDetails = {
  movieId: string;
  movieTitle: string;
  date: string;
  time: string;
  theater: string;
  room: string;
  seats: string[];
  basePrice: number;
  discount: number;
  total: number;
  screeningId: string;
  userId: string;
  bookingId?: string;
};

const Checkout: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const [theaterName, setTheaterName] = useState('');
  const [roomName, setRoomName] = useState('');
  const isCreatingBooking = React.useRef(false);
  const bookingIdRef = React.useRef<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    // Check for update success message
    const successFlag = sessionStorage.getItem('bookingUpdateSuccess');
    if (successFlag) {
      setUpdateMessage('Cập nhật vé thành công!');
      sessionStorage.removeItem('bookingUpdateSuccess');
      setTimeout(() => setUpdateMessage(null), 4000); // Hide after 4 seconds
    }

    const loadBookingDetails = async () => {
      try {
        setIsLoadingPage(true);
        const storedDetails = sessionStorage.getItem('bookingDetails');
        
        if (!storedDetails) {
          setError('Không tìm thấy thông tin đặt vé');
          return;
        }

        const details = JSON.parse(storedDetails);
        console.log('Loaded booking details:', details);

        // Đảm bảo các giá trị số được chuyển đổi đúng
        const bookingInfo = {
          ...details,
          basePrice: Number(details.basePrice),
          total: Number(details.total),
          discount: Number(details.discount)
        };

        setBookingDetails(bookingInfo);

        // Lấy tên rạp
        if (details.theater) {
          try {
            const theaterData = await getTheaterById(details.theater);
            setTheaterName(theaterData.name);
          } catch (error) {
            console.error('Error fetching theater:', error);
          }
        }

        // Lấy tên phòng
        if (details.room) {
          setRoomName(details.room);
        }

      } catch (error) {
        console.error('Error loading booking details:', error);
        setError('Không thể tải thông tin đặt vé');
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadBookingDetails();
  }, []);

  const handlePayment = async () => {
    if (!bookingDetails) {
      setError('Không có thông tin đặt vé');
      return;
    }

    if (isLoadingPage || isPaymentProcessing || isCreatingBooking.current) {
      return;
    }

    setIsPaymentProcessing(true);
    setError(null);

    try {
      const bookingIdToUse = bookingDetails.bookingId;

      if (!bookingIdToUse) {
        throw new Error('Không tìm thấy ID booking. Vui lòng quay lại và thử lại.');
      }

      const confirmationDetails = {
        bookingId: bookingIdToUse,
        movieTitle: bookingDetails.movieTitle,
        moviePoster: '', // Placeholder for now, as it's not directly in bookingDetails
        screeningTime: `${bookingDetails.date} at ${bookingDetails.time}`,
        roomName: roomName, // Use the state variable roomName
        seatNumbers: bookingDetails.seats,
        totalPrice: bookingDetails.total,
        paymentStatus: 'pending', // Default to pending as payment is being initiated
        createdAt: new Date().toISOString(),
        qrCodeDataUrl: undefined, // Will be populated by BookingConfirmation from API response
      };

      sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));

      navigate('/confirmation');
    } catch (error: any) {
      console.error('Lỗi xử lý thanh toán:', error);
      if (error.message?.includes('already booked')) {
        setError('Một số ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.');
      } else {
        setError(error.message || 'Không thể xử lý thanh toán. Vui lòng thử lại.');
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleUpdateBooking = () => {
    if (!bookingDetails) {
      alert('Không tìm thấy thông tin đặt vé để cập nhật.');
      return;
    }

    // Set a flag in sessionStorage to let SeatSelection know it's an update.
    // The details are already in sessionStorage, so we just need to navigate.
    sessionStorage.setItem('isUpdatingBooking', 'true');

    const seatSelectionUrl = `/seats/${bookingDetails.movieId}?date=${bookingDetails.date}&time=${bookingDetails.time}&theater=${bookingDetails.theater}&screeningId=${bookingDetails.screeningId}&movieTitle=${encodeURIComponent(bookingDetails.movieTitle)}&userId=${bookingDetails.userId}`;

    navigate(seatSelectionUrl);
  };

  const handleCancelBooking = async () => {
    try {
      if (!bookingDetails?.bookingId) {
        throw new Error('Không tìm thấy mã đặt vé');
      }

      const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đặt vé này không? Hành động này không thể hoàn tác.');

      if (!confirmCancel) {
        return;
      }

      setIsCancelling(true);

      const response = await cancelBooking(bookingDetails.bookingId);

      if (response.booking) {
        alert('Hủy đặt vé thành công!');

        // Xóa thông tin booking khỏi sessionStorage
        sessionStorage.removeItem('bookingDetails');
        sessionStorage.removeItem('currentBookingId');
        sessionStorage.removeItem('isUpdatingBooking');

        // Chuyển hướng về trang chủ và đảm bảo trang được refresh
        window.location.href = '/';
      } else {
        throw new Error(response.message || 'Không thể hủy đặt vé');
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi hủy đặt vé');
      console.error('Lỗi hủy đặt vé:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Đang tải trang thanh toán...</h2>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy thông tin đặt vé. Vui lòng thử lại.</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="mb-2">{error}</p>
            {error.includes('already booked') && (
              <button
                onClick={() => navigate(-1)}
                className="text-red-700 underline hover:text-red-800"
              >
                Quay lại chọn ghế
              </button>
            )}
          </div>
        )}
        {updateMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{updateMessage}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Thanh Toán Đơn Hàng</h1>
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Tóm Tắt Đặt Vé</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Phim</p>
                <p className="font-medium">{bookingDetails.movieTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngày & Giờ</p>
                <p className="font-medium">
                  {bookingDetails.date} lúc {bookingDetails.time}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Rạp</p>
                <p className="font-medium">{theaterName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phòng</p>
                <p className="font-medium">{roomName}</p>
              </div>
              <div>
                <p className="text-gray-600">Ghế</p>
                <p className="font-medium">{bookingDetails.seats.join(', ')}</p>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông Tin Thanh Toán</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span>
                  Vé ({bookingDetails.seats.length} x {bookingDetails.basePrice.toLocaleString('vi-VN')} VND)
                </span>
                <span>
                  {(bookingDetails.basePrice * bookingDetails.seats.length).toLocaleString('vi-VN')} VND
                </span>
              </div>
              {bookingDetails.discount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>
                    Giảm giá ({(() => {
                      const totalBeforeDiscount = bookingDetails.basePrice * bookingDetails.seats.length;
                      if (totalBeforeDiscount === 0 || !bookingDetails.discount) return '0%';
                      const percentage = (bookingDetails.discount / totalBeforeDiscount) * 100;
                      return `${Math.round(percentage)}%`;
                    })()})
                  </span>
                  <span>
                    -{(bookingDetails.discount || 0).toLocaleString('vi-VN')} VND
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span>{(bookingDetails.total || 0).toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="mr-2" size={20} />
                <span className="font-medium">Thanh Toán Bằng Thẻ</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Số Thẻ
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="1234 5678 9012 3456"
                    defaultValue="4111 1111 1111 1111"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Ngày Hết Hạn
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="MM/YY"
                    defaultValue="12/25"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Mã CVV
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="123"
                    defaultValue="123"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Tên Chủ Thẻ
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Nguyễn Văn A"
                    defaultValue="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center text-green-600">
                <CheckCircleIcon className="mr-2" size={16} />
                <span className="text-sm">
                  Đây là phiên bản demo - không có giao dịch thực tế
                </span>
              </div>
            </div>
          </div>
          <button
            className={`w-full py-3 rounded-md font-medium ${isPaymentProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              } text-white mb-4`}
            onClick={handlePayment}
            disabled={isPaymentProcessing}
          >
            {isPaymentProcessing ? 'Đang Xử Lý Thanh Toán...' : 'Thanh Toán Ngay'}
          </button>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpdateBooking}
              disabled={isUpdating}
              className={`flex-1 flex items-center justify-center py-2 px-4 border border-blue-300 rounded-md ${isUpdating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
            >
              <EditIcon size={18} className="mr-2" />
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật vé'}
            </button>

            <button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className={`flex-1 flex items-center justify-center py-2 px-4 border border-red-300 rounded-md ${isCancelling
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
            >
              <XCircleIcon size={18} className="mr-2" />
              {isCancelling ? 'Đang hủy...' : 'Hủy đặt vé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;