// This is a mock service for authentication
// In a real app, these functions would make API calls

const users = [
  // Add a sample user for easier testing
  {
    id: "12345",
    name: "Demo User",
    username: "demouser",
    email: "demo@example.com",
    password: "password123",
    createdAt: "2023-01-01T00:00:00.000Z"
  }
];

export const login = async (credentials) => {
    try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find user by email (case insensitive)
        const user = users.find(u => 
            u.email.toLowerCase() === credentials.email.toLowerCase() &&
            u.password === credentials.password
        );
        
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if user with same email already exists
        const existingUser = users.find(u => 
            u.email.toLowerCase() === userData.email.toLowerCase()
        );
        
        if (existingUser) {
            throw new Error('Email already in use');
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            createdAt: new Date().toISOString()
        };
        
        // Add to users array (in a real app, this would be saved to a database)
        users.push(newUser);
        
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find user by ID
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        throw error;
    }
};

const authService = {
    login,
    registerUser,
    getUserProfile,
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    logout: () => {
        localStorage.removeItem('user');
    }
};

export default authService;