import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import listingService from '../../services/listing.service';
import mockHomes from '../../assets/mockData/homes.json';
import { FaFilter, FaMapMarkerAlt, FaDollarSign, FaBed, FaBath } from 'react-icons/fa';
import './Listings.css';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        try {
          const response = await listingService.getHomes();
          if (response?.data) {
            setListings(response.data);
            setFilteredListings(response.data);
          } else {
            // Fallback to mock data
            setListings(mockHomes);
            setFilteredListings(mockHomes);
          }
        } catch (error) {
          console.error('Error fetching listings:', error);
          // Fallback to mock data
          setListings(mockHomes);
          setFilteredListings(mockHomes);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (filters.location) {
      filtered = filtered.filter(home =>
        home.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(home => 
        home.pricePerNight >= parseInt(filters.priceMin)
      );
    }

    if (filters.priceMax) {
      filtered = filtered.filter(home => 
        home.pricePerNight <= parseInt(filters.priceMax)
      );
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(home => 
        home.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(home => 
        home.bathrooms >= parseFloat(filters.bathrooms)
      );
    }

    setFilteredListings(filtered);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: ''
    });
    setFilteredListings(listings);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Finding perfect homes for you...</p>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <div className="filters-section">
        <h2><FaFilter /> Filters</h2>
        <form className="filters-form">
          <div className="filter-group">
            <label><FaMapMarkerAlt /> Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="City, neighborhood"
            />
          </div>

          <div className="filter-group">
            <label><FaDollarSign /> Price Range</label>
            <div className="price-range">
              <input
                type="number"
                name="priceMin"
                value={filters.priceMin}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="priceMax"
                value={filters.priceMax}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label><FaBed /> Bedrooms</label>
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="filter-group">
            <label><FaBath /> Bathrooms</label>
            <select
              name="bathrooms"
              value={filters.bathrooms}
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="1.5">1.5+</option>
              <option value="2">2+</option>
              <option value="2.5">2.5+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button type="button" onClick={applyFilters} className="filter-apply">
              Apply Filters
            </button>
            <button type="button" onClick={resetFilters} className="filter-reset">
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="listings-content">
        <h2>Available Homes</h2>
        
        {filteredListings.length === 0 ? (
          <div className="no-listings">
            <img src="/images/no-results.svg" alt="No listings found" />
            <h3>No listings found</h3>
            <p>Try adjusting your filters to find more homes</p>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredListings.map(home => (
              <Link to={`/listing/${home.id}`} className="listing-card" key={home.id}>
                <div className="listing-image">
                  <img 
                    src={home.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=60'} 
                    alt={home.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=60';
                    }}
                  />
                </div>
                <div className="listing-info">
                  <h3>{home.title}</h3>
                  <p className="listing-location">
                    <FaMapMarkerAlt /> {home.location}
                  </p>
                  <div className="listing-details">
                    <span><FaBed /> {home.bedrooms} {home.bedrooms === 1 ? 'bed' : 'beds'}</span>
                    <span><FaBath /> {home.bathrooms} {home.bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>
                  <p className="listing-price">${home.pricePerNight} <span>/ night</span></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;