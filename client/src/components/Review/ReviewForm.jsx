import React, { useState } from 'react';
import { createReview } from '../../services/review.service';
import './Review.css';

const ReviewForm = ({ listingId, onReviewAdded }) => {
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'rating' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            await createReview(listingId, formData);
            setSuccess('Review submitted successfully!');
            setFormData({
                rating: 5,
                comment: ''
            });
            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-form-container">
            <h3>Leave a Review</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-input">
                        {[5, 4, 3, 2, 1].map((value) => (
                            <label key={value}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={value}
                                    checked={formData.rating === value}
                                    onChange={handleChange}
                                />
                                <span>{value} Star{value !== 1 ? 's' : ''}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="comment">Your Review</label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows="4"
                        value={formData.comment}
                        onChange={handleChange}
                        required
                        placeholder="Share your experience with this property"
                        className="form-control"
                    ></textarea>
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;