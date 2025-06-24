import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie, getMovieById } from '../../utils/movie';
import { Screening, getPublicScreenings } from '../../utils/screening';
import { getTheaters, Theater } from '../../utils/theater';
import { getRooms, Room } from '../../utils/room';
import { Calendar, Clock, Tag, Star, Film, MapPin, Flag, Building2, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError('Movie ID is missing');
        setLoading(false);
        return;
      }
      try {
        const movieData = await getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Fetch screenings for the movie
  useEffect(() => {
    const fetchScreenings = async () => {
      setScreeningsLoading(true);
      try {
        const data = await getPublicScreenings();
        // Filter screenings by movieId
        const filtered = id ? data.filter(s => {
          const movieId = typeof s.movieId === 'string' ? s.movieId : s.movieId?._id;
          return movieId === id;
        }) : [];
        setScreenings(filtered);
      } catch (err) {
        console.error('Error fetching screenings:', err);
        setError('Failed to load screening times. Please try again later.');
      } finally {
        setScreeningsLoading(false);
      }
    };

    fetchScreenings();
  }, [id]);

  // Fetch theaters and rooms
  useEffect(() => {
    const fetchTheatersAndRooms = async () => {
      try {
        const [theatersData, roomsData] = await Promise.all([
          getTheaters(),
          getRooms()
        ]);
        setTheaters(theatersData);
        setRooms(roomsData);
      } catch (err) {
        console.error('Error fetching theaters and rooms:', err);
        setError('Failed to load theater information. Please try again later.');
      }
    };

    fetchTheatersAndRooms();
  }, []);

  // Update selected screening when selections change
  useEffect(() => {
    if (selectedDate && selectedTime && selectedTheater && movie) {
      const found = screenings.find(
        s =>
          s.startTime.startsWith(selectedDate) &&
          s.startTime.includes(selectedTime) &&
          (typeof s.theaterId === 'string' ? s.theaterId : s.theaterId?._id) === selectedTheater &&
          (typeof s.movieId === 'string' ? s.movieId : s.movieId?._id) === movie._id
      );
      setSelectedScreening(found || null);
    } else {
      setSelectedScreening(null);
    }
  }, [selectedDate, selectedTime, selectedTheater, screenings, movie]);

  // Available dates for selected theater
  const availableDates = useMemo(() => {
    if (!selectedTheater) return [];
    const dates = new Set<string>();
    screenings.forEach(s => {
      const theaterId = typeof s.theaterId === 'string' ? s.theaterId : s.theaterId?._id;
      if (theaterId === selectedTheater) {
        dates.add(s.startTime.split('T')[0]);
      }
    });
    return Array.from(dates).sort();
  }, [selectedTheater, screenings]);

  // Available times for selected theater and date
  const availableTimes = useMemo(() => {
    if (!selectedTheater || !selectedDate || !movie) return [];

    const times = new Set<string>();
    screenings.forEach(s => {
      const screeningDate = s.startTime.split('T')[0];
      const theaterId = typeof s.theaterId === 'string' ? s.theaterId : s.theaterId?._id;
      const movieId = typeof s.movieId === 'string' ? s.movieId : s.movieId?._id;

      if (
        screeningDate === selectedDate &&
        theaterId === selectedTheater &&
        movieId === movie._id
      ) {
        times.add(s.startTime.split('T')[1].slice(0, 5));
      }
    });
    return Array.from(times).sort();
  }, [selectedTheater, selectedDate, movie, screenings]);

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleBooking = () => {
    if (!selectedScreening) {
      alert('Please select a time and theater');
      return;
    }

    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const navigatePath = `/seats/${movie?._id}?date=${selectedDate}&time=${selectedTime}&theater=${selectedTheater}&screeningId=${selectedScreening._id}&movieTitle=${encodeURIComponent(movie?.title || '')}&userId=${user?.id}`;
    navigate(navigatePath);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Movie Not Found</h2>
          <p className="text-gray-600">The movie you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative w-full h-[600px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: movie.trailerUrl
              ? `url(https://img.youtube.com/vi/${movie.trailerUrl.split('/').pop()}/maxresdefault.jpg)`
              : `url(${movie.posterUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-gray-50" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          {movie.trailerUrl && (
            <button
              onClick={() => setShowTrailer(true)}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              aria-label="Play trailer"
            >
              <Film className="w-10 h-10 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              aria-label="Close trailer"
            >
              <span className="text-2xl">×</span>
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(movie.trailerUrl)}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Section: Poster and Movie Info */}
          <div className="col-span-12 lg:col-span-9">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Poster */}
              <div className="w-full lg:w-[300px] flex-shrink-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-[450px] object-cover rounded-lg shadow-xl"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 py-4">
                {/* Title & Rating */}
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {movie.title}
                  </h1>
                  <h2 className="text-xl text-gray-600 mb-3">
                    {movie.vietnameseTitle || movie.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-500">{movie.rating || '7.5'}</span>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-gray-500">({movie.votes || '11'} votes)</span>
                  </div>
                </div>

                {/* Movie Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Thời lượng:</span>
                    <span className="font-medium">{movie.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Khởi chiếu:</span>
                    <span className="font-medium">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Quốc gia:</span>
                    <span className="font-medium">{movie.country || 'Việt Nam'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Nhà sản xuất:</span>
                    <span className="font-medium">{movie.producer || 'Jungka Bangkok'}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Thể loại:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(movie.genre || 'Tâm Lý,Giật Gân').split(',').map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Directors */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Film className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Đạo diễn:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(movie.directors?.join(',') || 'Pae Arak Amornsupasiri,Wutthiphong Sukanin').split(',').map((director, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {director.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cast */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
                    <span className="text-gray-500">Diễn viên:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(movie.actors?.join(',') || 'Pae Arak Amornsupasiri,Kittikun Chattongkum,Paween Purijitpanya').split(',').map((actor, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {actor.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Booking */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-lg sticky top-8">
              <h3 className="text-xl font-semibold mb-6">Đặt vé</h3>

              {/* Theater Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Chọn rạp</label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={selectedTheater}
                  onChange={e => {
                    setSelectedTheater(e.target.value);
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                >
                  <option value="">Chọn rạp</option>
                  {theaters.map(theater => (
                    <option key={theater._id} value={theater._id}>{theater.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              {selectedTheater && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Chọn ngày</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  >
                    <option value="">Chọn ngày chiếu</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Time Selection */}
              {selectedTheater && selectedDate && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Chọn suất chiếu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        className={`p-2 rounded-lg transition-all ${selectedTime === time
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                className={`w-full py-3 rounded-lg font-medium transition-all ${selectedScreening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                onClick={handleBooking}
                disabled={!selectedScreening}
              >
                {selectedScreening ? 'Chọn ghế' : 'Vui lòng chọn suất chiếu'}
              </button>
            </div>
          </div>
        </div>

        {/* Movie Description Card */}
        <div className="bg-white rounded-lg p-6 shadow-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Nội Dung Phim</h3>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {movie.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;