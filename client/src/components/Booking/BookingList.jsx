import React, { useContext, useEffect, useState } from 'react';
import { BookingContext } from '../../contexts/BookingContext';

const BookingList = () => {
    const { bookings, fetchBookings } = useContext(BookingContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBookings = async () => {
            await fetchBookings();
            setLoading(false);
        };
        getBookings();
    }, [fetchBookings]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Your Bookings</h2>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <ul>
                    {bookings.map((booking) => (
                        <li key={booking.id}>
                            <h3>{booking.homeTitle}</h3>
                            <p>Check-in: {booking.checkInDate}</p>
                            <p>Check-out: {booking.checkOutDate}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BookingList;