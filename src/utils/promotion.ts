import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface PromotionValidationResponse {
    isValid: boolean;
    discountedPrice?: number;
    message: string;
}

interface Promotion {
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

export const validatePromotionCode = async (
    code: string,
    ticketPrice: number,
    numberOfSeats: number
): Promise<PromotionValidationResponse> => {
    try {
        console.log('Validating promo code:', code, 'with ticketPrice:', ticketPrice, 'and numberOfSeats:', numberOfSeats);
        const response = await axios.post(`${API_URL}/api/promotions/validate`, {
            code
        });

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

        return { isValid: true, discountedPrice: calculatedDiscountedPrice, message: 'Mã khuyến mãi đã được áp dụng!' };
    } catch (error: any) {
        console.error('Error validating promotion code:', error);
        return { isValid: false, message: error.response?.data?.message || 'Mã khuyến mãi không hợp lệ' };
    }
};