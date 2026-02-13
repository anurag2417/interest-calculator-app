// server/index.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Define Routes
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;

// 2. Database Connection Logic (Only ONE block is needed)
const connectDB = async () => {
    try {
        // Check if we are already connected to avoid errors
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB Already Connected!');
            return;
        }

        // Use the Environment Variable for Cloud, or Local as backup
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interest_calculator';

        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ Connection Error:', err);
        process.exit(1); // Stop the app if we can't connect
    }
};

// Start the Server (and connect to DB)
app.listen(PORT, () => {
    connectDB(); // Call connection logic when server starts
    console.log(`Server running on port ${PORT}`);
});