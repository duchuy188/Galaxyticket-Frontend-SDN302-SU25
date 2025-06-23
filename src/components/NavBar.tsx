import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, ChevronDown, User, LogOut, Ticket, Star, ChevronRight, Calendar } from 'lucide-react';
import { Movie, getMovies } from '../utils/movie';
import { getTheaters, Theater } from '../utils/theater';

interface MovieSection {
  title: string;
  movies: Movie[];
}

interface NavItem {
  name: string;
  path: string;
  items?: string[] | MovieSection[];
  requireAuth?: boolean;
}

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, theatersData] = await Promise.all([
          getMovies(),
          getTheaters()
        ]);
        setMovies(moviesData || []);
        setTheaters(theatersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (user?.role === 'admin' || user?.role === 'staff') {
    return null;
  }

  const nowShowing = movies.filter(movie => movie.showingStatus === 'now-showing');
  const comingSoon = movies.filter(movie => movie.showingStatus === 'coming-soon');

  const navItems: NavItem[] = [
    {
      name: 'Phim',
      path: '/movies',
      items: [
        {
          title: 'ĐANG CHIẾU',
          movies: nowShowing.slice(0, 4)
        },
        {
          title: 'SẮP CHIẾU',
          movies: comingSoon.slice(0, 4)
        }
      ]
    },
    {
      name: 'Rạp Chiếu',
      path: '#',
      items: theaters.map(theater => theater.name)
    },
    {
      name: 'Vé Của Tôi',
      path: '/bookings',
      requireAuth: true
    }
  ];

  return (
    <header className="bg-[#1a237e] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <Film className="h-6 w-6 text-red-500" />
            <span className="text-2xl font-bold text-white">Galaxy Cinema</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              (!item.requireAuth || isAuthenticated) && (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.name === 'Phim' ? (
                    <div className="flex items-center space-x-1 cursor-pointer py-6">
                      <Link 
                        to={item.path}
                        className="text-gray-200 hover:text-white font-medium"
                        onClick={(e) => {
                          if (activeDropdown === item.name) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-200 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  ) : item.name === 'Rạp Chiếu' ? (
                    <button 
                      className="text-gray-200 hover:text-white font-medium flex items-center space-x-1 py-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveDropdown(activeDropdown === item.name ? null : item.name);
                      }}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? 'transform rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link 
                      to={item.path}
                      className="text-gray-200 hover:text-white font-medium flex items-center space-x-1 py-6"
                    >
                      <span>{item.name}</span>
                      {item.items && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? 'transform rotate-180' : ''}`} />}
                    </Link>
                  )}
                  {item.items && activeDropdown === item.name && (
                    <div 
                      className={`absolute left-0 ${item.name === 'Phim' ? 'w-[600px]' : 'w-[280px]'} bg-white rounded-xl shadow-xl py-3 z-50 
                        transform transition-all duration-300 ease-out origin-top mt-0 border border-gray-100
                        ${activeDropdown === item.name 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.name === 'Rạp Chiếu' ? (
                        <div className="grid grid-cols-1 gap-0.5">
                          <div className="px-3 py-2 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chọn Rạp</h3>
                          </div>
                          <div className="p-2">
                            {(item.items as string[]).map((theaterName, index) => {
                              const theater = theaters.find(t => t.name === theaterName);
                              return (
                                <Link
                                  key={index}
                                  to={`/theater/${theater?._id}`}
                                  className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50/80 rounded-lg group relative
                                    before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-transparent
                                    hover:before:border-blue-200 before:transition-colors"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 
                                    group-hover:bg-blue-100 group-hover:shadow-sm transition-all z-10">
                                    <Film className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                                  </div>
                                  <div className="flex-1 z-10">
                                    <span className="font-medium group-hover:text-blue-700 transition-colors">{theaterName}</span>
                                  </div>
                                  <div className="z-10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:ring-4 group-hover:ring-emerald-100 transition-all"></div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Movies dropdown with sections
                        <div>
                          {(item.items as MovieSection[]).map((section, index) => (
                            <div key={section.title} className={index > 0 ? 'mt-2' : ''}>
                              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  {section.title}
                                </h3>
                                <Link 
                                  to="/movies" 
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  Xem tất cả
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                              </div>
                              <div className="grid grid-cols-2 gap-3 p-3">
                                {section.movies.map((movie) => (
                                  <Link
                                    key={movie._id}
                                    to={`/movie/${movie._id}`}
                                    className="flex items-start space-x-3 p-2 rounded-xl hover:bg-gray-50 group/card relative
                                      transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {/* Poster với overlay */}
                                    <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg relative shadow-sm">
                                      <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/placeholder-movie.jpg';
                                        }}
                                      />
                                      {/* Overlay với nút Mua vé */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100
                                        transition-all duration-300 flex items-end justify-center pb-3">
                                        <button className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium
                                          hover:bg-red-700 transition-colors">
                                          Mua vé
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Movie Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-2">
                                        <h3 className="text-gray-900 font-medium group-hover/card:text-blue-600 transition-colors line-clamp-2 text-sm">
                                          {movie.title}
                                        </h3>
                                        <span className={`px-1.5 py-0.5 text-[10px] rounded-sm flex-shrink-0 font-medium ${
                                          movie.ageRating === 'T18' ? 'bg-red-100 text-red-800' :
                                          movie.ageRating === 'T16' ? 'bg-orange-100 text-orange-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {movie.ageRating || 'P'}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <div className="flex items-center">
                                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                          <span className="ml-1 font-medium text-gray-700">{movie.rating || '7.5'}</span>
                                        </div>
                                        {movie.releaseDate && (
                                          <span className="ml-3 flex items-center">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1" />
                                            {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-200 hover:text-white focus:outline-none"
                >
                  <span>{user?.email}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/bookings" 
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      <span>Vé của tôi</span>
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="px-4 py-2 text-gray-200 hover:text-white"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;