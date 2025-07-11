import React, { useState, useEffect, CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getApprovalRequests, updateApprovalRequest, ApprovalRequest } from '../../utils/approval';

interface ManagerDashboardProps {
  filterType?: 'movie' | 'promotion' | 'screening';
}

const videoResponsiveStyle: CSSProperties = {
  position: 'relative',
  paddingBottom: '56.25%' /* Tỷ lệ 16:9 */,
  height: 0,
  overflow: 'hidden',
  borderRadius: '0.375rem',
  marginTop: '0.5rem',
};

const videoIframeStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 0,
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ filterType }) => {
  const location = useLocation();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Thêm state cho việc lọc cục bộ
  const [localFiltered, setLocalFiltered] = useState<ApprovalRequest[]>([]);

  // Nếu có filterType được truyền vào thông qua prop, sử dụng nó
  const [filterTypeState, setFilterTypeState] = useState<string>(filterType || 'all');

  // Thêm state để lưu khoảng thời gian lọc
  const [dateFilter, setDateFilter] = useState<number>(30); // Mặc định hiển thị 30 ngày gần nhất

  // 1. Thêm state quản lý phân trang (thêm vào sau dòng khai báo state filterStatus)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch dữ liệu chỉ một lần khi component mount
  useEffect(() => {
    if (filterType) {
      setFilterTypeState(filterType);
    }

    // Chỉ fetch dữ liệu một lần khi component được tạo
    // hoặc khi filterType thay đổi (không phải khi route thay đổi)
    fetchApprovalRequests();
  }, [filterType]); // Chỉ phụ thuộc vào filterType

  // Thêm vào useEffect xử lý bộ lọc
  useEffect(() => {
    let filtered = [...requests];

    if (filterTypeState !== 'all') {
      filtered = filtered.filter(req => req.type === filterTypeState);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Thêm lọc theo ngày
    if (dateFilter > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateFilter); // Lấy ngày cách đây dateFilter ngày

      filtered = filtered.filter(req => {
        const requestDate = new Date(req.createdAt);
        return requestDate >= cutoffDate;
      });
    }

    setLocalFiltered(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  }, [requests, filterTypeState, filterStatus, dateFilter]);

  // 2. Thêm logic phân trang (thêm vào sau đoạn code lọc dữ liệu localFiltered)
  // Tính toán các yêu cầu hiển thị cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = localFiltered.slice(indexOfFirstItem, indexOfLastItem);

  // Sửa hàm fetchApprovalRequests để không hiển thị loading khi không cần thiết
  const fetchApprovalRequests = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const params = filterType ? { type: filterType } : filterTypeState !== 'all' ? { type: filterTypeState } : {};

      const data = await getApprovalRequests(params);

      setRequests(data);
      setLocalFiltered(data);
      return true; // Trả về true khi thành công
    } catch (err) {
      console.error('Error fetching approval requests:', err);
      setError('Failed to fetch approval requests');
      toast.error('Không thể tải danh sách yêu cầu phê duyệt');
      throw err; // Ném lỗi để xử lý ở phía gọi hàm
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setIsLoading(true);
      // Đảm bảo API trả về dữ liệu phim đã cập nhật đầy đủ
      const updatedData = await updateApprovalRequest(requestId, 'approved');

      // Cập nhật state với dữ liệu đầy đủ từ API
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId
            ? {
              ...req,
              status: 'approved',
              managerId: { _id: 'currentUser', name: 'Current Manager' },
              requestData: updatedData.requestData // Cập nhật dữ liệu mới
            }
            : req
        )
      );

      toast.success('Yêu cầu đã được phê duyệt thành công!');
      setSelectedRequest(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi phê duyệt yêu cầu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      setIsLoading(true);
      await updateApprovalRequest(requestId, 'rejected', rejectionReason);

      // Cập nhật trạng thái trong state local
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId
            ? { ...req, status: 'rejected', rejectionReason: rejectionReason, managerId: { _id: 'currentUser', name: 'Current Manager' } }
            : req
        )
      );

      toast.success('Đã từ chối yêu cầu thành công!');
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu!');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'movie': return 'Phim';
      case 'promotion': return 'Khuyến Mãi';
      case 'screening': return 'Lịch Chiếu';
      default: return type;
    }
  };

  // Thêm hàm mới để lấy tên của yêu cầu
  const getRequestName = (request: ApprovalRequest): string => {
    if (!request || !request.requestData) return 'Không có dữ liệu';

    switch (request.type) {
      case 'movie':
        return request.requestData.title || 'Phim không tên';
      case 'promotion':
        return request.requestData.name || 'Khuyến mãi không tên';
      case 'screening':
        // Kiểm tra xem movieId có phải là object hay không
        if (typeof request.requestData.movieId === 'object' && request.requestData.movieId !== null) {
          return request.requestData.movieId.title || 'Lịch chiếu không tên';
        } else {
          return 'Lịch chiếu: ' + (request.requestData.movieId || 'Không xác định');
        }
      default:
        return 'Không xác định';
    }
  };

  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getYoutubeIdFromUrl = (url: string): string => {
    if (!url) return '';

    // Xử lý URLs dạng youtu.be
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }

    // Xử lý URLs dạng youtube.com/watch?v=
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : '';
  };

  const parsePersonList = (data: any): string[] => {
    if (!data) return [];

    // Nếu là mảng, trả về mảng đã được xử lý
    if (Array.isArray(data)) {
      return data.map(item => typeof item === 'string' ? item.trim() : String(item)).filter(Boolean);
    }

    // Nếu là chuỗi
    if (typeof data === 'string') {
      // Xóa tất cả dấu ngoặc vuông và ngoặc kép
      const cleanedString = data.replace(/^\[|\]$|"/g, '');

      // Nếu chuỗi rỗng sau khi xóa
      if (!cleanedString.trim()) return [];

      // Tách theo dấu phẩy và loại bỏ khoảng trắng
      return cleanedString.split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Quản Lý Phê Duyệt</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Danh Sách Yêu Cầu</h2>
            <div className="flex items-center space-x-4">
              {/* Bộ lọc theo loại - ẩn khi đã có filterType */}
              {!filterType && (
                <select
                  value={filterTypeState}
                  onChange={(e) => setFilterTypeState(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Tất Cả Loại</option>
                  <option value="movie">Phim</option>
                  <option value="promotion">Khuyến Mãi</option>
                  <option value="screening">Lịch Chiếu</option>
                </select>
              )}

              {/* Bộ lọc theo trạng thái - vẫn giữ lại */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="pending">Chờ Duyệt</option>
                <option value="approved">Đã Duyệt</option>
                <option value="rejected">Từ Chối</option>
              </select>

              {/* Thêm dropdown để chọn khoảng thời gian */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={0}>Tất cả thời gian</option>
                <option value={7}>7 ngày gần đây</option>
                <option value={30}>30 ngày gần đây</option>
                <option value={90}>90 ngày gần đây</option>
                <option value={180}>6 tháng gần đây</option>
              </select>

              <button
                onClick={() => {
                  fetchApprovalRequests(true)
                    .then(() => {
                      toast.success('Đã cập nhật dữ liệu thành công!');
                    });
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                Cập Nhật Dữ Liệu
              </button>
            </div>
          </div>

          <div className="overflow-x-auto relative">
            {/* {isLoading && !selectedRequest && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )} */}

            {isLoading && !selectedRequest && (
              <div className="text-center py-1 text-sm text-blue-600">
                Đang cập nhật...
              </div>
            )}

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người Yêu Cầu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getRequestName(request)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getRequestTypeLabel(request.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.staffId?.name || 'Không xác định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status === 'pending' ? 'Chờ Duyệt' :
                              request.status === 'approved' ? 'Đã Duyệt' :
                                'Từ Chối'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block group">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <div className="absolute right-0 top-0 transform -translate-y-full mt-[-5px] bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Xem chi tiết
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {isLoading ? 'Đang tải...' : 'Không tìm thấy yêu cầu nào'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 4. Thêm UI phân trang vào cuối bảng (sau thẻ table) */}
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &laquo;
                </button>

                {Array.from({ length: Math.ceil(localFiltered.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded ${currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(localFiltered.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(localFiltered.length / itemsPerPage)}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Chi Tiết Yêu Cầu
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs for different sections */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex">
                  <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                    Thông Tin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status === 'pending' ? 'Chờ Duyệt' :
                        selectedRequest.status === 'approved' ? 'Đã Duyệt' :
                          'Từ Chối'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời Gian Yêu Cầu</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Người Yêu Cầu</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.staffId?.name || 'Không xác định'}</p>
                </div>
              </div>

              {/* Nội dung yêu cầu - hiển thị theo loại */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Nội Dung Yêu Cầu</h4>

                {selectedRequest.type === 'movie' && selectedRequest.requestData && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700">Thông Tin Cơ Bản</h5>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Tiêu đề:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.title}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Thể loại:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.genre}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Thời lượng:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.duration} phút</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Ngày phát hành:</span>
                            <span className="text-sm ml-2">{new Date(selectedRequest.requestData.releaseDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Ngày kết thúc:</span>
                            <span className="text-sm ml-2">
                              {selectedRequest.requestData.endDate
                                ? new Date(selectedRequest.requestData.endDate).toLocaleDateString('vi-VN')
                                : 'Chưa xác định'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Quốc gia:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.country}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Trạng thái chiếu:</span>
                            <span className="text-sm ml-2">
                              {selectedRequest.requestData.showingStatus === 'coming-soon' ? 'Sắp chiếu' :
                                selectedRequest.requestData.showingStatus === 'now-showing' ? 'Đang chiếu' : 'Đã kết thúc'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Nhà sản xuất:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.producer}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700">Ảnh Poster</h5>
                        {selectedRequest.requestData.posterUrl && (
                          <div className="mt-2">
                            <img
                              src={selectedRequest.requestData.posterUrl}
                              alt="Poster"
                              className="w-full max-h-40 object-contain rounded-md"
                            />
                          </div>
                        )}

                        <h5 className="font-medium text-gray-700 mt-4">Trailer</h5>
                        {selectedRequest.requestData.trailerUrl && (
                          <div className="mt-2">
                            <div style={videoResponsiveStyle}>
                              <iframe
                                style={videoIframeStyle}
                                src={`https://www.youtube.com/embed/${getYoutubeIdFromUrl(selectedRequest.requestData.trailerUrl)}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700">Mô Tả</h5>
                      <p className="text-sm mt-2">{selectedRequest.requestData.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h5 className="font-medium text-gray-700">Đạo Diễn</h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {parsePersonList(selectedRequest.requestData.directors).map((director, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {director}
                            </span>
                          ))}
                          {parsePersonList(selectedRequest.requestData.directors).length === 0 && (
                            <span className="text-sm text-gray-500">Không có thông tin</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700">Diễn Viên</h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {parsePersonList(selectedRequest.requestData.actors).map((actor, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {actor}
                            </span>
                          ))}
                          {parsePersonList(selectedRequest.requestData.actors).length === 0 && (
                            <span className="text-sm text-gray-500">Không có thông tin</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.type === 'screening' && selectedRequest.requestData && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Phim:</span>
                          <span className="ml-2">{selectedRequest.requestData.movieId?.title || selectedRequest.requestData.movieId}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Phòng:</span>
                          <span className="ml-2">{selectedRequest.requestData.roomId?.name || selectedRequest.requestData.roomId}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Rạp:</span>
                          <span className="ml-2">{selectedRequest.requestData.theaterId?.name || selectedRequest.requestData.theaterId}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Thời gian bắt đầu:</span>
                          <span className="ml-2">
                            {new Date(selectedRequest.requestData.startTime).toLocaleString('vi-VN', { hour12: false })}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Thời gian kết thúc:</span>
                          <span className="ml-2">
                            {new Date(selectedRequest.requestData.endTime).toLocaleString('vi-VN', { hour12: false })}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Giá vé:</span>
                          <span className="ml-2">{selectedRequest.requestData.ticketPrice?.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Trạng thái:</span>
                          <span className="ml-2 capitalize">{selectedRequest.requestData.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Người tạo:</span>
                          <span className="ml-2">
                            {selectedRequest.requestData.createdByName ||
                              selectedRequest.requestData.createdBy?.name ||
                              selectedRequest.requestData.createdBy ||
                              'Không xác định'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Người duyệt:</span>
                          <span className="ml-2">{selectedRequest.requestData.approvedBy?.name || 'Chưa duyệt'}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Ngày tạo:</span>
                          <span className="ml-2">{new Date(selectedRequest.requestData.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Ngày cập nhật:</span>
                          <span className="ml-2">{new Date(selectedRequest.requestData.updatedAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedRequest.type === 'promotion' && selectedRequest.requestData && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700">Thông Tin Khuyến Mãi</h5>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Mã khuyến mãi:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.code}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Tên khuyến mãi:</span>
                            <span className="text-sm ml-2">{selectedRequest.requestData.name}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Loại khuyến mãi:</span>
                            <span className="text-sm ml-2">
                              {selectedRequest.requestData.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Giá trị:</span>
                            <span className="text-sm ml-2">
                              {selectedRequest.requestData.type === 'percent'
                                ? `${selectedRequest.requestData.value}%`
                                : `${selectedRequest.requestData.value.toLocaleString('vi-VN')}đ`}
                            </span>
                          </div>
                        </div>

                        <h5 className="font-medium text-gray-700 mt-4">Thời Gian</h5>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Ngày bắt đầu:</span>
                            <span className="text-sm ml-2">
                              {new Date(selectedRequest.requestData.startDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Ngày kết thúc:</span>
                            <span className="text-sm ml-2">
                              {new Date(selectedRequest.requestData.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700">Ảnh Khuyến Mãi</h5>
                        {selectedRequest.requestData.posterUrl ? (
                          <div className="mt-2 border rounded-lg overflow-hidden">
                            <img
                              src={selectedRequest.requestData.posterUrl}
                              alt={selectedRequest.requestData.name}
                              className="w-full h-48 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 p-4 bg-gray-100 rounded-lg text-gray-500 text-sm text-center">
                            Không có ảnh khuyến mãi
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700">Mô Tả</h5>
                      <p className="text-sm mt-2">{selectedRequest.requestData.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Lý Do Từ Chối</label>
                  <p className="mt-1 p-2 bg-red-50 text-sm text-red-600 rounded-md">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lý Do Từ Chối</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối (bắt buộc khi từ chối yêu cầu)"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Phê Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ManagerDashboard);
