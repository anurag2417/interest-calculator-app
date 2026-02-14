import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import './TransactionForm.css';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password);
        } catch (err) {
            setError('User already exists');
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
                <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#fff'}}>Create Account</h2>
                {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
                
                <div style={{marginBottom: '15px'}}>
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>
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
                
                <button type="submit" className="add-btn">Sign Up</button>
                <p style={{marginTop: '15px', textAlign: 'center', color: '#94a3b8'}}>
                    Already have an account? <a href="/login" style={{color: '#6366f1'}}>Login</a>
                </p>
            </motion.form>
        </div>
    );
};

export default Register;