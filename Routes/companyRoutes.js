const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../Middleware/isAuth');
const isAdmin = require('../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const companyController = require('../Controllers/companyController');

router.get('/display-all', [
    isAuth,
    isAdmin
],
companyController.getAllCompanies
);

router.get('/display-company-profile/:companyId', [
    isAuth,
    isAdmin
],
companyController.getCompanyProfile
);

router.put('/update-company', [
        // checking the incoming data from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail'),
        check('name')
            .isString()
            .trim(),
        check('phone_number')
            .isString()
            .trim(),
        check('location')
            .isString()
            .trim(),
        check('type')
            .isString()
            .trim()
    ], [
        isAuth,
        isAdmin
    ],
    companyController.putUpdateProfile
);

router.delete('/delete-company', [
        isAuth,
        isAdmin
    ],
    companyController.deleteCompany
);

module.exports = router;