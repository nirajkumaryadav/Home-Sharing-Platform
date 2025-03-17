import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import listingService from '../services/listing.service';
import mockHomes from '../assets/mockData/homes.json';
import './Home.css';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await listingService.getHomes();
        if (response && response.data) {
          setListings(response.data);
        } else {
          // Fallback to mock data
          setListings(mockHomes);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
        console.error('Error fetching listings:', err);
        // Fallback to mock data
        setListings(mockHomes);
      }
    };

    fetchListings();
  }, []);

  const featuredListings = listings.slice(0, 4);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing stays for you...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find your perfect getaway</h1>
          <p>Discover unique homes for your next adventure</p>
          <Link to="/listings" className="cta-button">Browse Homes</Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2>Featured Homes</h2>
          <div className="featured-grid">
            {featuredListings.map(home => (
              <Link to={`/listing/${home.id}`} className="featured-card" key={home.id}>
                <div className="featured-image">
                  <img 
                    src={home.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60'} 
                    alt={home.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60';
                    }}
                  />
                </div>
                <div className="featured-content">
                  <h3>{home.title}</h3>
                  <p className="featured-location">{home.location}</p>
                  <p className="featured-price">${home.pricePerNight} per night</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="view-all-container">
            <Link to="/listings" className="view-all-link">View All Homes</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;