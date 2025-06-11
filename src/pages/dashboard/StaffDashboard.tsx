import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movies as initialMovies, showtimes as initialShowtimes } from '../../utils/mockData';
import { EditIcon, TrashIcon, PlusIcon, FilmIcon, AlertCircleIcon } from 'lucide-react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Movie {
  _id: string;
  id?: string;
  title: string;
  description: string;
  genre: 'Western' | 'War' | 'Family' | 'Fantasy' | 'Thriller' | 'Comedy' |
          'Action' | 'Crime' | 'Animation' | 'Horror' | 'Romance' | 'Historical' |
          'Mystery' | 'Musical' | 'Adventure' | 'Documentary' | 'Drama' | 'Mythology' |
          'Sports' | 'Biography';
  duration: number;
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  createdBy: string;
  approvedBy: string | null;
  isActive: boolean;
  country: string;
  showingStatus: 'coming-soon' | 'now-showing' | 'ended';
  producer: string;
  directors: string[];
  actors: string[];
  createdAt: string;
  updatedAt: string;
}

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
  const [isUploading, setIsUploading] = useState(false);
  // Check which section we're on
  const isMainDashboard = location.pathname === '/staff';
  const isMovieManagement = location.pathname === '/staff/movies';
  const isScreeningManagement = location.pathname === '/staff/screenings';
  const isPaymentIssues = location.pathname === '/staff/payments';

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/movies/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!window.confirm('Bạn có chắc chắn muốn xóa phim này?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      setMovies(movies.filter(movie => movie._id !== movieId));
      toast.success('Phim đã được xóa thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xóa phim!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
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

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      const method = editingMovie._id ? 'PUT' : 'POST';
      const url = editingMovie._id 
        ? `${API_BASE_URL}/movies/${editingMovie._id}` 
        : `${API_BASE_URL}/movies/create`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingMovie)
      });

      if (!response.ok) {
        throw new Error('Failed to save movie');
      }

      const savedMovie = await response.json();
      
      if (editingMovie._id) {
        setMovies(movies.map(movie => 
          movie._id === savedMovie.data._id ? savedMovie.data : movie
        ));
        toast.success('Phim đã được cập nhật thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setMovies([...movies, savedMovie.data]);
        toast.success('Phim mới đã được thêm thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setEditingMovie(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu thông tin phim!', {
        position: "top-right",
        autoClose: 3000,
      });
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
  const handleDeleteShowtime = (showtimeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
      try {
        setShowtimes(showtimes.filter(showtime => showtime.id !== showtimeId));
        toast.success('Lịch chiếu đã được xóa thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        toast.error('Có lỗi xảy ra khi xóa lịch chiếu!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
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
  const renderMainDashboard = () => <div>
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
          <h3 className="text-lg font-semibold mb-2">Payment Issues</h3>
          <p className="text-3xl font-bold">2</p>
          <button className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium flex items-center" onClick={() => navigate('/staff/payments')}>
            <AlertCircleIcon size={16} className="mr-1" />
            Resolve Issues
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
                      <button onClick={() => handleEditMovie(movie)} 
                              className="text-blue-600 hover:text-blue-900 mr-3">
                        <EditIcon size={18} />
                      </button>
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
    </div>;
  const renderMovieManagement = () => <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Movie Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center" onClick={handleAddMovie}>
          <PlusIcon size={18} className="mr-1" />
          Add Movie
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movies.map(movie => (
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
                  <button onClick={() => handleEditMovie(movie)} 
                          className="text-blue-600 hover:text-blue-900 mr-3">
                    <EditIcon size={18} />
                  </button>
                  <button onClick={() => handleDeleteMovie(movie._id)} 
                          className="text-red-600 hover:text-red-900">
                    <TrashIcon size={18} />
                  </button>
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
                      {editingMovie.directors?.map((director, index) => (
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
                          disabled={isUploading}
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

                              // Set the file as posterUrl directly without uploading yet
                              setEditingMovie({
                                ...editingMovie,
                                posterUrl: URL.createObjectURL(file)
                              });
                            }
                          }}
                        />
                        <div className="mt-1">
                          {isUploading && (
                            <p className="text-xs text-blue-500">Uploading image...</p>
                          )}
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
    </div>;
  const renderScreeningManagement = () => <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Screening Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center" onClick={handleAddShowtime}>
          <PlusIcon size={18} className="mr-1" />
          Add Screening
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            {showtimes.map(showtime => {
              const movieInfo = movies.find(m => m._id === showtime.movieId);
              return <tr key={showtime.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movieInfo && <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={movieInfo.posterUrl} alt={movieInfo.title} />
                          </div>}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {movieInfo?.title || 'Unknown Movie'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{showtime.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{showtime.time}</div>
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
                      <button onClick={() => handleDeleteShowtime(showtime.id)} className="text-red-600 hover:text-red-900 mr-3">
                        <TrashIcon size={18} />
                      </button>
                      <button onClick={() => handleEditSeatLayout(showtime.id)} className="text-green-600 hover:text-green-900">
                        Seats
                      </button>
                    </td>
                  </tr>;
            })}
          </tbody>
        </table>
      </div>
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
    </div>;
  const renderPaymentIssues = () => <div>
      <h2 className="text-2xl font-bold mb-6">Payment Issues</h2>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Failed Payments</h3>
        <div className="space-y-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 w-full">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-red-800">
                    Payment Failed: Transaction #VNP-12345
                  </h4>
                  <span className="text-sm text-red-500">2 hours ago</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer:</span> John Smith
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Movie:</span> Inception
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Amount:</span> $45.00
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Error:</span> Card declined by
                    bank
                  </p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 mr-2">
                    Contact Customer
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 w-full">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-red-800">
                    Payment Failed: Transaction #VNP-12346
                  </h4>
                  <span className="text-sm text-red-500">5 hours ago</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer:</span> Jane Doe
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Movie:</span> The Dark Knight
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Amount:</span> $30.00
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Error:</span> Gateway timeout
                  </p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 mr-2">
                    Contact Customer
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recently Resolved Issues</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolved By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                VNP-12340
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Michael Johnson
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Insufficient funds
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                $25.00
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Staff User
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                VNP-12341
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Sarah Williams
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Network error
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                $35.00
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Admin User
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  return <div>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      {isMainDashboard && renderMainDashboard()}
      {isMovieManagement && renderMovieManagement()}
      {isScreeningManagement && renderScreeningManagement()}
      {isPaymentIssues && renderPaymentIssues()}
    </div>;
};
export default StaffDashboard;