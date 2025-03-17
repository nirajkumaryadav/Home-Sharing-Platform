import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaCalendarCheck, 
  FaHome, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaTrashAlt, 
  FaEdit, 
  FaEye, 
  FaExclamationCircle,
  FaUsers, 
  FaBed,
  FaBath
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../contexts/BookingContext';
import listingService from '../services/listing.service';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { fetchBookings, removeBooking } = useBooking();
    const [activeTab, setActiveTab] = useState('listings');
    const [homes, setHomes] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const tooltipTimeout = useRef(null);
    const [featureTooltipContent, setFeatureTooltipContent] = useState('');
    const [featureTooltipVisible, setFeatureTooltipVisible] = useState(false);
    const [featureTooltipPosition, setFeatureTooltipPosition] = useState({ top: 0, left: 0 });

    // Load user's homes
    useEffect(() => {
        const loadUserHomes = async () => {
            if (user) {
                try {
                    const response = await listingService.getUserHomes(user.id);
                    if (response && response.data) {
                        setHomes(response.data);
                    }
                } catch (err) {
                    console.error('Error loading user homes:', err);
                }
            }
        };

        loadUserHomes();
    }, [user]);

    // Load bookings and check URL parameters
    useEffect(() => {
        const loadBookings = async () => {
            setLoading(true);
            if (user) {
                try {
                    // Try multiple sources to find bookings
                    // First check if there's a recent booking that was just created
                    const recentBookingData = localStorage.getItem('recent_booking_data');
                    let foundBookings = [];
                    
                    // Check user-specific storage first
                    const savedBookings = localStorage.getItem(`bookings_${user.id}`);
                    if (savedBookings) {
                        foundBookings = JSON.parse(savedBookings);
                        console.log("Retrieved bookings from localStorage:", foundBookings);
                    }
                    
                    // Check email-based storage
                    if (foundBookings.length === 0 && user.email) {
                        const emailBookings = localStorage.getItem(`bookings_email_${user.email}`);
                        if (emailBookings) {
                            foundBookings = JSON.parse(emailBookings);
                            console.log("Retrieved bookings from email storage:", foundBookings);
                        }
                    }
                    
                    // Check global bookings repository
                    if (foundBookings.length === 0) {
                        const allBookings = JSON.parse(localStorage.getItem('all_bookings') || '[]');
                        foundBookings = allBookings.filter(booking => 
                            booking.userId === user.id || 
                            booking.userEmail === user.email
                        );
                        console.log("Retrieved bookings from global storage:", foundBookings);
                    }
                    
                    // Add the recent booking if it's not already included
                    if (recentBookingData) {
                        const recentBooking = JSON.parse(recentBookingData);
                        const recentExists = foundBookings.some(b => b.id === recentBooking.id);
                        
                        if (!recentExists) {
                            foundBookings.push(recentBooking);
                            console.log("Added recent booking to results:", recentBooking);
                            
                            // Save this updated list back to user's bookings for future use
                            localStorage.setItem(`bookings_${user.id}`, JSON.stringify(foundBookings));
                            
                            // Also update email-based storage
                            if (user.email) {
                                localStorage.setItem(`bookings_email_${user.email}`, JSON.stringify(foundBookings));
                            }
                        }
                        
                        // Clear the temporary recent booking data to avoid adding it multiple times
                        localStorage.removeItem('recent_booking_data');
                        localStorage.removeItem('recent_booking_id');
                    }
                    
                    setUserBookings(foundBookings);
                } catch (error) {
                    console.error("Error parsing bookings from localStorage:", error);
                    setUserBookings([]);
                }
            }
            setLoading(false);
        };

        loadBookings();
        
        // Check URL parameters for tab selection
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'bookings') {
            setActiveTab('bookings');
        }
        
        return () => {
            if (tooltipTimeout.current) {
                clearTimeout(tooltipTimeout.current);
            }
        };
    }, [user, location.search]);

    // Function to format date nicely
    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };
    
    // Function for tooltip display
    const showUnavailableFeatureTooltip = (e, message) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX - 100
        };
        
        setFeatureTooltipContent(message);
        setFeatureTooltipPosition(position);
        setFeatureTooltipVisible(true);
        
        if (tooltipTimeout.current) {
            clearTimeout(tooltipTimeout.current);
        }
        
        tooltipTimeout.current = setTimeout(() => {
            setFeatureTooltipVisible(false);
        }, 3000);
    };

    const handleUnavailableFeature = (e, message) => {
        e.preventDefault();
        showUnavailableFeatureTooltip(e, message);
    };

    const handleDeleteListing = async (homeId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await listingService.deleteListing(homeId);
                setHomes(homes.filter(home => home.id !== homeId));
            } catch (err) {
                console.error('Error deleting listing:', err);
                alert('Failed to delete listing. Please try again.');
            }
        }
    };

    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                removeBooking(bookingId);
                
                // Update our local state too
                setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));
            } catch (err) {
                console.error('Error canceling booking:', err);
                alert('Failed to cancel booking. Please try again.');
            }
        }
    };

    const removeProblematicListing = () => {
        // First, get all listings from localStorage
        const allListingsString = localStorage.getItem('homes');
        if (!allListingsString) {
          alert('No listings found in storage.');
          return;
        }
        
        try {
          const allListings = JSON.parse(allListingsString);
          
          // Display the listings to identify the problematic one
          console.log('All listings:', allListings);
          
          // Create a simple modal to show listings and allow removal
          const listingId = prompt('Enter the ID of the listing you want to remove:');
          
          if (!listingId) return;
          
          // Find the listing index
          const listingIndex = allListings.findIndex(home => home.id === listingId);
          
          if (listingIndex === -1) {
            alert('Listing not found with that ID.');
            return;
          }
          
          // Remove the listing
          const updatedListings = allListings.filter(home => home.id !== listingId);
          
          // Save back to localStorage
          localStorage.setItem('homes', JSON.stringify(updatedListings));
          
          // Refresh page to see changes
          alert(`Listing with ID ${listingId} has been removed.`);
          window.location.reload();
        } catch (error) {
          console.error('Error removing listing:', error);
          alert('There was an error processing the listings. Check the console for details.');
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading your dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome back, {user?.name}!</p>
            </div>
            
            <div className="dashboard-tabs">
                <button 
                    className={`tab-button ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    <FaHome /> My Listings
                </button>
                <button 
                    className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <FaCalendarCheck /> My Bookings
                </button>
            </div>
            
            {/* Feature tooltip */}
            {featureTooltipVisible && (
                <div 
                    className="feature-tooltip" 
                    style={{ 
                        top: featureTooltipPosition.top, 
                        left: featureTooltipPosition.left 
                    }}
                >
                    <FaExclamationCircle /> {featureTooltipContent}
                </div>
            )}
            
            {activeTab === 'listings' && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>My Listings</h2>
                        <Link to="/create-listing" className="btn btn-primary">
                            <FaPlus /> Add New Listing
                        </Link>
                    </div>
                    
                    {homes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏠</div>
                            <p>You don't have any listings yet.</p>
                            <p>Share your space and start earning!</p>
                            <Link to="/create-listing" className="btn btn-outline">Create Your First Listing</Link>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {homes.map(home => (
                                <div className="listing-card" key={home.id}>
                                    <div className="listing-image">
                                        <img src={home.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={home.title} />
                                        <div className="listing-badge">${home.pricePerNight}/night</div>
                                        <div className={`listing-status ${home.status ? `status-${home.status}` : 'status-active'}`}>
                                            {home.status || 'Active'}
                                        </div>
                                    </div>
                                    
                                    <div className="listing-info">
                                        <h3>{home.title}</h3>
                                        
                                        <div className="listing-location">
                                            <FaMapMarkerAlt />
                                            <span>{home.location}</span>
                                        </div>
                                        
                                        <div className="listing-features">
                                            <div className="feature">
                                                <FaBed />
                                                <span>{home.bedrooms} {home.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                                            </div>
                                            <div className="feature">
                                                <FaBath />
                                                <span>{home.bathrooms} {home.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="listing-price">
                                            <FaDollarSign />
                                            <span>${home.pricePerNight} per night</span>
                                        </div>
                                    </div>
                                    
                                    <div className="listing-actions">
                                        <Link to={`/listing/${home.id}`} className="listing-action-btn btn-view" title="View listing">
                                            <FaEye />
                                        </Link>
                                        <button className="listing-action-btn btn-edit disabled" title="Editing unavailable">
                                            <FaEdit />
                                        </button>
                                        <button className="listing-action-btn btn-delete" onClick={() => handleDeleteListing(home.id)} title="Delete listing">
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'bookings' && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>My Bookings</h2>
                    </div>
                    
                    {userBookings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <p>You don't have any bookings yet.</p>
                            <p>Start exploring and book your next stay!</p>
                            <Link to="/listings" className="btn btn-outline">Browse Properties</Link>
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {userBookings.map(booking => (
                                <div className="booking-card" key={booking.id}>
                                    <div className="booking-info">
                                        <div className="booking-image-container">
                                            <img 
                                                src={booking.image || 'https://via.placeholder.com/100x100'} 
                                                alt={booking.homeTitle} 
                                                className="booking-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className="booking-details">
                                            <h3>{booking.homeTitle}</h3>
                                            <p className="booking-location"><FaMapMarkerAlt /> {booking.location}</p>
                                            <div className="booking-dates">
                                                <p><FaCalendarAlt /> Check-in: {formatDate(booking.checkInDate)}</p>
                                                <p><FaCalendarAlt /> Check-out: {formatDate(booking.checkOutDate)}</p>
                                            </div>
                                            <p className="booking-guests"><FaUsers /> {booking.guests} guests</p>
                                            <p className="booking-price"><FaDollarSign /> {booking.totalPrice}</p>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        <Link to={`/listing/${booking.homeId}`} className="btn btn-sm btn-outline">
                                            <FaEye /> View Property
                                        </Link>
                                        <button 
                                            className="btn btn-sm btn-outline btn-danger"
                                            onClick={() => handleCancelBooking(booking.id)}
                                        >
                                            <FaTrashAlt /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;