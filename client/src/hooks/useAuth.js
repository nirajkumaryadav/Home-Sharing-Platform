import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/auth.service';

export const useAuth = () => {
    const { user, login: contextLogin, logout: contextLogout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkUser = () => {
            try {
                const user = authService.getCurrentUser();
                if (user) {
                    contextLogin(user);
                }
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [contextLogin]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login({ email, password });
            contextLogin(data.user);
            return data.user;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        contextLogout();
        navigate('/');
    };

    // Only redirect if explicitly navigating from login/register
    useEffect(() => {
        if (user && location.pathname.match(/\/(login|register)$/)) {
            const params = new URLSearchParams(location.search);
            const redirectPath = params.get('redirect') || '/';
            navigate(redirectPath);
        }
    }, [user, navigate, location]);

    return { user, login, logout, loading, error };
};

export default useAuth;