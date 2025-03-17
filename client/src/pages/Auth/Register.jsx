import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth'; // Add this import
import './Auth.css';

const Register = () => {
  const location = useLocation();
  const { login } = useAuth(); // Add this to use the login function
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation checks remain the same
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the user
      await authService.registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Use the login function from useAuth instead of authService.login
      // This ensures the redirect will work through the useAuth hook
      await login(formData.email, formData.password);
      
      // Do not navigate here - let useAuth handle the redirect
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // The loginLink function is correct - keep it
  const loginLink = () => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    return redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login';
  };

  return (
    // Rest of your component remains the same
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join our home sharing community</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-alternate">
            <span>Already have an account?</span>
            <Link to={loginLink()} className="auth-alternate-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;