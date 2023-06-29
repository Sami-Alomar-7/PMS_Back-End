require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.generat = (employee) => {
    // get the current time and set the expiration after one houre
    const timestamp = Date.now();
    const expiry = timestamp + (60 * 60 * 1000);

    const secret = process.env.JWT_SECRETE_KEY;

    // create a token based on the user data and the secret key
    const token = jwt.sign({
            id: employee.id, 
            email: employee.email, 
            statu: employee.statu,
            date: timestamp,
        },
        secret, {
            expiresIn: '1h'
        }
    );

    return {token: token, expiry: expiry};
};