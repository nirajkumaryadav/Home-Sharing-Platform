const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const listingRoutes = require('./routes/listing.routes');
const errorMiddleware = require('./middleware/error.middleware');
const net = require('net');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DB_URI:', process.env.DB_URI); // Add this line to debug

const app = express();
let PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route to verify the server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running correctly' });
});

// Add this before your other routes
app.get('/', (req, res) => {
  res.send('Home Sharing Platform API is running');
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