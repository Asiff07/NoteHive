import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.withCredentials = true;
    // Use relative path to leverage Vite proxy
    axios.defaults.baseURL = '/api';

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        setUser(res.data);
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await axios.post('/auth/register', { name, email, password });
        return res.data;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
