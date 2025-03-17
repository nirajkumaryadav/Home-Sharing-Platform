const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const listingsRouter = require('./routes/listings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/listings', listingsRouter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/home-sharing')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});