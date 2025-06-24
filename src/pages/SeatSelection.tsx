import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import SeatGrid from '../components/SeatGrid';
import { getTheaterById } from '../utils/theater';
import { createBooking, updateBooking, cancelBooking } from '../utils/booking';
import { getScreeningById, Screening } from '../utils/screening';
import { validatePromotionCode } from '../utils/promotion';
import { useAuth } from '../context/AuthContext';

const SeatSelection: React.FC = () => {
  const { user } = useAuth();
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
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const isProceedingToCheckout = React.useRef(false);

  useEffect(() => {
    // Check for update mode when component mounts
    const isUpdating = sessionStorage.getItem('isUpdatingBooking');
    if (isUpdating === 'true') {
      const storedDetails = sessionStorage.getItem('bookingDetails');
      const currentBookingId = sessionStorage.getItem('currentBookingId');
      if (storedDetails && currentBookingId) {
        setIsUpdateMode(true);
        const parsedDetails = JSON.parse(storedDetails);
        setSelectedSeats(parsedDetails.seats || []);
        setBookingId(currentBookingId);
      }
      // Clean up the flag
      sessionStorage.removeItem('isUpdatingBooking');
    }
  }, []);

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
      const newTotalPrice = Number(screeningDetails.ticketPrice) * selectedSeats.length;

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

  const handleUpdateAndReturnToCheckout = async () => {
    if (!bookingId) {
      setError('Không tìm thấy mã đặt vé để cập nhật.');
      return;
    }
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ít nhất một ghế.');
      return;
    }

    if (isProceedingToCheckout.current) return;
    isProceedingToCheckout.current = true;
    setError(null);

    try {
      const finalCalculatedTotal = totalPrice;
      const originalPriceBeforeDiscount = (screeningDetails?.ticketPrice || 0) * selectedSeats.length;
      const discountAmountCalculated = appliedPromoCode ? (originalPriceBeforeDiscount - finalCalculatedTotal) : 0;

      const updateData = {
        seatNumbers: selectedSeats,
        code: appliedPromoCode || undefined,
        totalPrice: finalCalculatedTotal,
        discount: discountAmountCalculated,
        basePrice: screeningDetails?.ticketPrice || 0,
      };
      
      await updateBooking(bookingId, updateData);

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
        userId: user.id,
        bookingId: bookingId,
      };

      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
      sessionStorage.setItem('bookingUpdateSuccess', 'true');

      navigate('/checkout');

    } catch (error: any) {
      console.error('Error updating booking:', error);
      setError(error.message || 'Không thể cập nhật đặt vé.');
    } finally {
      isProceedingToCheckout.current = false;
    }
  };

  const handleProceedToCheckout = async () => {
    console.log('Current user:', user); // Log user info
    console.log('Current screeningId:', screeningId); // Log screeningId
    console.log('Selected seats:', selectedSeats); // Log selected seats

    if (!user) {
      setError('Vui lòng đăng nhập để đặt vé');
      navigate('/signin');
      return;
    }

    // Get user ID from either id or _id field
    const userId = user._id || user.id;
    console.log('User ID being used:', userId);

    if (!userId) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      navigate('/signin');
      return;
    }

    if (!screeningId) {
      setError('Không tìm thấy thông tin suất chiếu');
      return;
    }

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
      // Validate current user
      if (!userId || !user) {
        throw new Error('Vui lòng đăng nhập để đặt vé.');
      }

      // Validate screening
      if (!screeningId || !screeningDetails) {
        throw new Error('Không tìm thấy thông tin suất chiếu.');
      }

      // Validate selected seats
      if (!selectedSeats || selectedSeats.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một ghế.');
      }

      const bookingData = {
        userId: userId,
        screeningId: screeningId,
        seatNumbers: selectedSeats,
        code: appliedPromoCode || undefined,
      };

      console.log('Creating booking with data:', bookingData);

      try {
        const response = await createBooking(bookingData);

        if (!response.success || !response.data?._id) {
          throw new Error('Không thể tạo đơn đặt vé. Vui lòng thử lại sau.');
        }

        const bookingId = response.data._id as string;
        setBookingId(bookingId);
        sessionStorage.setItem('currentBookingId', bookingId);

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
          bookingId: bookingId,
        };

        console.log('Booking Details prepared:', bookingDetails);
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

        navigate('/checkout');

      } catch (error) {
        setShowTimer(false);
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.';
        
        if (errorMessage.includes('already booked')) {
          setError('Một số ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.');
          setSelectedSeats([]);
          if (appliedPromoCode) {
            setAppliedPromoCode(null);
            setPromoCode('');
          }
        } else {
          setError(errorMessage);
        }
        
        // Release the seats if booking failed
        // await releasePendingSeats();
      }
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{movieTitle}</h1>
          <p className="text-gray-600">
            {date ? (() => {
              const d = new Date(date);
              if (!isNaN(d.getTime())) {
                return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                // fallback for string date
                const [y, m, d2] = date.split('-');
                return `${parseInt(d2, 10)}/${parseInt(m, 10)}/${y}`;
              }
              return date;
            })() : ''} | {time} | {theaterName}
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
                Giảm giá ({Math.round(100 - (totalPrice / originalPrice * 100))}%)
                <span>-{Math.round(discountAmount)} VND</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span>{Math.round(totalPrice)} VND</span>
            </div>
          </div>
          {isUpdateMode ? (
            <button
              className={`w-full py-3 rounded-md font-medium ${selectedSeats.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              onClick={handleUpdateAndReturnToCheckout}
              disabled={selectedSeats.length === 0 || isProceedingToCheckout.current}
            >
              Cập nhật vé
            </button>
          ) : (
            <button
              className={`w-full py-3 rounded-md font-medium ${selectedSeats.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || isProceedingToCheckout.current}
            >
              Tiến hành thanh toán
            </button>
          )}
        </div>
      </div>
    </div>
  </div>;
};

export default SeatSelection;