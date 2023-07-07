require('dotenv').config();

const Employee = require('../Models/AuthModels/Employee');

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // make sure the header has an authorization field
    const authHeader = req.get('Authorization');
    if(!authHeader)
        return false;
    
    // get the token from the header
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        // decode and verify the token
        decodedToken = jwt.verify(token, process.env.JWT_SECRETE_KEY);
    } catch(err) {
        return false;
    }
    if(!decodedToken)
        return false;
    // to determine that the token is indeed the current token which the employee use
    Employee.findOne({where: {token: token}})
        .then(() => {
            // if reached here then the employee is authenticated
            return true;
        })
        .catch(() => {
            return false;
        })
};