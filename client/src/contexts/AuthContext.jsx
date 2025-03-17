import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize user state from localStorage during initial render
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(user));

    const login = useCallback(async (credentials) => {
        try {
            const userObj = {
                id: Date.now().toString(),
                username: credentials.username || credentials.email.split('@')[0],
                email: credentials.email,
                name: credentials.name || 'User',
            };
            
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
            setIsAuthenticated(true);
            return userObj;
        } catch (err) {
            console.error('Login error:', err);
            throw new Error('Login failed');
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;