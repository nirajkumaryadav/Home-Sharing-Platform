const mockListings = require('../data/mockListings');

const listingController = {
    getAllListings: async (req, res) => {
        try {
            res.json({
                status: 'success',
                data: mockListings
            });
        } catch (error) {
            console.error('Error in getAllListings:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch listings'
            });
        }
    },

    getListingById: async (req, res) => {
        try {
            const listing = mockListings.find(l => l._id === req.params.id);
            if (!listing) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Listing not found'
                });
            }
            res.json({
                status: 'success',
                data: listing
            });
        } catch (error) {
            console.error('Error in getListingById:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch listing'
            });
        }
    },

    createListing: async (req, res) => {
        try {
            const newListing = {
                _id: String(mockListings.length + 1),
                ...req.body,
                createdAt: new Date()
            };
            mockListings.push(newListing);
            res.status(201).json({
                status: 'success',
                data: newListing
            });
        } catch (error) {
            console.error('Error in createListing:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create listing'
            });
        }
    },

    updateListing: async (req, res) => {
        try {
            const index = mockListings.findIndex(l => l._id === req.params.id);
            if (index === -1) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Listing not found'
                });
            }
            mockListings[index] = { ...mockListings[index], ...req.body };
            res.json({
                status: 'success',
                data: mockListings[index]
            });
        } catch (error) {
            console.error('Error in updateListing:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update listing'
            });
        }
    },

    deleteListing: async (req, res) => {
        try {
            const index = mockListings.findIndex(l => l._id === req.params.id);
            if (index === -1) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Listing not found'
                });
            }
            mockListings.splice(index, 1);
            res.json({
                status: 'success',
                message: 'Listing deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteListing:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete listing'
            });
        }
    }
};

module.exports = listingController;