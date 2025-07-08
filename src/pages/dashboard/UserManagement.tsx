import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { EditIcon, TrashIcon, LockIcon, UnlockIcon, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isLocked?: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const totalPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
  });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/auth/users');
        const usersData = (Array.isArray(response.data) ? response.data : response.data.users || []).map((u: any) => ({
          id: u._id,
          fullName: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isLocked: u.status === false
        }));
        setUsers(usersData);
      } catch (err) {
        // Đừng gọi toast.error ở đây để tránh double noti!
        // console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleLockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/users/${userId}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Khóa tài khoản thành công!');
      // Update UI ngay lập tức
      setUsers(users => users.map(user => user.id === userId ? { ...user, isLocked: true } : user));
      // fetchUsers(); // Nếu muốn, có thể fetch lại users sau đó
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Khóa tài khoản thất bại!');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/users/${userId}/unlock`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Mở khóa tài khoản thành công!');
      // Update UI ngay lập tức
      setUsers(users => users.map(user => user.id === userId ? { ...user, isLocked: false } : user));
      // fetchUsers(); // Nếu muốn, có thể fetch lại users sau đó
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mở khóa tài khoản thất bại!');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };
const handleUpdateUser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingUser) return;
  const userId = editingUser._id || editingUser.id;
  if (!userId) {
    toast.error('Không tìm thấy ID user!');
    return;
  }
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `/api/admin/users/${userId}`,
      { role: editingUser.role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUsers(users.map(user => ((user._id || user.id) === userId ? { ...user, role: editingUser.role } : user)));
    toast.success('Cập nhật role thành công!');
    setEditingUser(null);
  } catch (err) {
    toast.error('Cập nhật role thất bại!');
  }
};
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete?.role === 'admin') {
      toast.error('Không thể xóa tài khoản admin!');
      return;
    }
    // Hiển thị modal xác nhận
    setUserToDelete(userToDelete!);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast.success('Xóa user thành công!');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xóa user thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate phone number
    const phone = newUser.phone.trim();
    if (!phone) {
      setPhoneError('Số điện thoại không được để trống');
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setPhoneError('Số điện thoại phải đúng 10 số');
      return;
    }
    setPhoneError(null);
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tạo user thành công!');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'staff' });
      // Reload lại danh sách user (nếu lỗi thì chỉ log, không báo toast.error)
      try {
        const response = await api.get('/api/users');
        const usersData = (Array.isArray(response.data) ? response.data : response.data.users || []).map((u: any) => ({
          id: u._id,
          fullName: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isLocked: u.status === false
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Lỗi reload danh sách user:', err);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tạo user thất bại!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowCreateModal(true)}
      >
        Tạo user mới
      </button>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">Không tìm thấy người dùng</td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.isLocked ? 'Đã khóa' : 'Hoạt động'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.isLocked ? (
                      <button onClick={() => handleUnlockUser(user.id)} className="text-gray-600 hover:text-gray-900 mr-3" title="Mở khóa tài khoản">
                        <UnlockIcon size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleLockUser(user.id)} className="text-gray-600 hover:text-gray-900 mr-3" title="Khóa tài khoản">
                        <LockIcon size={18} />
                      </button>
                    )}
                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <EditIcon size={18} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-4 space-x-2">
            <button
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </div>
      {/* Edit User Modal */}
   {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Chỉnh sửa người dùng</h3>
              <form onSubmit={handleUpdateUser}>
                {/* <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={editingUser.name} readOnly />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-md" value={editingUser.email} readOnly />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Phone</label>
                  <input type="tel" className="w-full p-2 border border-gray-300 rounded-md" value={editingUser.phone} readOnly />
                </div> */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Vai trò</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="member">Thành viên</option>
                    <option value="staff">Nhân viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setEditingUser(null)}>Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tạo User Mới</h3>
                <button
                  onClick={() => !creating && setShowCreateModal(false)}
                  className={`text-gray-400 hover:text-gray-500 ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={creating}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-6 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Họ tên"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Email"
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      className={`w-full px-3 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
                      placeholder="Số điện thoại"
                      value={newUser.phone}
                      onChange={e => {
                        setNewUser({ ...newUser, phone: e.target.value });
                        if (phoneError) setPhoneError(null);
                      }}
                      required
                    />
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-10"
                        placeholder="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={creating}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="staff">Nhân viên</option>
                      <option value="manager">Quản lý</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-6 border-t">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="relative px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="opacity-0">Tạo mới</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      'Tạo mới'
                    )}
                  </button>
                </div>
                {creating && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-40 pointer-events-auto cursor-not-allowed z-10" />
                )}
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Xác nhận xóa người dùng</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete.fullName}</strong>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  onClick={cancelDeleteUser}
                  disabled={deleting}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="relative px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  onClick={confirmDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="opacity-0">Xóa</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    </>
                  ) : (
                    'Xóa'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 