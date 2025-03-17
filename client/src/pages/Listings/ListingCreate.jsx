import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import listingService from '../../services/listing.service';
import { FaArrowLeft, FaUpload, FaBed, FaBath, FaUsers, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import './ListingCreate.css';

const ListingCreate = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        pricePerNight: '',
        bedrooms: '',
        bathrooms: '',
        maxGuests: '',
        amenities: [],
        image: '',
    });
    
    // List of amenities to choose from
    const amenitiesList = [
        'WiFi', 'Kitchen', 'Free parking', 'Pool', 'Hot tub', 'Washer/Dryer', 
        'Air conditioning', 'Heating', 'TV', 'Workspace', 'Pets allowed', 'Beachfront'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAmenityToggle = (amenity) => {
        setFormData(prevData => {
            if (prevData.amenities.includes(amenity)) {
                return {
                    ...prevData,
                    amenities: prevData.amenities.filter(a => a !== amenity)
                };
            } else {
                return {
                    ...prevData,
                    amenities: [...prevData.amenities, amenity]
                };
            }
        });
    };

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        
        // In a real app, you would upload to a service like AWS S3 or Cloudinary
        // For this demo, we'll simulate an upload and use a local URL
        setTimeout(() => {
            // Create a local URL for the image (this is a simplified example)
            const imageUrl = URL.createObjectURL(file);
            
            setFormData({
                ...formData,
                image: imageUrl
            });
            setUploadingImage(false);
        }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('You must be logged in to create a listing');
            return;
        }

        // Convert string values to appropriate types
        const processedFormData = {
            ...formData,
            bedrooms: parseInt(formData.bedrooms) || 1,
            bathrooms: parseInt(formData.bathrooms) || 1,
            maxGuests: parseInt(formData.maxGuests) || 2,
            pricePerNight: parseFloat(formData.pricePerNight) || 100
        };

        try {
            setLoading(true);
            setError('');

            // Convert some fields to numbers
            const listingData = {
                ...processedFormData,
                // Associate listing with current user in multiple ways to ensure matching
                ownerId: user.id,
                owner: user.id, // Alternative ID field
                ownerName: user.name || user.displayName,
                ownerEmail: user.email,
                createdAt: new Date().toISOString()
            };

            console.log("Creating listing with data:", listingData);
            const response = await listingService.createListing(listingData);
            
            if (response && response.data) {
                console.log("Created listing:", response.data);
                
                // Force update localStorage to ensure persistence
                try {
                    const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
                    
                    // Check if this listing is already in the array
                    const existingIndex = userListings.findIndex(listing => listing.id === response.data.id);
                    
                    if (existingIndex >= 0) {
                        userListings[existingIndex] = response.data;
                    } else {
                        userListings.push(response.data);
                    }
                    
                    localStorage.setItem('userListings', JSON.stringify(userListings));
                } catch (err) {
                    console.error("Error updating localStorage:", err);
                }
            }
            
            alert("Your listing has been created successfully!");
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create listing. Please try again.');
            console.error('Error creating listing:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="listing-create-container">
            <div className="listing-create-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <FaArrowLeft /> Back
                </button>
                <h1>Create a New Listing</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="listing-create-form">
                <div className="form-section">
                    <h2>Basic Information</h2>
                    
                    <div className="form-group">
                        <label htmlFor="title">Listing Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Give your place a catchy title"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your place in detail"
                            rows="5"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="location">
                            <FaMapMarkerAlt /> Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, State or Country"
                            required
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Details</h2>
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="pricePerNight">
                                <FaDollarSign /> Price per night
                            </label>
                            <input
                                type="number"
                                id="pricePerNight"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={handleChange}
                                min="1"
                                placeholder="USD"
                                required
                            />
                        </div>
                        
                        <div className="form-group half">
                            <label htmlFor="maxGuests">
                                <FaUsers /> Maximum guests
                            </label>
                            <input
                                type="number"
                                id="maxGuests"
                                name="maxGuests"
                                value={formData.maxGuests}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="bedrooms">
                                <FaBed /> Bedrooms
                            </label>
                            <input
                                type="number"
                                id="bedrooms"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>
                        
                        <div className="form-group half">
                            <label htmlFor="bathrooms">
                                <FaBath /> Bathrooms
                            </label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                step="0.5"
                                required
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Amenities</h2>
                    <p className="form-hint">Select all amenities that your place offers</p>
                    
                    <div className="amenities-grid">
                        {amenitiesList.map(amenity => (
                            <div 
                                key={amenity} 
                                className={`amenity-item ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                                onClick={() => handleAmenityToggle(amenity)}
                            >
                                {amenity}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Images</h2>
                    
                    <div className="form-group">
                        <label htmlFor="image">Main Image</label>
                        <div className="image-input">
                            <input
                                type="text"
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="Paste an image URL"
                            />
                            <button 
                                type="button" 
                                className="upload-button"
                                onClick={handleFileButtonClick}
                                disabled={uploadingImage}
                            >
                                <FaUpload /> {uploadingImage ? 'Uploading...' : 'Upload'}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="form-hint">Tip: Use high quality images that showcase your place</p>
                    </div>
                    
                    {formData.image && (
                        <div className="image-preview">
                            <img 
                                src={formData.image} 
                                alt="Listing preview" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                                }}
                            />
                        </div>
                    )}
                </div>
                
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ListingCreate;