import React, { useState, useEffect } from 'react';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  Promotion,
  CreatePromotionData
} from '../../utils/promotion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromotionManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<CreatePromotionData>({
    code: '',
    name: '',
    description: '',
    type: 'percent',
    value: 0,
    startDate: '',
    endDate: ''
  });

  // Thêm hàm để lấy ngày hiện tại theo định dạng YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAllPromotions(selectedStatus);
      setPromotions(response.data || []);
    } catch (err: any) {
      toast.error(err.message);
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [selectedStatus]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN');
  };

  // Handle value input
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    let numberValue = parseInt(numericValue) || 0;
    
    // Nếu là kiểu phần trăm, giới hạn giá trị tối đa là 100
    if (formData.type === 'percent' && numberValue > 100) {
      numberValue = 100;
      toast.warning('Giá trị phần trăm không thể lớn hơn 100%');
    }
    
    setFormData(prev => ({
      ...prev,
      value: numberValue
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        throw new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
      }

      // Validate giá trị phần trăm
      if (formData.type === 'percent' && (formData.value <= 0 || formData.value > 100)) {
        throw new Error('Giá trị phần trăm phải nằm trong khoảng 1-100%');
      }

      // Validate giá trị tiền
      if (formData.type === 'fixed' && formData.value <= 0) {
        throw new Error('Giá trị tiền phải lớn hơn 0');
      }

      if (editingPromotion) {
        await updatePromotion(editingPromotion._id, formData);
        toast.success('Cập nhật khuyến mãi thành công!');
      } else {
        await createPromotion(formData);
        toast.success('Tạo khuyến mãi thành công!');
      }
      
      setIsModalOpen(false);
      setEditingPromotion(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percent',
        value: 0,
        startDate: getCurrentDate(), // Reset về ngày hiện tại
        endDate: ''
      });
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.message);
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle promotion deletion
  const handleDelete = async (id: string) => {
    const promotion = promotions.find(p => p._id === id);
    let confirmMessage = 'Bạn có chắc chắn muốn xóa khuyến mãi này?';
    
    if (promotion?.status === 'approved') {
      confirmMessage = 'Khuyến mãi này đã được duyệt. Bạn có chắc chắn muốn xóa?';
    } else if (promotion?.status === 'rejected') {
      confirmMessage = `Khuyến mãi này đã bị từ chối với lý do: "${promotion.rejectionReason}". Bạn có chắc chắn muốn xóa?`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        setError(null);
        await deletePromotion(id);
        toast.success('Xóa khuyến mãi thành công!');
        fetchPromotions();
      } catch (err: any) {
        toast.error(err.message);
        if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
          navigate('/auth/signin');
        }
      }
    }
  };

  // Handle editing promotion
  const handleEdit = (promotion: Promotion) => {
    let confirmMessage = '';
    
    if (promotion.status === 'approved') {
      confirmMessage = 'Khuyến mãi này đã được duyệt. Nếu chỉnh sửa, trạng thái sẽ chuyển về chờ duyệt. Bạn có muốn tiếp tục?';
    } else if (promotion.status === 'rejected') {
      confirmMessage = `Khuyến mãi này đã bị từ chối với lý do: "${promotion.rejectionReason}". Nếu chỉnh sửa, trạng thái sẽ chuyển về chờ duyệt. Bạn có muốn tiếp tục?`;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

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

  // Check if user can edit/delete
  const canEditDelete = (promotion: Promotion) => {
    if (!user) return false;
    if (user.role === 'manager') return true; // Manager có thể edit/delete mọi trạng thái
    if (user.role === 'staff') {
      // Staff có thể edit/delete promotion ở trạng thái pending, approved hoặc rejected
      return ['pending', 'approved', 'rejected'].includes(promotion.status);
    }
    return false;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Khuyến mãi</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả các chương trình khuyến mãi</p>
          </div>
          {(user?.role === 'manager' || user?.role === 'staff') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 ease-in-out flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm Khuyến mãi
            </button>
          )}
        </div>

        {/* Filter Section */}
        {(user?.role === 'manager' || user?.role === 'staff') && (
          <div className="mt-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên & Mô tả
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                {(user?.role === 'manager' || user?.role === 'staff') && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu khuyến mãi
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promotion.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                      
                     
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promotion.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promotion.type === 'percent' ? 
                        `${promotion.value}%` : 
                        `${formatCurrency(promotion.value)}đ`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${promotion.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            promotion.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {getStatusText(promotion.status)}
                        </span>
                      </div>
                      {promotion.rejectionReason && (
                        <div className="mt-1 text-xs text-red-600">
                          Lý do: {promotion.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Bắt đầu: {new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>Kết thúc: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    {(user?.role === 'manager' || user?.role === 'staff') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canEditDelete(promotion) && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(promotion)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200 relative group"
                              title={`Chỉnh sửa${promotion.status !== 'pending' ? ' (Sẽ chuyển về trạng thái chờ duyệt)' : ''}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              <span className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                {promotion.status !== 'pending' ? 'Chỉnh sửa ' : 'Chỉnh sửa'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(promotion._id)}
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
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingPromotion ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khuyến mãi
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Nhập mã khuyến mãi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khuyến mãi
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Nhập tên khuyến mãi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    rows={3}
                    placeholder="Nhập mô tả khuyến mãi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại khuyến mãi
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'percent' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={formData.type === 'percent' ? formData.value : formatCurrency(formData.value)}
                    onChange={handleValueChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder={formData.type === 'percent' ? 'Nhập % giảm giá' : 'Nhập số tiền giảm'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={getCurrentDate()} // Giới hạn chỉ cho chọn từ ngày hiện tại trở đi
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={formData.startDate} // Ngày kết thúc phải sau ngày bắt đầu
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                    setFormData({
                      code: '',
                      name: '',
                      description: '',
                      type: 'percent',
                      value: 0,
                      startDate: '',
                      endDate: ''
                    });
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : editingPromotion ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManager;
