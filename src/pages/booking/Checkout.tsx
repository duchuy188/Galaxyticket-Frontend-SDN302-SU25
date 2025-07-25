import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCardIcon, CheckCircleIcon, EditIcon, XCircleIcon } from 'lucide-react';
import { getTheaterById } from '../../utils/theater';
import { getRoomById } from '../../utils/room';
import { getScreeningById } from '../../utils/screening';
import { createBooking, cancelBooking, updateBooking } from '../../utils/booking';
import { createPaymentUrl, processPaymentReturn } from '../../utils/vnpay';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const formatDateVN = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const Checkout: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'vnpay'>('vnpay');
  const navigate = useNavigate();
  const [theaterName, setTheaterName] = useState('');
  const [roomName, setRoomName] = useState('');
  const isCreatingBooking = React.useRef(false);
  const bookingIdRef = React.useRef<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120); // 2 phút = 120 giây
  const [isExpired, setIsExpired] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    // Check for update success message
    const successFlag = sessionStorage.getItem('bookingUpdateSuccess');
    if (successFlag) {
      toast.success('Cập nhật vé thành công!', { position: 'top-right', autoClose: 3000 });
      sessionStorage.removeItem('bookingUpdateSuccess');
    }

    // Check for VNPay return
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = urlParams.get('vnp_TransactionStatus');

    if (vnp_ResponseCode || vnp_TransactionStatus) {
      handleVNPayReturn();
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
        // Đảm bảo paymentMethod luôn có trong bookingDetails
        if (!details.paymentMethod) {
          details.paymentMethod = paymentMethod; // Lưu đúng giá trị 'card' hoặc 'vnpay'
          sessionStorage.setItem('bookingDetails', JSON.stringify(details));
        }

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

        // Kiểm tra quá giờ suất chiếu
        if (details.date && details.time) {
          // Lấy giờ hiện tại ở VN
          const nowVN = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
          // Tạo đối tượng Date cho suất chiếu
          const [hour, minute] = details.time.split(':').map(Number);
          const showTime = new Date(details.date + 'T00:00:00');
          showTime.setHours(hour, minute, 0, 0);
          if (nowVN > showTime) {
            setShowExpiredModal(true);
            setIsExpired(true);
          }
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

  useEffect(() => {
    // Đếm ngược thời gian giữ ghế
    if (isExpired) return;
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);

  // Khi người dùng chọn phương thức thanh toán, cập nhật vào sessionStorage
  useEffect(() => {
    if (bookingDetails) {
      const updatedDetails = { ...bookingDetails, paymentMethod };
      sessionStorage.setItem('bookingDetails', JSON.stringify(updatedDetails));
    }
  }, [paymentMethod, bookingDetails]);

  const handleVNPayReturn = async () => {
    try {
      const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
      const response = await processPaymentReturn(queryParams);

      if (response.code === '00') {
        // Payment successful
        const confirmationDetails = {
          bookingId: bookingDetails?.bookingId || '',
          movieTitle: bookingDetails?.movieTitle,
          moviePoster: '',
          screeningTime: `${bookingDetails?.date} at ${bookingDetails?.time}`,
          theaterName: theaterName, // Thêm trường này
          roomName: roomName,
          seatNumbers: bookingDetails?.seats || [],
          totalPrice: bookingDetails?.total || 0,
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
        };

        sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));
        navigate('/confirmation');
      } else {
        // Payment failed
        toast.error('Thanh toán thất bại: ' + (response.message || 'Vui lòng thử lại'), { position: 'top-right', autoClose: 3000 });
        setError('Thanh toán thất bại: ' + (response.message || 'Vui lòng thử lại'));
        
        // Update booking status to failed
        if (bookingDetails?.bookingId) {
          await updateBooking(bookingDetails.bookingId, { paymentStatus: 'failed' });
        }
      }
    } catch (error: any) {
      console.error('Error processing VNPay return:', error);
      toast.error('Lỗi xử lý thanh toán: ' + error.message, { position: 'top-right', autoClose: 3000 });
      setError('Lỗi xử lý thanh toán: ' + error.message);
    }
  };

  const handlePayment = async () => {
    if (!bookingDetails) {
      toast.error('Không có thông tin đặt vé', { position: 'top-right', autoClose: 3000 });
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

      if (paymentMethod === 'vnpay') {
        // Create VNPay payment URL
        const paymentUrl = await createPaymentUrl(
          bookingDetails.total,
          bookingIdToUse,
          bookingDetails.userId
        );

        // Store confirmation details before redirecting
        const confirmationDetails = {
          bookingId: bookingIdToUse,
          movieTitle: bookingDetails.movieTitle,
          moviePoster: '',
          screeningTime: `${bookingDetails.date} at ${bookingDetails.time}`,
          theaterName: theaterName, // Thêm trường này
          roomName: roomName,
          seatNumbers: bookingDetails.seats,
          totalPrice: bookingDetails.total,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod: paymentMethod, // Lưu đúng giá trị 'card' hoặc 'vnpay'
        };

        sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));

        // Redirect to VNPay
        window.location.href = paymentUrl;
      } else {
        // Handle card payment (your existing logic)
        const confirmationDetails = {
          bookingId: bookingIdToUse,
          movieTitle: bookingDetails.movieTitle,
          moviePoster: '',
          screeningTime: `${bookingDetails.date} at ${bookingDetails.time}`,
          theaterName: theaterName, // Thêm trường này
          roomName: roomName,
          seatNumbers: bookingDetails.seats,
          totalPrice: bookingDetails.total,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod: paymentMethod, // Lưu đúng giá trị 'card' hoặc 'vnpay'
        };
        sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));
        navigate('/confirmation');
      }
    } catch (error: any) {
      console.error('Lỗi xử lý thanh toán:', error);
      if (error.message?.includes('already booked')) {
        toast.error('Một số ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.', { position: 'top-right', autoClose: 3000 });
        setError('Một số ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.');
      } else {
        toast.error(error.message || 'Không thể xử lý thanh toán. Vui lòng thử lại.', { position: 'top-right', autoClose: 3000 });
        setError(error.message || 'Không thể xử lý thanh toán. Vui lòng thử lại.');
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleUpdateBooking = () => {
    if (!bookingDetails) {
      toast.error('Không tìm thấy thông tin đặt vé để cập nhật.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    sessionStorage.setItem('isUpdatingBooking', 'true');
    // Lưu thời gian hết hạn giữ ghế (epoch milliseconds)
    if (!isExpired) {
      const expireAt = Date.now() + timeLeft * 1000;
      sessionStorage.setItem('bookingExpireAt', expireAt.toString());
    }

    const seatSelectionUrl = `/seats/${bookingDetails.movieId}?date=${bookingDetails.date}&time=${bookingDetails.time}&theater=${bookingDetails.theater}&screeningId=${bookingDetails.screeningId}&movieTitle=${encodeURIComponent(bookingDetails.movieTitle)}&userId=${bookingDetails.userId}`;

    navigate(seatSelectionUrl);
  };

  const handleCancelBooking = async () => {
    if (!bookingDetails?.bookingId) {
      toast.error('Không tìm thấy mã đặt vé', { position: 'top-right', autoClose: 3000 });
      return;
    }
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    try {
      setIsCancelling(true);
      const response = await cancelBooking(bookingDetails?.bookingId!);
      if (response.booking) {
        toast.success('Hủy đặt vé thành công!', { position: 'top-right', autoClose: 3000 });
        sessionStorage.removeItem('bookingDetails');
        sessionStorage.removeItem('currentBookingId');
        sessionStorage.removeItem('isUpdatingBooking');
        window.location.href = '/';
      } else {
        throw new Error(response.message || 'Không thể hủy đặt vé');
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi hủy đặt vé', { position: 'top-right', autoClose: 3000 });
      console.error('Lỗi hủy đặt vé:', error);
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
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

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" />
      {/* Modal quá giờ đặt phim */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Bạn không thể đặt được suất chiếu vì đã quá giờ đặt phim rồi</h3>
            <button
              className="mt-4 px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
              onClick={() => { setShowExpiredModal(false); navigate('/'); }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {/* Đồng hồ đếm ngược giữ ghế */}
        <div className="flex items-center justify-center mb-6">
          <div className={`text-lg font-bold px-4 py-2 rounded-lg border ${isExpired ? 'bg-red-100 text-red-600 border-red-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}> 
            {isExpired ? (
              <span>Hết thời gian giữ ghế, vui lòng chọn lại!</span>
            ) : (
              <span>Thời gian giữ ghế còn lại: {formatTime(timeLeft)}</span>
            )}
          </div>
        </div>
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
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
                  {formatDateVN(bookingDetails.date)} lúc {bookingDetails.time}
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
          
          <h2 className="text-xl font-semibold mb-4">Thông Tin Thanh Toán</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span>
                Vé ({bookingDetails.seats.length} x {bookingDetails.basePrice.toLocaleString('vi-VN')} đ)
              </span>
              <span>
                {(bookingDetails.basePrice * bookingDetails.seats.length).toLocaleString('vi-VN')} đ
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
                  -{(bookingDetails.discount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span>{(bookingDetails.total || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod('vnpay')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">VNPay</p>
                  <p className="text-sm text-gray-500">Thanh toán an toàn qua VNPay</p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod('card')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Thẻ tín dụng/ghi nợ</p>
                  <p className="text-sm text-gray-500">Thanh toán bằng thẻ Visa, Mastercard, JCB</p>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="mb-6">
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
            </div>
          )}

          <button
            className={`w-full py-3 rounded-md font-medium ${
              isPaymentProcessing || isExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            } text-white mb-4`}
            onClick={handlePayment}
            disabled={isPaymentProcessing || isExpired}
          >
            {isExpired ? 'Hết thời gian giữ ghế hoặc quá giờ suất chiếu' : (isPaymentProcessing ? 'Đang Xử Lý Thanh Toán...' : 'Thanh Toán Ngay')}
          </button>

          {/* Khi hết thời gian giữ ghế, chỉ hiện nút quay về trang chủ */}
          {isExpired ? (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-blue-300 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
              >
                Quay về trang chủ
              </button>
            </div>
          ) : (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleUpdateBooking}
                disabled={isUpdating}
                className={`flex-1 flex items-center justify-center py-2 px-4 border border-blue-300 rounded-md ${
                  isUpdating
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
                className={`flex-1 flex items-center justify-center py-2 px-4 border border-red-300 rounded-md ${
                  isCancelling
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <XCircleIcon size={18} className="mr-2" />
                {isCancelling ? 'Đang hủy...' : 'Hủy đặt vé'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận hủy đặt vé */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận hủy đặt vé</h3>
            <p className="mb-6">Bạn có chắc chắn muốn hủy đặt vé này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                onClick={confirmCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? 'Đang hủy...' : 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;