import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueData } from '../../utils/mockData';
import { EditIcon, TrashIcon, LockIcon, UnlockIcon } from 'lucide-react';
import api from '../../utils/api';
// Mock user data
const initialUsers = [{
  id: '1',
  fullName: 'Admin User',
  email: 'admin@cinema.com',
  phone: '123-456-7890',
  role: 'admin',
  isLocked: false
}, {
  id: '2',
  fullName: 'Staff User',
  email: 'staff@cinema.com',
  phone: '123-456-7891',
  role: 'staff',
  isLocked: false
}, {
  id: '3',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7892',
  role: 'user',
  isLocked: false
}, {
  id: '4',
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '123-456-7893',
  role: 'user',
  isLocked: true
}];
// Định nghĩa type User
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isLocked?: boolean;
}
const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Check if we're on the main dashboard or a subpage
  const isMainDashboard = location.pathname === '/admin';
  const isUserManagement = location.pathname === '/admin/users';
  const isRevenueReports = location.pathname === '/admin/reports';
  console.log('Current pathname:', location.pathname);
  console.log('isUserManagement:', isUserManagement);
  useEffect(() => {
    // Fetch user list từ backend khi vào dashboard hoặc user management
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        // Nếu response.data là array, dùng trực tiếp; nếu là object có users thì lấy users
        const usersData = (Array.isArray(response.data) ? response.data : response.data.users || []).map((u: any) => ({
          id: u._id,
          fullName: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isLocked: u.status === false
        }));
        console.log('Fetched users:', usersData);
        setUsers(usersData);
      } catch (err) {
        // Có thể toast hoặc log lỗi
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, [location.pathname]);
  const handleToggleLock = (userId: string) => {
    setUsers(users.map(user => user.id === userId ? {
      ...user,
      isLocked: !user.isLocked
    } : user));
  };
  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(users.map(user => user.id === editingUser.id ? {
      ...editingUser
    } : user));
    setEditingUser(null);
  };
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  const renderMainDashboard = () => <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{users.length}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 12%</span> from last month
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold">42</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 8%</span> from last week
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold">$12,450</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 5%</span> from last month
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Dòng test debug số lượng user */}
              <tr>
                <td colSpan={6} style={{color: 'red', fontWeight: 'bold'}}>TEST ROW - USERS: {users.length}</td>
              </tr>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">No users found</td>
                </tr>
              ) : (
                users.slice(0, 5).map(user => <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.isLocked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                  </tr>)
              )}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => navigate('/admin/users')}>
              View All Users
            </button>
          </div>
        </div>
      </div>
    </div>;
  const renderUserManagement = () => {
    console.log('RenderUserManagement called, users:', users);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div style={{color: 'blue', fontWeight: 'bold'}}>DEBUG: renderUserManagement return called, users.length = {users.length}</div>
          <table border={1} style={{width: '100%'}}>
            <tbody>
              <tr>
                <td colSpan={6} style={{color: 'red', fontWeight: 'bold'}}>TEST ROW - USERS: {users.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderRevenueReports = () => <div>
      <h2 className="text-2xl font-bold mb-6">Revenue Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$124,500</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 8.2%</span> from last year
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Average Ticket Price</h3>
          <p className="text-3xl font-bold">$14.25</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 2.5%</span> from last month
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold">8,742</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 12%</span> from last month
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Monthly Revenue</h3>
          <div>
            <select className="border border-gray-300 rounded-md p-2 text-sm">
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Movies</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets Sold
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Rating
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  Inception
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">$24,500</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">1,720</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">4.8/5</div>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  Interstellar
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">$22,100</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">1,580</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">4.7/5</div>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  The Dark Knight
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">$19,800</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">1,320</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">4.9/5</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  return <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {isMainDashboard && renderMainDashboard()}
      {isUserManagement && renderUserManagement()}
      {isRevenueReports && renderRevenueReports()}
    </div>;
};
export default AdminDashboard;