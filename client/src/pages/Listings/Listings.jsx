import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaDollarSign, FaFilter } from 'react-icons/fa';
import listingService from '../../services/listing.service';
import mockHomes from '../../assets/mockData/homes.json';
import './Listings.css';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    guests: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // Attempt to fetch from API
        const response = await listingService.getHomes();
        if (response && response.data) {
          setListings(response.data);
        } else {
          // Fallback to mock data
          setListings(mockHomes);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        // Fallback to mock data
        setListings(mockHomes);
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

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    
    // Apply filters logic
    const filteredListings = mockHomes.filter(home => {
      // Filter by location
      if (filters.location && !home.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by min price
      if (filters.minPrice && home.pricePerNight < parseInt(filters.minPrice)) {
        return false;
      }
      
      // Filter by max price
      if (filters.maxPrice && home.pricePerNight > parseInt(filters.maxPrice)) {
        return false;
      }
      
      // Filter by bedrooms
      if (filters.bedrooms && home.bedrooms < parseInt(filters.bedrooms)) {
        return false;
      }
      
      // Filter by guests
      if (filters.guests && home.maxGuests < parseInt(filters.guests)) {
        return false;
      }
      
      return true;
    });
    
    setListings(filteredListings);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      guests: ''
    });
    
    // Reset to original listings
    setListings(mockHomes);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading available homes...</p>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <div className="filters-section">
        <h2><FaFilter /> Filters</h2>
        <form onSubmit={handleFilterSubmit} className="filters-form">
          <div className="filter-group">
            <label htmlFor="location">
              <FaMapMarkerAlt /> Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="City, state, or area"
            />
          </div>
          
          <div className="filter-group">
            <label>
              <FaDollarSign /> Price Range
            </label>
            <div className="price-inputs">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                min={filters.minPrice || 0}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="bedrooms">
              <FaBed /> Bedrooms
            </label>
            <select
              id="bedrooms"
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
            <label htmlFor="guests">
              <FaUsers /> Guests
            </label>
            <select
              id="guests"
              name="guests"
              value={filters.guests}
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="6">6+</option>
              <option value="8">8+</option>
            </select>
          </div>
          
          <div className="filter-buttons">
            <button type="submit" className="search-button">
              <FaSearch /> Search
            </button>
            <button type="button" onClick={resetFilters} className="reset-button">
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="listings-content">
        <div className="results-header">
          <h3>{listings.length} {listings.length === 1 ? 'home' : 'homes'} found</h3>
        </div>

        {listings.length > 0 ? (
          <div className="listings-grid">
            {listings.map(home => (
              <Link to={`/listing/${home.id}`} className="listing-card" key={home.id}>
                <div className="listing-image">
                  <img 
                    src={home.image} 
                    alt={home.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      // Use inline SVG instead of placeholder.com
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23999999'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="listing-info">
                  <h3>{home.title}</h3>
                  <p className="listing-location">
                    <FaMapMarkerAlt /> {home.location}
                  </p>
                  <div className="listing-details">
                    <span><FaBed /> {parseInt(home.bedrooms) || 1} {parseInt(home.bedrooms) === 1 ? 'bedroom' : 'bedrooms'}</span>
                    <span><FaBath /> {parseInt(home.bathrooms) || 1} {parseInt(home.bathrooms) === 1 ? 'bathroom' : 'bathrooms'}</span>
                    <span><FaUsers /> {parseInt(home.maxGuests) || 2} {parseInt(home.maxGuests) === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  <p className="listing-price">${home.pricePerNight} <span>night</span></p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-listings">
            <h3>No homes found</h3>
            <p>Try adjusting your filters to find more homes</p>
            <button onClick={resetFilters}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;