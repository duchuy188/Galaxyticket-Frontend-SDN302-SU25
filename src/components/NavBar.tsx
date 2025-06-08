import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, XIcon, UserIcon } from 'lucide-react';
const NavBar: React.FC = () => {
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/signin');
  };
  // Don't show admin/staff navigation options in public area
  if (user?.role === 'admin' || user?.role === 'staff') {
    return null;
  }
  return <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold">
                Cinema Booking
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Home
                </Link>
                {isAuthenticated && <Link to="/bookings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    My Bookings
                  </Link>}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? <div className="relative ml-3">
                  <div className="flex items-center">
                    <Link to="/bookings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                      My Account
                    </Link>
                    <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 ml-2">
                      Logout
                    </button>
                  </div>
                </div> : <div className="flex items-center space-x-2">
                  <Link to="/signin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Sign In
                  </Link>
                  <Link to="/signup" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Link>
                </div>}
            </div>
          </div>
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {isAuthenticated && <Link to="/bookings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                My Bookings
              </Link>}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {isAuthenticated ? <div className="px-2 space-y-1">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {user?.fullName}
                    </div>
                    <div className="text-sm text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <Link to="/bookings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                  My Account
                </Link>
                <button onClick={() => {
            handleLogout();
            setIsMenuOpen(false);
          }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-red-400">
                  Logout
                </button>
              </div> : <div className="px-2 space-y-1">
                <Link to="/signin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>}
          </div>
        </div>}
    </nav>;
};
export default NavBar;