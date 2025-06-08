import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, PrinterIcon, MailIcon } from 'lucide-react';
type ConfirmationDetails = {
  movieId: string;
  movieTitle: string;
  date: string;
  time: string;
  theater: string;
  seats: string[];
  total: number;
  bookingReference: string;
  paymentDate: string;
};
const BookingConfirmation: React.FC = () => {
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedDetails = sessionStorage.getItem('confirmationDetails');
    if (storedDetails) {
      setConfirmationDetails(JSON.parse(storedDetails));
    } else {
      navigate('/');
    }
  }, [navigate]);
  if (!confirmationDetails) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Loading confirmation...</h2>
      </div>;
  }
  const formattedDate = new Date(confirmationDetails.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mt-2">
              Your tickets have been booked successfully.
            </p>
          </div>
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Booking Details</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {confirmationDetails.bookingReference}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Movie</p>
                <p className="font-medium">{confirmationDetails.movieTitle}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date & Time</p>
                <p className="font-medium">
                  {confirmationDetails.date} at {confirmationDetails.time}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Theater</p>
                <p className="font-medium">{confirmationDetails.theater}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Seats</p>
                <p className="font-medium">
                  {confirmationDetails.seats.join(', ')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Amount Paid</p>
                <p className="font-medium">
                  ${confirmationDetails.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Payment Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Ticket</h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-lg">
                    {confirmationDetails.movieTitle}
                  </h4>
                  <p className="text-sm">
                    {confirmationDetails.date} at {confirmationDetails.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{confirmationDetails.theater}</p>
                  <p className="text-sm">
                    Seats: {confirmationDetails.seats.join(', ')}
                  </p>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-4 mt-4 flex justify-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEMO_TICKET" alt="QR Code" className="h-32 w-32" />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Scan this QR code at the theater entrance
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <PrinterIcon size={18} className="mr-2" />
              Print Ticket
            </button>
            <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <MailIcon size={18} className="mr-2" />
              Email Ticket
            </button>
          </div>
          <div className="mt-8 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default BookingConfirmation;