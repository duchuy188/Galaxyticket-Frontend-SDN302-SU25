import api from '../config/api';
import QRCode from 'qrcode';

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
    basePrice: number;
    discount: number;
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
    totalPrice?: number;
    basePrice?: number;
    discount?: number;
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

interface ApiError extends Error {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
        status?: number;
    };
}

export const getBookings = async (filters: BookingFilters): Promise<BookingResponse> => {
    try {
        const response = await api.get('/api/bookings', { params: filters });
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
        if (!bookingData.userId) {
            throw new Error('User ID is required');
        }
        if (!bookingData.screeningId) {
            throw new Error('Screening ID is required');
        }
        if (!Array.isArray(bookingData.seatNumbers) || bookingData.seatNumbers.length === 0) {
            throw new Error('At least one seat must be selected');
        }

        // Clean up the booking data
        const cleanBookingData = {
            userId: bookingData.userId,
            screeningId: bookingData.screeningId,
            seatNumbers: bookingData.seatNumbers,
            ...(bookingData.code && { code: bookingData.code })
        };

        // Attempt to create the booking
        const response = await api.post('/api/bookings', cleanBookingData);
        
        // Validate response
        if (!response.data) {
            throw new Error('No response data received from server');
        }
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Booking creation failed');
        }
        
        return response.data;
    } catch (error) {
        const apiError = error as ApiError;
        
        // Log detailed error for debugging
        console.error('Booking creation error:', {
            error: apiError,
            response: apiError.response?.data,
            status: apiError.response?.status,
            requestData: bookingData
        });
        
        // Handle specific error cases
        if (apiError.response?.status === 500) {
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
        }
        
        if (apiError.response?.status === 409) {
            throw new Error('Ghế đã được đặt. Vui lòng chọn ghế khác.');
        }
        
        if (apiError.response?.status === 400) {
            throw new Error(apiError.response.data?.message || 'Thông tin đặt vé không hợp lệ.');
        }
        
        // Default error message
        throw new Error(
            apiError.response?.data?.message || 
            apiError.message || 
            'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.'
        );
    }
};

export const cancelBooking = async (bookingId: string): Promise<BookingResponse> => {
    try {
        const response = await api.post(`/api/bookings/${bookingId}/cancel`);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Không thể hủy đặt vé');
        }

        return {
            success: true,
            message: response.data.message,
            booking: response.data.data
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error cancelling booking');
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        throw new Error(`Error cancelling booking: ${errorMessage}`);
    }
};

export const updateBooking = async (
    bookingId: string,
    updateData: UpdateBookingData
): Promise<Booking> => {
    try {
        const response = await api.put<{ booking: Booking }>(`/api/bookings/${bookingId}`, updateData);
        // Assuming the backend returns the updated booking in a `booking` property.
        if (response.data && response.data.booking) {
            return response.data.booking;
        }
        // Fallback for cases where the root object is the booking itself
        return response.data as unknown as Booking;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error updating booking');
        }
        throw error;
    }
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
    try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error fetching booking');
        }
        throw error;
    }
};

export const getUserBookings = async (): Promise<BookingResponse> => {
    try {
        const response = await api.get('/api/bookings/user');
        
        // Handle the new response structure where bookings are nested in data
        const bookingsData = response.data?.data?.bookings || response.data?.bookings;
        
        if (!bookingsData || !Array.isArray(bookingsData)) {
            console.error('Invalid response structure from /user:', response.data);
            return { message: "Invalid data from server", bookings: [] };
        }

        // Generate QR codes for each booking
        const bookingsWithQrCode = await Promise.all(
            bookingsData.map(async (booking: any) => {
                if (!booking?._id || !booking.screeningId) {
                    console.warn("Skipping invalid booking object returned from API:", booking);
                    return null;
                }

                try {
                    const qrContent = [
                        `Mã đặt vé: ${booking._id.toString()}`,
                        `Phim: ${booking.screeningId.movieId?.title || 'N/A'}`,
                        `Thời gian chiếu phim: ${booking.screeningId.startTime ? (() => {
                            const d = new Date(booking.screeningId.startTime);
                            if (isNaN(d.getTime())) return 'N/A';
                            const vnDate = new Date(d.getTime() - (7 * 60 * 60 * 1000));
                            const day = vnDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                            const time = vnDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
                            return `Ngày: ${day} vào lúc: ${time}`;
                        })() : 'N/A'}`,
                        `Phòng: ${booking.screeningId.roomId?.name || 'N/A'}`,
                        `Ghế: ${booking.seatNumbers.join(', ')}`,
                        `Tổng tiền: ${(booking.totalPrice || 0).toLocaleString('vi-VN')} VND`,
                        `Ngày đặt: Ngày: ${new Date(booking.createdAt).toLocaleDateString('vi-VN')} vào lúc: ${new Date(booking.createdAt).getHours().toString().padStart(2, '0')}:${new Date(booking.createdAt).getMinutes().toString().padStart(2, '0')}`
                    ].join('\n');
                    const qrCodeDataUrl = await QRCode.toDataURL(qrContent);

                    return {
                        ...booking,
                        movieTitle: booking.screeningId.movieId?.title || "N/A",
                        moviePoster: booking.screeningId.movieId?.poster,
                        roomName: booking.screeningId.roomId?.name || "N/A",
                        screeningTime: booking.screeningId.startTime,
                        seatNumbers: booking.seatNumbers || [],
                        totalPrice: booking.totalPrice,
                        bookingDate: booking.createdAt,
                        qrCodeDataUrl
                    };
                } catch (e) {
                    console.error(`Failed to process booking ${booking._id}`, e);
                    return {
                        ...booking,
                        qrCodeDataUrl: null // Indicate that QR code generation failed
                    };
                }
            })
        );
        
        const validBookings = bookingsWithQrCode.filter(Boolean) as Booking[];

        return {
            message: response.data.message || 'Lấy danh sách vé đã đặt thành công',
            bookings: validBookings
        };
    } catch (error: any) {
        console.error("Failed to fetch user bookings:", error);
        if (error.response) {
            throw new Error(error.response.data?.message || 'Error fetching user bookings');
        }
        throw new Error('Could not fetch bookings. Please try again later.');
    }
};

export const updateBookingStatus = async (bookingId: string): Promise<BookingResponse> => {
    try {
        // Lấy thông tin booking details từ sessionStorage
        const storedDetails = sessionStorage.getItem('bookingDetails');
        const bookingDetails = storedDetails ? JSON.parse(storedDetails) : null;

        if (!bookingDetails) {
            throw new Error('Không tìm thấy thông tin đặt vé');
        }

        // Gọi API để cập nhật trạng thái và thông tin giá
        const response = await api.post(`/api/bookings/${bookingId}/status`, {
            totalPrice: Number(bookingDetails.total),
            basePrice: Number(bookingDetails.basePrice),
            discount: Number(bookingDetails.discount),
            paymentStatus: 'paid'
        });

        // Cập nhật lại thông tin xác nhận trong sessionStorage
        const confirmationDetails = {
            bookingId: bookingId,
            movieTitle: bookingDetails.movieTitle,
            screeningTime: `${bookingDetails.date} ${bookingDetails.time}`,
            roomName: bookingDetails.room,
            seatNumbers: bookingDetails.seats,
            totalPrice: Number(bookingDetails.total),
            basePrice: Number(bookingDetails.basePrice),
            discount: Number(bookingDetails.discount),
            paymentStatus: 'paid'
        };
        sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));
        
        return {
            success: true,
            message: 'Cập nhật trạng thái thành công',
            booking: {
                ...response.data.booking,
                totalPrice: Number(bookingDetails.total),
                basePrice: Number(bookingDetails.basePrice),
                discount: Number(bookingDetails.discount)
            }
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error updating booking status');
        }
        throw error;
    }
};

export const sendTicketEmail = async (bookingId: string): Promise<BookingResponse> => {
    try {
        const response = await api.post('/api/bookings/email-ticket', { bookingId });
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
