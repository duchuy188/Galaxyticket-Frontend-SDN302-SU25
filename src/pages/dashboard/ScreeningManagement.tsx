import React, { useEffect, useState } from 'react';
import { getScreenings, deleteScreening, createScreening, Screening, updateScreening } from '../../utils/screening';
import { getMovies } from '../../utils/movie';
import { getRooms } from '../../utils/room';
import { getTheaters } from '../../utils/theater';

const ScreeningManagement: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [form, setForm] = useState({
    movieId: '',
    roomId: '',
    theaterId: '',
    startTime: '',
    ticketPrice: 90000,
  });

  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      await deleteScreening(id);
      fetchScreenings();
    }
  };

  const handleEdit = (screening: Screening) => {
    setEditingScreening(screening);
    setForm({
      movieId: screening.movieId?._id || '',
      roomId: screening.roomId?._id || '',
      theaterId: screening.theaterId?._id || '',
      startTime: screening.startTime ? screening.startTime.slice(0, 16) : '',
      ticketPrice: screening.ticketPrice,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScreening) {
        await updateScreening(editingScreening._id, form);
        alert('Cập nhật suất chiếu thành công!');
      } else {
        await createScreening(form);
        alert('Tạo suất chiếu thành công!');
      }
      setShowModal(false);
      setEditingScreening(null);
      fetchScreenings();
    } catch (err: any) {
      alert((editingScreening ? 'Cập nhật' : 'Tạo') + ' suất chiếu thất bại: ' + (err?.message || 'Lỗi không xác định'));
    }
  };

  useEffect(() => {
    fetchScreenings();
    // eslint-disable-next-line
  }, [statusFilter]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Quản lý suất chiếu</h2>
      <div className="mb-4 flex items-center gap-2">
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
      </div>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setShowModal(true);
          setEditingScreening(null);
          setForm({
            movieId: '',
            roomId: '',
            theaterId: '',
            startTime: '',
            ticketPrice: 90000,
          });
        }}
      >
        Tạo suất chiếu
      </button>
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
                {rooms.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
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
              <label>Thời gian bắt đầu:</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
              />
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
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Phim</th>
                <th className="border px-2 py-1">Phòng</th>
                <th className="border px-2 py-1">Thời gian bắt đầu</th>
                <th className="border px-2 py-1">Thời gian kết thúc</th>
                <th className="border px-2 py-1">Trạng thái</th>
                <th className="border px-2 py-1">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map((s) => (
                <tr key={s._id}>
                  <td className="border px-2 py-1">{s.movieId?.title}</td>
                  <td className="border px-2 py-1">{s.roomId?.name}</td>
                  <td className="border px-2 py-1">{new Date(s.startTime).toLocaleString()}</td>
                  <td className="border px-2 py-1">{new Date(s.endTime).toLocaleString()}</td>
                  <td className="border px-2 py-1">{s.status}</td>
                  <td className="border px-2 py-1">
                    <button
                      className="mr-2 px-2 py-1 bg-yellow-400 rounded"
                      onClick={() => handleEdit(s)}
                    >
                      Sửa
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(s._id)}
                    >
                      Xóa
                    </button>
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
    </div>
  );
};

export default ScreeningManagement;
