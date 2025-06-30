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

const PromotionManager: React.FC = () => {
  const navigate = useNavigate();
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

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAllPromotions(selectedStatus);
      setPromotions(response.data || []);
    } catch (err: any) {
      setError(err.message);
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

  // Thêm hàm format tiền
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN');
  };

  // Thêm hàm xử lý input giá trị
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    const numberValue = parseInt(numericValue) || 0;
    
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
      if (editingPromotion) {
        await updatePromotion(editingPromotion._id, formData);
      } else {
        await createPromotion(formData);
      }
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
      fetchPromotions();
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle promotion deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        await deletePromotion(id);
        fetchPromotions();
      } catch (err: any) {
        setError(err.message);
        if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
          navigate('/auth/signin');
        }
      }
    }
  };

  // Handle editing promotion
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Khuyến mãi</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm Khuyến mãi
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Promotions list */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Mã</th>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Loại</th>
              <th className="px-4 py-2">Giá trị</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Thời gian</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion._id} className="border-b">
                <td className="px-4 py-2">{promotion.code}</td>
                <td className="px-4 py-2">{promotion.name}</td>
                <td className="px-4 py-2">
                  {promotion.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}
                </td>
                <td className="px-4 py-2">
                  {promotion.type === 'percent' ? `${promotion.value}%` : `${promotion.value.toLocaleString()}đ`}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    promotion.status === 'approved' ? 'bg-green-100 text-green-800' :
                    promotion.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {promotion.status === 'approved' ? 'Đã duyệt' :
                     promotion.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(promotion.startDate).toLocaleDateString()} -
                  {new Date(promotion.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(promotion)}
                      className="group relative p-2 hover:bg-blue-50 rounded-full"
                      title="Sửa"
                    >
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                        Chỉnh sửa
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>

                    <button 
                      onClick={() => handleDelete(promotion._id)}
                      className="group relative p-2 hover:bg-red-50 rounded-full"
                      title="Xóa"
                    >
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2">
                        Xóa
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for creating/editing promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Mã khuyến mãi</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Tên khuyến mãi</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Loại khuyến mãi</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="percent">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  {formData.type === 'percent' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
                </label>
                <input
                  type="text"
                  name="value"
                  value={formData.type === 'percent' ? formData.value : formatCurrency(formData.value)}
                  onChange={handleValueChange}
                  className="w-full border p-2 rounded"
                  required
                  placeholder={formData.type === 'percent' ? 'Nhập % giảm giá' : 'Nhập số tiền giảm'}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Ngày kết thúc</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
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
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
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
