import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Room {
    _id: string;
    theaterId: string;
    name: string;
    totalSeats: number;
    isActive: boolean; 
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export const getRooms = async (): Promise<Room[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/rooms`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
};

export const getRoomById = async (id: string): Promise<Room> => {
    try {
        const response = await axios.get(`${API_URL}/api/rooms/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching room with id ${id}:`, error);
        throw error;
    }
};

export const createRoom = async (roomData: Omit<Room, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Room> => {
    try {
        const response = await axios.post(`${API_URL}/api/rooms`, roomData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
};

export const updateRoom = async (id: string, roomData: Partial<Room>): Promise<Room> => {
    try {
        const response = await axios.put(`${API_URL}/api/rooms/${id}`, roomData);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating room with id ${id}:`, error);
        throw error;
    }
};

export const deleteRoom = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/api/rooms/${id}`);
    } catch (error) {
        console.error(`Error deleting room with id ${id}:`, error);
        throw error;
    }
};

export const activateRoom = async (id: string): Promise<Room> => {
    try {
        const response = await axios.patch(`${API_URL}/api/rooms/${id}/activate`);
        return response.data.data;
    } catch (error) {
        console.error(`Error activating room with id ${id}:`, error);
        throw error;
    }
};
