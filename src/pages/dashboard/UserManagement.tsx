import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { EditIcon, TrashIcon, LockIcon, UnlockIcon } from 'lucide-react';
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

  useEffect(() => {
    const fetchUsers = async () => {
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
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleLock = (userId: string) => {
    setUsers(users.map(user => user.id === userId ? {
      ...user,
      isLocked: !user.isLocked
    } : user));
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => (user._id || user.id) !== userId));
      toast.success('Xóa user thành công!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xóa user thất bại!');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tạo user thành công!');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'staff' });
      // Reload lại danh sách user
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tạo user thất bại!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">No users found</td>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.isLocked ? 'Locked' : 'Active'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleToggleLock(user.id)} className="text-gray-600 hover:text-gray-900 mr-3" title={user.isLocked ? 'Unlock Account' : 'Lock Account'}>
                      {user.isLocked ? <UnlockIcon size={18} /> : <LockIcon size={18} />}
                    </button>
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
              Previous
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
              Next
            </button>
          </div>
        )}
      </div>
      {/* Edit User Modal */}
   {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
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
                  <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="member">Member</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <form
            onSubmit={handleCreateUser}
            className="bg-white p-6 rounded shadow-md min-w-[350px]"
          >
            <h3 className="text-lg font-semibold mb-4">Tạo user mới</h3>
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Họ tên"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Số điện thoại"
              value={newUser.phone}
              onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Mật khẩu"
              type="password"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <select
              className="border rounded px-3 py-2 w-full mb-4"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="staff">staff</option>
              <option value="manager">manager</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={creating}
              >
                {creating ? 'Đang tạo...' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 