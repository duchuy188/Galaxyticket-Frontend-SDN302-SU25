import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Hàm helper để lấy token từ localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để tự động gắn token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface PromotionValidationResponse {
    isValid: boolean;
    discountedPrice?: number;
    message: string;
}

export interface Promotion {
    _id: string;
    code: string;
    name: string;
    description: string;
    type: 'percent' | 'fixed';
    value: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string | null;
    createdBy: string;
    approvedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    posterUrl?: string;
    maxUsage: number;      // Maximum number of times this promotion can be used
    currentUsage: number;  // Current number of times this promotion has been used
}

export interface CreatePromotionData {
    code: string;
    name: string;
    description: string;
    type: 'percent' | 'fixed';
    value: number;
    startDate: string;
    endDate: string;
    posterFile?: File; // Add this line
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    count?: number;
}

// Get all promotions
export const getAllPromotions = async (status?: string): Promise<ApiResponse<Promotion[]>> => {
    try {
        const query = status ? `?status=${status}` : '';
        const response = await axiosInstance.get(`/api/promotions${query}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách khuyến mãi');
    }
};

// Get promotion by ID
export const getPromotionById = async (id: string): Promise<ApiResponse<Promotion>> => {
    try {
        const response = await axiosInstance.get(`/api/promotions/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin khuyến mãi');
    }
};

// Create new promotion
export const createPromotion = async (promotionData: CreatePromotionData): Promise<ApiResponse<Promotion>> => {
    try {
        const formData = new FormData();
        Object.keys(promotionData).forEach(key => {
            const k = key as keyof CreatePromotionData;
            if (k === 'posterFile' && promotionData[k]) {
                formData.append('poster', promotionData[k] as File);
            } else {
                formData.append(key, String(promotionData[k]));
            }
        });

        const response = await axiosInstance.post('/api/promotions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        if (error.response?.status === 400) {
            throw new Error(error.response.data.message || 'Dữ liệu không hợp lệ');
        }
        throw new Error(error.response?.data?.message || 'Không thể tạo khuyến mãi');
    }
};

// Update promotion
export const updatePromotion = async (id: string, promotionData: Partial<CreatePromotionData>): Promise<ApiResponse<Promotion>> => {
    try {
        const formData = new FormData();
        Object.keys(promotionData).forEach(key => {
            const k = key as keyof CreatePromotionData;
            if (k === 'posterFile' && promotionData[k]) {
                formData.append('poster', promotionData[k] as File);
            } else if (promotionData[k] !== undefined) {
                formData.append(key, String(promotionData[k]));
            }
        });

        const response = await axiosInstance.put(`/api/promotions/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        if (error.response?.status === 404) {
            throw new Error('Không tìm thấy khuyến mãi');
        }
        if (error.response?.status === 400) {
            throw new Error(error.response.data.message || 'Dữ liệu không hợp lệ');
        }
        throw new Error(error.response?.data?.message || 'Không thể cập nhật khuyến mãi');
    }
};

// Delete promotion (soft delete)
export const deletePromotion = async (id: string): Promise<ApiResponse<void>> => {
    try {
        const response = await axiosInstance.delete(`/api/promotions/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        if (error.response?.status === 404) {
            throw new Error('Không tìm thấy khuyến mãi');
        }
        throw new Error(error.response?.data?.message || 'Không thể xóa khuyến mãi');
    }
};

// Validate promotion code
export const validatePromotionCode = async (
    code: string,
    ticketPrice: number,
    numberOfSeats: number
): Promise<PromotionValidationResponse> => {
    try {
        const response = await axiosInstance.post('/api/promotions/validate', {
            code
        });

        // If the response is not successful or promotion is not found
        if (!response.data || response.data.message === 'Invalid or expired promotion code') {
            return {
                isValid: false,
                message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn'
            };
        }

        const promotion: Promotion = response.data;

        // Ensure promotion.value is a valid number
        const promotionValue = typeof promotion.value === 'number' ? promotion.value : parseFloat(promotion.value as any);
        if (isNaN(promotionValue)) {
            throw new Error('Giá trị khuyến mãi không hợp lệ');
        }

        let calculatedDiscountedPrice = ticketPrice * numberOfSeats;

        if (promotion.type === 'percent') {
            calculatedDiscountedPrice = Math.round(calculatedDiscountedPrice * (1 - promotionValue / 100));
        } else if (promotion.type === 'fixed') {
            calculatedDiscountedPrice = Math.round(Math.max(0, calculatedDiscountedPrice - promotionValue));
        }

        return {
            isValid: true,
            discountedPrice: calculatedDiscountedPrice,
            message: 'Mã khuyến mãi đã được áp dụng!'
        };
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }

        // Handle usage limit exceeded message
        if (error.response?.data?.message === 'Mã khuyến mãi đã hết lượt sử dụng') {
            return {
                isValid: false,
                message: 'Mã khuyến mãi đã hết lượt sử dụng'
            };
        }

        return {
            isValid: false,
            message: error.response?.data?.message || 'Mã khuyến mãi không hợp lệ'
        };
    }
};