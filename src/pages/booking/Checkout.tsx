import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCardIcon, CheckCircleIcon } from 'lucide-react';
import { getTheaterById } from '../../utils/theater';
import { getRoomById } from '../../utils/room';
import { getScreeningById } from '../../utils/screening';
import { createBooking } from '../../utils/booking';

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
  const navigate = useNavigate();
  const [theaterName, setTheaterName] = useState('');
  const [roomName, setRoomName] = useState('');
  const isCreatingBooking = React.useRef(false);
  const bookingIdRef = React.useRef<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoadingPage(true);
        const storedDetails = sessionStorage.getItem('bookingDetails');
        console.log('Stored bookingDetails from sessionStorage in Checkout:', storedDetails);
        if (!storedDetails) {
          navigate('/');
          return;
        }

        const parsedDetails = JSON.parse(storedDetails);
        console.log('Parsed bookingDetails in Checkout:', parsedDetails);

        const currentBookingId = sessionStorage.getItem('currentBookingId');
        if (currentBookingId) {
          bookingIdRef.current = currentBookingId;
          parsedDetails.bookingId = currentBookingId;
        } else if (parsedDetails.bookingId) {
          bookingIdRef.current = parsedDetails.bookingId;
          sessionStorage.setItem('currentBookingId', parsedDetails.bookingId);
        }

        if (!parsedDetails.screeningId || !parsedDetails.theater || !parsedDetails.userId) {
          throw new Error('Thiếu thông tin đặt vé bắt buộc');
        }

        setBookingDetails(parsedDetails);

        try {
          const theaterData = await getTheaterById(parsedDetails.theater);
          setTheaterName(theaterData.name);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin rạp:', error);
          setTheaterName('Rạp không xác định');
        }

        try {
          const screeningData = await getScreeningById(parsedDetails.screeningId);
          if (!screeningData) {
            throw new Error('Không tìm thấy thông tin suất chiếu');
          }

          if (parsedDetails.room) {
            setRoomName(parsedDetails.room);
          } else if (screeningData.roomId) {
            const roomData = await getRoomById(screeningData.roomId._id);
            if (roomData) {
              setRoomName(roomData.name);
            } else {
              setRoomName('Phòng không xác định');
            }
          } else {
            setRoomName('Phòng không xác định');
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin suất chiếu hoặc phòng:', error);
          setRoomName('Phòng không xác định');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin đặt vé:', error);
        setError(error.message || 'Không thể tải thông tin đặt vé. Vui lòng thử lại.');
        navigate('/');
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchBookingDetails();
  }, [navigate]);

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
                  Vé ({bookingDetails.seats.length} x {bookingDetails.basePrice} VND)
                </span>
                <span>
                  {(bookingDetails.basePrice * bookingDetails.seats.length)} VND
                </span>
              </div>
              {bookingDetails.discount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>Giảm giá ({100 - bookingDetails.discount * 100}%)</span>
                  <span>
                    -{(bookingDetails.basePrice * bookingDetails.seats.length) - bookingDetails.total} VND
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span>{bookingDetails.total} VND</span>
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
              } text-white`}
            onClick={handlePayment}
            disabled={isPaymentProcessing}
          >
            {isPaymentProcessing ? 'Đang Xử Lý Thanh Toán...' : 'Thanh Toán Ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;