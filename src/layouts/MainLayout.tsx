import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
type MainLayoutProps = {
  hideNavigation?: boolean;
};
const MainLayout: React.FC<MainLayoutProps> = ({
  hideNavigation = false
}) => {
  return <div className="min-h-screen bg-gray-100 flex flex-col">
      {!hideNavigation && <NavBar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Cinema Booking</h3>
              <p className="text-gray-400">The best movie experience</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
              <a href="#" className="hover:text-blue-400">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-400">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Cinema Booking. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>;
};
export default MainLayout;