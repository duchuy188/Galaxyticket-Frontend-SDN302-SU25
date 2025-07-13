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
  const [displayedPromotions, setDisplayedPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUsability, setSelectedUsability] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ title: '', message: '', onConfirm: () => void 0 });
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<CreatePromotionData>({
    code: '',
    name: '',
    description: '',
    type: 'percent',
    value: 0,
    startDate: '',
    endDate: '',
    maxUsage: 5
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Thêm state mới để quản lý modal xem chi tiết
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
      const data = response.data || [];
      setPromotions(data);
      setDisplayedPromotions(data);
    } catch (err: any) {
      toast.error(err.message);
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter promotions based on usability
  const filterPromotionsByUsability = (usabilityFilter: string) => {
    if (!usabilityFilter) {
      setDisplayedPromotions(promotions);
      return;
    }

    const today = new Date();
    
    if (usabilityFilter === 'usable') {
      // Khuyến mãi còn sử dụng được: đã duyệt, còn hạn sử dụng, và còn lượt sử dụng
      const usablePromotions = promotions.filter(promo => {
        const endDate = new Date(promo.endDate);
        const startDate = new Date(promo.startDate);
        return (
          promo.status === 'approved' && 
          endDate >= today && 
          startDate <= today &&
          (promo.maxUsage > (promo.currentUsage || 0))
        );
      });
      setDisplayedPromotions(usablePromotions);
    } else if (usabilityFilter === 'expired') {
      // Khuyến mãi hết hạn sử dụng: hết hạn hoặc hết lượt sử dụng
      const expiredPromotions = promotions.filter(promo => {
        const endDate = new Date(promo.endDate);
        const startDate = new Date(promo.startDate);
        return (
          endDate < today || 
          (promo.maxUsage <= (promo.currentUsage || 0)) ||
          startDate > today
        );
      });
      setDisplayedPromotions(expiredPromotions);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [selectedStatus]);

  useEffect(() => {
    filterPromotionsByUsability(selectedUsability);
  }, [selectedUsability, promotions]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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

      // Validate số lượng sử dụng
      if (!formData.maxUsage || formData.maxUsage < 1) {
        throw new Error('Số lượng sử dụng tối đa phải lớn hơn 0');
      }

      // Validate image for new promotion
      if (!editingPromotion && !selectedImage) {
        throw new Error('Vui lòng chọn ảnh cho khuyến mãi');
      }

      const promotionDataWithImage = {
        ...formData,
        posterFile: selectedImage || undefined
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion._id, promotionDataWithImage);
        toast.success('Cập nhật khuyến mãi thành công!');
      } else {
        await createPromotion(promotionDataWithImage);
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
        startDate: getCurrentDate(),
        endDate: '',
        maxUsage: 5
      });
      setSelectedImage(null);
      setImagePreview(null);
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

    setConfirmModalData({
      title: 'Xác nhận xóa',
      message: confirmMessage,
      onConfirm: async () => {
        try {
          setError(null);
          await deletePromotion(id);
          toast.success('Xóa khuyến mãi thành công!');
          fetchPromotions();
          setIsConfirmModalOpen(false);
        } catch (err: any) {
          toast.error(err.message);
          if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
            navigate('/auth/signin');
          }
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  // Handle editing promotion
  const handleEdit = (promotion: Promotion) => {
    let confirmMessage = '';

    if (promotion.status === 'approved') {
      confirmMessage = 'Khuyến mãi này đã được duyệt. Nếu chỉnh sửa, trạng thái sẽ chuyển về chờ duyệt. Bạn có muốn tiếp tục?';
    } else if (promotion.status === 'rejected') {
      confirmMessage = `Khuyến mãi này đã bị từ chối với lý do: "${promotion.rejectionReason}". Nếu chỉnh sửa, trạng thái sẽ chuyển về chờ duyệt. Bạn có muốn tiếp tục?`;
    }

    if (confirmMessage) {
      setConfirmModalData({
        title: 'Xác nhận chỉnh sửa',
        message: confirmMessage,
        onConfirm: () => {
          setEditingPromotion(promotion);
          setFormData({
            code: promotion.code,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            value: promotion.value,
            startDate: new Date(promotion.startDate).toISOString().split('T')[0],
            endDate: new Date(promotion.endDate).toISOString().split('T')[0],
            maxUsage: promotion.maxUsage || 5
          });
          if (promotion.posterUrl) {
            setImagePreview(promotion.posterUrl);
          }
          setIsModalOpen(true);
          setIsConfirmModalOpen(false);
        }
      });
      setIsConfirmModalOpen(true);
    } else {
      setEditingPromotion(promotion);
      setFormData({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        startDate: new Date(promotion.startDate).toISOString().split('T')[0],
        endDate: new Date(promotion.endDate).toISOString().split('T')[0],
        maxUsage: promotion.maxUsage || 5
      });
      if (promotion.posterUrl) {
        setImagePreview(promotion.posterUrl);
      }
      setIsModalOpen(true);
    }
  };

  // Thêm hàm xử lý khi click vào nút xem chi tiết
  const handleViewDetails = (promotion: Promotion) => {
    setViewingPromotion(promotion);
    setIsViewModalOpen(true);
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

  // Check promotion usability - mới tạo mặc định là còn hạn sử dụng
  const isPromotionUsable = (promotion: Promotion) => {
    // Khuyến mãi mới tạo (pending) mặc định là còn hạn sử dụng
    if (promotion.status === 'pending') {
      return true;
    }
    
    const today = new Date();
    const endDate = new Date(promotion.endDate);
    const startDate = new Date(promotion.startDate);
    
    return (
      endDate >= today && 
      startDate <= today &&
      (promotion.maxUsage > (promotion.currentUsage || 0))
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Quản Lý Khuyến Mãi</h2>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  await fetchPromotions();
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
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={() => {
              setEditingPromotion(null);
              setFormData({
                code: '',
                name: '',
                description: '',
                type: 'percent',
                value: 0,
                startDate: getCurrentDate(),
                endDate: '',
                maxUsage: 5
              });
              setSelectedImage(null);
              setImagePreview(null);
              setIsModalOpen(true);
            }}
          >
            Tạo Khuyến Mãi Mới
          </button>
        </div>

        {/* Filter Section */}
        {(user?.role === 'manager' || user?.role === 'staff') && (
          <div className="mt-4 flex flex-wrap gap-4">
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
            
            <select
              value={selectedUsability}
              onChange={(e) => setSelectedUsability(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả khuyến mãi</option>
              <option value="usable">Còn hạn sử dụng </option>
              <option value="expired">Hết hạn sử dụng</option>
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
                  Tên
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
                  Thời gian & Sử dụng
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
              ) : displayedPromotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu khuyến mãi
                  </td>
                </tr>
              ) : (
                displayedPromotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promotion.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {promotion.posterUrl && (
                          <img
                            src={promotion.posterUrl}
                            alt={promotion.name}
                            className="h-12 w-12 object-cover rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        </div>
                      </div>
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
                      {/* Chỉ hiển thị trạng thái từ chối nếu có */}
                      {promotion.status === 'rejected' && (
                        <div>
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Từ chối
                          </span>
                          {promotion.rejectionReason && (
                            <div className="mt-1 text-xs text-red-600">
                              Lý do: {promotion.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Hiển thị còn/hết hạn sử dụng */}
                      <div className={promotion.status === 'rejected' ? "mt-1" : ""}>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${isPromotionUsable(promotion) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {isPromotionUsable(promotion) ? 'Còn hạn sử dụng' : 'Hết hạn sử dụng'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Bắt đầu: {new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>Kết thúc: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                      <div className="mt-1">
                        Sử dụng: {promotion.currentUsage || 0}/{promotion.maxUsage}
                      </div>
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
                            <button
                              onClick={() => handleViewDetails(promotion)}
                              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 relative group"
                              title="Xem chi tiết"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              <span className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-1/2 transform -translate-x-1/2">
                                Xem chi tiết
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
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-4xl shadow-2xl rounded-2xl bg-white">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image upload section */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh khuyến mãi
                    </label>
                    <div className="mt-1 flex flex-col items-center space-y-2">
                      <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-4">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-4 flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Tải ảnh lên</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="VD: SUMMER2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="VD: Khuyến mãi hè 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        required
                      >
                        <option value="percent">Phần trăm</option>
                        <option value="fixed">Số tiền cố định</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.type === 'percent' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="value"
                        value={formData.type === 'percent' ? formData.value : formatCurrency(formData.value)}
                        onChange={handleValueChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder={formData.type === 'percent' ? 'VD: 10' : 'VD: 100,000'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min={getCurrentDate()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min={formData.startDate}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng sử dụng tối đa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxUsage"
                        value={formData.maxUsage}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          maxUsage: parseInt(e.target.value) || 5
                        }))}
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="VD: 100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        rows={3}
                        placeholder="Mô tả chi tiết về khuyến mãi"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </div>
                    ) : editingPromotion ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{confirmModalData.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{confirmModalData.message}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmModalData.onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {isViewModalOpen && viewingPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-4xl shadow-2xl rounded-2xl bg-white">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Chi tiết khuyến mãi
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image section */}
                <div className="md:col-span-1">
                  {viewingPromotion.posterUrl && (
                    <img
                      src={viewingPromotion.posterUrl}
                      alt={viewingPromotion.name}
                      className="w-full rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* Details section */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Mã khuyến mãi</h4>
                    <p className="text-lg font-medium">{viewingPromotion.code}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tên khuyến mãi</h4>
                    <p className="text-lg font-medium">{viewingPromotion.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Loại khuyến mãi</h4>
                    <p>{viewingPromotion.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Giá trị</h4>
                    <p>{viewingPromotion.type === 'percent' ? 
                      `${viewingPromotion.value}%` : 
                      `${formatCurrency(viewingPromotion.value)}đ`}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Thời gian hiệu lực</h4>
                    <p>Từ {new Date(viewingPromotion.startDate).toLocaleDateString('vi-VN')} đến {new Date(viewingPromotion.endDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Số lượng sử dụng</h4>
                    <p>{viewingPromotion.currentUsage || 0}/{viewingPromotion.maxUsage}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${viewingPromotion.status === 'approved' ? 'bg-green-100 text-green-800' :
                          viewingPromotion.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}
                      >
                        {getStatusText(viewingPromotion.status)}
                      </span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${isPromotionUsable(viewingPromotion) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {isPromotionUsable(viewingPromotion) ? 'Còn hạn sử dụng' : 'Hết hạn sử dụng'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Mô tả</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{viewingPromotion.description}</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManager;
