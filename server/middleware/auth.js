const jwt = require('jsonwebtoken');

// Middleware function to verify Token
module.exports = function(req, res, next) {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, 'mysecretkey123'); // Use same secret as auth.js
        req.user = decoded.user; // Add the user ID to the request
        next(); // Move to the next step
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};