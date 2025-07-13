import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Filter, Search, Calendar, Tag, Ticket, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, getMovies } from '../../utils/movie';
import { getAllPromotions, Promotion } from '../../utils/promotion';

// Thêm interface cho banner quảng cáo
interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  type: 'movie' | 'promotion';
  badgeText?: string;
  badgeColor?: string;
}

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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'now-showing' | 'coming-soon'>('now-showing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất Cả Thể Loại');
  const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>('RATING');
  
  // State cho banner slider
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Hàm điều khiển slider
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Cải thiện auto slide để nó phụ thuộc vào banners.length
  useEffect(() => {
    // Chỉ auto slide khi có ít nhất 2 banner
    if (banners.length > 1) {
      const timer = setInterval(() => {
        nextBanner();
      }, 5000); // Chuyển slide mỗi 5 giây
      
      return () => clearInterval(timer);
    }
  }, [banners.length]); // Thêm banners.length vào dependencies

  // Sửa hàm fetchData để xử lý trường hợp không đăng nhập
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch movies first
        const moviesData = await getMovies();
        setMovies(moviesData || []);
        
        // Tạo banners từ phim
        const movieBanners: Banner[] = [];
        
        // Tạo danh sách tất cả phim
        const allMovies = [...moviesData];
        
        // Shuffle toàn bộ danh sách phim
        const shuffledMovies = [...allMovies].sort(() => Math.random() - 0.5);
        
        // Lấy 3 phim đang chiếu
        const nowShowingMovies = shuffledMovies.filter(movie => movie.showingStatus === 'now-showing').slice(0, 3);
        
        // Lấy 3 phim sắp chiếu
        const comingSoonMovies = shuffledMovies.filter(movie => movie.showingStatus === 'coming-soon').slice(0, 3);
        
        // Thêm phim đang chiếu vào banners
        nowShowingMovies.forEach(movie => {
          movieBanners.push({
            id: movie._id,
            imageUrl: movie.posterUrl,
            title: movie.title,
            subtitle: movie.vietnameseTitle,
            link: `/movie/${movie._id}`,
            type: 'movie',
            badgeText: 'Đang Chiếu',
            badgeColor: 'bg-green-600'
          });
        });
        
        // Thêm phim sắp chiếu vào banners
        comingSoonMovies.forEach(movie => {
          movieBanners.push({
            id: movie._id,
            imageUrl: movie.posterUrl,
            title: movie.title,
            subtitle: movie.vietnameseTitle,
            link: `/movie/${movie._id}`,
            type: 'movie',
            badgeText: 'Sắp Chiếu',
            badgeColor: 'bg-blue-600'
          });
        });
        
        // Thử tải khuyến mãi nếu đã đăng nhập
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const promotionsData = await getAllPromotions();
            setPromotions(promotionsData.data || []);
            
            // Shuffle khuyến mãi
            const activePromotions = (promotionsData.data?.filter(promo => 
              promo.status === 'approved' && 
              new Date(promo.endDate) >= new Date() &&
              promo.maxUsage > (promo.currentUsage || 0)
            ) || []).sort(() => Math.random() - 0.5);
            
            // Thêm 2 khuyến mãi
            activePromotions.slice(0, 2).forEach(promo => {
              movieBanners.push({
                id: promo._id,
                imageUrl: promo.posterUrl || 'https://via.placeholder.com/800x450?text=Khuyến+Mãi',
                title: promo.name,
                subtitle: promo.description,
                link: '#', // Không có trang chi tiết khuyến mãi
                type: 'promotion',
                badgeText: 'Khuyến Mãi',
                badgeColor: 'bg-red-600'
              });
            });
          }
        } catch (error) {
          console.log('Không thể tải khuyến mãi, tiếp tục với chỉ phim');
          // Không làm gì, tiếp tục với chỉ phim
        }
        
        // Shuffle banners một lần nữa để đảm bảo thứ tự ngẫu nhiên
        const shuffledBanners = [...movieBanners].sort(() => Math.random() - 0.5);
        
        // Thêm timestamp vào mỗi banner để đảm bảo ID khác nhau mỗi khi refresh
        const timestampedBanners = shuffledBanners.map(banner => ({
          ...banner,
          id: `${banner.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }));
        
        setBanners(timestampedBanners);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      {/* Thêm container với padding-top */}
      <div className="pt-4">
        {/* Banner Slider */}
        <div className="relative w-full h-[350px] overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className="min-w-full h-full relative"
              >
                <div className="absolute inset-0 bg-black/30"></div>
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-full h-full object-contain md:object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/1920x1080?text=Galaxy+Cinema';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent/30 flex items-end">
                  <div className="container mx-auto px-4 pb-12">
                    {banner.badgeText && (
                      <span className={`${banner.badgeColor} text-white px-3 py-1 rounded-md text-sm font-medium mb-3 inline-block`}>
                        {banner.badgeText}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-1">{banner.title}</h2>
                    {banner.subtitle && (
                      <p className="text-base text-white/80 mb-2 line-clamp-2">{banner.subtitle}</p>
                    )}
                    <Link 
                      to={banner.link}
                      className="bg-red-600 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      {banner.type === 'movie' ? (
                        <>
                          <Ticket className="w-3.5 h-3.5" />
                          Mua vé ngay
                        </>
                      ) : (
                        <>
                          <Tag className="w-3.5 h-3.5" />
                          Xem chi tiết
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation buttons */}
          <button 
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full ${index === currentBanner ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>

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
            target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
          }}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movie/${movie._id}`);
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
            <span>{movie.duration} phút</span>
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