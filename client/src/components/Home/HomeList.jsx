import React from 'react';
import HomeCard from './HomeCard';
import './HomeList.css'; // Make sure to create this file

const HomeList = ({ homes = [] }) => {
    if (!homes || homes.length === 0) {
        return <p>No homes available at the moment.</p>;
    }

    return (
        <div className="home-list">
            <div className="home-list-container">
                {homes.map((home) => (
                    <HomeCard key={home.id} home={home} />
                ))}
            </div>
        </div>
    );
};

export default HomeList;