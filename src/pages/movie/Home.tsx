import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Filter, Search, Calendar, Tag, Ticket, Film } from 'lucide-react';
import { Movie, getMovies } from '../../utils/movie';

// Constants
const GENRES = [
  "Tất Cả Thể Loại",
  "Phim Cao Bồi", 
  "Phim Chiến Tranh", 
  "Phim Gia Đình", 
  "Phim Giả Tưởng", 
  "Phim Giật Gân", 
  "Phim Hài", 
  "Phim Hành Động", 
  "Phim Hình Sự", 
  "Phim Hoạt Hình", 
  "Phim Kinh Dị", 
  "Phim Lãng Mạn", 
  "Phim Lịch Sử",
  "Phim Bí Ẩn", 
  "Phim Âm Nhạc", 
  "Phim Phiêu Lưu", 
  "Phim Tài Liệu", 
  "Phim Chính Kịch", 
  "Phim Thần Thoại", 
  "Phim Thể Thao", 
  "Phim Tiểu Sử"
] as const;

const SORT_OPTIONS = {
  RATING: 'đánh giá',
  TITLE: 'tên phim',
  DURATION: 'thời lượng'
} as const;

// Types
interface MovieCardProps {
  movie: Movie;
  isComingSoon?: boolean;
}

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'now-showing' | 'coming-soon'>('now-showing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất Cả Thể Loại');
  const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>('RATING');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const nowShowing = Array.isArray(movies) ? movies.filter(movie => movie.showingStatus === 'now-showing') : [];
  const comingSoon = Array.isArray(movies) ? movies.filter(movie => movie.showingStatus === 'coming-soon') : [];


  const filteredMovies = [...(activeTab === 'now-showing' ? nowShowing : comingSoon)].filter(movie => {
    
    if (selectedGenre !== 'Tất Cả Thể Loại') {
      if (movie.genre !== selectedGenre) {
        return false;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = movie.title.toLowerCase();
      const vietnameseTitle = movie.vietnameseTitle?.toLowerCase() || '';
      
      return title.includes(query) || vietnameseTitle.includes(query);
    }
    
    return true;
  });

 
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'RATING':
        return (b.rating || 0) - (a.rating || 0);
      case 'TITLE':
        return a.title.localeCompare(b.title);
      case 'DURATION':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Đang tải...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('now-showing')}
            className={`px-6 py-2.5 rounded-lg transition duration-300 text-lg font-medium ${activeTab === 'now-showing'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Đang Chiếu
          </button>
          <button
            onClick={() => setActiveTab('coming-soon')}
            className={`px-6 py-2.5 rounded-lg transition duration-300 text-lg font-medium ${activeTab === 'coming-soon'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Sắp Chiếu
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof typeof SORT_OPTIONS)}
            className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="RATING">Đánh Giá Cao Nhất</option>
            <option value="TITLE">A-Z</option>
            <option value="DURATION">Thời Lượng</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedGenre !== 'Tất Cả Thể Loại') && (
          <div className="flex items-center gap-3 mb-8 text-gray-600">
            <Filter className="w-5 h-5" />
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-white border border-gray-200">
                  Tìm kiếm: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedGenre !== 'Tất Cả Thể Loại' && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-white border border-gray-200">
                  Thể loại: {selectedGenre}
                  <button
                    onClick={() => setSelectedGenre('Tất Cả Thể Loại')}
                    className="ml-2 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {sortedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                isComingSoon={movie.showingStatus === 'coming-soon'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">Không tìm thấy phim phù hợp với tiêu chí của bạn.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Tất Cả Thể Loại');
                setSortBy('RATING');
              }}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 shadow-lg shadow-red-600/30"
            >
              Xóa Bộ Lọc
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, isComingSoon }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Poster with Overlay */}
      <div className="relative">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-movie.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movie/${movie._id}`);  // Chuyển đến trang chi tiết phim giống nút Trailer
            }}
            className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span>Mua vé</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movie/${movie._id}`);
            }}
            className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Film className="w-4 h-4" />
            <span>Trailer</span>
          </button>
        </div>
        {isComingSoon && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Sắp Chiếu
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-red-600 transition-colors">
            {movie.title}
          </h3>
       
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{movie.rating || '7.5'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{movie.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;