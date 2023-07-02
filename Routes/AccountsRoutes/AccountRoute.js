const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const accountController = require('../../Controllers/AccountController/accountController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    accountController.getAllAccounts
);

router.get('/display-account', [
        isAuth,
        isAdmin
    ],
    accountController.getSpecificAccount
);

router.delete('/delete-account', [
        isAuth,
        isAdmin
    ],
    accountController.deleteAccount
);

module.exports = router;