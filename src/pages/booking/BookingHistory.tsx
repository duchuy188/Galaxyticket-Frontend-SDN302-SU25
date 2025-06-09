import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookings as mockBookings } from '../../utils/mockData';
import { movies } from '../../utils/mockData';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
type Booking = {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: string[];
  totalPrice: number;
  date: string;
  status: string;
};
const BookingHistory: React.FC = () => {
  const {
    user
  } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    // In a real app, you would fetch the user's bookings from an API
    // For this demo, we'll use the mock data and filter by user ID
    if (user) {
      // Get bookings from local storage if available
      const storedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      // Combine with mock bookings
      const allBookings = [...mockBookings, ...storedBookings].filter(booking => booking.userId === user.id);
      setBookings(allBookings);
    }
  }, [user]);
  const getMovieTitle = (movieId: string) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.title : 'Unknown Movie';
  };
  if (!user) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">
          Please sign in to view your bookings
        </h2>
        <Link to="/signin" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Sign In
        </Link>
      </div>;
  }
  return <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        {bookings.length === 0 ? <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">
              You have no booking history yet.
            </p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Book a Movie
            </Link>
          </div> : <div className="space-y-6">
            {bookings.map(booking => <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-xl font-bold">
                      {getMovieTitle(booking.movieId)}
                    </h2>
                    <div className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {booking.status === 'completed' ? <div className="flex items-center">
                          <CheckCircleIcon size={16} className="mr-1" />
                          Completed
                        </div> : <div className="flex items-center">
                          <XCircleIcon size={16} className="mr-1" />
                          {booking.status}
                        </div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Date</p>
                      <p>{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Seats</p>
                      <p>{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Amount Paid</p>
                      <p>${booking.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to={`/movie/${booking.movieId}`} className="text-blue-600 hover:text-blue-800">
                      Book Again
                    </Link>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};
export default BookingHistory;