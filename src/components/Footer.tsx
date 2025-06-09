import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a237e] mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Film className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-white">Galaxy Cinema</h3>
            </div>
            <p className="text-gray-300">
              Your premier destination for the latest movies and unforgettable cinema experiences.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-300 hover:text-white">Movies</Link>
              </li>
              <li>
                <Link to="/theaters" className="text-gray-300 hover:text-white">Theaters</Link>
              </li>
              <li>
                <Link to="/bookings" className="text-gray-300 hover:text-white">My Bookings</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">YouTube</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Galaxy Cinema. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 