import React, { useEffect, useState } from 'react';
import { adminGetBookings, Booking } from '../../utils/booking';
import { getMovieById } from '../../utils/movie';
import { getTheaterById } from '../../utils/theater';
import ReactModal from 'react-modal';

const RevenueReport: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [movieMap, setMovieMap] = useState<Record<string, string>>({});
  const [theaterMap, setTheaterMap] = useState<Record<string, string>>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.paymentStatus === filterStatus);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await adminGetBookings();
        const bookingsData = res.bookings || [];
        setBookings(bookingsData);
        setStats({
          total: bookingsData.length,
          pending: bookingsData.filter(b => b.paymentStatus === 'pending').length,
          paid: bookingsData.filter(b => b.paymentStatus === 'paid').length,
          cancelled: bookingsData.filter(b => b.paymentStatus === 'cancelled').length,
        });
        // Lấy danh sách các movieId, theaterId duy nhất
        const movieIds = Array.from(new Set(bookingsData.map((b: Booking) => typeof b.screeningId?.movieId === 'string' ? b.screeningId.movieId : null).filter(Boolean)));
        const theaterIds = Array.from(new Set(bookingsData.map((b: Booking) => typeof b.screeningId?.theaterId === 'string' ? b.screeningId.theaterId : null).filter(Boolean)));
        // Fetch thông tin phim, rạp
        const movieMapTemp: Record<string, string> = {};
        const theaterMapTemp: Record<string, string> = {};
        await Promise.all([
          ...movieIds.map(async (id) => {
            try {
              const movie = await getMovieById(id);
              movieMapTemp[id] = movie?.title || 'Không tìm thấy phim';
            } catch {
              movieMapTemp[id] = 'Không tìm thấy phim';
            }
          }),
          ...theaterIds.map(async (id) => {
            try {
              const theater = await getTheaterById(id);
              theaterMapTemp[id] = theater?.name || 'Không tìm thấy rạp';
            } catch {
              theaterMapTemp[id] = 'Không tìm thấy rạp';
            }
          })
        ]);
        setMovieMap(movieMapTemp);
        setTheaterMap(theaterMapTemp);
      } catch (err) {
        // handle error if needed
      }
    };
    fetchBookings();
  }, []);

  const handleStatusFilter = (status: 'all' | 'pending' | 'paid' | 'cancelled') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đặt vé</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className={`rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transition-colors duration-150 ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`} onClick={() => handleStatusFilter('all')}>
          <span className="text-lg font-semibold mb-2">Tổng số vé</span>
          <span className="text-3xl font-bold">{stats.total}</span>
        </div>
        <div className={`rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transition-colors duration-150 ${filterStatus === 'pending' ? 'bg-yellow-400 text-white' : 'bg-white hover:bg-yellow-50'}`} onClick={() => handleStatusFilter('pending')}>
          <span className="text-lg font-semibold mb-2">Chờ thanh toán</span>
          <span className="text-3xl font-bold">{stats.pending}</span>
        </div>
        <div className={`rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transition-colors duration-150 ${filterStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-white hover:bg-green-50'}`} onClick={() => handleStatusFilter('paid')}>
          <span className="text-lg font-semibold mb-2">Đã thanh toán</span>
          <span className="text-3xl font-bold">{stats.paid}</span>
        </div>
        <div className={`rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transition-colors duration-150 ${filterStatus === 'cancelled' ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-50'}`} onClick={() => handleStatusFilter('cancelled')}>
          <span className="text-lg font-semibold mb-2">Hủy thanh toán</span>
          <span className="text-3xl font-bold">{stats.cancelled}</span>
        </div>
      </div>
      {/* Bảng đặt vé */}
      <div className="mt-8">
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Không có dữ liệu đặt vé</td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={b._id}>{b._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={b.userId?.email}>{b.userId?.email || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={typeof b.screeningId?.movieId === 'string' ? movieMap[b.screeningId?.movieId] : b.screeningId?.movieId?.title}>{typeof b.screeningId?.movieId === 'string' ? movieMap[b.screeningId?.movieId] : b.screeningId?.movieId?.title || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={typeof b.screeningId?.theaterId === 'string' ? theaterMap[b.screeningId?.theaterId] : b.screeningId?.theaterId?.name}>{typeof b.screeningId?.theaterId === 'string' ? theaterMap[b.screeningId?.theaterId] : b.screeningId?.theaterId?.name || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{b.totalPrice ? b.totalPrice.toLocaleString() + '₫' : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-white text-xs ${b.paymentStatus === 'paid' ? 'bg-green-400' : b.paymentStatus === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        title="Xem chi tiết"
                        onClick={() => setSelectedBooking(b)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 inline-block">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.75 7.5 4.75 12 4.75c4.5 0 8.5 3 9.75 7.25-1.25 4.25-5.25 7.25-9.75 7.25-4.5 0-8.5-3-9.75-7.25z" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-4 gap-2">
              <button
                className="px-3 py-1 rounded border bg-gray-100 text-gray-400 cursor-default"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {/* Smart pagination logic */}
              {(() => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`px-3 py-1 rounded border transition-colors duration-150 ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      className={`px-3 py-1 rounded border transition-colors duration-150 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                  );
                  // Show ... if currentPage > 4
                  if (currentPage > 4) {
                    pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                  }
                  // Show pages around currentPage
                  for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`px-3 py-1 rounded border transition-colors duration-150 ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                  // Show ... if currentPage < totalPages - 3
                  if (currentPage < totalPages - 3) {
                    pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                  }
                  // Always show last page
                  pages.push(
                    <button
                      key={totalPages}
                      className={`px-3 py-1 rounded border transition-colors duration-150 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  );
                }
                return pages;
              })()}
              <button
                className="px-3 py-1 rounded border bg-gray-100 text-gray-400 cursor-default"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal chi tiết đặt vé */}
      <ReactModal
        isOpen={!!selectedBooking}
        onRequestClose={() => setSelectedBooking(null)}
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg p-0 max-w-2xl mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div className="border-b px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chi tiết đặt vé</h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedBooking(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 pt-4 pb-2 border-b flex gap-8 flex-wrap">
          {/* Trạng thái + thời gian đặt + người đặt */}
          <div className="flex-1 min-w-[220px]">
            <div className="mb-2 flex items-center gap-2">
              {selectedBooking && (
                <>
                  {selectedBooking.paymentStatus === 'paid' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Đã thanh toán
                    </span>
                  )}
                  {selectedBooking.paymentStatus === 'pending' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                      Chờ thanh toán
                    </span>
                  )}
                  {selectedBooking.paymentStatus === 'cancelled' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Hủy thanh toán
                    </span>
                  )}
                </>
              )}
            </div>
            {selectedBooking && (
              <>
                <div className="text-gray-500 text-xs mb-1">Thời gian đặt: <span className="font-semibold text-gray-700">{new Date(selectedBooking.createdAt).toLocaleString()}</span></div>
                <div className="text-gray-500 text-xs mb-1">Email: <span className="font-semibold text-gray-700">{selectedBooking.userId?.email}</span></div>
                <div className="text-gray-500 text-xs mb-1">Tên khách: <span className="font-semibold text-gray-700">{selectedBooking.userId?.name}</span></div>
              </>
            )}
          </div>
          {/* Thông tin vé */}
          <div className="flex-1 min-w-[220px]">
            {selectedBooking && (
              <>
                <div className="text-gray-500 text-xs mb-1">Mã vé: <span className="font-semibold text-gray-700">{selectedBooking._id}</span></div>
                <div className="text-gray-500 text-xs mb-1">Tên phim: <span className="font-semibold text-gray-700">{typeof selectedBooking.screeningId?.movieId === 'string' ? movieMap[selectedBooking.screeningId.movieId] : selectedBooking.screeningId?.movieId?.title || 'Không tìm thấy phim'}</span></div>
                <div className="text-gray-500 text-xs mb-1">Tên rạp: <span className="font-semibold text-gray-700">{selectedBooking.screeningId?.roomId?.theaterName || theaterMap[selectedBooking.screeningId?.roomId?._id] || 'Không tìm thấy rạp'}</span></div>
                <div className="text-gray-500 text-xs mb-1">Phòng chiếu: <span className="font-semibold text-gray-700">{selectedBooking.screeningId?.roomId?.name}</span></div>
                <div className="text-gray-500 text-xs mb-1">Ghế: <span className="font-semibold text-gray-700">{selectedBooking.seatNumbers?.join(', ')}</span></div>
                <div className="text-gray-500 text-xs mb-1">Thời gian chiếu: <span className="font-semibold text-gray-700">{selectedBooking.screeningId?.startTime ? new Date(selectedBooking.screeningId.startTime).toLocaleString() : ''}</span></div>
              </>
            )}
          </div>
        </div>
        {/* Thông tin giá vé, trạng thái */}
        <div className="px-6 py-4 flex gap-8 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            {selectedBooking && (
              <>
                <div className="text-gray-500 text-xs mb-1">Giá vé: <span className="font-semibold text-gray-700">{selectedBooking.screeningId?.ticketPrice?.toLocaleString()}₫</span></div>
                <div className="text-gray-500 text-xs mb-1">Tổng tiền: <span className="font-semibold text-gray-700">{selectedBooking.totalPrice?.toLocaleString()}₫</span></div>
              </>
            )}
          </div>
          <div className="flex-1 min-w-[220px]">
            {selectedBooking && (
              <>
                <div className="text-gray-500 text-xs mb-1">Trạng thái thanh toán: <span className="font-semibold text-gray-700">{selectedBooking.paymentStatus}</span></div>
                <div className="text-gray-500 text-xs mb-1">Thời gian đặt: <span className="font-semibold text-gray-700">{new Date(selectedBooking.createdAt).toLocaleString()}</span></div>
                <div className="text-gray-500 text-xs mb-1">Thời gian chiếu: <span className="font-semibold text-gray-700">{selectedBooking.screeningId?.startTime ? new Date(selectedBooking.screeningId.startTime).toLocaleString() : ''}</span></div>
              </>
            )}
          </div>
        </div>
        <div className="px-6 py-4 text-right border-t">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setSelectedBooking(null)}>Đóng</button>
        </div>
      </ReactModal>
    </div>
  );
};

export default RevenueReport;
