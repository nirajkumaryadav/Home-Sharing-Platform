const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/booking.model');

const createPaymentIntent = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId)
            .populate('listing');
            
        if (!booking) {
            throw new Error('Booking not found');
        }
        
        // Calculate total price based on night count and price per night
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const amount = nights * booking.listing.pricePerNight * 100; // Amount in cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                bookingId: bookingId.toString(),
                listingId: booking.listing._id.toString(),
                nights
            }
        });
        
        return paymentIntent;
    } catch (error) {
        throw new Error(`Error creating payment intent: ${error.message}`);
    }
};

const confirmPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment not successful');
        }
        
        const { bookingId } = paymentIntent.metadata;
        
        // Update booking status
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
        
        return { success: true, bookingId };
    } catch (error) {
        throw new Error(`Error confirming payment: ${error.message}`);
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment
};