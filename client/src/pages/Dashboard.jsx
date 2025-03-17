import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaCalendarCheck, FaHome, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaTrashAlt, FaEdit, FaEye } from 'react-icons/fa';
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
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                if (!user) {
                    setLoading(false);
                    return;
                }

                // Fetch homes that belong to the current user
                try {
                    console.log("Current user:", user); // Debug logging
                    
                    // First try with getUserListings
                    const response = await listingService.getUserListings(user.id);
                    
                    if (response && response.data && response.data.length > 0) {
                        setHomes(response.data);
                    } else {
                        // If no results, try fetching all and filtering client-side
                        console.log("No listings found with getUserListings, trying alternative method");
                        const allHomeResponse = await listingService.getHomes();
                        if (allHomeResponse && allHomeResponse.data) {
                            const userListings = allHomeResponse.data.filter(home => 
                                home.ownerId == user.id || 
                                home.owner == user.id || 
                                home.ownerEmail == user.email
                            );
                            console.log("Filtered listings:", userListings);
                            setHomes(userListings);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user homes:', error);
                    setError('Failed to load your listings');
                }
                
                // Fetch bookings
                const fetchedBookings = await fetchBookings();
                setUserBookings(fetchedBookings || []);
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [fetchBookings, user]);

    // Format date function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle booking cancellation
    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                // Call the remove function from context
                removeBooking(bookingId);
                
                // Update the local UI state
                setUserBookings(userBookings.filter(booking => booking.id !== bookingId));
                
                // Show success message
                alert('Booking canceled successfully');
            } catch (error) {
                console.error('Error canceling booking:', error);
                alert('Failed to cancel booking. Please try again.');
            }
        }
    };

    // Handle listing deletion
    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            try {
                await listingService.deleteListing(listingId);
                
                // Update the local UI state
                setHomes(homes.filter(home => home.id !== listingId));
                
                // Show success message
                alert('Listing deleted successfully');
            } catch (error) {
                console.error('Error deleting listing:', error);
                alert('Failed to delete listing. Please try again.');
            }
        }
    };

    // Get user's display name - use full name if available, otherwise username
    const getUserDisplayName = () => {
        if (!user) return 'Guest';
        return user.name || user.username;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome, {getUserDisplayName()}</h1>
                    <p className="subtitle">Manage your listings and bookings from one place</p>
                </div>
                <Link to="/create-listing" className="create-listing-button">
                    <FaPlus /> Create New Listing
                </Link>
            </div>

            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    <FaHome /> My Listings
                </button>
                <button 
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <FaCalendarCheck /> My Bookings
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && (
                    <>
                        <div className="section-header">
                            <h2>Your Listings</h2>
                            <Link to="/create-listing" className="btn">Add New</Link>
                        </div>
                        {homes.length > 0 ? (
                            <div className="listings-grid">
                                {homes.map(home => (
                                    <div className="listing-card" key={home.id}>
                                        <div className="listing-image">
                                            <img 
                                                src={home.image || 'https://via.placeholder.com/300x200'} 
                                                alt={home.title} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className="listing-info">
                                            <h3>{home.title}</h3>
                                            <p className="listing-location"><FaMapMarkerAlt /> {home.location}</p>
                                            <p className="listing-price"><FaDollarSign /> ${home.pricePerNight} / night</p>
                                        </div>
                                        <div className="listing-actions">
                                            <Link 
                                                to={`/listing/${home.id}`} 
                                                className="btn btn-icon" 
                                                aria-label="View details"
                                            >
                                                <FaEye />
                                            </Link>
                                            <Link 
                                                to={`/edit-listing/${home.id}`} 
                                                className="btn btn-icon" 
                                                aria-label="Edit listing"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn btn-icon danger" 
                                                onClick={() => handleDeleteListing(home.id)}
                                                aria-label="Delete listing"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🏠</div>
                                <p>You don't have any listings yet.</p>
                                <p>Create your first listing to start hosting!</p>
                                <Link to="/create-listing" className="btn">Create Listing</Link>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'bookings' && (
                    <>
                        <div className="section-header">
                            <h2>Your Bookings</h2>
                        </div>
                        {userBookings.length > 0 ? (
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
                                                    <span><FaCalendarAlt /> <strong>Check-in:</strong> {formatDate(booking.checkInDate)}</span>
                                                    <span><FaCalendarAlt /> <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</span>
                                                </div>
                                                <div className="booking-price">
                                                    <FaDollarSign /> <strong>Total:</strong> ${booking.totalPrice || 'N/A'}
                                                </div>
                                                <div className="booking-status">
                                                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-actions">
                                            <Link to={`/listing/${booking.homeId}`} className="btn btn-small">
                                                View Listing
                                            </Link>
                                            {booking.status === 'confirmed' && (
                                                <button 
                                                    className="btn btn-small btn-outline danger" 
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                            {booking.status === 'cancelled' && (
                                                <span className="cancelled-text">Cancelled</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🗓️</div>
                                <p>You don't have any bookings yet.</p>
                                <p>Start exploring places to stay!</p>
                                <Link to="/listings" className="btn">Browse Homes</Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;