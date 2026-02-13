import React, { useState } from 'react';
import axios from '../api/axios';
import './TransactionForm.css'; // We will create this style next

const TransactionForm = ({ onTransactionAdded }) => {
    const [formData, setFormData] = useState({
        personName: '',
        amount: '',
        interestRate: '',
        type: 'Given', // Default to Given
        date: new Date().toISOString().split('T')[0], // Default to today
        dueDate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send data to backend
            await axios.post('/transactions', formData);
            
            // Clear the form
            setFormData({
                personName: '',
                amount: '',
                interestRate: '',
                type: 'Given',
                date: new Date().toISOString().split('T')[0],
                dueDate: ''
            });

            // Notify Dashboard to refresh the list
            onTransactionAdded(); 
            alert('Transaction Added Successfully!');
        } catch (err) {
            console.error(err);
            alert('Error adding transaction');
        }
    };

    return (
        <form className="transaction-form" onSubmit={handleSubmit}>
            <h3>Add New Transaction</h3>
            <div className="form-row">
                <input 
                    type="text" 
                    name="personName" 
                    placeholder="Person Name" 
                    value={formData.personName} 
                    onChange={handleChange} 
                    required 
                />
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="Given">Given (Lend)</option>
                    <option value="Taken">Taken (Borrow)</option>
                </select>
            </div>
            <div className="form-row">
                <input 
                    type="number" 
                    name="amount" 
                    placeholder="Amount (₹)" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="number" 
                    name="interestRate" 
                    placeholder="Interest Rate (%)" 
                    value={formData.interestRate} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    required 
                />
                <div className="form-row">
                <label style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <span style={{fontSize: '0.8rem', color: '#666'}}>Transaction Date:</span>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                    />
                </label>

                <label style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <span style={{fontSize: '0.8rem', color: 'red'}}>Due Date (Optional):</span>
                    <input 
                        type="date" 
                        name="dueDate" 
                        value={formData.dueDate} 
                        onChange={handleChange} 
                    />
                </label>
            </div>
            </div>
            <button type="submit" className="add-btn">Add Transaction</button>
        </form>
    );
};

export default TransactionForm;