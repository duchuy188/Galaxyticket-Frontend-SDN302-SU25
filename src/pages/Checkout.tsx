import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, CheckCircleIcon } from 'lucide-react';
type BookingDetails = {
  movieId: string;
  movieTitle: string;
  date: string;
  time: string;
  theater: string;
  seats: string[];
  basePrice: number;
  discount: number;
  total: number;
};
const Checkout: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const storedDetails = sessionStorage.getItem('bookingDetails');
    if (storedDetails) {
      setBookingDetails(JSON.parse(storedDetails));
    } else {
      navigate('/');
    }
  }, [navigate]);
  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      // Generate booking reference
      const bookingReference = `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      // Store confirmation details
      sessionStorage.setItem('confirmationDetails', JSON.stringify({
        ...bookingDetails,
        bookingReference,
        paymentDate: new Date().toISOString()
      }));
      navigate('/confirmation');
    }, 2000);
  };
  if (!bookingDetails) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Loading checkout...</h2>
      </div>;
  }
  return <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Movie</p>
                <p className="font-medium">{bookingDetails.movieTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {bookingDetails.date} at {bookingDetails.time}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Theater</p>
                <p className="font-medium">{bookingDetails.theater}</p>
              </div>
              <div>
                <p className="text-gray-600">Seats</p>
                <p className="font-medium">{bookingDetails.seats.join(', ')}</p>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span>
                  Tickets ({bookingDetails.seats.length} x $
                  {bookingDetails.basePrice.toFixed(2)})
                </span>
                <span>
                  $
                  {(bookingDetails.basePrice * bookingDetails.seats.length).toFixed(2)}
                </span>
              </div>
              {bookingDetails.discount > 0 && <div className="flex justify-between text-green-600 mb-2">
                  <span>Discount ({bookingDetails.discount * 100}%)</span>
                  <span>
                    -$
                    {(bookingDetails.basePrice * bookingDetails.seats.length * bookingDetails.discount).toFixed(2)}
                  </span>
                </div>}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${bookingDetails.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="mr-2" size={20} />
                <span className="font-medium">Credit Card Payment</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Card Number
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="1234 5678 9012 3456" defaultValue="4111 1111 1111 1111" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Expiration Date
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="MM/YY" defaultValue="12/25" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    CVV
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="123" defaultValue="123" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Cardholder Name
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="John Doe" defaultValue="John Doe" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-green-600">
                <CheckCircleIcon className="mr-2" size={16} />
                <span className="text-sm">
                  This is a demo - no real payment will be processed
                </span>
              </div>
            </div>
          </div>
          <button className={`w-full py-3 rounded-md font-medium ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`} onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? 'Processing Payment...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>;
};
export default Checkout;