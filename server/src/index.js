const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./config/config');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const listingRoutes = require('./routes/listing.routes');
const errorMiddleware = require('./middleware/error.middleware');
const net = require('net');

// Load environment variables
dotenv.config();

const app = express();
let PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Skip database connection entirely and use mock data
console.log('Using mock data for development');

// Test route to verify the server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running correctly' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/listings', listingRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Function to check if a port is available
const checkPort = (port) => {
    return new Promise((resolve, reject) => {
        const tester = net.createServer()
            .once('error', err => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
            .once('listening', () => tester.once('close', () => resolve(true)).close())
            .listen(port);
    });
};

// Start server with fallback ports
const startServer = async () => {
    while (!(await checkPort(PORT))) {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
        PORT++;
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();