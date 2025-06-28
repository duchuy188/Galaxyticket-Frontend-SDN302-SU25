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
}

export interface CreatePromotionData {
    code: string;
    name: string;
    description: string;
    type: 'percent' | 'fixed';
    value: number;
    startDate: string;
    endDate: string;
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
        throw new Error(error.response?.data?.message || 'Failed to fetch promotions');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch promotion');
    }
};

// Create new promotion
export const createPromotion = async (promotionData: CreatePromotionData): Promise<ApiResponse<Promotion>> => {
    try {
        const response = await axiosInstance.post('/api/promotions', promotionData);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Failed to create promotion');
    }
};

// Update promotion
export const updatePromotion = async (id: string, promotionData: Partial<CreatePromotionData>): Promise<ApiResponse<Promotion>> => {
    try {
        const response = await axiosInstance.put(`/api/promotions/${id}`, promotionData);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Failed to update promotion');
    }
};

// Delete promotion
export const deletePromotion = async (id: string): Promise<ApiResponse<void>> => {
    try {
        const response = await axiosInstance.delete(`/api/promotions/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete promotion');
    }
};

// Validate promotion code
export const validatePromotionCode = async (
    code: string,
    ticketPrice: number,
    numberOfSeats: number
): Promise<PromotionValidationResponse> => {
    try {
        console.log('Validating promo code:', code, 'with ticketPrice:', ticketPrice, 'and numberOfSeats:', numberOfSeats);
        const response = await axiosInstance.post('/api/promotions/validate', {
            code
        });

        // If the response is not successful, throw an error
        if (!response.data || response.data.message === 'Invalid or expired promotion code') {
            return {
                isValid: false,
                message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn'
            };
        }

        const promotion: Promotion = response.data;
        console.log('Promotion data from backend:', promotion);
        console.log('Promotion type:', promotion.type, 'Promotion value:', promotion.value);

        // Ensure promotion.value is a valid number
        const promotionValue = typeof promotion.value === 'number' ? promotion.value : parseFloat(promotion.value as any);
        if (isNaN(promotionValue)) {
            throw new Error('Giá trị khuyến mãi từ backend không phải là số hợp lệ.');
        }

        let calculatedDiscountedPrice = ticketPrice * numberOfSeats;
        console.log('Initial calculated price (before discount):', calculatedDiscountedPrice);

        if (promotion.type === 'percent') {
            calculatedDiscountedPrice = Math.round(calculatedDiscountedPrice * (1 - promotionValue / 100));
        } else if (promotion.type === 'fixed') {
            calculatedDiscountedPrice = Math.round(Math.max(0, calculatedDiscountedPrice - promotionValue));
        }
        console.log('Final calculated discounted price:', calculatedDiscountedPrice);

        return {
            isValid: true,
            discountedPrice: calculatedDiscountedPrice,
            message: 'Mã khuyến mãi đã được áp dụng!'
        };
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        console.error('Error validating promotion code:', error);
        return {
            isValid: false,
            message: error.response?.data?.message || 'Mã khuyến mãi không hợp lệ'
        };
    }
};