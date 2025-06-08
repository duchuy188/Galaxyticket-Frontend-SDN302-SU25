import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movies, showtimes } from '../utils/mockData';
import { CalendarIcon, ClockIcon, TagIcon } from 'lucide-react';
const MovieDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const movie = movies.find(m => m.id === id);
  const movieShowtimes = showtimes.filter(s => s.movieId === id);
  const [selectedDate, setSelectedDate] = useState<string>(movieShowtimes[0]?.date || '');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  if (!movie) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Movie not found</h2>
      </div>;
  }
  const filteredShowtimes = movieShowtimes.filter(s => !selectedDate || s.date === selectedDate);
  const handleBooking = () => {
    if (!selectedTime || !selectedTheater) {
      alert('Please select a time and theater');
      return;
    }
    navigate(`/seats/${id}?date=${selectedDate}&time=${selectedTime}&theater=${selectedTheater}`);
  };
  return <div className="bg-gray-100 min-h-screen">
      <div className="h-80 bg-cover bg-center relative" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${movie.image})`
    }}>
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end">
            <div className="w-40 h-56 overflow-hidden rounded-lg shadow-lg flex-shrink-0 -mb-16 md:-mb-8 border-4 border-white">
              <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center">
                  <TagIcon size={16} className="mr-1" />
                  <span>{movie.genre}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon size={16} className="mr-1" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon size={16} className="mr-1" />
                  <span>{movie.releaseDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-gray-700">{movie.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Trailer</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe src={`https://www.youtube.com/embed/${movie.trailer}`} title={`${movie.title} Trailer`} allowFullScreen className="w-full h-96"></iframe>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Book Tickets</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Date
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
                  <option value="">Select a date</option>
                  {[...new Set(movieShowtimes.map(s => s.date))].map(date => <option key={date} value={date}>
                        {date}
                      </option>)}
                </select>
              </div>
              {selectedDate && <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Showtime
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[...new Set(filteredShowtimes.map(s => s.time))].map(time => <button key={time} className={`p-2 border rounded-md ${selectedTime === time ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setSelectedTime(time)}>
                          {time}
                        </button>)}
                  </div>
                </div>}
              {selectedTime && <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Theater
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[...new Set(filteredShowtimes.filter(s => s.time === selectedTime).map(s => s.theater))].map(theater => <button key={theater} className={`p-2 border rounded-md ${selectedTheater === theater ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setSelectedTheater(theater)}>
                        {theater}
                      </button>)}
                  </div>
                </div>}
              <button className={`w-full py-3 rounded-md font-medium ${selectedDate && selectedTime && selectedTheater ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleBooking} disabled={!selectedDate || !selectedTime || !selectedTheater}>
                Select Seats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default MovieDetail;