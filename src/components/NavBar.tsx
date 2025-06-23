import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, ChevronDown, User, LogOut, Ticket, Star } from 'lucide-react';
import { Movie } from '../utils/movie';

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

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'manager') {
    return null;
  }

  const navItems: NavItem[] = [
    {
      name: 'Movies',
      path: '/movies',
      items: [
        {
          title: 'NOW SHOWING',
          movies: []
        },
        {
          title: 'COMING SOON',
          movies: []
        }
      ]
    },
    {
      name: 'Theaters',
      path: '/theaters',
      items: ['All Theaters', 'Special Screens', 'Theater Rules']
    },
    {
      name: 'My Bookings',
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
                  {item.name === 'Movies' ? (
                    <div className="flex items-center space-x-1 cursor-pointer py-6">
                      <Link 
                        to={item.path}
                        className="text-gray-200 hover:text-white font-medium"
                      >
                        {item.name}
                      </Link>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-200 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
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
                      className={`absolute left-0 w-[600px] bg-white rounded-lg shadow-xl py-4 z-50 transform transition-all duration-200 ease-out ${
                        activeDropdown === item.name 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 -translate-y-2'
                      }`}
                      style={{ top: '100%' }}
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {Array.isArray(item.items) && typeof item.items[0] === 'string' ? (
                        item.items.map((subItem) => (
                          <Link
                            key={subItem}
                            to={`${item.path}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600"
                          >
                            {subItem}
                          </Link>
                        ))
                      ) : (
                        // Movies dropdown with sections
                        (item.items as MovieSection[]).map((section, index) => (
                          <div key={section.title} className={`px-4 ${index > 0 ? 'mt-4' : ''}`}>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-2">
                              {section.title}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {section.movies.map((movie) => (
                                <Link
                                  key={movie._id}
                                  to={`/movie/${movie._id}`}
                                  className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 group"
                                >
                                  {/* Poster */}
                                  <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                                    <img
                                      src={movie.posterUrl}
                                      alt={movie.title}
                                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-movie.jpg';
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Movie Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="text-gray-900 font-medium group-hover:text-red-600 transition-colors line-clamp-2">
                                        {movie.title}
                                      </h3>
                                      <span className={`px-1.5 py-0.5 text-xs rounded flex-shrink-0 ${
                                        movie.ageRating === 'T18' ? 'bg-red-100 text-red-800' :
                                        movie.ageRating === 'T16' ? 'bg-orange-100 text-orange-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {movie.ageRating || 'P'}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="text-sm text-gray-600 ml-1">{movie.rating || '7.5'}</span>
                                      {movie.releaseDate && (
                                        <span className="text-sm text-gray-500 ml-2">• {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))
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
                    <button
                      onClick={() => {
                        console.log('Profile link clicked!');
                        console.log('User:', user);
                        console.log('Is authenticated:', isAuthenticated);
                        navigate('/profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/bookings');
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      <span>My Bookings</span>
                    </button>
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