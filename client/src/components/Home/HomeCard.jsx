import React from 'react';
import { Link } from 'react-router-dom';
import './HomeCard.css'; // Make sure to create this file

const HomeCard = ({ home }) => {
    if (!home) return null;
    
    const { id, title, location, availableDates = [], pricePerNight } = home;

    return (
        <div className="home-card">
            <img src={home.image || 'https://via.placeholder.com/300x200'} alt={title} className="home-image" />
            <h3 className="home-title">{title}</h3>
            <p className="home-location">{location}</p>
            <p className="home-price">${pricePerNight} per night</p>
            <p className="home-availability">
                Available: {Array.isArray(availableDates) ? availableDates.join(', ') : 'No dates available'}
            </p>
            <Link to={`/listing/${id}`} className="book-button">View Details</Link>
        </div>
    );
};

export default HomeCard;