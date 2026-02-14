const mongoose = require('mongoose');


const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    type: {
        type: String,
        enum: ['Given', 'Taken'], // "Given" = you lent money, "Taken" = you borrowed
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    personName: { // The name of the person you gave/took money from
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    // NEW FIELD
    dueDate: {
        type: Date,
        required: false // Optional, because sometimes there is no deadline
    },
    status: {
        type: String,
        enum: ['Active', 'Settled'],
        default: 'Active'
    },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    personName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, enum: ['Active', 'Settled'], default: 'Active' }
});

module.exports = mongoose.model('Transaction', TransactionSchema);