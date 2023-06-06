const crypto = require('crypto');

exports.generat = () => {
    // get the current time and set the expiration date
    const timestamp = new Date().getTime();
    const expiry = timestamp + 10 * 60 * 1000;
    
    // genrats a 4 digit code for verifing
    let code = crypto.randomInt(1000,9999);

    return {code: code, expiry: expiry};
};