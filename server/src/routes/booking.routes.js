const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Route to create a new booking
router.post('/', bookingController.createBooking);

// Route to get all bookings for a user
router.get('/:userId', bookingController.getUserBookings);

// Route to cancel a booking
router.delete('/:bookingId', bookingController.cancelBooking);

module.exports = router;