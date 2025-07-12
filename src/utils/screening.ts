import api from './api';

export interface Screening {
    _id: string;
    movieId: {
        _id: string;
        title: string;
        genre: string;
        duration?: number;
        posterUrl?: string;
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
        const response = await api.get<ApiResponse<Screening[]>>(`/api/screenings`, { params });
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching screenings:', error);
        return [];
    }
};

export const getScreeningById = async (id: string): Promise<Screening> => {
    try {
        const response = await api.get<ApiResponse<Screening>>(`/api/screenings/${id}`);
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
        const response = await api.post<ApiResponse<Screening>>(`/api/screenings`, screeningData);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error: any) {
        if (error.response) {
            console.error('Error creating screening:', error.response.data);
            throw new Error(error.response.data.message || 'Unknown error');
        }
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
        const response = await api.put<ApiResponse<Screening>>(`/api/screenings/${id}`, screeningData);
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
        const response = await api.delete<ApiResponse<null>>(`/api/screenings/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return { message: response.data.message };
    } catch (error) {
        console.error(`Error deleting screening with id ${id}:`, error);
        throw error;
    }
};

export const getScreeningsByStatus = async (status: 'pending' | 'approved' | 'rejected'): Promise<Screening[]> => {
    try {
        const response = await api.get<ApiResponse<Screening[]>>(`/api/screenings/status/${status}`);
        if (response.data.success && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error fetching screenings by status ${status}:`, error);
        return [];
    }
};

export const getScheduleByTheater = async (date: string): Promise<TheaterSchedule[]> => {
    try {
        const response = await api.get<ApiResponse<TheaterSchedule[]>>(`/api/screenings/public`, {
            params: { date }
        });
        return response.data.data || [];
    } catch (error) {
        console.error(`Error fetching schedule for date ${date}:`, error);
        return [];
    }
};

export const getMemberScreeningById = async (id: string): Promise<Screening> => {
    try {
        const response = await api.get<ApiResponse<Screening>>(`/api/screenings/member/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error) {
        console.error(`Error fetching member screening with id ${id}:`, error);
        throw error;
    }
};

export const getPublicScreenings = async (): Promise<Screening[]> => {
    try {
        const response = await api.get<ApiResponse<Screening[]>>(`/api/screenings/public`);
        if (response.data.success && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching public screenings:', error);
        return [];
    }
};

export const getPublicScreeningById = async (id: string): Promise<Screening> => {
    try {
        const response = await api.get<ApiResponse<Screening>>(`/api/screenings/public/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data!;
    } catch (error) {
        console.error(`Error fetching public screening with id ${id}:`, error);
        throw error;
    }
};

export const getPublicScreeningsByTheaterAndDate = async (theaterId: string, startTime: string): Promise<Screening[]> => {
    try {
        const response = await api.get<ApiResponse<Screening[]>>(`/api/screenings/public`, {
            params: { theaterId, startTime }
        });
        if (response.data.success && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching public screenings by theater and date:', error);
        return [];
    }
};
