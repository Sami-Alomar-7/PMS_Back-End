require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // make sure the header has an authorization field
    const authHeader = req.get('Authorization');
    if(!authHeader)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authenticated'
        })
    
    // get the token from the header
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        // get the data from the token by decoding it
        decodedToken = jwt.verify(token, process.env.JWT_SECRETE_KEY);
    } catch(err) {
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authorized, This Token Isn\'t Valid'
        });
    }
    
    if(!decodedToken)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authenticated'
        });
        
    // set the employee id to the req object to use it later
    req.employeeId = decodedToken.id;

    // continue to the next stage
    next();
};