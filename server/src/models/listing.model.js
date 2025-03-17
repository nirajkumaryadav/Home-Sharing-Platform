const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    description: {
        type: String,
        required: true
    },
    availableDates: {
        type: [Date],
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    images: [{
        url: String,
        caption: String
    }],
    amenities: {
        type: [String],
        default: []
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    maxGuests: {
        type: Number,
        default: 1
    },
    bedrooms: {
        type: Number,
        default: 1
    },
    beds: {
        type: Number,
        default: 1
    },
    bathrooms: {
        type: Number,
        default: 1
    },
    propertyType: {
        type: String,
        enum: ['house', 'apartment', 'guesthouse', 'hotel', 'other'],
        default: 'house'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for better search
listingSchema.index({ 
    title: 'text', 
    description: 'text', 
    location: 'text' 
});

module.exports = mongoose.model('Listing', listingSchema);