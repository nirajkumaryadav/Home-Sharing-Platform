import api from './api';

export const createPaymentIntent = async (paymentData) => {
    try {
        const response = await api.post('/payments/create-payment-intent', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

export const confirmPayment = async (paymentIntentId, bookingId) => {
    try {
        const response = await api.post('/payments/confirm-payment', {
            paymentIntentId,
            bookingId
        });
        return response.data;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

export const getPaymentStatus = async (bookingId) => {
    try {
        const response = await api.get(`/payments/status/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting payment status:', error);
        throw error;
    }
};

const paymentService = {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus
};

export default paymentService;