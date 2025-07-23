import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Seat {
    _id: string;
    screeningId: string;
    seatNumber: string;
    status: 'available' | 'reserved' | 'booked';
    reservedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export const reserveSeat = async (screeningId: string, seatNumber: string): Promise<Seat> => {
    try {
        const response = await axios.post(`${API_URL}/api/seats/reserve`, {
            screeningId,
            seatNumber
        });
        return response.data.seat;
    } catch (error) {
        console.error('Error reserving seat:', error);
        throw error;
    }
};

export const checkSeatStatus = async (screeningId: string, seatNumber: string): Promise<{ status: string }> => {
    try {
        const response = await axios.get(`${API_URL}/api/seats/status`, {
            params: { screeningId, seatNumber }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking seat status:', error);
        throw error;
    }
};

export const releaseExpiredSeats = async (): Promise<{ modifiedCount: number }> => {
    try {
        const response = await axios.post(`${API_URL}/api/seats/release-expired`);
        return response.data;
    } catch (error) {
        console.error('Error releasing expired seats:', error);
        throw error;
    }
};

export const getScreeningSeats = async (screeningId: string): Promise<Seat[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/seats/screening/${screeningId}`);
        return Array.isArray(response.data.seats) ? response.data.seats : [];
    } catch (error) {
        console.error('Error fetching screening seats:', error);
        return [];
    }
};
