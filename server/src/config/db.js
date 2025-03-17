const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    // No MongoDB connection, always use mock data
    console.log('Using mock data instead of MongoDB');
    return false;
};

module.exports = connectDB;