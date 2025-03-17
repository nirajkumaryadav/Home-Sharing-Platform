import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a "registered" parameter, to show a success message
  const justRegistered = new URLSearchParams(location.search).get('registered') === 'true';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Try to login
      await login(formData.email, formData.password);
      
      // Redirection is now handled by the useAuth hook's useEffect
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Make sure there's a link to register that preserves the redirect parameter
  const registerLink = () => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    return redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          {justRegistered && (
            <div className="auth-success">
              Registration successful! Please sign in with your new account.
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
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
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-alternate">
            <p>Don't have an account?</p>
            <Link to={registerLink()} className="auth-alternate-link">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;