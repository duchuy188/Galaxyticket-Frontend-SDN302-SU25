import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Theater {
    _id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    status: boolean;
    latitude?: string;
    longitude?: string;
    screens?: number;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export const getTheaters = async (): Promise<Theater[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/theaters`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching theaters:', error);
        throw error;
    }
};

export const getTheaterById = async (id: string): Promise<Theater> => {
    try {
        const response = await axios.get(`${API_URL}/api/theaters/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching theater with id ${id}:`, error);
        throw error;
    }
};

export const createTheater = async (theaterData: Omit<Theater, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Theater> => {
    try {
        const response = await axios.post(`${API_URL}/api/theaters`, theaterData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating theater:', error);
        throw error;
    }
};

export const updateTheater = async (id: string, theaterData: Partial<Theater>): Promise<Theater> => {
    try {
        const response = await axios.put(`${API_URL}/api/theaters/${id}`, theaterData);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating theater with id ${id}:`, error);
        throw error;
    }
};

export const deleteTheater = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/api/theaters/${id}`);
    } catch (error) {
        console.error(`Error deleting theater with id ${id}:`, error);
        throw error;
    }
};

export const getTheatersByStatus = async (status: 'active' | 'maintenance' | 'closed'): Promise<Theater[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/theaters/status/${status}`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error(`Error fetching theaters with status ${status}:`, error);
        return [];
    }
}; 