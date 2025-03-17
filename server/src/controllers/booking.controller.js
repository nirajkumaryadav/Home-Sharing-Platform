const Booking = require('../models/booking.model');
const Listing = require('../models/listing.model');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { listingId, userId, startDate, endDate } = req.body;

        const booking = new Booking({
            listing: listingId,
            user: userId,
            startDate,
            endDate,
        });

        await booking.save();
        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.params.userId;
        const bookings = await Booking.find({ user: userId }).populate('listing');

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error });
    }
};