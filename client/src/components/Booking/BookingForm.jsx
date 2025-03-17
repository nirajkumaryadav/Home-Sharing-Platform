import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../contexts/BookingContext';
import { FaMoneyBillWave, FaCreditCard, FaPaypal, FaApplePay } from 'react-icons/fa';
import './BookingForm.css';

const BookingForm = ({ homeId, homeData, pricePerNight }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  const { user } = useAuth();
  const { createBooking } = useBooking();
  const navigate = useNavigate();

  // Calculate booking details when inputs change
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nightsCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (nightsCount > 0) {
        setNights(nightsCount);
        const basePriceCalc = nightsCount * pricePerNight;
        setBasePrice(basePriceCalc);
        
        // Add service fee (e.g. 12% of base price)
        const serviceFeeCalc = Math.round(basePriceCalc * 0.12);
        setServiceFee(serviceFeeCalc);
        
        // Calculate total
        setTotalPrice(basePriceCalc + serviceFeeCalc);
      }
    }
  }, [checkIn, checkOut, pricePerNight]);

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    // Clear previous errors when user selects a different payment method
    setPaymentError('');
  };

  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'card': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'applepay': return 'Apple Pay';
      case 'cash': return 'Pay at Property';
      default: return method;
    }
  };

  const handleBookNow = () => {
    if (!user) {
      // Save form data before redirecting to login
      localStorage.setItem(`booking_data_${homeId}`, JSON.stringify({ checkIn, checkOut, guests }));
      navigate('/login?redirect=' + encodeURIComponent(`/listing/${homeId}`));
      return;
    }
    
    // Validate dates
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Check if dates are valid
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    if (startDate < today) {
      alert('Check-in date cannot be in the past');
      return;
    }
    
    if (endDate <= startDate) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    // Show payment options
    setShowPaymentOptions(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Only allow 'cash' payment method for now
    if (paymentMethod !== 'cash') {
      setPaymentError(`${getPaymentMethodName(paymentMethod)} is not available at this time. Please select "Pay at Property" option.`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the booking using our context
      const bookingResult = await createBooking(
        homeId,
        homeData,
        checkIn,
        checkOut,
        guests,
        totalPrice
      );
      
      console.log("Booking created:", bookingResult);
      
      // Store booking data in multiple locations to ensure retrieval
      const bookingWithUserInfo = {
        ...bookingResult,
        userId: user.id,
        userEmail: user.email
      };
      
      // Store in recent booking location for immediate access
      localStorage.setItem('recent_booking_id', bookingResult.id);
      localStorage.setItem('recent_booking_data', JSON.stringify(bookingWithUserInfo));
      
      // Get existing bookings and append the new one
      // For user-specific storage
      const userBookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`) || '[]');
      // Check if this booking already exists
      const existingBookingIndex = userBookings.findIndex(b => b.id === bookingResult.id);
      if (existingBookingIndex === -1) {
        userBookings.push(bookingWithUserInfo);
      } else {
        // Replace existing booking with updated one
        userBookings[existingBookingIndex] = bookingWithUserInfo;
      }
      localStorage.setItem(`bookings_${user.id}`, JSON.stringify(userBookings));
      
      // For email-based backup storage
      if (user.email) {
        const emailBookings = JSON.parse(localStorage.getItem(`bookings_email_${user.email}`) || '[]');
        const existingEmailIndex = emailBookings.findIndex(b => b.id === bookingResult.id);
        if (existingEmailIndex === -1) {
          emailBookings.push(bookingWithUserInfo);
        } else {
          emailBookings[existingEmailIndex] = bookingWithUserInfo;
        }
        localStorage.setItem(`bookings_email_${user.email}`, JSON.stringify(emailBookings));
      }
      
      // Also store in global bookings for redundancy
      const allBookings = JSON.parse(localStorage.getItem('all_bookings') || '[]');
      const existingAllIndex = allBookings.findIndex(b => b.id === bookingResult.id);
      if (existingAllIndex === -1) {
        allBookings.push(bookingWithUserInfo);
      } else {
        allBookings[existingAllIndex] = bookingWithUserInfo;
      }
      localStorage.setItem('all_bookings', JSON.stringify(allBookings));
      
      // Show success message
      setSuccessMessage('Booking confirmed! Redirecting to dashboard...');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        // Use state parameter to force dashboard to refetch bookings
        navigate('/dashboard?tab=bookings&newBooking=' + Date.now());
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was a problem creating your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of your component remains the same...
  // ... (payment options rendering, etc.)

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <h2>Book this property</h2>
        <p className="booking-price">${pricePerNight} per night</p>
        
        {!successMessage ? (
          <form onSubmit={handleConfirmBooking} className="booking-form">
            <div className="form-group">
              <label htmlFor="checkIn">Check-in:</label>
              <input 
                type="date" 
                id="checkIn"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="checkOut">Check-out:</label>
              <input 
                type="date" 
                id="checkOut"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="guests">Guests:</label>
              <select 
                id="guests" 
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
            
            {checkIn && checkOut && nights > 0 && (
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-line">
                  <span>${pricePerNight} x {nights} nights</span>
                  <span>${basePrice}</span>
                </div>
                <div className="summary-line">
                  <span>Service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}
            
            {!showPaymentOptions ? (
              <button 
                type="button" 
                className="btn btn-primary btn-block"
                onClick={handleBookNow}
              >
                Book Now
              </button>
            ) : null}
            
            {showPaymentOptions && (
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                {paymentError && <div className="payment-error">{paymentError}</div>}
                <div className="payment-options">
                  <div 
                    className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('cash')}
                  >
                    <FaMoneyBillWave />
                    <span>Pay at Property</span>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('card')}
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
                    className={`payment-option ${paymentMethod === 'applepay' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('applepay')}
                  >
                    <FaApplePay />
                    <span>Apple Pay</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={!paymentMethod || isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;