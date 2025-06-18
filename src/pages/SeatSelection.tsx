import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import SeatGrid from '../components/SeatGrid';
import { getTheaterById } from '../utils/theater';
import { createBooking, cancelBooking } from '../utils/booking';
import { getScreeningById, Screening } from '../utils/screening';
import { validatePromotionCode } from '../utils/promotion';

const CountdownTimer: React.FC<{ onTimeUp: () => void }> = ({ onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center mb-4">
      <div className="text-lg font-semibold text-gray-700">Thời gian còn lại để thanh toán:</div>
      <div className="text-2xl font-bold text-red-600">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

const SeatSelection: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const theater = searchParams.get('theater') || '';
  const screeningId = searchParams.get('screeningId') || '';
  const movieTitle = searchParams.get('movieTitle') || '';
  const userId = searchParams.get('userId') || '';
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [screeningDetails, setScreeningDetails] = useState<Screening | null>(null);
  const [loadingScreening, setLoadingScreening] = useState(true);
  const [screeningError, setScreeningError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [theaterName, setTheaterName] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const isProceedingToCheckout = React.useRef(false);

  useEffect(() => {
    const fetchScreeningDetails = async () => {
      if (screeningId) {
        try {
          setLoadingScreening(true);
          const data = await getScreeningById(screeningId);
          setScreeningDetails(data);
          setTotalPrice(data.ticketPrice * selectedSeats.length);
        } catch (error) {
          console.error('Error fetching screening details:', error);
          setScreeningError('Không thể tải chi tiết suất chiếu.');
        } finally {
          setLoadingScreening(false);
        }
      }
    };
    fetchScreeningDetails();
  }, [screeningId]);

  useEffect(() => {
    if (screeningDetails) {
      let newTotalPrice = Number(screeningDetails.ticketPrice) * selectedSeats.length;

      if (appliedPromoCode && selectedSeats.length > 0) {
        setPromoMessage(null);
        setAppliedPromoCode(null);
      }
      setTotalPrice(newTotalPrice);
    } else {
      setTotalPrice(0);
    }
  }, [selectedSeats, screeningDetails]);

  useEffect(() => {
    const fetchTheaterName = async () => {
      if (theater) {
        try {
          const theaterData = await getTheaterById(theater);
          setTheaterName(theaterData.name);
        } catch (error) {
          console.error('Error fetching theater name:', error);
          setTheaterName('Unknown Theater');
        }
      }
    };

    fetchTheaterName();
  }, [theater]);

  if (!screeningId || !movieTitle) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-red-600">Thiếu thông tin đặt vé. Vui lòng quay lại và chọn suất chiếu.</h2>
    </div>;
  }

  if (loadingScreening) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-blue-600">Đang tải thông tin suất chiếu...</h2>
    </div>;
  }

  if (screeningError) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-red-600">{screeningError}</h2>
    </div>;
  }

  const currentTicketPrice = Number(screeningDetails?.ticketPrice) || 0;

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      const newSelectedSeats = prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId];
      setPromoMessage(null);
      setAppliedPromoCode(null);
      return newSelectedSeats;
    });
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode || selectedSeats.length === 0 || !screeningDetails) {
      setPromoMessage({ type: 'error', message: 'Vui lòng chọn ít nhất một ghế và nhập mã khuyến mãi.' });
      return;
    }

    try {
      const validationResponse = await validatePromotionCode(promoCode, currentTicketPrice, selectedSeats.length);

      if (validationResponse.isValid && validationResponse.discountedPrice !== undefined) {
        setTotalPrice(Number(validationResponse.discountedPrice));
        setAppliedPromoCode(promoCode);
        setPromoMessage({ type: 'success', message: validationResponse.message || 'Mã khuyến mãi đã được áp dụng!' });
      } else {
        setPromoMessage({ type: 'error', message: validationResponse.message || 'Mã khuyến mãi không hợp lệ.' });
        if (appliedPromoCode) {
          setTotalPrice(Number(currentTicketPrice) * selectedSeats.length);
          setAppliedPromoCode(null);
        }
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoMessage({ type: 'error', message: 'Đã xảy ra lỗi khi áp dụng mã khuyến mãi.' });
      if (appliedPromoCode) {
        setTotalPrice(Number(currentTicketPrice) * selectedSeats.length);
        setAppliedPromoCode(null);
      }
    }
  };

  const handleTimeUp = async () => {
    if (bookingId) {
      try {
        await cancelBooking(bookingId);
        setError('Hết thời gian thanh toán. Vui lòng đặt vé lại.');
        setShowTimer(false);
        setBookingId(null);
        setSelectedSeats([]);
        if (appliedPromoCode) {
          setAppliedPromoCode(null);
          setPromoCode('');
          setPromoMessage(null);
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ít nhất một ghế');
      return;
    }

    if (isProceedingToCheckout.current) {
      return;
    }

    isProceedingToCheckout.current = true;

    setError(null);

    try {
      const bookingData = {
        userId: userId,
        screeningId: screeningId,
        seatNumbers: selectedSeats,
        code: appliedPromoCode || undefined,
      };

      const response = await createBooking(bookingData);

      if (!response.success || !response.data?._id) {
        throw new Error('Không thể tạo booking ban đầu hoặc lấy ID booking.');
      }

      setBookingId(response.data._id as string);
      sessionStorage.setItem('currentBookingId', response.data._id as string);

      const finalCalculatedTotal = totalPrice;
      const originalPriceBeforeDiscount = Number(screeningDetails?.ticketPrice) * selectedSeats.length;
      const discountAmountCalculated = appliedPromoCode ? (originalPriceBeforeDiscount - finalCalculatedTotal) : 0;

      const bookingDetails = {
        movieId: id || '',
        movieTitle: movieTitle,
        date: date,
        time: time,
        theater: theater,
        room: screeningDetails?.roomId.name || '',
        seats: selectedSeats,
        basePrice: screeningDetails?.ticketPrice || 0,
        discount: discountAmountCalculated,
        total: finalCalculatedTotal,
        screeningId: screeningId,
        userId: userId,
        bookingId: response.data._id as string,
      };

      console.log('Booking Details prepared in SeatSelection (before sessionStorage):', bookingDetails);
      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

      navigate('/checkout');

    } catch (error: any) {
      setShowTimer(false);
      console.error('Error creating or proceeding with booking:', error);
      if (error.message?.includes('already booked')) {
        setError('Một số ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.');
        setSelectedSeats([]);
        if (appliedPromoCode) {
          setAppliedPromoCode(null);
          setPromoCode('');
          setPromoMessage(null);
        }
      } else {
        setError(error.message || 'Không thể tạo đặt vé hoặc xử lý. Vui lòng thử lại.');
      }
    } finally {
      isProceedingToCheckout.current = false;
    }
  };

  const originalPrice = Number(currentTicketPrice) * Number(selectedSeats.length);

  const discountAmount = Number(originalPrice) - Number(totalPrice);

  return <div className="container mx-auto px-4 py-8">
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="mb-2">{error}</p>
        {error.includes('already booked') && (
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 underline hover:text-red-800"
          >
            Làm mới danh sách ghế
          </button>
        )}
      </div>
    )}
    {showTimer && (
      <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
        <CountdownTimer onTimeUp={handleTimeUp} />
      </div>
    )}
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{movieTitle}</h1>
          <p className="text-gray-600">
            {date} | {time} | {theaterName}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Chọn ghế của bạn
          </span>
        </div>
      </div>
      <SeatGrid
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelect}
        screeningId={screeningId}
      />
    </div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Ghế đã chọn</h2>
          {selectedSeats.length > 0 ? <div className="flex flex-wrap gap-2 mb-4">
            {selectedSeats.map(seat => <span key={seat} className="inline-block px-3 py-1 bg-blue-500 text-white rounded-md">
              {seat}
            </span>)}
          </div> : <p className="text-gray-500 mb-4">Chưa chọn ghế nào</p>}
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">
              Mã khuyến mãi
            </label>
            <div className="flex">
              <input type="text" className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập mã khuyến mãi" value={promoCode} onChange={e => {
                setPromoCode(e.target.value);
                setPromoMessage(null);
                if (!e.target.value && appliedPromoCode) {
                  setTotalPrice(Number(currentTicketPrice) * selectedSeats.length);
                  setAppliedPromoCode(null);
                }
              }} />
              <button className={`px-4 py-2 rounded-r-md font-medium ${promoCode && selectedSeats.length > 0 ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleApplyPromoCode}>
                Áp dụng
              </button>
            </div>
            {promoMessage && (
              <p className={`text-sm mt-1 ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {promoMessage.message}
              </p>
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>
                Vé ({selectedSeats.length} x {Number(currentTicketPrice)} VND)
              </span>
              <span>{Number(originalPrice)} VND</span>
            </div>
            {appliedPromoCode && discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá  ({100 - (totalPrice / originalPrice * 100)}%)</span>
                <span>-{Math.round(discountAmount)} VND</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span>{Math.round(totalPrice)} VND</span>
            </div>
          </div>
          <button className={`w-full py-3 rounded-md font-medium ${selectedSeats.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleProceedToCheckout} disabled={selectedSeats.length === 0}>
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  </div>;
};

export default SeatSelection;