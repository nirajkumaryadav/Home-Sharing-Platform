const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// GET all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(12); // Limit results
    
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other listing routes...

module.exports = router;