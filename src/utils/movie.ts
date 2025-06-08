import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Movie {
    _id: string;
    title: string;
    description: string;
    genre: string;
    duration: number;
    posterUrl: string;
    trailerUrl: string;
    releaseDate: string;
    status: boolean;
    country: string;
    showingStatus: 'now-showing' | 'coming-soon' | 'ended';
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
    createdBy?: string;
    approvedBy?: string | null;
    isActive?: boolean;
    __v?: number;
}

export const getMovies = async (): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
};

export const getMovieById = async (id: string): Promise<Movie> => {
    try {
        const response = await axios.get(`${API_URL}/api/movies/${id}`);
        return response.data.data; // Assuming single movie is returned directly under data
    } catch (error) {
        console.error(`Error fetching movie with id ${id}:`, error);
        throw error;
    }
};

export const createMovie = async (movieData: Omit<Movie, '_id' | 'createdAt' | 'updatedAt' | '__v' | 'rejectionReason' | 'createdBy' | 'approvedBy' | 'isActive'>): Promise<Movie> => {
    try {
        const response = await axios.post(`${API_URL}/api/movies`, movieData);
        return response.data.data; // Assuming created movie is returned directly under data
    } catch (error) {
        console.error('Error creating movie:', error);
        throw error;
    }
};

export const updateMovie = async (id: string, movieData: Partial<Movie>): Promise<Movie> => {
    try {
        const response = await axios.put(`${API_URL}/api/movies/${id}`, movieData);
        return response.data.data; // Assuming updated movie is returned directly under data
    } catch (error) {
        console.error(`Error updating movie with id ${id}:`, error);
        throw error;
    }
};

export const deleteMovie = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/api/movies/${id}`);
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
