import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueData } from '../../utils/mockData';
import { EditIcon, TrashIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserManagement from './UserManagement';
import AdminProfile from './AdminProfile';
import api from '../../utils/api';
import { adminGetBookings } from '../../utils/booking';
import { getMovieById } from '../../utils/movie';
import { getTheaterById } from '../../utils/theater';

// Mock user data
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
  const [bookings, setBookings] = useState([]);
  const [bookingStatusSummary, setBookingStatusSummary] = useState({ pending: 0, paid: 0, cancelled: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenueData, setDailyRevenueData] = useState<{ date: string; vnpayRevenue: number; cardRevenue: number }[]>([]);
  const [vnpayRevenue, setVnpayRevenue] = useState(0);
  const [cardRevenue, setCardRevenue] = useState(0);

  // Check if we're on the main dashboard or a subpage
  const isMainDashboard = location.pathname === '/admin';
  const isUserManagement = location.pathname === '/admin/users';
  const isProfilePage = location.pathname === '/admin/profile';
  // const isRevenueReports = location.pathname === '/admin/reports';

  useEffect(() => {
    // Fetch user list từ backend khi vào dashboard hoặc user managementAdd commentMore actions
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/auth/users');
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

    const fetchBookings = async () => {
      try {
        const res = await adminGetBookings();
        const bookingsRaw = res.bookings || [];
        // Lấy danh sách các movieId và theaterId duy nhất
        const movieIds = Array.from(new Set(bookingsRaw.map((b: any) => typeof b.screeningId?.movieId === 'string' ? b.screeningId.movieId : null).filter(Boolean)));
        const theaterIds = Array.from(new Set(bookingsRaw.map((b: any) => typeof b.screeningId?.theaterId === 'string' ? b.screeningId.theaterId : null).filter(Boolean)));
        // Fetch thông tin phim và rạp
        const movieMap: Record<string, string> = {};
        const theaterMap: Record<string, string> = {};
        await Promise.all([
          ...movieIds.map(async (id) => {
            try {
              const movie = await getMovieById(id);
              movieMap[id] = movie?.title || 'Không tìm thấy phim';
            } catch {
              movieMap[id] = 'Không tìm thấy phim';
            }
          }),
          ...theaterIds.map(async (id) => {
            try {
              const theater = await getTheaterById(id);
              theaterMap[id] = theater?.name || 'Không tìm thấy rạp';
            } catch {
              theaterMap[id] = 'Không tìm thấy rạp';
            }
          })
        ]);
        // Map lại bookings để thêm tên phim và tên rạp
        const bookingsWithNames = bookingsRaw.map((b: any) => ({
          ...b,
          movieTitle: typeof b.screeningId?.movieId === 'string' ? (movieMap[b.screeningId.movieId] || 'Không tìm thấy phim') : b.screeningId?.movieId?.title || 'Không tìm thấy phim',
          theaterName: typeof b.screeningId?.theaterId === 'string' ? (theaterMap[b.screeningId.theaterId] || 'Không tìm thấy rạp') : b.screeningId?.theaterId?.name || 'Không tìm thấy rạp'
        }));
        setBookings(bookingsWithNames);
        // Count status
        const summary = { pending: 0, paid: 0, cancelled: 0 };
        let revenue = 0;
        let vnpaySum = 0;
        let cardSum = 0;
        const dailyMap: Record<string, { vnpayRevenue: number; cardRevenue: number }> = {};
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        bookingsRaw.forEach((b: any) => {
          if (b.paymentStatus === 'pending') summary.pending++;
          else if (b.paymentStatus === 'paid') {
            summary.paid++;
            revenue += b.totalPrice || 0;
            if (b.paymentMethod === 'vnpay') vnpaySum += b.totalPrice || 0;
            if (b.paymentMethod === 'card') cardSum += b.totalPrice || 0;
            // Lấy ngày thanh toán, nếu có
            const paidDate = b.paidAt ? new Date(b.paidAt) : (b.createdAt ? new Date(b.createdAt) : null);
            if (paidDate && paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
              const dateStr = paidDate.toLocaleDateString('vi-VN');
              if (!dailyMap[dateStr]) dailyMap[dateStr] = { vnpayRevenue: 0, cardRevenue: 0 };
              if (b.paymentMethod === 'vnpay') dailyMap[dateStr].vnpayRevenue += b.totalPrice || 0;
              if (b.paymentMethod === 'card') dailyMap[dateStr].cardRevenue += b.totalPrice || 0;
            }
          }
          else if (b.paymentStatus === 'cancelled') summary.cancelled++;
        });
        setBookingStatusSummary(summary);
        setMonthlyRevenue(revenue);
        setVnpayRevenue(vnpaySum);
        setCardRevenue(cardSum);
        // Chuyển map thành mảng cho biểu đồ
        const dailyRevenueArr = Object.entries(dailyMap).map(([date, obj]) => ({ date, vnpayRevenue: obj.vnpayRevenue, cardRevenue: obj.cardRevenue }));
        // Sắp xếp theo ngày tăng dần
        dailyRevenueArr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDailyRevenueData(dailyRevenueArr);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchUsers();
    fetchBookings();
  }, [location.pathname]);

  const handleToggleLock = (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      setUsers(users.map(user => user.id === userId ? {
        ...user,
        isLocked: !user.isLocked
      } : user));
      
      toast.success(`Tài khoản đã được ${user?.isLocked ? 'mở khóa' : 'khóa'} thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      ...user
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUsers(users.map(user => user.id === editingUser.id ? {
        ...editingUser
      } : user));
      
      toast.success('Thông tin người dùng đã được cập nhật thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      setEditingUser(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin người dùng!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setUsers(users.filter(user => user.id !== userId));
        toast.success('Người dùng đã được xóa thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        toast.error('Có lỗi xảy ra khi xóa người dùng!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const renderMainDashboard = () => <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Tổng người dùng</h3>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Đặt vé hoạt động</h3>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Doanh thu tháng</h3>
          <p className="text-3xl font-bold">{monthlyRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Tổng quan doanh thu</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRevenueData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => [value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), name === 'vnpayRevenue' ? 'Doanh thu VNPay' : 'Doanh thu Thẻ']} />
              <Legend />
              <Bar dataKey="vnpayRevenue" name="Doanh thu VNPay" fill="#3B82F6" />
              <Bar dataKey="cardRevenue" name="Doanh thu Thẻ" fill="#F59E42" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Người dùng gần đây</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 5).map(user => <tr key={user.id}>
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
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : user.role === 'manager' ? 'Quản lý' : user.role === 'member' ? 'Thành viên' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                </tr>)}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => navigate('/admin/users')}>
              Xem tất cả người dùng
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Đặt vé gần đây</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên rạp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá vé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái thanh toán</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.slice(0, 5).map((b: any) => (
                <tr key={b._id}>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={b._id}>
                    {b._id.length > 20 ? b._id.slice(0, 20) + '...' : b._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={b.userId?.email}>
                    {b.userId?.email && b.userId.email.length > 20 ? b.userId.email.slice(0, 20) + '...' : b.userId?.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={b.movieTitle}>
                    {b.movieTitle && b.movieTitle.length > 20 ? b.movieTitle.slice(0, 20) + '...' : b.movieTitle || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.theaterName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.screeningId?.ticketPrice ? b.screeningId.ticketPrice.toLocaleString() + '₫' : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : b.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {b.paymentStatus === 'paid' ? 'Đã thanh toán' : b.paymentStatus === 'pending' ? 'Chờ thanh toán' : b.paymentStatus === 'cancelled' ? 'Hủy thanh toán' : b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => navigate('/admin/reports')}>
              Xem tất cả đặt vé
            </button>
          </div>
        </div>
      </div>
    </div>;
 const renderUserManagement = () => {
    console.log('RenderUserManagement called, users:', users);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>
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
  // const renderRevenueReports = () => <div>
  //     <h2 className="text-2xl font-bold mb-6">Revenue Reports</h2>
  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  //       <div className="bg-white rounded-lg shadow-md p-6">
  //         <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
  //         <p className="text-3xl font-bold">$124,500</p>
  //         <div className="mt-2 text-sm text-gray-500">
  //           <span className="text-green-500">↑ 8.2%</span> from last year
  //         </div>
  //       </div>
  //       <div className="bg-white rounded-lg shadow-md p-6">
  //         <h3 className="text-lg font-semibold mb-2">Average Ticket Price</h3>
  //         <p className="text-3xl font-bold">$14.25</p>
  //         <div className="mt-2 text-sm text-gray-500">
  //           <span className="text-green-500">↑ 2.5%</span> from last month
  //         </div>
  //       </div>
  //       <div className="bg-white rounded-lg shadow-md p-6">
  //         <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
  //         <p className="text-3xl font-bold">8,742</p>
  //         <div className="mt-2 text-sm text-gray-500">
  //           <span className="text-green-500">↑ 12%</span> from last month
  //         </div>
  //       </div>
  //     </div>
  //     <div className="bg-white rounded-lg shadow-md p-6 mb-8">
  //       <div className="flex justify-between items-center mb-4">
  //         <h3 className="text-lg font-semibold">Monthly Revenue</h3>
  //         <div>
  //           <select className="border border-gray-300 rounded-md p-2 text-sm">
  //             <option value="2023">2023</option>
  //             <option value="2022">2022</option>
  //           </select>
  //         </div>
  //       </div>
  //       <div className="h-80">
  //         <ResponsiveContainer width="100%" height="100%">
  //           <BarChart data={revenueData} margin={{
  //           top: 20,
  //           right: 30,
  //           left: 20,
  //           bottom: 5
  //         }}>
  //             <CartesianGrid strokeDasharray="3 3" />
  //             <XAxis dataKey="month" />
  //             <YAxis />
  //             <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
  //             <Legend />
  //             <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
  //           </BarChart>
  //         </ResponsiveContainer>
  //       </div>
  //     </div>
  //     <div className="bg-white rounded-lg shadow-md p-6">
  //       <h3 className="text-lg font-semibold mb-4">Top Performing Movies</h3>
  //       <table className="min-w-full divide-y divide-gray-200">
  //         <thead className="bg-gray-50">
  //           <tr>
  //             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //               Movie
  //             </th>
  //             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //               Revenue
  //             </th>
  //             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //               Tickets Sold
  //             </th>
  //             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //               Avg. Rating
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody className="bg-white divide-y divide-gray-200">
  //           <tr>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm font-medium text-gray-900">
  //                 Inception
  //               </div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">$24,500</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">1,720</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">4.8/5</div>
  //             </td>
  //           </tr>
  //           <tr>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm font-medium text-gray-900">
  //                 Interstellar
  //               </div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">$22,100</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">1,580</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">4.7/5</div>
  //             </td>
  //           </tr>
  //           <tr>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm font-medium text-gray-900">
  //                 The Dark Knight
  //               </div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">$19,800</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">1,320</div>
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap">
  //               <div className="text-sm text-gray-900">4.9/5</div>
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>;

  return <div>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Bảng điều khiển quản trị</h1>
      {isMainDashboard && renderMainDashboard()}
      {isUserManagement && <UserManagement />}
      {isProfilePage && <AdminProfile />}
      {/* {isRevenueReports && renderRevenueReports()} */}
    </div>;
};

export default AdminDashboard;