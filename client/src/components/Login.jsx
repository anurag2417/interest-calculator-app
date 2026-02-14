import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import './TransactionForm.css'; // Keep this for form styles
import './Login.css'; // Import the new layout styles

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
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
        <div className="login-page">
            
            {/* --- LEFT SIDE: THE FORM --- */}
            <div className="login-left">
                <motion.form 
                    className="transaction-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmit}
                    style={{width: '100%', maxWidth: '400px', boxShadow: 'none', background: 'transparent', border: 'none'}}
                >
                    <h2 style={{fontSize: '2rem', marginBottom: '10px', color: '#fff'}}>Welcome Back</h2>
                    <p style={{color: '#94a3b8', marginBottom: '30px'}}>Please enter your details to sign in.</p>
                    
                    {error && (
                        <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem'}}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{marginBottom: '20px'}}>
                        <label style={{color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '5px', display: 'block'}}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email..."
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white'}}
                        />
                    </div>
                    <div style={{marginBottom: '30px'}}>
                        <label style={{color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '5px', display: 'block'}}>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password..."
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white'}}
                        />
                    </div>
                    
                    <button type="submit" className="add-btn" disabled={isLoading} style={{marginBottom: '20px'}}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    
                    <p style={{textAlign: 'center', color: '#94a3b8'}}>
                        Don't have an account? <a href="/register" style={{color: '#60a5fa', fontWeight: 'bold', textDecoration: 'none'}}>Sign Up for free</a>
                    </p>
                </motion.form>
            </div>

            {/* --- RIGHT SIDE: THE SHOWCASE --- */}
            <div className="login-right">
                <motion.div 
                    className="showcase-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h1 className="showcase-title">FinanceFlow</h1>
                    <p className="showcase-desc">
                        Stop the awkward money conversations. Track your personal lending and borrowing in one secure, professional dashboard.
                    </p>

                    <ul className="feature-list">
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Track friends who owe you money</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Auto-calculate simple interest</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Generate PDF reports instantly</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>100% Secure & Private Data</span>
                        </li>
                    </ul>

                    {/* SHOWCASE IMAGE */}
                    <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                        alt="Finance Dashboard Preview" 
                        className="showcase-image"
                    />
                </motion.div>
            </div>

        </div>
    );
};

export default Login;