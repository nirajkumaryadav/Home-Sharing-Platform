const Review = require('../models/review.model');
const Listing = require('../models/listing.model');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { listingId, rating, comment } = req.body;
        const userId = req.user._id;

        // Check if user has already reviewed this listing
        const existingReview = await Review.findOne({
            listing: listingId,
            user: userId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this listing' });
        }

        const review = new Review({
            listing: listingId,
            user: userId,
            rating,
            comment
        });

        await review.save();

        // Update listing average rating
        const reviews = await Review.find({ listing: listingId });
        const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
        
        await Listing.findByIdAndUpdate(listingId, {
            averageRating: avg,
            reviewCount: reviews.length
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};

// Get all reviews for a listing
exports.getListingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ listing: req.params.listingId })
            .populate('user', 'username');
            
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check if user is the author of the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }
        
        await Review.findByIdAndDelete(req.params.reviewId);
        
        // Update listing average rating
        const reviews = await Review.find({ listing: review.listing });
        
        if (reviews.length > 0) {
            const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
            await Listing.findByIdAndUpdate(review.listing, {
                averageRating: avg,
                reviewCount: reviews.length
            });
        } else {
            await Listing.findByIdAndUpdate(review.listing, {
                averageRating: 0,
                reviewCount: 0
            });
        }
        
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};