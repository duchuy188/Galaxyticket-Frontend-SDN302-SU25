import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie, getMovieById } from '../../utils/movie';
import { showtimes } from '../../utils/mockData'; 
import { Calendar, Clock, Tag, Star, Film, MapPin, Flag, Building2, User } from 'lucide-react';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [showTrailer, setShowTrailer] = useState(false);

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
        setError('Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const movieShowtimes = showtimes.filter(s => s.movieId === id);
  const filteredShowtimes = movieShowtimes.filter(s => !selectedDate || s.date === selectedDate);

  // Thêm hàm này để chuyển đổi URL YouTube
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Xử lý URL dạng youtu.be
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Xử lý URL dạng youtube.com/watch?v=
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Loading movie details...</h2></div>;
  if (error) return <div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold text-red-600">Error: {error}</h2></div>;
  if (!movie) return <div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Movie not found</h2></div>;

  const handleBooking = () => {
    if (!selectedTime || !selectedTheater) {
      alert('Please select a time and theater');
      return;
    }
    navigate(`/seats/${id}?date=${selectedDate}&time=${selectedTime}&theater=${selectedTheater}`);
  };

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
          <button 
            onClick={() => setShowTrailer(true)}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <Film className="w-10 h-10 text-white" />
          </button>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl mx-4">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <span className="text-2xl">×</span>
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(movie.trailerUrl)}
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
            <div className="flex gap-8">
              {/* Poster */}
              <div className="w-[300px] flex-shrink-0">
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
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                    {(movie.director || 'Pae Arak Amornsupasiri,Wutthiphong Sukanin').split(',').map((director, index) => (
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
                    {(movie.cast || 'Pae Arak Amornsupasiri,Kittikun Chattongkum,Paween Purijitpanya').split(',').map((actor, index) => (
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
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Chọn ngày</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  <option value="">Chọn ngày chiếu</option>
                  {[...new Set(movieShowtimes.map(s => s.date))].map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Chọn suất chiếu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[...new Set(filteredShowtimes.map(s => s.time))].map(time => (
                      <button
                        key={time}
                        className={`p-2 rounded-lg transition-all ${
                          selectedTime === time 
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

              {/* Theater Selection */}
              {selectedTime && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Chọn rạp</label>
                  <div className="space-y-2">
                    {[...new Set(filteredShowtimes
                      .filter(s => s.time === selectedTime)
                      .map(s => s.theater))].map(theater => (
                      <button
                        key={theater}
                        className={`w-full p-3 rounded-lg text-left ${
                          selectedTheater === theater 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTheater(theater)}
                      >
                        {theater}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                className={`w-full py-3 rounded-lg font-medium ${
                  selectedDate && selectedTime && selectedTheater
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !selectedTheater}
              >
                Chọn ghế
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