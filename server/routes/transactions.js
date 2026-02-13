const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction'); // Import the schema we made earlier

// @route   POST /api/transactions
// @desc    Add a new transaction (Given or Taken)
router.post('/', async (req, res) => {
    try {
        const { type, amount, interestRate, personName, date, dueDate } = req.body;

        const newTransaction = new Transaction({
            type,
            amount,
            interestRate,
            personName,
            date,
            dueDate
        });

        const savedTransaction = await newTransaction.save();
        res.json(savedTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/transactions
// @desc    Get all transactions (For the Dashboard)
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 }); // Sort by newest first
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/transactions/:id/settle
// @desc    Mark a transaction as "Settled" (Paid)
router.patch('/:id/settle', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Toggle the status (if Active -> Settled, if Settled -> Active)
        transaction.status = transaction.status === 'Active' ? 'Settled' : 'Active';
        
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;