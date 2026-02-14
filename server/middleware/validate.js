const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        // .parse will throw an error if req.body doesn't match the schema
        schema.parse(req.body);
        next();
    } catch (err) {
        // Return a professional 400 error with the specific Zod messages
        return res.status(400).json({
            msg: "Validation Failed",
            errors: err.errors.map(e => ({ field: e.path[0], message: e.message }))
        });
    }
};

module.exports = validate;