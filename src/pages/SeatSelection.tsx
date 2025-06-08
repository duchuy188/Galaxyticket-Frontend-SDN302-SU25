import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { movies } from '../utils/mockData';
import SeatGrid from '../components/SeatGrid';
const SeatSelection: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const movie = movies.find(m => m.id === id);
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const theater = searchParams.get('theater') || '';
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  if (!movie) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Movie not found</h2>
      </div>;
  }
  const basePrice = 15;
  const discount = promoApplied ? 0.15 : 0;
  const subtotal = basePrice * selectedSeats.length;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]);
  };
  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'movie15') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };
  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    // Store booking details in session storage
    const bookingDetails = {
      movieId: id,
      movieTitle: movie.title,
      date,
      time,
      theater,
      seats: selectedSeats,
      basePrice,
      discount,
      total
    };
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    navigate('/checkout');
  };
  return <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{movie.title}</h1>
            <p className="text-gray-600">
              {date} | {time} | {theater}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Select your seats
            </span>
          </div>
        </div>
        <SeatGrid selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Selected Seats</h2>
            {selectedSeats.length > 0 ? <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeats.map(seat => <span key={seat} className="inline-block px-3 py-1 bg-blue-500 text-white rounded-md">
                    {seat}
                  </span>)}
              </div> : <p className="text-gray-500 mb-4">No seats selected</p>}
            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-2">
                Promo Code
              </label>
              <div className="flex">
                <input type="text" className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={promoApplied} />
                <button className={`px-4 py-2 rounded-r-md font-medium ${promoApplied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`} onClick={applyPromoCode} disabled={promoApplied || !promoCode}>
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Try "MOVIE15" for 15% off
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>
                  Tickets ({selectedSeats.length} x ${basePrice.toFixed(2)})
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && <div className="flex justify-between text-green-600">
                  <span>Discount (15%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className={`w-full py-3 rounded-md font-medium ${selectedSeats.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleProceedToCheckout} disabled={selectedSeats.length === 0}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default SeatSelection;