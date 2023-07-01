const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const rawController = require('../../Controllers/CompaniesController/rawController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],  
    rawController.getAllRaws
);

router.get('/display-raw', [
        isAuth,
        isAdmin
    ],
    rawController.getSpecificRaw
);

router.get('/display-company-raw', [
        isAuth,
        isAdmin
    ],
    rawController.getSpecificCompanyRaws
);

module.exports = router;