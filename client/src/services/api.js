import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Changed from 5002 to 5000

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Function to fetch all homes
export const fetchHomes = async () => {
    try {
        const response = await api.get('/listings');
        return response.data;
    } catch (error) {
        console.error('Error fetching homes:', error);
        throw error;
    }
};

// Function to fetch a single home by ID
export const fetchHomeById = async (id) => {
    try {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching home by ID:', error);
        throw error;
    }
};

// Function to create a new home listing
export const createHomeListing = async (homeData) => {
    try {

        const response = await api.post('/listings', homeData);
        return response.data;
    } catch (error) {
        console.error('Error creating home listing:', error);
        throw error;
    }
};

// Function to update an existing home listing
export const updateHomeListing = async (id, homeData) => {
    try {
        const response = await api.put(`/listings/${id}`, homeData);
        return response.data;
    } catch (error) {
        console.error('Error updating home listing:', error);
        throw error;
    }
};

// Function to delete a home listing
export const deleteHomeListing = async (id) => {
    try {
        const response = await api.delete(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting home listing:', error);
        throw error;
    }
};

// Export all the functions as named exports
export { api };

// Export the API instance as default
export default api;