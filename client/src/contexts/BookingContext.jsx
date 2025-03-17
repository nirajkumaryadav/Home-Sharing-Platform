import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState([]);
    const { user } = useAuth();

    // Load bookings when user changes
    useEffect(() => {
        if (user) {
            const savedBookings = localStorage.getItem(`bookings_${user.id}`);
            if (savedBookings) {
                try {
                    const parsedBookings = JSON.parse(savedBookings);
                    setBookings(parsedBookings);
                    console.log("Loaded bookings from localStorage:", parsedBookings);
                } catch (error) {
                    console.error("Error parsing saved bookings:", error);
                }
            }
        } else {
            setBookings([]);
        }
    }, [user]);

    const saveBookings = useCallback((newBookings) => {
        if (user) {
            localStorage.setItem(`bookings_${user.id}`, JSON.stringify(newBookings));
            console.log("Saved bookings to localStorage:", newBookings);
        }
    }, [user]);

    const fetchBookings = useCallback(async () => {
        if (!user) return [];

        try {
            // Get bookings from localStorage
            const savedBookings = localStorage.getItem(`bookings_${user.id}`);
            const parsedBookings = savedBookings ? JSON.parse(savedBookings) : [];
            
            // Update state
            setBookings(parsedBookings);
            console.log("Fetched bookings:", parsedBookings);
            return parsedBookings;
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    }, [user]);

    const createBooking = useCallback((homeId, homeData, startDate, endDate, guests, totalPrice) => {
        if (!user) return null;
        
        // Create new booking object
        const newBooking = {
            id: Date.now().toString(),
            homeId: homeId,
            homeTitle: homeData?.title || `Home ${homeId}`,
            location: homeData?.location || 'Unknown location',
            image: homeData?.image || '',
            checkInDate: startDate,
            checkOutDate: endDate,
            guests: guests,
            totalPrice: totalPrice,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        console.log("Creating booking:", newBooking);
        
        // Update state and localStorage
        setBookings(prevBookings => {
            const updatedBookings = [...prevBookings, newBooking];
            saveBookings(updatedBookings);
            return updatedBookings;
        });
        
        return newBooking;
    }, [user, saveBookings]);

    const removeBooking = useCallback((bookingId) => {
        setBookings(prevBookings => {
            const updatedBookings = prevBookings.filter(booking => booking.id !== bookingId);
            saveBookings(updatedBookings);
            return updatedBookings;
        });
    }, [saveBookings]);

    return (
        <BookingContext.Provider value={{ 
            bookings, 
            fetchBookings, 
            createBooking, 
            removeBooking 
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    return useContext(BookingContext);
};

export default BookingContext;