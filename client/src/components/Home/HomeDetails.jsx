import React from 'react';
import BookingForm from '../Booking/BookingForm';
import './HomeDetails.css';

const HomeDetails = ({ home }) => {
    if (!home) {
        return <div>Home not found</div>;
    }

    return (
        <div className="home-details">
            <h1>{home.title}</h1>
            <img 
                src={home.image || 'https://via.placeholder.com/800x400'} 
                alt={home.title} 
                className="home-detail-image" 
            />
            <p><strong>Location:</strong> {home.location}</p>
            <p><strong>Description:</strong> {home.description}</p>
            <p><strong>Price:</strong> ${home.pricePerNight} per night</p>
            <p><strong>Available Dates:</strong> {Array.isArray(home.availableDates) ? home.availableDates.join(', ') : 'No dates available'}</p>
            
            <h3>Amenities</h3>
            <ul>
                {home.amenities && home.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                ))}
            </ul>

            <h3>Host Information</h3>
            <p>Host: {home.host && home.host.name}</p>

            <BookingForm homeId={home.id} />
        </div>
    );
};

export default HomeDetails;