import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboardIcon,
  UsersIcon,
  FilmIcon,
  CalendarIcon,
  CreditCardIcon,
  LogOutIcon,
  TagIcon,
  LayoutGridIcon,
} from 'lucide-react'
type DashboardLayoutProps = {
  children: React.ReactNode
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const basePath = isAdmin ? '/admin' : isManager ? '/manager' : '/staff'
  const handleLogout = () => {
    logout()
    navigate('/signin')
  }
  const adminNavItems = [
    {
      label: 'Dashboard',
      path: `${basePath}`,
      icon: <LayoutDashboardIcon size={20} />,
    },
    {
      label: 'User Management',
      path: `${basePath}/users`,
      icon: <UsersIcon size={20} />,
    },
    {
      label: 'Revenue Reports',
      path: `${basePath}/reports`,
      icon: <CreditCardIcon size={20} />,
    },
  ]
  const staffNavItems = [
    {
      label: 'Dashboard',
      path: `${basePath}`,
      icon: <LayoutDashboardIcon size={20} />,
    },
    {
      label: 'Movie Management',
      path: `${basePath}/movies`,
      icon: <FilmIcon size={20} />,
    },
    {
      label: 'Screening Management',
      path: `${basePath}/screenings`,
      icon: <CalendarIcon size={20} />,
    },
    {
      label: 'Payment Issues',
      path: `${basePath}/payments`,
      icon: <CreditCardIcon size={20} />,
    },
  ]
  const managerNavItems = [
    {
      label: 'Dashboard',
      path: `${basePath}`,
      icon: <LayoutDashboardIcon size={20} />,
    },
    {
      label: 'Movie Requests',
      path: `${basePath}/movies`,
      icon: <FilmIcon size={20} />,
    },
    {
      label: 'Promotion Requests',
      path: `${basePath}/promotions`,
      icon: <TagIcon size={20} />,
    },
    {
      label: 'Showtime Requests',
      path: `${basePath}/showtimes`,
      icon: <CalendarIcon size={20} />,
    },
    {
      label: 'Seat Map Requests',
      path: `${basePath}/seatmaps`,
      icon: <LayoutGridIcon size={20} />,
    },
  ]
  const navItems = isAdmin
    ? adminNavItems
    : isManager
      ? managerNavItems
      : staffNavItems
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
        <div className="p-4 flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              {isAdmin ? 'Admin' : isManager ? 'Manager' : 'Staff'} Panel
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Welcome, {user?.fullName}
            </p>
          </div>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white w-full p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LogOutIcon size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-full">{children}</div>
      </div>
    </div>
  )
}
export default DashboardLayout
