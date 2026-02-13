// src/utils/calculations.js

export const calculateInterest = (principal, rate, startDate) => {
    const start = new Date(startDate);
    const now = new Date();

    // 1. Calculate time difference in milliseconds
    const timeDiff = now - start;

    // 2. Convert to days (1000ms * 60s * 60m * 24h)
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // 3. Convert to months (approx 30 days per month)
    // You can use (daysPassed / 365) * 12 for more precision if needed
    const monthsPassed = (daysPassed / 30).toFixed(2); 

    // 4. Calculate Simple Interest (Monthly)
    // Formula: (P * R * T) / 100
    const interest = (principal * rate * monthsPassed) / 100;

    const totalAmount = principal + interest;

    return {
        days: daysPassed,
        months: monthsPassed,
        interest: Math.round(interest), // Round to nearest rupee
        total: Math.round(totalAmount)
    };
};