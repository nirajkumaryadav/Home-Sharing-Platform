import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../services/payment.service';
import './Payment.css';

const stripePromise = loadStripe('your_stripe_publishable_key');

const CheckoutForm = ({ bookingId, amount, onPaymentComplete }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [succeeded, setSucceeded] = useState(false);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        const getPaymentIntent = async () => {
            try {
                setLoading(true);
                const data = await createPaymentIntent({ bookingId, amount });
                setClientSecret(data.clientSecret);
            } catch (err) {
                setError('Failed to load payment information. Please try again.');
                console.error('Error creating payment intent:', err);
            } finally {
                setLoading(false);
            }
        };

        if (bookingId && amount) {
            getPaymentIntent();
        }
    }, [bookingId, amount]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                setError(`Payment failed: ${error.message}`);
            } else if (paymentIntent.status === 'succeeded') {
                setSucceeded(true);
                setError(null);
                if (onPaymentComplete) {
                    onPaymentComplete(paymentIntent);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h3>Payment Details</h3>
            {error && <div className="payment-error">{error}</div>}
            {succeeded && <div className="payment-success">Payment successful!</div>}
            
            <div className="card-element-container">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            
            <button 
                type="submit" 
                disabled={loading || succeeded || !stripe || !clientSecret}
                className="payment-button"
            >
                {loading ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

// Wrapper component that provides the Stripe context
const PaymentForm = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    );
};

export default PaymentForm;