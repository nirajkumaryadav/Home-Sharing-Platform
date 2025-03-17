import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUsers, FaBed, FaBath, FaWifi, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import listingService from '../../services/listing.service';
import BookingForm from '../../components/Booking/BookingForm';
import './ListingDetail.css';

const ListingDetail = () => {
    const { id } = useParams();
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [isOwnListing, setIsOwnListing] = useState(false);
    const navigate = useNavigate();
    // Add a ref to track if this is the first render
    const initialFetchDone = useRef(false);

    useEffect(() => {
        // Prevent multiple fetches by checking if we've already done the initial fetch
        if (initialFetchDone.current) return;
        
        const fetchHomeDetails = async () => {
            try {
                setLoading(true);
                setError('');
                console.log("Fetching home with ID:", id);
                
                const response = await listingService.getHomeById(id);
                
                if (!response || !response.data) {
                    console.error('Invalid response from API:', response);
                    throw new Error('Received invalid data from server');
                }
                
                console.log("API response:", response);
                setHome(response.data);
                
                // Check if this is the user's own listing
                if (user && response.data) {
                    const isOwner = 
                        (response.data.ownerId && user.id && response.data.ownerId === user.id) || 
                        (response.data.owner && user.id && response.data.owner === user.id) || 
                        (response.data.ownerEmail && user.email && response.data.ownerEmail === user.email);
                    
                    console.log("Owner check:", { 
                        isOwner, 
                        responseOwnerId: response.data.ownerId, 
                        userId: user.id,
                        responseOwner: response.data.owner,
                        responseOwnerEmail: response.data.ownerEmail,
                        userEmail: user.email 
                    });
                    
                    setIsOwnListing(isOwner);
                }
            } catch (error) {
                console.error('Error fetching home details:', error);
                setError('Failed to load home details. Please try again.');
            } finally {
                setLoading(false);
                // Mark that we've done the initial fetch
                initialFetchDone.current = true;
            }
        };

        fetchHomeDetails();
    }, [id]); // Remove user from the dependency array

    // Add this as a separate useEffect
    useEffect(() => {
        if (user && home) {
            const isOwner = 
                (home.ownerId && user.id && home.ownerId === user.id) || 
                (home.owner && user.id && home.owner === user.id) || 
                (home.ownerEmail && user.email && home.ownerEmail === user.email);
            
            setIsOwnListing(isOwner);
        } else {
            setIsOwnListing(false);
        }
    }, [user, home]);

    const handleBookNow = () => {
        if (!user) {
            // Save current path for redirect after login
            const currentPath = location.pathname;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
        
        // Proceed with booking logic for logged-in users
        // ...
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading home details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <Link to="/listings" className="btn">Back to Listings</Link>
            </div>
        );
    }

    if (!home) {
        return (
            <div className="not-found-container">
                <h2>Home Not Found</h2>
                <p>Sorry, we couldn't find the listing you're looking for.</p>
                <Link to="/listings" className="btn">Browse Other Homes</Link>
            </div>
        );
    }

    return (
        <div className="listing-detail-container">
            <div className="listing-detail-header">
                <Link to="/listings" className="back-button">
                    <FaArrowLeft /> Back to Listings
                </Link>
                <h1>{home?.title || "Home Details"}</h1>
                <div className="listing-meta">
                    <div className="rating">
                        <FaStar /> {home?.rating || '4.5'} ({home?.reviewCount || '12'} reviews)
                    </div>
                    <div className="location">
                        <FaMapMarkerAlt /> {home?.location || "Location unavailable"}
                    </div>
                </div>
            </div>

            <div className="listing-detail-content">
                <div className="listing-gallery">
                    <img 
                        src={home?.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60'} 
                        alt={home?.title || "Home"} 
                        className="main-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x500?text=No+Image+Available';
                        }}
                    />
                </div>

                <div className="listing-detail-grid">
                    <div className="listing-info">
                        <div className="host-info">
                            <h2>Hosted by {home?.ownerName || 'Home Owner'}</h2>
                            {isOwnListing && <span className="owner-badge">Your Listing</span>}
                        </div>

                        <div className="listing-features">
                            <div className="feature">
                                <FaHome /> Entire home
                            </div>
                            <div className="feature">
                                <FaUsers /> {parseInt(home?.maxGuests) || 2} guests
                            </div>
                            <div className="feature">
                                <FaBed /> {parseInt(home?.bedrooms) || 1} bedrooms
                            </div>
                            <div className="feature">
                                <FaBath /> {parseInt(home?.bathrooms) || 1} bathrooms
                            </div>
                        </div>

                        <div className="listing-description">
                            <h3>About this place</h3>
                            <p>{home?.description || 'A wonderful home for your next adventure. This property offers comfort and convenience in a great location.'}</p>
                        </div>

                        <div className="listing-amenities">
                            <h3>Amenities</h3>
                            <div className="amenities-list">
                                {home?.amenities && Array.isArray(home.amenities) && home.amenities.length > 0 ? (
                                    home.amenities.map((amenity, index) => (
                                        <div className="amenity" key={index}>
                                            <FaWifi /> {amenity}
                                        </div>
                                    ))
                                ) : (
                                    <p>Basic amenities included</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Show booking form only if it's not the user's own listing */}
                    {!isOwnListing ? (
                        <div className="booking-container">
                            <BookingForm 
                                homeId={id} 
                                homeData={home} // Pass the full home data
                                pricePerNight={home?.pricePerNight || 0} 
                            />
                        </div>
                    ) : (
                        <div className="owner-actions">
                            <h3>Manage Your Listing</h3>
                            <p>You can view your property details here.</p>
                            <div className="owner-buttons">
                                <Link to="/dashboard" className="btn btn-primary">
                                    Go to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;