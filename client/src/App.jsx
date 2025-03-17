import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/Listings/ListingDetail';
import ListingCreate from './pages/Listings/ListingCreate';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register'; 
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={<Dashboard />} 
                />
                <Route 
                  path="/create-listing" 
                  element={<ListingCreate />} 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;