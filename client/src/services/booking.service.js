import api from './api';

const bookingService = {
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserBookings: async (userId) => {
        try {
            const response = await api.get(`/bookings/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    cancelBooking: async (bookingId) => {
        try {
            const response = await api.delete(`/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default bookingService;