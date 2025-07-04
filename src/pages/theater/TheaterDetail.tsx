import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTheaterById, Theater } from '../../utils/theater';
import { Building2, MapPin, Phone, Calendar, Film, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Movie, getMovies } from '../../utils/movie';
import dayjs from 'dayjs';
import { getScheduleByTheater, TheaterSchedule, getPublicScreenings, Screening, getPublicScreeningsByTheaterAndDate } from '../../utils/screening';
import { useAuth } from '../../context/AuthContext';

// Đặt hàm này ở đây, TRƯỚC khi dùng useState
const getNextFiveDays = () => {
  const weekdayVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const days = [];
  for (let i = 0; i < 5; i++) {
    const date = dayjs().add(i, 'day');
    days.push({
      label: i === 0 ? 'Hôm Nay' : weekdayVi[date.day()],
      value: date.format('DD/MM'),
      fullDate: date.format('YYYY-MM-DD'),
    });
  }
  return days;
};

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 10.7769,
  lng: 106.7009
};

const TheaterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [center, setCenter] = useState(defaultCenter);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [days, setDays] = useState(getNextFiveDays());
  const [activeDay, setActiveDay] = useState(days[0].value);
  const [schedule, setSchedule] = useState<TheaterSchedule | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  // Lấy ngày hôm nay dạng 'DD/MM'
  const todayValue = dayjs().format('DD/MM');
  // now là dayjs object, tự động cập nhật mỗi 10 giây
  const [now, setNow] = useState(dayjs());
  const [dayLoading, setDayLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 10000); // cập nhật mỗi 10 giây
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Theater ID is missing');
        setLoading(false);
        return;
      }
      try {
        const [theaterData, moviesData] = await Promise.all([
          getTheaterById(id),
          getMovies()
        ]);
        
        setTheater(theaterData);
        setMovies(moviesData || []);
        
        if (theaterData.latitude && theaterData.longitude) {
          setCenter({
            lat: parseFloat(theaterData.latitude),
            lng: parseFloat(theaterData.longitude)
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchScreenings = async () => {
      setDayLoading(true);
      try {
        const dateISO = dayjs(days.find(d => d.value === activeDay)?.fullDate).startOf('day').toISOString();
        const screenings = await getPublicScreeningsByTheaterAndDate(id, dateISO);
        setScreenings(screenings);
      } catch (err) {
        setError('Không thể tải suất chiếu');
      }
      setDayLoading(false);
    };
    fetchScreenings();
  }, [id, activeDay, days]);

  useEffect(() => {
    if (!id) return;
    const fetchSchedule = async () => {
      setDayLoading(true);
      try {
        const schedules = await getScheduleByTheater(days.find(d => d.value === activeDay)?.fullDate || '');
        const theaterSchedule = schedules.find(s => s.theaterId === id);
        setSchedule(theaterSchedule || null);
      } catch (err) {
        setError('Không thể tải lịch chiếu');
      }
      setDayLoading(false);
    };
    fetchSchedule();
  }, [id, activeDay, days]);

  const handleMapLoad = (map: google.maps.Map) => {
    // This function is no longer used in the new renderMap function
  };

  const handleMapError = (error: Error) => {
    console.error('Error loading map:', error);
    setError('Failed to load Google Maps');
  };

  // Render map section
  const renderMap = () => {
    if (loadError) {
      return (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error loading maps</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
          ],
        }}
      >
        <Marker 
          position={center}
          title={theater?.name}
        />
      </GoogleMap>
    );
  };

  // Nhóm suất chiếu theo phim
  const screeningsByMovie = screenings.reduce((acc, screening) => {
    const movieId = screening.movieId._id;
    if (!acc[movieId]) acc[movieId] = [];
    acc[movieId].push(screening);
    return acc;
  }, {} as Record<string, Screening[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !theater) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">{error || 'Theater not found'}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Theater Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {/* Banner section */}
        <div className="relative h-64 bg-gradient-to-r from-[#1a237e] to-[#283593]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
            />
          </div>

          {/* Theater icon */}
          <div className="absolute top-8 left-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 size={48} className="text-white" />
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute top-8 right-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              theater.status 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                theater.status ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {theater.status ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </div>
          </div>

          {/* Theater info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8">
            <h1 className="text-4xl font-bold text-white mb-4">{theater.name}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center text-white/90">
                <MapPin size={20} className="mr-2" />
                <span className="text-sm font-medium">{theater.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick info bar */}
        <div className="bg-white border-t border-gray-100 px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Giờ mở cửa</p>
                <p className="font-medium">9:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Film className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Số phòng chiếu</p>
                <p className="font-medium">{theater.screens || '5'} Screens</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Suất chiếu hôm nay</p>
                <p className="font-medium">{Object.keys(screeningsByMovie).length} Phim</p>
              </div>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <MapPin size={18} className="mr-2" />
              Chỉ đường
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* About */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-[#2D3748]">Thông tin về rạp</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{theater.description}</p>
          </div>

          {/* Now Showing */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-[#2D3748]">PHIM</h2>
            </div>
            
            {/* Date Selection */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 rounded-xl p-1.5">
                {days.map((day, index) => (
                  <button
                    key={day.value}
                    onClick={() => setActiveDay(day.value)}
                    className={`flex flex-col items-center min-w-[120px] px-4 py-2 rounded-lg transition-all ${
                      activeDay === day.value
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{day.label}</span>
                    <span className={`text-sm ${activeDay === day.value ? 'text-white/90' : 'text-gray-500'}`}>{day.value}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Hiển thị loading indicator nhỏ khi chuyển ngày */}
            {dayLoading && (
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
              </div>
            )}

            {/* Movies Grid - render theo screeningsByMovie */}
            <div className="relative">
              {Object.keys(screeningsByMovie).length > 0 ? (
                <div className="grid grid-cols-5 gap-4 overflow-hidden px-4">
                  {Object.values(screeningsByMovie).map((movieScreenings) => {
                    const movie = movieScreenings[0].movieId;
                    return (
                      <div key={movie._id} className="group relative cursor-pointer">
                        <div
                          className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center hover:ring-2 ring-blue-400 transition"
                          onClick={() => setSelectedMovieId(selectedMovieId === movie._id ? null : movie._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Overlay dấu tích khi được chọn */}
                          {selectedMovieId === movie._id && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <span className="bg-orange-500 rounded-full p-4 flex items-center justify-center">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            </div>
                          )}
                          {/* Poster phim */}
                          {(() => {
                            const movieFull = movies.find(m => m._id === movie._id);
                            return movieFull?.posterUrl ? (
                              <img
                                src={movieFull.posterUrl}
                                alt={movie.title}
                                className={`w-full h-full object-cover ${selectedMovieId === movie._id ? 'opacity-60' : ''}`}
                                onError={e => { e.currentTarget.src = '/placeholder-movie.jpg'; }}
                              />
                            ) : (
                              <span className="text-lg font-bold text-gray-700">{movie.title}</span>
                            );
                          })()}
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-gray-900 line-clamp-2 text-center">
                          {movie.title}
                        </h3>
                        {selectedMovieId === movie._id && (
                          <div className="mt-2 bg-gray-50 rounded-lg p-4 flex flex-row flex-wrap gap-4">
                            {Object.values(
                              movieScreenings.reduce((acc, screening) => {
                                const hour = dayjs(screening.startTime).format('HH:mm');
                                if (!acc[hour]) acc[hour] = screening;
                                return acc;
                              }, {} as Record<string, Screening>)
                            )
                            // Lọc suất chiếu nếu là hôm nay và giờ chiếu <= giờ hiện tại thì ẩn
                            .filter(screening => {
                              if (activeDay === todayValue) {
                                return dayjs(screening.startTime).isAfter(now);
                              }
                              return true;
                            })
                            .map(screening => (
                              <button
                                key={screening._id}
                                className="px-6 py-2 bg-white border rounded shadow text-base transition-all hover:bg-blue-700 hover:text-white"
                                onClick={() => {
                                  if (!isAuthenticated) {
                                    navigate('/signin');
                                    return;
                                  }
                                  // Lấy đúng ID rạp
                                  const theaterId = typeof screening.theaterId === 'string' ? screening.theaterId : screening.theaterId._id;
                                  // Điều hướng sang trang chọn ghế/checkout, truyền thêm tên rạp
                                  navigate(`/seats/${screening.movieId._id}?date=${dayjs(screening.startTime).format('YYYY-MM-DD')}&time=${dayjs(screening.startTime).format('HH:mm')}&theater=${theaterId}&theaterName=${encodeURIComponent(screening.theaterId.name || '')}&screeningId=${screening._id}&movieTitle=${encodeURIComponent(screening.movieId.title)}&userId=${user?.id}`);
                                }}
                              >
                                {dayjs(screening.startTime).format('HH:mm')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500">Không có suất chiếu</div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-[#2D3748]">Location</h2>
            </div>
            <div className="rounded-lg overflow-hidden">
              {renderMap()}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <MapPin size={16} className="mr-2" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterDetail; 