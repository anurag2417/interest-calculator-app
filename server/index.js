// server/index.js

require('dotenv').config(); // Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to Cloud DB (or local if cloud fails)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interest_calculator';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => console.error('❌ Connection Error:', err));



// 2. Define Routes (We will create this file next)
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

const PORT = 5000;

// 1. Better Connection Logic
const connectDB = async () => {
    try {
        // Check if we are already connected
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB Already Connected!');
            return;
        }

        // If not connected, connect now
        await mongoose.connect(process.env.MONGO_URI); // Make sure your .env variable is correct
        console.log('✅ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ Connection Error:', err);
        process.exit(1); // Stop the app if we can't connect
    }
};

// Call the function
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});