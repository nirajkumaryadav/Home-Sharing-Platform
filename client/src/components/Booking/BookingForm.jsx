import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../contexts/BookingContext';
import { FaMoneyBillWave, FaCreditCard, FaPaypal, FaApplePay } from 'react-icons/fa';
import './BookingForm.css';

const BookingForm = ({ homeId, pricePerNight }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const { createBooking } = useBooking();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate number of nights and total price
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  
  // Add guest factor to pricing (additional guests cost more)
  const guestFactor = guests > 2 ? 1 + ((guests - 2) * 0.15) : 1; // 15% more per guest after 2
  const baseTotal = nights * pricePerNight;
  const totalWithGuests = Math.ceil(baseTotal * guestFactor);
  const serviceFee = Math.ceil(totalWithGuests * 0.12);
  const finalTotal = totalWithGuests + serviceFee;
  
  // Handle payment method selection
  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    
    if (method !== 'cash') {
      alert(`${method.charAt(0).toUpperCase() + method.slice(1)} payment is not available at this time. Please choose Cash payment to proceed.`);
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show payment options if not yet selected
    if (!showPaymentOptions) {
      setShowPaymentOptions(true);
      return;
    }
    
    // Require payment method selection
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // Only allow cash payment for now
    if (paymentMethod !== 'cash') {
      alert(`${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment is not available yet. Please choose Cash payment.`);
      return;
    }
    
    // Redirect to login if user is not authenticated
    if (!user) {
      navigate(`/login?redirect=listing/${homeId}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createBooking(homeId, checkIn, checkOut, guests, finalTotal);
      
      // Show success message
      setSuccessMessage('Booking successful! Redirecting to dashboard...');
      
      // Reset form
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
      setPaymentMethod('');
      setShowPaymentOptions(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <div className="booking-price">
          <span className="price">${pricePerNight}</span> / night
        </div>
        
        {successMessage ? (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="dates-container">
              <div className="form-group">
                <label>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Guests</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(parseInt(e.target.value))}
                required
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            
            {showPaymentOptions && (
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="payment-options">
                  <div 
                    className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('cash')}
                  >
                    <FaMoneyBillWave />
                    <span>Cash</span>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'credit' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('credit')}
                  >
                    <FaCreditCard />
                    <span>Credit Card</span>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('paypal')}
                  >
                    <FaPaypal />
                    <span>PayPal</span>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'apple' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('apple')}
                  >
                    <FaApplePay />
                    <span>Apple Pay</span>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="booking-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : showPaymentOptions ? 'Complete Booking' : 'Reserve'}
            </button>
            
            <div className="booking-details">
              <div className="booking-row">
                <span>${pricePerNight} x {nights || 0} nights</span>
                <span>${baseTotal || 0}</span>
              </div>
              {guests > 2 && (
                <div className="booking-row">
                  <span>Additional guest fee ({guests-2} extra {guests-2 === 1 ? 'guest' : 'guests'})</span>
                  <span>${totalWithGuests - baseTotal}</span>
                </div>
              )}
              <div className="booking-row">
                <span>Service fee</span>
                <span>${serviceFee || 0}</span>
              </div>
              <div className="booking-row total">
                <span>Total</span>
                <span>${finalTotal || 0}</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;