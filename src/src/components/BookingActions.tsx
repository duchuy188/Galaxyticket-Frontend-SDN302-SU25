import React, { useState } from 'react';
import { cancelBooking, updateBooking } from '../utils/booking';

interface BookingActionsProps {
    bookingId: string;
    currentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
    onActionSuccess?: () => void;
    className?: string;
}

const BookingActions: React.FC<BookingActionsProps> = ({
    bookingId,
    currentStatus,
    onActionSuccess,
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState<'update' | 'cancel' | null>(null);

    const handleUpdateBooking = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setActionType('update');

        try {
            // Lấy thông tin booking details từ sessionStorage
            const storedDetails = sessionStorage.getItem('bookingDetails');
            const bookingDetails = storedDetails ? JSON.parse(storedDetails) : null;

            if (!bookingDetails) {
                throw new Error('Không tìm thấy thông tin đặt vé');
            }

            // Tính toán giá và giảm giá giống như trong trang Checkout
            const totalBeforeDiscount = bookingDetails.basePrice * bookingDetails.seats.length;
            const discountAmount = bookingDetails.discount || 0;
            const finalTotal = totalBeforeDiscount - discountAmount;

            // Cập nhật trạng thái thanh toán thành 'paid' và giữ lại thông tin giá
            await updateBooking(bookingId, {
                paymentStatus: 'paid',
                totalPrice: finalTotal,
                basePrice: bookingDetails.basePrice,
                discount: discountAmount
            });

            // Cập nhật lại thông tin xác nhận trong sessionStorage
            const confirmationDetails = {
                bookingId: bookingId,
                movieTitle: bookingDetails.movieTitle,
                screeningTime: `${bookingDetails.date} ${bookingDetails.time}`,
                roomName: bookingDetails.room,
                seatNumbers: bookingDetails.seats,
                totalPrice: finalTotal,
                basePrice: bookingDetails.basePrice,
                discount: discountAmount,
                paymentStatus: 'paid'
            };
            sessionStorage.setItem('confirmationDetails', JSON.stringify(confirmationDetails));

            // Cập nhật lại bookingDetails trong sessionStorage với giá mới
            const updatedBookingDetails = {
                ...bookingDetails,
                total: finalTotal,
                basePrice: bookingDetails.basePrice,
                discount: discountAmount
            };
            sessionStorage.setItem('bookingDetails', JSON.stringify(updatedBookingDetails));

            if (onActionSuccess) {
                onActionSuccess();
            }

            // Hiển thị thông báo thành công
            alert('Cập nhật vé thành công!');
        } catch (error: any) {
            console.error('Error updating booking:', error);
            alert(`Lỗi cập nhật vé: ${error.message}`);
        } finally {
            setIsLoading(false);
            setActionType(null);
        }
    };

    const handleCancelBooking = async () => {
        if (isLoading) return;

        // Xác nhận trước khi hủy
        const confirmed = window.confirm('Bạn có chắc chắn muốn hủy vé này không?');
        if (!confirmed) return;

        setIsLoading(true);
        setActionType('cancel');

        try {
            await cancelBooking(bookingId);

            if (onActionSuccess) {
                onActionSuccess();
            }

            // Hiển thị thông báo thành công
            alert('Hủy vé thành công!');
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            alert(`Lỗi hủy vé: ${error.message}`);
        } finally {
            setIsLoading(false);
            setActionType(null);
        }
    };

    // Không hiển thị button nếu vé đã bị hủy
    if (currentStatus === 'cancelled') {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <span className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md">
                    Vé đã bị hủy
                </span>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Button Cập nhật vé */}
            <button
                onClick={handleUpdateBooking}
                disabled={isLoading || currentStatus === 'paid'}
                className={`
                    flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentStatus === 'paid'
                        ? 'bg-green-100 text-green-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }
                    ${isLoading && actionType === 'update' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {isLoading && actionType === 'update' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang cập nhật...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {currentStatus === 'paid' ? 'Đã thanh toán' : 'Cập nhật vé'}
                    </>
                )}
            </button>

            {/* Button Hủy vé */}
            <button
                onClick={handleCancelBooking}
                disabled={isLoading}
                className={`
                    flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                    bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {isLoading && actionType === 'cancel' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang hủy...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hủy vé
                    </>
                )}
            </button>
        </div>
    );
};

export default BookingActions; 