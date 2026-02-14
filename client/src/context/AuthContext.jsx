import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 1. Check if user is already logged in (on refresh)
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
            setUser({ token }); // Simple user object for now
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    // 2. Login Function
    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        setToken(res.data.token);
    };

    // 3. Register Function
    const register = async (name, email, password) => {
        const res = await axios.post('/auth/register', { name, email, password });
        setToken(res.data.token);
    };

    // 4. Logout Function
    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;