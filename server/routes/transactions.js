const express = require('express');
const router = express.Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth'); // Import Middleware
const Transaction = require('../models/Transaction');

// 1. Define the Transaction Schema
const transactionSchema = z.object({
    personName: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["Given", "Taken"]),
    amount: z.number().positive("Amount must be a positive number"),
    interestRate: z.number().min(0).max(100),
    date: z.string().datetime({ offset: true }).or(z.string()), // Flexible date validation
    dueDate: z.string().optional().nullable()
});

// @route   GET /api/transactions
// @desc    Get ALL transactions for the LOGGED-IN user
router.get('/', auth, async (req, res) => {
    try {
        // Find transactions where user matches the ID in the token
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
router.post('/', [auth, validate(transactionSchema)], async (req, res) => {
    try {
        const { type, amount, interestRate, personName, date, dueDate } = req.body;

        const newTransaction = new Transaction({
            user: req.user.id, // Attach the logged-in user's ID
            type,
            amount,
            interestRate,
            personName,
            date,
            dueDate
        });

        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Make sure user owns the transaction
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/transactions/:id/settle
// @desc    Update Status
router.patch('/:id/settle', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Not found' });

        // Check ownership
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        transaction.status = transaction.status === 'Active' ? 'Settled' : 'Active';
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;