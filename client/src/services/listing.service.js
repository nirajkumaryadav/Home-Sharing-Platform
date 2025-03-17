import mockHomes from '../assets/mockData/homes.json';

// Mock delay to simulate API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Service for listings-related functionality
const listingService = {
  /**
   * Get all homes (with optional filtering)
   * @param {Object} filters - Filter criteria
   * @returns {Promise} Promise that resolves to an array of homes
   */
  getHomes: async (filters = {}) => {
    try {
      // Simulate API delay
      await delay(800);
      
      // Get user listings from localStorage
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      // Combine with mock homes
      let homes = [...mockHomes, ...userListings];
      
      // Remove duplicates (in case user listings have same IDs as mock homes)
      homes = homes.filter((home, index, self) => 
        index === self.findIndex(h => h.id === home.id)
      );
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        homes = homes.filter(home => {
          // Filter by location
          if (filters.location && !home.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
          }
          
          // Filter by price
          if (filters.minPrice && home.pricePerNight < filters.minPrice) {
            return false;
          }
          if (filters.maxPrice && home.pricePerNight > filters.maxPrice) {
            return false;
          }
          
          // Filter by bedrooms
          if (filters.bedrooms && home.bedrooms < filters.bedrooms) {
            return false;
          }
          
          // Filter by guests
          if (filters.guests && home.maxGuests < filters.guests) {
            return false;
          }
          
          // Filter by owner if specified
          if (filters.ownerId && home.ownerId !== filters.ownerId) {
            return false;
          }
          
          return true;
        });
      }
      
      return { data: homes };
    } catch (error) {
      console.error("Error fetching homes:", error);
      throw error;
    }
  },
  
  /**
   * Get a specific home by ID
   * @param {string|number} id - The ID of the home to fetch
   * @returns {Promise} Promise that resolves to the home object
   */
  getHomeById: async (id) => {
    try {
      // Simulate API delay
      await delay(500);
      
      // Try to find in user listings first
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      const userHome = userListings.find(h => h.id === parseInt(id) || h.id === id);
      
      if (userHome) {
        return { data: userHome };
      }
      
      // If not found in user listings, look in mock data
      const home = mockHomes.find(h => h.id === parseInt(id));
      
      if (!home) {
        throw new Error("Home not found");
      }
      
      return { data: home };
    } catch (error) {
      console.error(`Error fetching home with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new listing
   * @param {Object} listingData - The data for the new listing
   * @returns {Promise} Promise that resolves to the created listing
   */
  createListing: async (listingData) => {
    try {
      // Simulate API delay
      await delay(1000);
      
      // Create a new listing with an ID and default values if missing
      const newListing = {
        id: Date.now(), // Use timestamp as ID to ensure uniqueness
        createdAt: new Date().toISOString(),
        ...listingData,
        // Ensure we have an image, even if one wasn't provided
        image: listingData.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60'
      };
      
      // Store in localStorage
      try {
        const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
        userListings.push(newListing);
        localStorage.setItem('userListings', JSON.stringify(userListings));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      
      return { data: newListing };
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  },
  
  /**
   * Create a new home listing
   * @param {Object} homeData - The data for the new home
   * @returns {Promise} Promise that resolves to the created home object
   */
  createHome: async (homeData) => {
    try {
      // Simulate API delay
      await delay(1000);
      
      // Get the current user
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      // Create new home with ID and timestamps
      const newHome = {
        ...homeData,
        id: Date.now(),
        ownerId: currentUser?.id,
        ownerEmail: currentUser?.email,
        owner: currentUser?.id,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing user listings
      const existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      // Add new listing
      const updatedListings = [...existingListings, newHome];
      
      // Save to localStorage
      localStorage.setItem('userListings', JSON.stringify(updatedListings));
      
      return { data: newHome };
    } catch (error) {
      console.error("Error creating home:", error);
      throw error;
    }
  },
  
  /**
   * Update an existing listing
   * @param {string|number} id - The ID of the listing to update
   * @param {Object} updateData - The data to update
   * @returns {Promise} Promise that resolves to the updated listing
   */
  updateListing: async (id, updateData) => {
    try {
      // Simulate API delay
      await delay(800);
      
      // Try to find in user listings first
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      const listingIndex = userListings.findIndex(h => h.id == id || h.id === parseInt(id));
      
      if (listingIndex !== -1) {
        // Update the listing in user listings
        const updatedListing = { ...userListings[listingIndex], ...updateData };
        userListings[listingIndex] = updatedListing;
        localStorage.setItem('userListings', JSON.stringify(userListings));
        return { data: updatedListing };
      }
      
      // If not in user listings, check mock data
      const home = mockHomes.find(h => h.id === parseInt(id));
      
      if (!home) {
        throw new Error("Home not found");
      }
      
      // Update the listing
      const updatedListing = { ...home, ...updateData };
      
      return { data: updatedListing };
    } catch (error) {
      console.error(`Error updating listing with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a listing
   * @param {string|number} id - The ID of the listing to delete
   * @returns {Promise} Promise that resolves when deletion is complete
   */
  deleteListing: async (id) => {
    try {
      // Simulate API delay
      await delay(800);
      
      // Try to find in user listings first
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      const newUserListings = userListings.filter(h => h.id !== id && h.id !== parseInt(id));
      
      if (newUserListings.length !== userListings.length) {
        // A listing was removed
        localStorage.setItem('userListings', JSON.stringify(newUserListings));
        return { success: true };
      }
      
      // If not in user listings, check mock data
      const homeIndex = mockHomes.findIndex(h => h.id === parseInt(id));
      
      if (homeIndex === -1) {
        throw new Error("Home not found");
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting listing with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get homes created by a specific user
   * @param {string|number} userId - The ID of the user
   * @returns {Promise} Promise that resolves to an array of homes
   */
  getUserListings: async (userId) => {
    try {
      // Simulate API delay
      await delay(600);
      
      // Get user listings from localStorage
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      // Enhanced logging for debugging
      console.log('All user listings:', userListings);
      console.log('Current userId:', userId);
      
      // Use more flexible matching for user identification
      const userHomes = userListings.filter(home => {
        // Check all possible ID fields with loose comparison
        const isOwner = 
          home.ownerId == userId || 
          home.owner == userId || 
          home.ownerEmail == userId ||
          // Also check user email if available
          (userId && userId.email && home.ownerEmail == userId.email);
        
        console.log(`Checking home ${home.id}: ${isOwner ? 'MATCH' : 'NO MATCH'}`);
        return isOwner;
      });
      
      console.log('Filtered user homes:', userHomes);
      return { data: userHomes };
    } catch (error) {
      console.error(`Error fetching listings for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get homes created by the current user
   * @returns {Promise} Promise that resolves to an array of homes
   */
  getUserHomes: async () => {
    try {
      // Simulate API delay
      await delay(600);
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        return { data: [] }; // No user logged in
      }
      
      // Get user listings from localStorage
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      // Filter homes based on the current user's ID or email
      const userHomes = userListings.filter(home => {
        return (
          // Check all possible owner ID fields with loose comparison
          (home.ownerId && (home.ownerId == currentUser.id)) || 
          (home.owner && (home.owner == currentUser.id)) || 
          (home.ownerEmail && (home.ownerEmail == currentUser.email)) ||
          // If none of the above match, check if the listing was created by this user's session
          (home.createdBy && home.createdBy == currentUser.id)
        );
      });
      
      console.log('Current user:', currentUser);
      console.log('Filtered user homes:', userHomes);
      return { data: userHomes };
    } catch (error) {
      console.error("Error fetching user's homes:", error);
      throw error;
    }
  },
};

export default listingService;