import React, { createContext, useState, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import mockHomes from '../assets/mockData/homes.json';
import bookingService from '../services/booking.service';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState(() => {
        // Initialize bookings from localStorage during initial render
        try {
            const savedBookings = localStorage.getItem('userBookings');
            return savedBookings ? JSON.parse(savedBookings) : [];
        } catch {
            return [];
        }
    });
    
    const { user } = useContext(AuthContext);

    const saveBookings = useCallback((newBookings) => {
        if (user) {
            localStorage.setItem('userBookings', JSON.stringify(newBookings));
        }
    }, [user]);

    const addBooking = useCallback((booking) => {
        setBookings(prevBookings => {
            const newBookings = [...prevBookings, booking];
            saveBookings(newBookings);
            return newBookings;
        });
    }, [saveBookings]);

    const removeBooking = useCallback((bookingId) => {
        setBookings(prevBookings => {
            const newBookings = prevBookings.filter(booking => booking.id !== bookingId);
            saveBookings(newBookings);
            return newBookings;
        });
        
        // Try to update on the server if we have a real API
        try {
            bookingService.cancelBooking(bookingId);
        } catch (error) {
            console.error("Error canceling booking on server:", error);
            // The booking is already removed from local state, so no need to restore
        }
    }, [saveBookings]);

    const fetchBookings = useCallback(() => {
        return bookings;
    }, [bookings]);

    const createBooking = useCallback((homeId, startDate, endDate, guests = 1, totalPrice = null) => {
        const homeDetails = mockHomes.find(home => home.id === parseInt(homeId)) || {
            title: `Home #${homeId}`,
            location: 'Unknown Location',
            pricePerNight: 100,
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60'
        };
        
        // Calculate the price if not provided
        const calculatedPrice = totalPrice || calculatePrice(startDate, endDate, homeDetails.pricePerNight, guests);
        
        const newBooking = {
            id: Date.now(),
            homeId: parseInt(homeId),
            homeTitle: homeDetails.title,
            location: homeDetails.location,
            image: homeDetails.image,
            checkInDate: startDate,
            checkOutDate: endDate,
            guests: guests,
            totalPrice: calculatedPrice,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Try to save to the server first if we have a real API
        try {
            if (user) {
                bookingService.createBooking({
                    ...newBooking,
                    userId: user.id
                });
            }
        } catch (error) {
            console.error("Error creating booking on server:", error);
            // Continue to save locally even if server fails
        }
        
        addBooking(newBooking);
        return newBooking;
    }, [addBooking, user]);

    const calculatePrice = (startDate, endDate, pricePerNight, guests = 1) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Add guest factor to pricing
        const guestFactor = guests > 2 ? 1 + ((guests - 2) * 0.15) : 1; // 15% more per guest after 2
        const baseTotal = nights * pricePerNight;
        const totalWithGuests = Math.ceil(baseTotal * guestFactor);
        const serviceFee = Math.ceil(totalWithGuests * 0.12);
        
        return totalWithGuests + serviceFee;
    };

    return (
        <BookingContext.Provider value={{ 
            bookings, 
            addBooking, 
            removeBooking, 
            fetchBookings, 
            createBooking 
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    return useContext(BookingContext);
};

export default BookingContext;