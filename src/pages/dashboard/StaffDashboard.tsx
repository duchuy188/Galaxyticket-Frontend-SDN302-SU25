import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showtimes as initialShowtimes } from '../../utils/mockData';
import {  PlusIcon, TicketIcon } from 'lucide-react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  createMovie, updateMovie, deleteMovie, Movie } from '../../utils/movie';
import { getStaffMovies } from '../../utils/movie';

interface SeatLayout {
  showtimeId: string;
  movieTitle: string;
  date: string;
  time: string;
  theater: string;
  unavailableSeats: string[];
}

interface Showtime {
  id: string;
  _id?: string;
  movieId: string;
  date: string;
  time: string;
  theater: string;
}

const API_BASE_URL = 'http://localhost:5173/api'; // Adjust this to match your backend URL

const countries = [
  { value: 'VN', label: 'Việt Nam' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'PT', label: 'Portugal' },
  { value: 'RU', label: 'Russia' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'TH', label: 'Thailand' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'PH', label: 'Philippines' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'LA', label: 'Laos' },
  { value: 'BN', label: 'Brunei' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'MO', label: 'Macau' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Peru' },
  { value: 'CO', label: 'Colombia' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'IE', label: 'Ireland' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'IS', label: 'Iceland' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'HU', label: 'Hungary' },
  { value: 'RO', label: 'Romania' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'GR', label: 'Greece' },
  { value: 'TR', label: 'Turkey' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'MA', label: 'Morocco' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'IL', label: 'Israel' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'OM', label: 'Oman' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'NP', label: 'Nepal' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'MV', label: 'Maldives' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'BY', label: 'Belarus' },
  { value: 'MD', label: 'Moldova' },
  { value: 'HR', label: 'Croatia' },
  { value: 'RS', label: 'Serbia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'AL', label: 'Albania' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'MT', label: 'Malta' }
].sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

const StaffDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState(initialShowtimes);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie> | null>(null);
  const [editingShowtime, setEditingShowtime] = useState<Partial<Showtime> | null>(null);
  const [editingSeatLayout, setEditingSeatLayout] = useState<SeatLayout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newDirector, setNewDirector] = useState('');
  const [newActor, setNewActor] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showingStatusFilter, setShowingStatusFilter] = useState<'all' | 'coming-soon' | 'now-showing' | 'ended'>('all');
  // Check which section we're on
  const isMainDashboard = location.pathname === '/staff';
  const isMovieManagement = location.pathname === '/staff/movies';
  const isScreeningManagement = location.pathname === '/staff/screenings';
  const isPromotionManagement = location.pathname === '/staff/promotions';
  // Thêm state cho movie detail modal
  const [viewingMovie, setViewingMovie] = useState<Movie | null>(null);


  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const params: any = {};
        if (showingStatusFilter !== 'all') params.showingStatus = showingStatusFilter;
        if (statusFilter !== 'all') params.status = statusFilter;  // Đổi từ approvalStatus thành status
        
        const data = await getStaffMovies(params);
        setMovies(data);
      } catch (err) {
        setError('Failed to fetch movies');
        toast.error('Failed to fetch movies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [statusFilter, showingStatusFilter]);

  const handleAddMovie = () => {
    setEditingMovie({
      title: '',
      description: '',
      genre: 'Action',
      duration: 90,
      posterUrl: '',
      trailerUrl: '',
      releaseDate: new Date().toISOString(),
      country: '',
      producer: '',
      directors: [],
      actors: [],
      showingStatus: 'coming-soon'
    });
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie({ ...movie });
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    
    try {
      setIsLoading(true);
      await deleteMovie(movieId);
      setMovies(movies.filter(movie => movie._id !== movieId));
      toast.success('Movie deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete movie');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      setIsLoading(true);

      // Validate file poster
      if (!editingMovie.posterFile && !editingMovie._id) {
        toast.error('Vui lòng chọn poster cho phim');
        return;
      }

      // Validate và clean up directors array
      const directors = (editingMovie.directors || [])
        .map(director => director.trim())
        .filter(director => director.length > 0);

      console.log('Directors before submission:', directors); // Debug directors

      if (directors.length === 0) {
        toast.error('Vui lòng thêm ít nhất một đạo diễn');
        return;
      }

      // Validate và clean up actors array
      const actors = (editingMovie.actors || [])
        .map(actor => actor.trim())
        .filter(actor => actor.length > 0);

      console.log('Actors before submission:', actors); // Debug actors

      if (actors.length === 0) {
        toast.error('Vui lòng thêm ít nhất một diễn viên');
        return;
      }

      const formData = new FormData();
      
      // Thêm các trường cơ bản
      formData.append('title', editingMovie.title?.trim() || '');
      formData.append('description', editingMovie.description?.trim() || '');
      formData.append('genre', editingMovie.genre || '');
      formData.append('duration', String(editingMovie.duration || 0));
      formData.append('releaseDate', editingMovie.releaseDate || new Date().toISOString());
      formData.append('country', editingMovie.country?.trim() || '');
      formData.append('producer', editingMovie.producer?.trim() || '');
      formData.append('showingStatus', editingMovie.showingStatus || 'coming-soon');

      // Gửi directors và actors như một mảng JSON
      formData.append('directors', JSON.stringify(directors));
      formData.append('actors', JSON.stringify(actors));

      // Thêm poster nếu có
      if (editingMovie.posterFile) {
        formData.append('poster', editingMovie.posterFile);
      }

      // Thêm trailer URL nếu có
      if (editingMovie.trailerUrl) {
        formData.append('trailerUrl', editingMovie.trailerUrl.trim());
      }

      // Log formData để kiểm tra
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (editingMovie._id) {
        // Cập nhật phim
        const updatedMovie = await updateMovie(editingMovie._id, formData);
        setMovies(movies.map(movie => 
          movie._id === updatedMovie._id ? updatedMovie : movie
        ));
        toast.success('Cập nhật phim thành công!');
      } else {
        // Tạo phim mới
        const newMovie = await createMovie(formData);
        setMovies([...movies, newMovie]);
        toast.success('Thêm phim thành công!');
      }
      
      setEditingMovie(null);
    } catch (err) {
      console.error('Error saving movie:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Có lỗi xảy ra khi lưu phim');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Showtime Management Functions
  const handleAddShowtime = () => {
    setEditingShowtime({
      movieId: movies[0]?._id || '',
      date: '',
      time: '',
      theater: ''
    });
  };
  const handleEditShowtime = (showtime: any) => {
    setEditingShowtime({
      ...showtime
    });
  };
  const handleSaveShowtime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShowtime) return;
    
    try {
      const newShowtimeData: Showtime = {
        id: editingShowtime.id || `showtime-${Date.now()}`,
        movieId: editingShowtime.movieId || '',
        date: editingShowtime.date || '',
        time: editingShowtime.time || '',
        theater: editingShowtime.theater || ''
      };

      if (editingShowtime.id) {
        // Update existing showtime
        setShowtimes(showtimes.map(showtime => 
          showtime.id === editingShowtime.id ? newShowtimeData : showtime
        ));
        toast.success('Lịch chiếu đã được cập nhật thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Add new showtime
        setShowtimes([...showtimes, newShowtimeData]);
        toast.success('Lịch chiếu mới đã được thêm thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setEditingShowtime(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu lịch chiếu!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // Seat Layout Management
  const handleEditSeatLayout = (showtimeId: string) => {
    const showtime = showtimes.find(st => st.id === showtimeId);
    if (!showtime) return;
    
    const movie = movies.find(m => m._id === showtime.movieId);
    setEditingSeatLayout({
      showtimeId,
      movieTitle: movie?.title || '',
      date: showtime.date,
      time: showtime.time,
      theater: showtime.theater,
      unavailableSeats: ['A3', 'B5', 'C2', 'C3', 'D4', 'E5', 'F2']
    });
  };
  const handleToggleSeatStatus = (seatId: string) => {
    if (!editingSeatLayout) return;
    setEditingSeatLayout((prev: SeatLayout | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        unavailableSeats: prev.unavailableSeats.includes(seatId) 
          ? prev.unavailableSeats.filter((id: string) => id !== seatId) 
          : [...prev.unavailableSeats, seatId]
      };
    });
  };
  const handleSaveSeatLayout = () => {
    try {
      // In a real app, you would save this to a database
      toast.success('Sơ đồ ghế đã được cập nhật thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      setEditingSeatLayout(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật sơ đồ ghế!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Thêm function để filter movies
  const filteredMovies = movies.filter(movie => {
    if (showingStatusFilter !== 'all' && movie.showingStatus !== showingStatusFilter) return false;
    if (statusFilter !== 'all' && movie.status !== statusFilter) return false;
    return true;
  });

  // Thêm function để handle view movie
  const handleViewMovie = (movie: Movie) => {
    setViewingMovie(movie);
  };

  const renderMainDashboard = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Movies</h3>
          <p className="text-3xl font-bold">{movies.length}</p>
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center" onClick={() => navigate('/staff/movies')}>
            <PlusIcon size={16} className="mr-1" />
            Add New Movie
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Screenings</h3>
          <p className="text-3xl font-bold">{showtimes.length}</p>
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center" onClick={() => navigate('/staff/screenings')}>
            <PlusIcon size={16} className="mr-1" />
            Add New Screening
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Promotions</h3>
          <p className="text-3xl font-bold">3</p>
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center" onClick={() => navigate('/staff/promotions')}>
            <TicketIcon size={16} className="mr-1" />
            Manage Promotions
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Now Showing Movies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies.filter(movie => movie.showingStatus === 'now-showing').map(movie => <tr key={movie._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" 
                               src={movie.posterUrl} 
                               alt={movie.title} 
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.src = '/placeholder-movie.jpg';
                               }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {movie.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{movie.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{movie.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="group relative p-2 hover:bg-blue-50 rounded-full"
                          onClick={() => handleViewMovie(movie)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Xem chi tiết
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        <button 
                          className="group relative p-2 hover:bg-blue-50 rounded-full"
                          onClick={() => handleEditMovie(movie)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Chỉnh sửa
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>

                        <button 
                          className="group relative p-2 hover:bg-red-50 rounded-full"
                          onClick={() => handleDeleteMovie(movie._id)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Xóa
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Screenings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Theater
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showtimes.slice(0, 5).map(showtime => {
                const movieData = movies.find(m => m._id === showtime.movieId);
                return <tr key={showtime.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {movieData?.title || 'Unknown Movie'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {showtime.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {showtime.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {showtime.theater}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditShowtime(showtime)} className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleEditSeatLayout(showtime.id)} className="text-green-600 hover:text-green-900">
                          Seats
                        </button>
                      </td>
                    </tr>;
              })}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => navigate('/staff/screenings')}>
              View All Screenings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderMovieManagement = () => (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Movie Management</h2>
        <div className="flex items-center gap-4">
          <select 
            value={showingStatusFilter}
            onChange={(e) => setShowingStatusFilter(e.target.value as typeof showingStatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="now-showing">Đang Chiếu</option>
            <option value="coming-soon">Sắp Chiếu</option>
            <option value="ended">Đã Kết Thúc</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md ml-2"
          >
            <option value="all">Tất Cả Phê Duyệt</option>
            <option value="pending">Chờ Duyệt</option>
            <option value="approved">Đã Duyệt</option>
            <option value="rejected">Từ Chối</option>
          </select>

          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleAddMovie}
            disabled={isLoading}
          >
            <PlusIcon size={18} className="mr-1" />
            Thêm Phim
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Phim
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thể Loại
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời Lượng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày Khởi Chiếu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovies.map(movie => (
              <tr key={movie._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-md object-cover" 
                           src={movie.posterUrl} 
                           alt={movie.title} 
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = '/placeholder-movie.jpg';
                           }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {movie.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{movie.genre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{movie.duration} min</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${movie.showingStatus === 'now-showing' ? 'bg-green-100 text-green-800' : 
                      movie.showingStatus === 'coming-soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {movie.showingStatus === 'now-showing' ? 'Đang Chiếu' : 
                     movie.showingStatus === 'coming-soon' ? 'Sắp Chiếu' : 'Đã Kết Thúc'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="group relative p-2 hover:bg-blue-50 rounded-full"
                      onClick={() => handleViewMovie(movie)}
                    >
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                        Xem chi tiết
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button 
                      className="group relative p-2 hover:bg-blue-50 rounded-full"
                      onClick={() => handleEditMovie(movie)}
                    >
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                        Chỉnh sửa
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>

                    <button 
                      className="group relative p-2 hover:bg-red-50 rounded-full"
                      onClick={() => handleDeleteMovie(movie._id)}
                    >
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                        Xóa
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Movie Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMovie._id ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}
                </h3>
                <button 
                  onClick={() => setEditingMovie(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveMovie} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tên Phim
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                      value={editingMovie.title || ''} 
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        title: e.target.value
                      })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Thể Loại
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={editingMovie.genre || 'Action'}
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        genre: e.target.value as Movie['genre']
                      })}
                      required
                    >
                      {[
                        { value: 'Action', label: 'Hành Động (Action)' },
                        { value: 'Adventure', label: 'Phiêu Lưu (Adventure)' },
                        { value: 'Animation', label: 'Hoạt Hình (Animation)' },
                        { value: 'Biography', label: 'Tiểu Sử (Biography)' },
                        { value: 'Comedy', label: 'Hài Hước (Comedy)' },
                        { value: 'Crime', label: 'Tội Phạm (Crime)' },
                        { value: 'Documentary', label: 'Tài Liệu (Documentary)' },
                        { value: 'Drama', label: 'Chính Kịch (Drama)' },
                        { value: 'Family', label: 'Gia Đình (Family)' },
                        { value: 'Fantasy', label: 'Viễn Tưởng (Fantasy)' },
                        { value: 'Historical', label: 'Lịch Sử (Historical)' },
                        { value: 'Horror', label: 'Kinh Dị (Horror)' },
                        { value: 'Musical', label: 'Âm Nhạc (Musical)' },
                        { value: 'Mystery', label: 'Bí Ẩn (Mystery)' },
                        { value: 'Mythology', label: 'Thần Thoại (Mythology)' },
                        { value: 'Romance', label: 'Lãng Mạn (Romance)' },
                        { value: 'Sports', label: 'Thể Thao (Sports)' },
                        { value: 'Thriller', label: 'Giật Gân (Thriller)' },
                        { value: 'War', label: 'Chiến Tranh (War)' },
                        { value: 'Western', label: 'Cao Bồi (Western)' }
                      ].map(genre => (
                        <option key={genre.value} value={genre.value}>
                          {genre.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Thời Lượng (phút)
                    </label>
                    <input 
                      type="number" 
                      min="30"
                      max="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                      value={editingMovie.duration || 90} 
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        duration: parseInt(e.target.value)
                      })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày Khởi Chiếu
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                      value={editingMovie.releaseDate ? new Date(editingMovie.releaseDate).toISOString().split('T')[0] : ''} 
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        releaseDate: new Date(e.target.value).toISOString()
                      })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quốc Gia
                    </label>
                    <Select
                      options={countries}
                      value={countries.find(country => country.label === editingMovie.country) || null}
                      onChange={(selected) => setEditingMovie({
                        ...editingMovie,
                        country: selected?.label || ''
                      })}
                      placeholder="Chọn quốc gia..."
                      isClearable
                      className="w-full"
                      classNamePrefix="select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#D1D5DB',
                          '&:hover': {
                            borderColor: '#9CA3AF'
                          }
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#DBEAFE' : 'white',
                          color: state.isSelected ? 'white' : '#111827',
                          '&:active': {
                            backgroundColor: '#BFDBFE'
                          }
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nhà Sản Xuất
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                      value={editingMovie.producer || ''} 
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        producer: e.target.value
                      })} 
                      placeholder="VD: Marvel Studios"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Đạo Diễn
                    </label>
                    <div className="space-y-2">
                      {editingMovie.directors?.map((director: string, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                            value={director}
                            onChange={e => {
                              const newDirectors = [...(editingMovie.directors || [])];
                              newDirectors[index] = e.target.value;
                              setEditingMovie({
                                ...editingMovie,
                                directors: newDirectors
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newDirectors = editingMovie.directors?.filter((_, i) => i !== index) || [];
                              setEditingMovie({
                                ...editingMovie,
                                directors: newDirectors
                              });
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                          value={newDirector}
                          onChange={e => setNewDirector(e.target.value)}
                          placeholder="Nhập tên đạo diễn"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newDirector.trim()) {
                              setEditingMovie({
                                ...editingMovie,
                                directors: [...(editingMovie.directors || []), newDirector.trim()]
                              });
                              setNewDirector('');
                            }
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Diễn Viên
                    </label>
                    <div className="space-y-2">
                      {editingMovie.actors?.map((actor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                            value={actor}
                            onChange={e => {
                              const newActors = [...(editingMovie.actors || [])];
                              newActors[index] = e.target.value;
                              setEditingMovie({
                                ...editingMovie,
                                actors: newActors
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newActors = editingMovie.actors?.filter((_, i) => i !== index) || [];
                              setEditingMovie({
                                ...editingMovie,
                                actors: newActors
                              });
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                          value={newActor}
                          onChange={e => setNewActor(e.target.value)}
                          placeholder="Nhập tên diễn viên"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newActor.trim()) {
                              setEditingMovie({
                                ...editingMovie,
                                actors: [...(editingMovie.actors || []), newActor.trim()]
                              });
                              setNewActor('');
                            }
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Poster
                    </label>
                    <div className="flex items-center space-x-4">
                      {(previewImage || editingMovie.posterUrl) && (
                        <div className="flex-shrink-0">
                          <img 
                            src={previewImage || editingMovie.posterUrl} 
                            alt="Movie poster preview" 
                            className="h-32 w-24 object-cover rounded-md border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-movie.jpg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            setUploadError(null);
                            
                            if (file) {
                              // Validate file size (5MB limit)
                              if (file.size > 5 * 1024 * 1024) {
                                setUploadError('File size must be less than 5MB');
                                return;
                              }

                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                setUploadError('Only image files are allowed');
                                return;
                              }

                              // Create local preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreviewImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);

                              // Store the file object
                              setEditingMovie({
                                ...editingMovie,
                                posterFile: file
                              });
                            }
                          }}
                        />
                        <div className="mt-1">
                          {uploadError ? (
                            <p className="text-xs text-red-500">{uploadError}</p>
                          ) : (
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Trailer URL
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                      value={editingMovie.trailerUrl || ''} 
                      onChange={e => setEditingMovie({
                        ...editingMovie,
                        trailerUrl: e.target.value
                      })} 
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mô Tả
                  </label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    rows={4} 
                    value={editingMovie.description || ''} 
                    onChange={e => setEditingMovie({
                      ...editingMovie,
                      description: e.target.value
                    })} 
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng Thái
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="relative flex items-center group cursor-pointer">
                      <input 
                        type="radio" 
                        className="absolute w-0 h-0 opacity-0 peer" 
                        checked={editingMovie.showingStatus === 'coming-soon'} 
                        onChange={() => setEditingMovie({
                          ...editingMovie,
                          showingStatus: 'coming-soon'
                        })} 
                      />
                      <div className="px-4 py-2 rounded-full border-2 border-yellow-400 bg-yellow-50 text-yellow-700 peer-checked:bg-yellow-400 peer-checked:text-white transition-all duration-200 group-hover:bg-yellow-100 peer-checked:group-hover:bg-yellow-500 relative">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">Sắp Chiếu</span>
                        </div>
                        <div className="absolute -right-1 -top-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white peer-checked:opacity-100 opacity-0 transition-opacity duration-200 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative flex items-center group cursor-pointer">
                      <input 
                        type="radio" 
                        className="absolute w-0 h-0 opacity-0 peer" 
                        checked={editingMovie.showingStatus === 'now-showing'} 
                        onChange={() => setEditingMovie({
                          ...editingMovie,
                          showingStatus: 'now-showing'
                        })} 
                      />
                      <div className="px-4 py-2 rounded-full border-2 border-green-400 bg-green-50 text-green-700 peer-checked:bg-green-400 peer-checked:text-white transition-all duration-200 group-hover:bg-green-100 peer-checked:group-hover:bg-green-500 relative">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">Đang Chiếu</span>
                        </div>
                        <div className="absolute -right-1 -top-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white peer-checked:opacity-100 opacity-0 transition-opacity duration-200 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative flex items-center group cursor-pointer">
                      <input 
                        type="radio" 
                        className="absolute w-0 h-0 opacity-0 peer" 
                        checked={editingMovie.showingStatus === 'ended'} 
                        onChange={() => setEditingMovie({
                          ...editingMovie,
                          showingStatus: 'ended'
                        })} 
                      />
                      <div className="px-4 py-2 rounded-full border-2 border-gray-400 bg-gray-50 text-gray-700 peer-checked:bg-gray-400 peer-checked:text-white transition-all duration-200 group-hover:bg-gray-100 peer-checked:group-hover:bg-gray-500 relative">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium">Đã Kết Thúc</span>
                        </div>
                        <div className="absolute -right-1 -top-1 w-5 h-5 bg-gray-400 rounded-full border-2 border-white peer-checked:opacity-100 opacity-0 transition-opacity duration-200 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                    onClick={() => setEditingMovie(null)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingMovie._id ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Movie Detail Modal */}
      {viewingMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingMovie.title}</h3>
                  {viewingMovie.vietnameseTitle && (
                    <p className="text-gray-600 mt-1">{viewingMovie.vietnameseTitle}</p>
                  )}
                </div>
                <button 
                  onClick={() => setViewingMovie(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Poster */}
                <div className="col-span-12 md:col-span-4">
                  <img
                    src={viewingMovie.posterUrl}
                    alt={viewingMovie.title}
                    className="w-full h-[500px] object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-movie.jpg';
                    }}
                  />
                </div>

                {/* Middle Column - Details */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Thể Loại:</span>
                      <p className="mt-1">{viewingMovie.genre}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Thời Lượng:</span>
                      <p className="mt-1">{viewingMovie.duration} phút</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Ngày Khởi Chiếu:</span>
                      <p className="mt-1">{new Date(viewingMovie.releaseDate).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Quốc Gia:</span>
                      <p className="mt-1">{viewingMovie.country}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Nhà Sản Xuất:</span>
                      <p className="mt-1">{viewingMovie.producer}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Trạng Thái:</span>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          viewingMovie.status === 'approved' ? 'bg-green-100 text-green-800' :
                          viewingMovie.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {viewingMovie.status === 'approved' ? 'Đã Duyệt' :
                           viewingMovie.status === 'pending' ? 'Chờ Duyệt' : 'Từ Chối'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          viewingMovie.showingStatus === 'now-showing' ? 'bg-blue-100 text-blue-800' :
                          viewingMovie.showingStatus === 'coming-soon' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {viewingMovie.showingStatus === 'now-showing' ? 'Đang Chiếu' :
                           viewingMovie.showingStatus === 'coming-soon' ? 'Sắp Chiếu' : 'Đã Kết Thúc'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Đạo Diễn:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingMovie.directors?.map((director, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {director}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Diễn Viên:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingMovie.actors?.map((actor, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Mô Tả:</span>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">{viewingMovie.description}</p>
                  </div>

                  {viewingMovie.trailerUrl && (
                    <div>
                      <span className="font-medium text-gray-700">Trailer:</span>
                      <div className="mt-2 aspect-video">
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${getYouTubeId(viewingMovie.trailerUrl)}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {viewingMovie.status === 'rejected' && viewingMovie.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <span className="font-medium text-red-800">Lý Do Từ Chối:</span>
                      <p className="mt-1 text-red-600">{viewingMovie.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Showtime Modal */}
      {editingShowtime && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingShowtime.id ? 'Edit Screening' : 'Add New Screening'}
              </h3>
              <form onSubmit={handleSaveShowtime}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Movie
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editingShowtime.movieId} onChange={e => setEditingShowtime({
                ...editingShowtime,
                movieId: e.target.value
              })} required>
                    <option value="">Select a movie</option>
                    {movies.map(movie => (
                      <option key={movie._id} value={movie._id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Date
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="YYYY-MM-DD" value={editingShowtime.date} onChange={e => setEditingShowtime({
                ...editingShowtime,
                date: e.target.value
              })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Time
                  </label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g. 10:00 AM" value={editingShowtime.time} onChange={e => setEditingShowtime({
                ...editingShowtime,
                time: e.target.value
              })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Theater
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editingShowtime.theater} onChange={e => setEditingShowtime({
                ...editingShowtime,
                theater: e.target.value
              })} required>
                    <option value="">Select a theater</option>
                    <option value="Theater 1">Theater 1</option>
                    <option value="Theater 2">Theater 2</option>
                    <option value="Theater 3">Theater 3</option>
                    <option value="Theater 4">Theater 4</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setEditingShowtime(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}
      {/* Seat Layout Editor Modal */}
      {editingSeatLayout && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Seat Layout Editor</h3>
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Movie:</span>{' '}
                  {editingSeatLayout.movieTitle}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Showtime:</span>{' '}
                  {editingSeatLayout.date} at {editingSeatLayout.time},{' '}
                  {editingSeatLayout.theater}
                </p>
              </div>
              <div className="mb-8 p-4 bg-gray-800 text-white text-center rounded-lg">
                <div className="w-full h-2 bg-gray-600 rounded-lg mb-8"></div>
                <p className="text-sm">SCREEN</p>
              </div>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D', 'E', 'F'].map(row => <div key={row} className="flex items-center">
                    <div className="w-6 text-center font-medium mr-2">
                      {row}
                    </div>
                    <div className="grid grid-cols-8 gap-2 flex-1">
                      {Array.from({
                  length: 8
                }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const isUnavailable = editingSeatLayout.unavailableSeats.includes(seatId);
                  return <button key={seatId} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${isUnavailable ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`} onClick={() => handleToggleSeatStatus(seatId)}>
                              {seatId}
                            </button>;
                })}
                    </div>
                  </div>)}
              </div>
              <div className="mt-8 flex justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-1"></div>
                    <span className="text-sm">Unavailable</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setEditingSeatLayout(null)}>
                    Cancel
                  </button>
                  <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handleSaveSeatLayout}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>
  );
  const renderPromotionManagement = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Promotion Management</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <PlusIcon size={18} className="mr-1" />
            Add Promotion
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Active Promotions</h3>
          <div className="space-y-4">
            {/* First Promotion Card */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <TicketIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-blue-800">
                      Student Discount - 20% Off
                    </h4>
                    <span className="text-sm text-blue-500">Active until Dec 31, 2023</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Code:</span> STUDENT20
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Discount:</span> 20% off all tickets
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requirements:</span> Valid student ID required
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 mr-2">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Promotion Card */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <TicketIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-blue-800">
                      Family Package - Buy 3 Get 1 Free
                    </h4>
                    <span className="text-sm text-blue-500">Active until Jan 15, 2024</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Code:</span> FAMILY4
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Offer:</span> Buy 3 tickets, get 1 free
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Applicable:</span> All movies on weekends
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 mr-2">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Promotions</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Holiday Special
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  HOLIDAY25
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  25% off
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Dec 20, 2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderScreeningManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản Lý Lịch Chiếu</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddShowtime}
        >
          <PlusIcon size={18} className="mr-1" />
          Thêm Lịch Chiếu
        </button>
      </div>
      {/* Rest of your screening management UI */}
    </div>
  );

  return <div>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      {isMainDashboard && renderMainDashboard()}
      {isMovieManagement && renderMovieManagement()}
      {isScreeningManagement && renderScreeningManagement()}
      {isPromotionManagement && renderPromotionManagement()}
    </div>;
};
export default StaffDashboard;

// Thêm helper function để lấy YouTube video ID
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const uploadPoster = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
};