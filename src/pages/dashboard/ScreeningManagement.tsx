import React, { useEffect, useState } from 'react';
import { getScreenings, deleteScreening, createScreening, Screening, updateScreening } from '../../utils/screening';
import { getMovies } from '../../utils/movie';
import { getRooms, createRoom } from '../../utils/room';
import { getTheaters } from '../../utils/theater';
import { EditIcon, TrashIcon, EyeIcon, Clock, XCircle, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScreeningManagement: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [form, setForm] = useState({
    movieId: '',
    roomId: '',
    theaterId: '',
    startTime: '',
    endTime: '',
    ticketPrice: 90000,
  });
  const [roomForm, setRoomForm] = useState({
    name: '',
    theaterId: '',
    totalSeats: 64,
  });

  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [viewingScreening, setViewingScreening] = useState<Screening | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [theaterFilter, setTheaterFilter] = useState<string>('');
  const [roomLoading, setRoomLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const moviesNowShowing = movies.filter(m => m.showingStatus === 'now-showing');

  useEffect(() => {
    fetchScreenings();
    fetchMovies();
    fetchRooms();
    fetchTheaters();
  }, []);

  const fetchScreenings = async () => {
    setLoading(true);
    let data;
    if (statusFilter === 'all') {
      data = await getScreenings();
    } else {
      data = await getScreenings(statusFilter as 'pending' | 'approved' | 'rejected');
    }
    // Lọc theo rạp nếu có chọn
    if (theaterFilter) {
      data = data.filter((s: any) =>
        (typeof s.theaterId === 'object' ? s.theaterId._id : s.theaterId) === theaterFilter
      );
    }
    setScreenings(data);
    setLoading(false);
  };

  const fetchMovies = async () => {
    const data = await getMovies();
    setMovies(data);
  };

  const fetchRooms = async () => {
    const data = await getRooms();
    setRooms(data);
  };

  const fetchTheaters = async () => {
    const data = await getTheaters();
    setTheaters(data);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteScreening(deleteId);
        toast.success('Xóa suất chiếu thành công!');
        fetchScreenings();
      } catch (err: any) {
        toast.error('Xóa suất chiếu thất bại: ' + (err?.message || 'Lỗi không xác định'));
      } finally {
        setDeleteId(null);
      }
    }
  };

  const cancelDelete = () => setDeleteId(null);

  const handleEdit = (screening: Screening) => {
    setEditingScreening(screening);
    setForm({
      movieId: screening.movieId?._id || '',
      roomId: screening.roomId?._id || '',
      theaterId: screening.theaterId?._id || '',
      startTime: screening.startTime || '', // Giữ nguyên ISO string
      endTime: screening.endTime || '',
      ticketPrice: screening.ticketPrice,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScreening) {
        await updateScreening(editingScreening._id, form);
        toast.success('Cập nhật suất chiếu thành công!');
      } else {
        await createScreening(form);
        toast.success('Tạo suất chiếu thành công!');
      }
      setShowModal(false);
      setEditingScreening(null);
      fetchScreenings();
    } catch (err: any) {
      toast.error((editingScreening ? 'Cập nhật' : 'Tạo') + ' suất chiếu thất bại: ' + (err?.message || 'Lỗi không xác định'));
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomLoading(true);
    try {
      await createRoom({
        name: roomForm.name,
        theaterId: roomForm.theaterId,
        totalSeats: Number(roomForm.totalSeats),
      });
      setShowRoomModal(false);
      setRoomForm({ name: '', theaterId: '', totalSeats: 0 });
      fetchRooms();
      toast.success('Tạo phòng chiếu thành công!');
    } catch (err: any) {
      toast.error('Tạo phòng chiếu thất bại: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setRoomLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
    // eslint-disable-next-line
  }, [statusFilter, theaterFilter]);

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Chờ duyệt';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Quản Lý Suất Chiếu</h2>
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  await fetchScreenings();
                  await fetchMovies();
                  await fetchRooms();
                  await fetchTheaters();
                  toast.success('Đã cập nhật dữ liệu thành công!');
                } catch (err) {
                  toast.error('Không thể cập nhật dữ liệu');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Cập Nhật Dữ Liệu
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md"
              onClick={() => setShowRoomModal(true)}
              type="button"
            >
              Tạo phòng chiếu
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => {
                setShowModal(true);
                setEditingScreening(null);
                setForm({
                  movieId: '',
                  roomId: '',
                  theaterId: '',
                  startTime: '',
                  endTime: '',
                  ticketPrice: 90000,
                });
              }}
            >
              Tạo suất chiếu
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mt-4 flex items-center gap-4">
          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>

          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={theaterFilter}
            onChange={e => setTheaterFilter(e.target.value)}
          >
            <option value="">Tất cả rạp</option>
            {theaters.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rạp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : screenings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu suất chiếu
                  </td>
                </tr>
              ) : (
                screenings.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-[200px]">
                        {s.movieId?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.theaterId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.roomId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Bắt đầu: {new Date(s.startTime).toLocaleString('vi-VN', { hour12: false })}</div>
                      <div>Kết thúc: {new Date(s.endTime).toLocaleString('vi-VN', { hour12: false })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(s.status)}`}>
                          {getStatusText(s.status)}
                        </span>
                      </div>
                      {s.status === 'rejected' && s.rejectionReason && (
                        <div className="mt-1 text-xs text-red-600">
                          Lý do: {s.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setViewingScreening(s)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 relative group"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            Xem chi tiết
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 relative group"
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            Chỉnh sửa
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 relative group"
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-1/2 transform -translate-x-1/2">
                            Xóa
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Screening Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingScreening ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rạp
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.theaterId}
                    onChange={e => setForm({ ...form, theaterId: e.target.value })}
                    required
                  >
                    <option value="">Chọn rạp</option>
                    {theaters.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phim
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.movieId}
                    onChange={e => setForm({ ...form, movieId: e.target.value })}
                    required
                  >
                    <option value="">Chọn phim</option>
                    {moviesNowShowing.map(m => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.roomId}
                    onChange={e => setForm({ ...form, roomId: e.target.value })}
                    required
                  >
                    <option value="">Chọn phòng</option>
                    {rooms
                      .filter(r => {
                        if (!r.theaterId) return false;
                        return (typeof r.theaterId === 'object' ? r.theaterId._id : r.theaterId) === form.theaterId;
                      })
                      .map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá vé
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.ticketPrice}
                    onChange={e => setForm({ ...form, ticketPrice: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu
                  </label>
                  <DatePicker
                    selected={form.startTime ? new Date(form.startTime) : null}
                    onChange={date => {
                      setForm({ ...form, startTime: date ? date.toISOString() : '' });
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    timeCaption="Giờ (24h)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Chọn thời gian bắt đầu"
                    required
                    minDate={new Date()}
                    minTime={
                      (() => {
                        const selectedDate = form.startTime ? new Date(form.startTime) : new Date();
                        const now = new Date();
                        if (
                          selectedDate.getFullYear() === now.getFullYear() &&
                          selectedDate.getMonth() === now.getMonth() &&
                          selectedDate.getDate() === now.getDate()
                        ) {
                          // Nếu là hôm nay, minTime là thời điểm hiện tại (làm tròn lên 15 phút tiếp theo, nhưng không trước 8h)
                          const min = new Date();
                          min.setSeconds(0, 0);
                          const minutes = min.getMinutes();
                          const roundedMinutes = Math.ceil(minutes / 15) * 15;
                          if (roundedMinutes === 60) {
                            min.setHours(min.getHours() + 1, 0, 0, 0);
                          } else {
                            min.setMinutes(roundedMinutes, 0, 0);
                          }
                          if (min.getHours() < 8) min.setHours(8, 0, 0, 0);
                          return min;
                        }
                        // Nếu là ngày khác, minTime là 8h sáng
                        const min = new Date(selectedDate);
                        min.setHours(8, 0, 0, 0);
                        return min;
                      })()
                    }
                    maxTime={
                      (() => {
                        const selectedDate = form.startTime ? new Date(form.startTime) : new Date();
                        const max = new Date(selectedDate);
                        max.setHours(23, 45, 0, 0);
                        return max;
                      })()
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    setShowModal(false);
                    setEditingScreening(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {editingScreening ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tạo phòng chiếu mới
              </h2>
            </div>
            
            <form onSubmit={handleCreateRoom} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rạp
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roomForm.theaterId}
                    onChange={e => setRoomForm({ ...roomForm, theaterId: e.target.value })}
                    required
                  >
                    <option value="">Chọn rạp</option>
                    {theaters.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phòng
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roomForm.name}
                    onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số ghế
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    value={64}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Mặc định 64 ghế (8x8)</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowRoomModal(false)}
                  disabled={roomLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {roomLoading ? 'Đang tạo...' : 'Tạo phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingScreening && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[350px]">
            <h3 className="text-lg font-bold mb-4">Thông tin suất chiếu</h3>
            <div className="mb-2"><b>Phim:</b> {typeof viewingScreening.movieId === 'object' ? viewingScreening.movieId.title : viewingScreening.movieId}</div>
            <div className="mb-2"><b>Rạp:</b> {typeof viewingScreening.theaterId === 'object' ? viewingScreening.theaterId.name : viewingScreening.theaterId}</div>
            <div className="mb-2"><b>Phòng:</b> {typeof viewingScreening.roomId === 'object' ? viewingScreening.roomId.name : viewingScreening.roomId}</div>
            <div className="mb-2"><b>Thời gian bắt đầu:</b> {new Date(viewingScreening.startTime).toLocaleString('vi-VN', { hour12: false })}</div>
            <div className="mb-2"><b>Thời gian kết thúc:</b> {new Date(viewingScreening.endTime).toLocaleString('vi-VN', { hour12: false })}</div>
            <div className="mb-2"><b>Trạng thái:</b> {viewingScreening.status}</div>
            <div className="mb-2"><b>Giá vé:</b> {viewingScreening.ticketPrice?.toLocaleString()} đ</div>
            {viewingScreening.status === 'rejected' && viewingScreening.rejectionReason && (
              <div className="mb-2 text-red-600"><b>Lý do từ chối:</b> {viewingScreening.rejectionReason}</div>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setViewingScreening(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[350px]">
            <h3 className="text-lg font-bold mb-4 text-red-600">Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa suất chiếu này?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={cancelDelete}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningManagement;
