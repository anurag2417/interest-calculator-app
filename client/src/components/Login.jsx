import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import this
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import './TransactionForm.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); // 2. Initialize it
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            // 3. Navigate to Dashboard on success
            navigate('/'); 
        } catch (err) {
            if (err.response) {
                setError(err.response.data.msg || 'Invalid Credentials');
            } else {
                setError('Network Error - Is the backend running?');
            }
            setIsLoading(false);
        }
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <motion.form 
                className="transaction-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                style={{width: '100%', maxWidth: '400px'}}
            >
                <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#fff'}}>Welcome Back</h2>
                {error && (
                    <div style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center'}}>
                        {error}
                    </div>
                )}
                
                <div style={{marginBottom: '15px'}}>
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>
                
                <button type="submit" className="add-btn" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Login'}
                </button>
                
                <p style={{marginTop: '15px', textAlign: 'center', color: '#94a3b8'}}>
                    Don't have an account? <a href="/register" style={{color: '#6366f1'}}>Sign Up</a>
                </p>
            </motion.form>
        </div>
    );
};

export default Login;