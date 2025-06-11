import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ApprovalRequest {
  _id: string;
  staffId: {
    _id: string;
    name: string;
  };
  managerId: {
    _id: string;
    name: string;
  } | null;
  type: 'movie' | 'promotion' | 'screening';
  requestData: any;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for testing UI
const mockRequests: ApprovalRequest[] = [
  {
    _id: '1',
    staffId: {
      _id: 'staff1',
      name: 'Nhân Viên A'
    },
    managerId: null,
    type: 'movie',
    requestData: {
      title: 'Avengers: Endgame',
      genre: 'Action',
      duration: 180,
      releaseDate: '2024-03-15'
    },
    status: 'pending',
    rejectionReason: null,
    referenceId: 'movie1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    staffId: {
      _id: 'staff2',
      name: 'Nhân Viên B'
    },
    managerId: {
      _id: 'manager1',
      name: 'Quản Lý X'
    },
    type: 'promotion',
    requestData: {
      name: 'Khuyến Mãi Tết 2024',
      discount: 20,
      startDate: '2024-02-01',
      endDate: '2024-02-15'
    },
    status: 'approved',
    rejectionReason: null,
    referenceId: 'promo1',
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-01-21T10:30:00.000Z'
  },
  {
    _id: '3',
    staffId: {
      _id: 'staff3',
      name: 'Nhân Viên C'
    },
    managerId: {
      _id: 'manager1',
      name: 'Quản Lý X'
    },
    type: 'screening',
    requestData: {
      movieTitle: 'Spider-Man: No Way Home',
      theater: 'Rạp 1',
      showtime: '19:30',
      date: '2024-03-20'
    },
    status: 'rejected',
    rejectionReason: 'Trùng lịch chiếu với phim khác',
    referenceId: 'screening1',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T11:45:00.000Z'
  }
];

const ManagerDashboard: React.FC = () => {
  const location = useLocation();
  const [requests] = useState<ApprovalRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    try {
      // Mock approve action
      toast.success('Yêu cầu đã được phê duyệt thành công!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setSelectedRequest(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi phê duyệt yêu cầu!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Mock reject action
      toast.success('Đã từ chối yêu cầu thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'movie':
        return 'Phim';
      case 'promotion':
        return 'Khuyến Mãi';
      case 'screening':
        return 'Lịch Chiếu';
      default:
        return type;
    }
  };

  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="flex space-x-2">
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                Làm Mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại Yêu Cầu
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
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getRequestTypeLabel(request.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.staffId.name}</div>
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
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Phê duyệt"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-red-600 hover:text-red-900"
                            title="Từ chối"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại Yêu Cầu</label>
                  <p className="mt-1 text-sm text-gray-900">{getRequestTypeLabel(selectedRequest.type)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Người Yêu Cầu</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.staffId.name}</p>
                </div>

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
                  <label className="block text-sm font-medium text-gray-700">Nội Dung Yêu Cầu</label>
                  <pre className="mt-1 p-4 bg-gray-50 rounded-md text-sm text-gray-900 overflow-auto">
                    {JSON.stringify(selectedRequest.requestData, null, 2)}
                  </pre>
                </div>

                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lý Do Từ Chối</label>
                    <p className="mt-1 text-sm text-red-600">{selectedRequest.rejectionReason}</p>
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
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard; 
