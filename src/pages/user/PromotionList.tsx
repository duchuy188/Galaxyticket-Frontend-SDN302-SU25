import React, { useState, useEffect } from 'react';
import { getAllPromotions } from '../../utils/promotion';
import { useNavigate } from 'react-router-dom';
import { Promotion } from '../../utils/promotion';

const UserPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAllPromotions('approved'); // Chỉ lấy các promotion đã được duyệt
      setPromotions(response.data || []);
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
    alert('Đã sao chép mã giảm giá!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mã Giảm Giá Của Bạn</h1>
      
      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promotion: any) => (
            <div key={promotion._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{promotion.name}</h3>
                  <p className="text-sm text-gray-600">{promotion.description}</p>
                </div>
                <button
                  onClick={() => copyPromotionCode(promotion.code)}
                  className="text-blue-600 hover:text-blue-800"
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
                <div className="flex justify-between mb-2">
                  <span>Hiệu lực từ:</span>
                  <span>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hết hạn:</span>
                  <span>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
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