import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusIcon, MapPinIcon } from 'lucide-react';
import { getTheaters, createTheater, updateTheater, deleteTheater, Theater } from '../../utils/theater';
import { getRooms, createRoom, updateRoom, deleteRoom, Room } from '../../utils/room';

const TheaterManagement: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [editingTheater, setEditingTheater] = useState<Partial<Theater> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [theaterToDelete, setTheaterToDelete] = useState<Theater | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomModal, setRoomModal] = useState<{ theaterId: string, open: boolean }>({ theaterId: '', open: false });
  const [roomForm, setRoomForm] = useState<{ name: string; totalSeats: number }>({ name: '', totalSeats: 0 });
  const [roomLoading, setRoomLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState<{ open: boolean, room: Room | null }>({ open: false, room: null });

  useEffect(() => {
    fetchTheaters();
    fetchRooms();
  }, []);

  const fetchTheaters = async () => {
    try {
      setIsLoading(true);
      const data = await getTheaters();
      setTheaters(data);
    } catch (err) {
      setError('Failed to fetch theaters');
      toast.error('Failed to fetch theaters');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setRoomLoading(true);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      toast.error('Không thể lấy danh sách phòng chiếu');
    } finally {
      setRoomLoading(false);
    }
  };

  const handleAddTheater = () => {
    setEditingTheater({
      name: '',
      address: '',
      phone: '',
      description: '',
      status: true
    });
  };

  const handleEditTheater = (theater: Theater) => {
    setEditingTheater({ ...theater });
  };

  const handleDeleteClick = (theater: Theater) => {
    setTheaterToDelete(theater);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!theaterToDelete) return;
    try {
      setIsLoading(true);
      await deleteTheater(theaterToDelete._id);
      await fetchTheaters();
      toast.success('Xóa rạp thành công!');
    } catch (err) {
      toast.error('Không thể xóa rạp');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setTheaterToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTheaterToDelete(null);
  };

  const handleSaveTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheater) return;

    try {
      setIsLoading(true);

      if (editingTheater._id) {
        // Update existing theater
        const updatedTheater = await updateTheater(editingTheater._id, editingTheater);
        setTheaters(theaters.map(theater => 
          theater._id === updatedTheater._id ? updatedTheater : theater
        ));
        toast.success('Cập nhật rạp thành công!');
      } else {
        // Create new theater
        const newTheater = await createTheater(editingTheater as any);
        setTheaters([...theaters, newTheater]);
        toast.success('Thêm rạp mới thành công!');
      }
      
      setEditingTheater(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu thông tin rạp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRoomModal = (theaterId: string) => {
    setRoomModal({ theaterId, open: true });
    setRoomForm({ name: '', totalSeats: 0 });
  };

  const handleCloseRoomModal = () => {
    setRoomModal({ theaterId: '', open: false });
  };

  const handleRoomFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({ ...prev, [name]: name === 'totalSeats' ? Number(value) : value }));
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomModal.theaterId) return;
    try {
      setRoomLoading(true);
      const newRoom = await createRoom({
        theaterId: roomModal.theaterId,
        name: roomForm.name,
        totalSeats: 64
      });
      await fetchRooms();
      toast.success('Tạo phòng chiếu thành công!');
      handleCloseRoomModal();
      setRoomForm({ name: '', totalSeats: 0 });
    } catch (err: any) {
      if (err?.response?.data?.message === 'Room name already exists in this theater') {
        toast.error('Tên phòng chiếu đã tồn tại trong rạp này!');
      } else {
        toast.error('Không thể tạo phòng chiếu');
      }
    } finally {
      setRoomLoading(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({ name: room.name, totalSeats: room.totalSeats });
    setRoomModal({ 
      theaterId: typeof room.theaterId === 'object' && room.theaterId !== null 
        ? (room.theaterId as any)._id 
        : room.theaterId, 
      open: true 
    });
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      setRoomLoading(true);
      const updatedRoom = await updateRoom(editingRoom._id, {
        name: roomForm.name,
        totalSeats: roomForm.totalSeats,
        theaterId: typeof editingRoom.theaterId === 'object' && editingRoom.theaterId !== null 
          ? (editingRoom.theaterId as any)._id 
          : editingRoom.theaterId
      });
      // Always refetch rooms and show success toast if API did not throw
      await fetchRooms();
      toast.success('Cập nhật phòng chiếu thành công!');
      setEditingRoom(null);
      handleCloseRoomModal();
    } catch (err) {
      toast.error('Không thể cập nhật phòng chiếu');
    } finally {
      setRoomLoading(false);
    }
  };

  const handleDeleteRoomClick = (room: Room) => {
    setShowDeleteRoomModal({ open: true, room });
  };

  const handleConfirmDeleteRoom = async () => {
    if (!showDeleteRoomModal.room) return;
    try {
      setRoomLoading(true);
      await deleteRoom(showDeleteRoomModal.room._id);
      if (showDeleteRoomModal.room) {
        setRooms(rooms.filter(r => r._id !== showDeleteRoomModal.room?._id));
      }
      toast.success('Xóa phòng chiếu thành công!');
      setShowDeleteRoomModal({ open: false, room: null });
    } catch (err) {
      toast.error('Không thể xóa phòng chiếu');
    } finally {
      setRoomLoading(false);
    }
  };

  const handleCancelDeleteRoom = () => {
    setShowDeleteRoomModal({ open: false, room: null });
  };

  return (
    <div>
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Quản Lý Rạp Chiếu Phim</h2>
          <button 
            onClick={async () => {
              try {
                setIsLoading(true);
                await fetchTheaters();
                toast.success('Đã cập nhật dữ liệu thành công!');
              } catch (err) {
                toast.error('Không thể cập nhật dữ liệu');
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Cập Nhật Dữ Liệu
          </button>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddTheater}
          disabled={isLoading}
        >
          <PlusIcon size={18} className="mr-1" />
          Thêm Rạp Mới
        </button>
      </div>

      {isLoading && !editingTheater && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="showInactive"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={showInactive}
          onChange={e => setShowInactive(e.target.checked)}
        />
        <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700">
          Hiển thị rạp tạm đóng
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Rạp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa Chỉ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số Điện Thoại
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {theaters
              .filter(theater => showInactive || theater.status)
              .map(theater => (
                <React.Fragment key={theater._id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPinIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {theater.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{theater.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{theater.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${theater.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {theater.status ? 'Hoạt Động' : 'Tạm Đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="group relative p-2 hover:bg-blue-50 rounded-full"
                          onClick={() => handleEditTheater(theater)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Chỉnh sửa
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>

                        <button 
                          className="group relative p-2 hover:bg-red-50 rounded-full"
                          onClick={() => handleDeleteClick(theater)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Xóa
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        </button>

                        <button
                          className="group relative p-2 hover:bg-green-50 rounded-full"
                          onClick={() => handleOpenRoomModal(theater._id)}
                        >
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                            Thêm phòng chiếu
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Room list for this theater */}
                  <tr>
                    <td colSpan={5} className="px-6 pb-4">
                      <div className="ml-10">
                        <div className="font-semibold text-gray-700 mb-2">Phòng chiếu:</div>
                        {roomLoading ? (
                          <div className="text-gray-500">Đang tải...</div>
                        ) : (
                          <ul className="list-disc ml-6">
                            {rooms.filter(room => {
                              if (typeof room.theaterId === 'object' && room.theaterId !== null) {
                                return (room.theaterId as any)._id === theater._id;
                              }
                              return room.theaterId === theater._id;
                            }).map(room => (
                              <li key={room._id} className="mb-1 flex items-center justify-between">
                                <span>
                                  <span className="font-medium">{room.name}</span> - Số ghế: {room.totalSeats}
                                </span>
                                <span className="flex gap-2">
                                  <button
                                    className="p-1 hover:bg-blue-100 rounded-full"
                                    onClick={() => handleEditRoom(room)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    className="p-1 hover:bg-red-100 rounded-full"
                                    onClick={() => handleDeleteRoomClick(room)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </span>
                              </li>
                            ))}
                            {rooms.filter(room => {
                              if (typeof room.theaterId === 'object' && room.theaterId !== null) {
                                return (room.theaterId as any)._id === theater._id;
                              }
                              return room.theaterId === theater._id;
                            }).length === 0 && (
                              <li className="text-gray-400">Chưa có phòng chiếu nào</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            
            {theaters.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Không có rạp nào. Hãy thêm rạp mới!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Theater Modal */}
      {editingTheater && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingTheater._id ? 'Chỉnh Sửa Rạp' : 'Thêm Rạp Mới'}
                </h3>
                <button 
                  onClick={() => !isLoading && setEditingTheater(null)}
                  className={`text-gray-400 hover:text-gray-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveTheater} className="space-y-6 relative">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Rạp <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.name || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        name: e.target.value
                      })} 
                      required 
                      minLength={2}
                      maxLength={100}
                      placeholder="Ví dụ: Galaxy Cinema Nguyễn Văn Quá"
                    />
                    <p className="text-xs text-gray-500 mt-1">2-100 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa Chỉ <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.address || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        address: e.target.value
                      })} 
                      required 
                      minLength={10}
                      maxLength={200}
                      placeholder="Ví dụ: 119B Nguyễn Văn Quá, Phường Đông Hưng Thuận, Q.12"
                    />
                    <p className="text-xs text-gray-500 mt-1">10-200 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số Điện Thoại <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.phone || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        phone: e.target.value
                      })} 
                      required 
                      pattern="^[0-9\s]{4,10}$"
                      title="Vui lòng nhập 4-10 số"
                      placeholder="Ví dụ: 19002224"
                    />
                    <p className="text-xs text-gray-500 mt-1">4-10 số</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng Thái
                    </label>
                    <div className="mt-1">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md ${
                          editingTheater.status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setEditingTheater({
                          ...editingTheater,
                          status: true
                        })}
                      >
                        Hoạt Động
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md ml-2 ${
                          !editingTheater.status 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setEditingTheater({
                          ...editingTheater,
                          status: false
                        })}
                      >
                        Tạm Đóng
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô Tả <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={5}
                      value={editingTheater.description || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        description: e.target.value
                      })}
                      required
                      minLength={50}
                      maxLength={2000}
                      placeholder="Mô tả chi tiết về rạp chiếu phim..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">50-2000 ký tự</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t mt-8">
                  <button 
                    type="button" 
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setEditingTheater(null)}
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="relative px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="opacity-0">{editingTheater._id ? 'Cập Nhật' : 'Thêm Mới'}</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      editingTheater._id ? 'Cập Nhật' : 'Thêm Mới'
                    )}
                  </button>
                </div>

                {/* Overlay when loading */}
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-40 pointer-events-auto cursor-not-allowed z-10" />
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && theaterToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Xác nhận xóa rạp</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc muốn xóa rạp <span className="font-semibold">{theaterToDelete.name}</span>?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {roomModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900">{editingRoom ? 'Cập Nhật Phòng Chiếu' : 'Thêm Phòng Chiếu'}</h3>
            <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng chiếu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={roomForm.name}
                  onChange={handleRoomFormChange}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ví dụ: Phòng 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số ghế <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="totalSeats"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={64}
                  readOnly
                  required
                  min={1}
                  max={500}
                  placeholder="Ví dụ: 64"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  onClick={() => { handleCloseRoomModal(); setEditingRoom(null); }}
                  disabled={roomLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
                  disabled={roomLoading}
                >
                  {roomLoading ? 'Đang lưu...' : (editingRoom ? 'Cập nhật' : 'Thêm phòng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteRoomModal.open && showDeleteRoomModal.room && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Xác nhận xóa phòng chiếu</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc muốn xóa phòng <span className="font-semibold">{showDeleteRoomModal.room.name}</span>?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={handleCancelDeleteRoom}
                disabled={roomLoading}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmDeleteRoom}
                disabled={roomLoading}
              >
                {roomLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterManagement;