import React, { useState, useEffect } from 'react';
import { getAllPromotions } from '../../utils/promotion';
import { useNavigate } from 'react-router-dom';
import { Promotion } from '../../utils/promotion';

const UserPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAllPromotions('approved');
      // Lọc ra các mã giảm giá chưa hết hạn và chưa hết lượt sử dụng
      const currentDate = new Date();
      const validPromotions = response.data?.filter(promotion =>
        new Date(promotion.endDate) >= currentDate &&
        promotion.currentUsage < promotion.maxUsage
      ) || [];
      setPromotions(validPromotions);
    } catch (err: any) {
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPromotionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mã Giảm Giá Của Bạn</h1>

      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 transform transition-all duration-300 ease-in-out ${showNotification
          ? 'translate-y-0 opacity-100'
          : '-translate-y-16 opacity-0'
        }`}>
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-medium">Đã sao chép mã giảm giá!</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promotion: any) => (
            <div key={promotion._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  {promotion.posterUrl && (
                    <img
                      src={promotion.posterUrl}
                      alt={promotion.name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{promotion.name}</h3>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">{promotion.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyPromotionCode(promotion.code)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono font-bold text-gray-700">{promotion.code}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {promotion.type === 'percent'
                      ? `Giảm ${promotion.value}%`
                      : `Giảm ${promotion.value.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Có hiệu lực đến: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && promotions.length === 0 && (
        <div className="text-center text-gray-500">
          Hiện tại chưa có mã giảm giá nào.
        </div>
      )}
    </div>
  );
};

export default UserPromotions; 