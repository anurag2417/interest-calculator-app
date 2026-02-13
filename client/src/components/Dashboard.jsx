import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Animation Library
import axios from '../api/axios';
import TransactionForm from './TransactionForm';
import StatsChart from './StatsChart';
import { calculateInterest } from '../utils/calculations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/transactions');
            setTransactions(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this transaction?")) return;
        await axios.delete(`/transactions/${id}`);
        fetchTransactions();
    };

    const handleSettle = async (id) => {
        await axios.patch(`/transactions/${id}/settle`);
        fetchTransactions();
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Interest Report", 14, 20);
        
        const tableColumn = ["Date", "Name", "Type", "Amount", "Total Due"];
        const tableRows = [];

        filteredTransactions.forEach(t => {
            const result = calculateInterest(t.amount, t.interestRate, t.date);
            tableRows.push([
                new Date(t.date).toLocaleDateString(),
                t.personName,
                t.type,
                t.amount,
                result.total
            ]);
        });

        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
        doc.save('report.pdf');
    };

    const filteredTransactions = transactions.filter(t => 
        t.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalGiven = filteredTransactions
        .filter(t => t.type === 'Given' && t.status !== 'Settled')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalTaken = filteredTransactions
        .filter(t => t.type === 'Taken' && t.status !== 'Settled')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="dashboard-header">
                <h1>Finance<span style={{color:'#a855f7'}}>Flow</span></h1>
                <p style={{color:'#94a3b8'}}>Manage your lending effortlessly</p>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <motion.div className="stat-card" variants={itemVariants}>
                    <h3>Lent (Given)</h3>
                    <p className="amount green">₹{totalGiven.toLocaleString()}</p>
                </motion.div>
                <motion.div className="stat-card" variants={itemVariants}>
                    <h3>Borrowed (Taken)</h3>
                    <p className="amount red">₹{totalTaken.toLocaleString()}</p>
                </motion.div>
                <motion.div className="stat-card" variants={itemVariants}>
                    <h3>Net Balance</h3>
                    <p className="amount blue">₹{(totalGiven - totalTaken).toLocaleString()}</p>
                </motion.div>
            </div>

            {/* Chart Section */}
            <motion.div variants={itemVariants} style={{marginBottom: '40px'}}>
                <StatsChart given={totalGiven} taken={totalTaken} />
            </motion.div>

            {/* Actions Bar */}
            <motion.div className="controls-container" variants={itemVariants}>
                <input 
                    className="search-input"
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-primary" onClick={downloadPDF}>
                    Download Report
                </button>
            </motion.div>

            {/* Form Section */}
            <motion.div variants={itemVariants}>
                <TransactionForm onTransactionAdded={fetchTransactions} />
            </motion.div>

            {/* Table Section */}
            <motion.div className="table-container" variants={itemVariants}>
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Person</th>
                            <th>Type</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Total Due</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((t) => {
                            const result = calculateInterest(t.amount, t.interestRate, t.date);
                            const isSettled = t.status === 'Settled';
                            
                            return (
                                <tr key={t._id} style={{opacity: isSettled ? 0.5 : 1}}>
                                    <td>
                                        {new Date(t.date).toLocaleDateString()}
                                        {t.dueDate && <div style={{fontSize:'0.7em', color:'#94a3b8'}}>Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                                    </td>
                                    <td>
                                        {t.personName}
                                        {isSettled && <span className="badge badge-paid" style={{marginLeft:'5px'}}>PAID</span>}
                                    </td>
                                    <td>
                                        <span style={{color: t.type === 'Given' ? '#10b981' : '#ef4444'}}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td>₹{t.amount}</td>
                                    <td style={{color:'#94a3b8'}}>₹{result.interest}</td>
                                    <td style={{fontWeight:'bold'}}>₹{result.total}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => handleSettle(t._id)}>
                                            {isSettled ? 'Undo' : 'Settle'}
                                        </button>
                                        <button className="action-btn delete-btn" onClick={() => handleDelete(t._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;