import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

interface MainLayoutProps {
  hideNavigation?: boolean;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  hideNavigation = false,
  hideFooter = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideNavigation && <NavBar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;