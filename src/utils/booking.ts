import api from '../config/api';
import QRCode from 'qrcode';

const API_URL = 'http://localhost:5000';

export interface Room {
    _id: string;
    name: string;
}

export interface Movie {
    _id: string;
    title: string;
    poster: string;
}

export interface Screening {
    _id: string;
    roomId: Room;
    movieId: Movie;
    ticketPrice: number;
    startTime: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Booking {
    _id: string;
    userId: User;
    screeningId: Screening;
    seatNumbers: string[];
    totalPrice: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
    code?: string;
    createdAt: string;
    updatedAt: string;
    qrCodeDataUrl?: string;
    movieTitle?: string;
    moviePoster?: string;
    roomName?: string;
    screeningTime?: string;
    bookingDate?: string;
}

export interface CreateBookingData {
    userId: string;
    screeningId: string;
    seatNumbers: string[];
    code?: string;
}

export interface UpdateBookingData {
    seatNumbers?: string[];
    code?: string;
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
}

export interface BookingFilters {
    userId?: string;
    screeningId?: string;
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
    startDate?: string;
    endDate?: string;
}

export interface BookingResponse {
    success?: boolean;
    message: string;
    booking?: Booking;
    bookings?: Booking[];
    data?: any;
}

export const getBookings = async (filters: BookingFilters): Promise<BookingResponse> => {
    try {
        const response = await api.get(`${API_URL}/api/bookings`, { params: filters });
        return {
            message: response.data.message,
            bookings: response.data.bookings
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error fetching bookings');
        }
        throw error;
    }
};

export const createBooking = async (bookingData: CreateBookingData): Promise<BookingResponse> => {
    try {
        // Validate required fields
        if (!bookingData.userId || !bookingData.screeningId || !bookingData.seatNumbers) {
            throw new Error('Missing required fields');
        }

        const response = await api.post(`${API_URL}/api/bookings`, bookingData);
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error creating booking');
        }
        throw error;
    }
};

export const cancelBooking = async (bookingId: string): Promise<BookingResponse> => {
    try {
        const response = await api.put(`${API_URL}/api/bookings/${bookingId}/cancel`);
        return {
            message: response.data.message,
            booking: response.data.booking
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error cancelling booking');
        }
        throw error;
    }
};

export const updateBooking = async (
    bookingId: string,
    updateData: UpdateBookingData
): Promise<Booking> => {
    try {
        const response = await api.put(`${API_URL}/api/bookings/${bookingId}`, updateData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error updating booking');
        }
        throw error;
    }
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
    try {
        const response = await api.get(`${API_URL}/api/bookings/${bookingId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error fetching booking');
        }
        throw error;
    }
};

export const getUserBookings = async (userId: string): Promise<BookingResponse> => {
    try {
        const response = await api.get(`${API_URL}/api/bookings/user/${userId}`);
        const bookings = response.data.bookings;

        // Generate QR codes for each booking
        const bookingsWithQrCode = await Promise.all(bookings.map(async (booking: any) => {
            const qrContent = [
                `Mã đặt vé: ${booking._id.toString()}`,
                `Phim: ${booking.screeningId.movieId.title}`,
                `Thời gian chiếu phim: Ngày: ${new Date(booking.screeningId.startTime).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.screeningId.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`,
                `Phòng: ${booking.screeningId.roomId.name}`,
                `Ghế: ${booking.seatNumbers.join(', ')}`,
                `Tổng tiền: ${booking.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
                `Ngày đặt: Ngày: ${new Date(booking.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} vào lúc: ${new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`
            ].join('\n');
            const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

            return {
                ...booking,
                movieTitle: booking.screeningId.movieId.title,
                moviePoster: booking.screeningId.movieId.poster,
                roomName: booking.screeningId.roomId.name,
                screeningTime: booking.screeningId.startTime,
                seatNumbers: booking.seatNumbers,
                totalPrice: booking.totalPrice,
                bookingDate: booking.createdAt,
                qrCodeDataUrl
            };
        }));

        return {
            message: response.data.message,
            bookings: bookingsWithQrCode
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error fetching user bookings');
        }
        return {
            message: 'Error fetching user bookings',
            bookings: []
        };
    }
};

export const updateBookingStatus = async (bookingId: string): Promise<BookingResponse> => {
    try {
        const response = await api.post(`${API_URL}/api/bookings/${bookingId}/status`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error updating booking status');
        }
        throw error;
    }
};

export const sendTicketEmail = async (bookingId: string): Promise<BookingResponse> => {
    try {
        const response = await api.post(`${API_URL}/api/bookings/${bookingId}/send-ticket`);
        return {
            success: response.data.success,
            message: response.data.message
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error sending ticket email');
        }
        throw error;
    }
};
