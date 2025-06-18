import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Screening {
    _id: string;
    movieId: {
        _id: string;
        title: string;
        genre: string;
        duration?: number;
    };
    roomId: {
        _id: string;
        name: string;
    };
    theaterId: {
        _id: string;
        name: string;
        address: string;
    };
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string | null;
    ticketPrice: number;
    createdBy: {
        _id: string;
        name: string;
    };
    approvedBy?: {
        _id: string;
        name: string;
    } | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TheaterSchedule {
    theaterId: string;
    theaterName: string;
    theaterAddress: string;
    screenings: {
        type: string;
        times: {
            screeningId: string;
            time: string;
            ticketPrice: number;
            roomId: string;
            movieId: string;
            movieTitle: string;
        }[];
    }[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    count?: number;
    status?: string;
}

export const getScreenings = async (status?: 'pending' | 'approved' | 'rejected'): Promise<Screening[]> => {
    try {
        const params = status ? { status } : {};
        const response = await axios.get<ApiResponse<Screening[]>>(`${API_URL}/api/screenings`, { params });
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching screenings:', error);
        return [];
    }
};

export const getScreeningById = async (id: string): Promise<Screening> => {
    try {
        const response = await axios.get<ApiResponse<Screening>>(`${API_URL}/api/screenings/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error) {
        console.error(`Error fetching screening with id ${id}:`, error);
        throw error;
    }
};

export const createScreening = async (screeningData: {
    movieId: string;
    roomId: string;
    theaterId: string;
    startTime: string;
    endTime?: string;
    ticketPrice?: number;
}): Promise<Screening> => {
    try {
        const response = await axios.post<ApiResponse<Screening>>(`${API_URL}/api/screenings`, screeningData);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error) {
        console.error('Error creating screening:', error);
        throw error;
    }
};

export const updateScreening = async (id: string, screeningData: {
    movieId?: string;
    roomId?: string;
    theaterId?: string;
    startTime?: string;
    endTime?: string;
    ticketPrice?: number;
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string | null;
    approvedBy?: string;
    isActive?: boolean;
}): Promise<Screening> => {
    try {
        const response = await axios.put<ApiResponse<Screening>>(`${API_URL}/api/screenings/${id}`, screeningData);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error) {
        console.error(`Error updating screening with id ${id}:`, error);
        throw error;
    }
};

export const deleteScreening = async (id: string): Promise<{ message: string }> => {
    try {
        const response = await axios.delete<ApiResponse<null>>(`${API_URL}/api/screenings/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return { message: response.data.message };
    } catch (error) {
        console.error(`Error deleting screening with id ${id}:`, error);
        throw error;
    }
};

export const getScreeningsByMovie = async (movieId: string): Promise<Screening[]> => {
    try {
        const response = await axios.get<Screening[]>(`${API_URL}/api/screenings/movie/${movieId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching screenings for movie ${movieId}:`, error);
        return [];
    }
};

export const getScheduleByTheater = async (date: string): Promise<TheaterSchedule[]> => {
    try {
        const response = await axios.get<ApiResponse<TheaterSchedule[]>>(`${API_URL}/api/screenings/schedule`, {
            params: { date }
        });
        return response.data.data || [];
    } catch (error) {
        console.error(`Error fetching schedule for date ${date}:`, error);
        return [];
    }
};
