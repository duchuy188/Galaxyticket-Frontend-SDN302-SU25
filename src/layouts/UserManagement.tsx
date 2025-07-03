// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import { FaTrash } from 'react-icons/fa';

// type User = {
//   _id?: string;
//   id?: string;
//   name: string;
//   email: string;
//   phone?: string;
//   role: string;
//   status?: boolean;
// };

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [selectedRole, setSelectedRole] = useState<string>('staff');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [roles] = useState<string[]>(['admin', 'manager', 'staff', 'user', 'member']);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get('/api/admin/users', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(res.data);
//       } catch {
//         toast.error('Lấy danh sách user thất bại!');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleEditClick = (user: User) => {
//     setEditingUser(user);
//     setSelectedRole(user.role);
//   };

//   const handleUpdateUser = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingUser) return;
//     try {
//       const token = localStorage.getItem('token');
//       const userId = editingUser._id || editingUser.id;
//       await axios.put(
//         `/api/admin/users/${userId}`,
//         { role: selectedRole },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setUsers(users.map(user =>
//         (user._id || user.id) === userId ? { ...user, role: selectedRole } : user
//       ));
//       toast.success('Cập nhật role thành công!');
//       setEditingUser(null);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Cập nhật role thất bại!');
//     }
//   };

//   const handleDeleteUser = async (userId: string) => {
//     if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`/api/admin/users/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(users.filter(user => (user._id || user.id) !== userId));
//       toast.success('Xóa user thành công!');
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Xóa user thất bại!');
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
//       {loading ? (
//         <div>Đang tải...</div>
//       ) : (
//         <table className="min-w-full border">
//           <thead>
//             <tr>
//               <th className="border px-4 py-2">Tên</th>
//               <th className="border px-4 py-2">Email</th>
//               <th className="border px-4 py-2">Role</th>
//               <th className="border px-4 py-2">Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map(user => (
//               <tr key={user._id || user.id}>
//                 <td className="border px-4 py-2">{user.name}</td>
//                 <td className="border px-4 py-2">{user.email}</td>
//                 <td className="border px-4 py-2">{user.role}</td>
//                 <td className="border px-4 py-2 text-center">
//                   <button
//                     className="hover:text-blue-600 mr-2"
//                     onClick={() => handleEditClick(user)}
//                     title="Chỉnh sửa role"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
//                     </svg>
//                   </button>
//                   <button
//                     className="hover:text-red-600"
//                     onClick={() => handleDeleteUser(user._id || user.id || '')}
//                     title="Xóa user"
//                   >
//                     <FaTrash size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       {editingUser && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//           <form
//             onSubmit={handleUpdateUser}
//             className="bg-white p-6 rounded shadow-md min-w-[300px]"
//           >
//             <h3 className="text-lg font-semibold mb-4">Chỉnh sửa role cho {editingUser.name}</h3>
//             <label className="block mb-2 font-medium">Role:</label>
//             <select
//               className="border rounded px-3 py-2 w-full mb-4"
//               value={selectedRole}
//               onChange={e => setSelectedRole(e.target.value)}
//             >
//               {roles.map(role => (
//                 <option key={role} value={role}>{role}</option>
//               ))}
//             </select>
//             <div className="flex justify-end gap-2">
//               <button
//                 type="button"
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//                 onClick={() => setEditingUser(null)}
//               >
//                 Hủy
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Lưu
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement; 