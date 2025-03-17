const paymentService = require('../services/payment.service');

// Create a payment intent for a booking
exports.createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }
        
        const paymentIntent = await paymentService.createPaymentIntent(bookingId);
        
        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Webhook to handle Stripe events
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (error) {
        return res.status(400).json({ message: `Webhook error: ${error.message}` });
    }
    
    // Handle the event based on its type
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await paymentService.confirmPayment(paymentIntent.id);
            break;
            
        // Handle other event types as needed
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
};