import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Movie {
    // Các trường bắt buộc
    _id: string;
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: string;
    country: string;
    producer: string;
    directors: string[];
    actors: string[];
    showingStatus: 'coming-soon' | 'now-showing' | 'ended';
    status: 'pending' | 'approved' | 'rejected';
    posterUrl: string;
    
    // Các trường tùy chọn
    trailerUrl?: string;
    vietnameseTitle?: string;
    rating?: number;
    votes?: number;
    createdAt?: string;
    updatedAt?: string;
    rejectionReason?: string;
    createdBy?: string;
    approvedBy?: string | null;
    isActive?: boolean;
    __v?: number;
    endDate?: string | null;
    
    // Trường temporary cho file upload
    posterFile?: File;
}

export const getMovies = async (): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies/public`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
};

export const getMovieById = async (id: string): Promise<Movie> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching movie with id ${id}:`, error);
        throw error;
    }
};

export const createMovie = async (formData: FormData): Promise<Movie> => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/api/movies`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create movie');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating movie:', error);
        throw error;
    }
};

export const updateMovie = async (id: string, formData: FormData): Promise<Movie> => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/api/movies/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update movie');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Error updating movie with id ${id}:`, error);
        throw error;
    }
};

export const deleteMovie = async (id: string): Promise<void> => {
    try {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/api/movies/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(`Error deleting movie with id ${id}:`, error);
        throw error;
    }
};

export const getMoviesByStatus = async (status: 'now-showing' | 'coming-soon' | 'ended'): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies/status/${status}`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error(`Error fetching movies with status ${status}:`, error);
        return [];
    }
};

export const getPublicMovies = async (): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies/public`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching public movies:', error);
        return [];
    }
};

export const getStaffMovies = async (params?: { 
    genre?: string, 
    status?: 'pending' | 'approved' | 'rejected', 
    showingStatus?: 'coming-soon' | 'now-showing' | 'ended' 
}): Promise<Movie[]> => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/api/movies`, { 
            params,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching staff movies:', error);
        return [];
    }
};

export const activateMovie = async (id: string): Promise<Movie> => {
    try {
        const token = getAuthToken();
        const response = await axios.patch(`${API_URL}/api/movies/${id}/activate`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error(`Error activating movie with id ${id}:`, error);
        throw error;
    }
};

export const getDeletedMovies = async (): Promise<Movie[]> => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/api/movies/deleted`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching deleted movies:', error);
        return [];
    }
};

const getAuthToken = () => {
    return localStorage.getItem('token');
};