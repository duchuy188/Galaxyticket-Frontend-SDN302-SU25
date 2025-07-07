import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Payment Response Interface
interface PaymentResponse {
    code: string;
    message?: string;
    data?: {
        orderId?: string;
        amount?: number;
        orderInfo?: string;
        payDate?: string;
        transactionNo?: string;
        transactionId?: string;
    };
    error?: string;
}

export const createPaymentUrl = async (
    amount: number,
    bookingId: string,
    userId: string,
    ipAddr = '127.0.0.1'
): Promise<string> => {
    try {
        if (!amount || !bookingId || !userId) {
            throw new Error('Missing required fields');
        }

        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not authenticated');

        const response = await axios.post(
            `${API_URL}/api/vnpay/create_payment_url`,
            { amount, bookingId, userId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data && response.data.data) {
            return response.data.data;
        }

        throw new Error('Could not create payment URL');
    } catch (error) {
        console.error('Error in createPaymentUrl:', error);
        throw error;
    }
};

export const processPaymentReturn = async (queryParams: any): Promise<PaymentResponse> => {
    try {
        const response = await axios.post(`${API_URL}/api/vnpay/payment_return`, queryParams);
        
        return {
            code: response.data.code || '99',
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error('Error in processPaymentReturn:', error);
        return {
            code: '99',
            message: 'Error processing payment return',
            error: error.message
        };
    }
};
