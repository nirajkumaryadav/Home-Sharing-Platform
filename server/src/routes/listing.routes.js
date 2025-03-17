const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');

// Route to create a new home listing
router.post('/', listingController.createListing);

// Route to get all home listings
router.get('/', listingController.getAllListings);

// Route to get a specific home listing by ID
router.get('/:id', listingController.getListingById);

// Route to update a home listing by ID
router.put('/:id', listingController.updateListing);

// Route to delete a home listing by ID
router.delete('/:id', listingController.deleteListing);

module.exports = router;