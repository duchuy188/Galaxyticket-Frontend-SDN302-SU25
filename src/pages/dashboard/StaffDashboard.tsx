import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movies as initialMovies, showtimes as initialShowtimes } from '../../utils/mockData';
import { EditIcon, TrashIcon, PlusIcon, FilmIcon, AlertCircleIcon } from 'lucide-react';
const StaffDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState(initialMovies);
  const [showtimes, setShowtimes] = useState(initialShowtimes);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [editingShowtime, setEditingShowtime] = useState<any>(null);
  const [editingSeatLayout, setEditingSeatLayout] = useState<any>(null);
  // Check which section we're on
  const isMainDashboard = location.pathname === '/staff';
  const isMovieManagement = location.pathname === '/staff/movies';
  const isScreeningManagement = location.pathname === '/staff/screenings';
  const isPaymentIssues = location.pathname === '/staff/payments';
  // Movie Management Functions
  const handleAddMovie = () => {
    setEditingMovie({
      id: '',
      title: '',
      genre: '',
      duration: '',
      description: '',
      image: '',
      trailer: '',
      releaseDate: '',
      isNowShowing: true
    });
  };
  const handleEditMovie = (movie: any) => {
    setEditingMovie({
      ...movie
    });
  };
  const handleDeleteMovie = (movieId: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      setMovies(movies.filter(movie => movie.id !== movieId));
    }
  };
  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    if (editingMovie.id) {
      // Update existing movie
      setMovies(movies.map(movie => movie.id === editingMovie.id ? {
        ...editingMovie
      } : movie));
    } else {
      // Add new movie
      const newMovie = {
        ...editingMovie,
        id: `movie-${Date.now()}`
      };
      setMovies([...movies, newMovie]);
    }
    setEditingMovie(null);
  };
  // Showtime Management Functions
  const handleAddShowtime = () => {
    setEditingShowtime({
      id: '',
      movieId: movies[0]?.id || '',
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
    if (window.confirm('Are you sure you want to delete this showtime?')) {
      setShowtimes(showtimes.filter(showtime => showtime.id !== showtimeId));
    }
  };
  const handleSaveShowtime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShowtime) return;
    if (editingShowtime.id) {
      // Update existing showtime
      setShowtimes(showtimes.map(showtime => showtime.id === editingShowtime.id ? {
        ...editingShowtime
      } : showtime));
    } else {
      // Add new showtime
      const newShowtime = {
        ...editingShowtime,
        id: `showtime-${Date.now()}`
      };
      setShowtimes([...showtimes, newShowtime]);
    }
    setEditingShowtime(null);
  };
  // Seat Layout Management
  const handleEditSeatLayout = (showtimeId: string) => {
    const showtime = showtimes.find(st => st.id === showtimeId);
    if (!showtime) return;
    // Mock seat layout data
    setEditingSeatLayout({
      showtimeId,
      movieTitle: movies.find(m => m.id === showtime.movieId)?.title || '',
      date: showtime.date,
      time: showtime.time,
      theater: showtime.theater,
      unavailableSeats: ['A3', 'B5', 'C2', 'C3', 'D4', 'E5', 'F2']
    });
  };
  const handleToggleSeatStatus = (seatId: string) => {
    if (!editingSeatLayout) return;
    setEditingSeatLayout(prev => ({
      ...prev,
      unavailableSeats: prev.unavailableSeats.includes(seatId) ? prev.unavailableSeats.filter(id => id !== seatId) : [...prev.unavailableSeats, seatId]
    }));
  };
  const handleSaveSeatLayout = () => {
    // In a real app, you would save this to a database
    // For this demo, we'll just close the modal
    setEditingSeatLayout(null);
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
              {movies.filter(movie => movie.isNowShowing).map(movie => <tr key={movie.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={movie.image} alt="" />
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
                      <div className="text-sm text-gray-500">
                        {movie.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {movie.releaseDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditMovie(movie)} className="text-blue-600 hover:text-blue-900">
                        Edit
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
              const movie = movies.find(m => m.id === showtime.movieId);
              return <tr key={showtime.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movie?.title || 'Unknown Movie'}
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
            {movies.map(movie => <tr key={movie.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-md object-cover" src={movie.image} alt="" />
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
                  <div className="text-sm text-gray-500">{movie.duration}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {movie.releaseDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${movie.isNowShowing ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {movie.isNowShowing ? 'Now Showing' : 'Coming Soon'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditMovie(movie)} className="text-blue-600 hover:text-blue-900 mr-3">
                    <EditIcon size={18} />
                  </button>
                  <button onClick={() => handleDeleteMovie(movie.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon size={18} />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Movie Modal */}
      {editingMovie && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingMovie.id ? 'Edit Movie' : 'Add New Movie'}
              </h3>
              <form onSubmit={handleSaveMovie}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Title
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.title} onChange={e => setEditingMovie({
                  ...editingMovie,
                  title: e.target.value
                })} required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Genre
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.genre} onChange={e => setEditingMovie({
                  ...editingMovie,
                  genre: e.target.value
                })} required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Duration (e.g. 120 min)
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.duration} onChange={e => setEditingMovie({
                  ...editingMovie,
                  duration: e.target.value
                })} required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Release Date
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.releaseDate} onChange={e => setEditingMovie({
                  ...editingMovie,
                  releaseDate: e.target.value
                })} required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Poster Image URL
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.image} onChange={e => setEditingMovie({
                  ...editingMovie,
                  image: e.target.value
                })} required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      YouTube Trailer ID
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingMovie.trailer} onChange={e => setEditingMovie({
                  ...editingMovie,
                  trailer: e.target.value
                })} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-md" rows={4} value={editingMovie.description} onChange={e => setEditingMovie({
                  ...editingMovie,
                  description: e.target.value
                })} required></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={editingMovie.isNowShowing} onChange={e => setEditingMovie({
                    ...editingMovie,
                    isNowShowing: e.target.checked
                  })} />
                      <span className="ml-2 text-gray-700">Now Showing</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setEditingMovie(null)}>
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
            const movie = movies.find(m => m.id === showtime.movieId);
            return <tr key={showtime.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {movie && <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={movie.image} alt="" />
                        </div>}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {movie?.title || 'Unknown Movie'}
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
                      <EditIcon size={18} />
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
                    {movies.map(movie => <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>)}
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
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      {isMainDashboard && renderMainDashboard()}
      {isMovieManagement && renderMovieManagement()}
      {isScreeningManagement && renderScreeningManagement()}
      {isPaymentIssues && renderPaymentIssues()}
    </div>;
};
export default StaffDashboard;