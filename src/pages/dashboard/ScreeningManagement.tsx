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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý suất chiếu</h1>
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <label>Trạng thái:</label>
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          {/* Bộ lọc rạp */}
          <label className="ml-4">Rạp:</label>
          <select
            className="border rounded px-2 py-1"
            value={theaterFilter}
            onChange={e => setTheaterFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            {theaters.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
                    <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => setShowRoomModal(true)}
            type="button"
          >
            Tạo phòng chiếu
          </button>
                 <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md min-w-[350px]"
            onSubmit={handleSubmit}
          >
            <h3 className="text-lg font-bold mb-4">
              {editingScreening ? 'Sửa suất chiếu' : 'Tạo suất chiếu mới'}
            </h3>
                        <div className="mb-2">
              <label>Rạp:</label>
              <select
                className="w-full border rounded px-2 py-1"
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
            <div className="mb-2">
              <label>Phim:</label>
              <select
                className="w-full border rounded px-2 py-1"
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
            <div className="mb-2">
              <label>Phòng:</label>
              <select
                className="w-full border rounded px-2 py-1"
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
            <div className="mb-2">
              <label>Giá vé:</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={form.ticketPrice}
                onChange={e => setForm({ ...form, ticketPrice: Number(e.target.value) })}
                min={0}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Thời gian bắt đầu:</label>
              <DatePicker
                selected={form.startTime ? new Date(form.startTime) : null}
                onChange={date => {
                  setForm({ ...form, startTime: date ? date.toISOString() : '' });
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm" // Đổi sang định dạng dd/MM/yyyy
                timeCaption="Giờ (24h)"
                className="w-full border rounded px-2 py-1"
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
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setShowModal(false);
                  setEditingScreening(null);
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Tạo
              </button>
            </div>
          </form>
        </div>
      )}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md min-w-[350px]"
            onSubmit={handleCreateRoom}
          >
            <h3 className="text-lg font-bold mb-4">Tạo phòng chiếu mới</h3>
                        <div className="mb-2">
              <label>Rạp:</label>
              <select
                className="w-full border rounded px-2 py-1"
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
            <div className="mb-2">
              <label>Tên phòng:</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={roomForm.name}
                onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label>Số ghế:</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={64}
                readOnly
                disabled
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowRoomModal(false)}
                disabled={roomLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={roomLoading}
              >
                {roomLoading ? 'Đang tạo...' : 'Tạo phòng'}
              </button>
            </div>
          </form>
        </div>
      )}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Phim</th>
                <th className="border px-2 py-1">Rạp</th>
                <th className="border px-2 py-1">Phòng</th>
                <th className="border px-2 py-1">Trạng thái</th>
                <th className="border px-3 py-1">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map((s) => (
                <tr key={s._id}>
                  <td className="border px-2 py-1 max-w-[220px] truncate whitespace-nowrap">{s.movieId?.title}</td>
                  <td className="border px-2 py-1 max-w-[180px] truncate whitespace-nowrap">{s.theaterId?.name}</td>
                  <td className="border px-2 py-1 max-w-[120px] truncate whitespace-nowrap">{s.roomId?.name}</td>
                  <td className="border px-2 py-1">
                    {s.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                        <Clock size={16} className="text-yellow-500" />
                        Chờ Duyệt
                      </span>
                    )}
                    {s.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        <XCircle size={16} className="text-red-500" />
                        Từ Chối
                      </span>
                    )}
                    {s.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle size={16} className="text-green-500" />
                        Đã Duyệt
                      </span>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
  <div className="flex items-center justify-center gap-8">
    <button
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
      title="Xem"
      onClick={() => setViewingScreening(s)}
    >
      <EyeIcon size={24} className="text-blue-600" />
    </button>
    <button
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-yellow-50 transition-colors duration-150 cursor-pointer"
      title="Sửa"
      onClick={() => handleEdit(s)}
    >
      <EditIcon size={24} className="text-yellow-600" />
    </button>
    <button
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors duration-150 cursor-pointer"
      title="Xóa"
      onClick={() => handleDelete(s._id)}
    >
      <TrashIcon size={24} className="text-red-600" />
    </button>
  </div>
</td>
                </tr>
              ))}
              {screenings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">Không có suất chiếu nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {viewingScreening && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[350px]">
            <h3 className="text-lg font-bold mb-4">Thông tin suất chiếu</h3>
            <div className="mb-2"><b>Phim:</b> {viewingScreening.movieId?.title || viewingScreening.movieId}</div>
            <div className="mb-2"><b>Rạp:</b> {viewingScreening.theaterId?.name || viewingScreening.theaterId}</div>
            <div className="mb-2"><b>Phòng:</b> {viewingScreening.roomId?.name || viewingScreening.roomId}</div>
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
      <ToastContainer />
    </div>
  );
};

export default ScreeningManagement;
