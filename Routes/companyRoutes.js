const express = require('express');
const router = express.Router();

// models
const Company = require('../Models/CompaniesModels/CompanyModel');

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

router.get('/display-all', [
    isAuth,
    isAdmin
],
companyController.getCompanyProfile
);

router.post('/add-company', [
        // checking the incoming data from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail')
            .normalizeEmail()
            .custom(value => {
                return Company.findOne({where: {email: value}})
                    .then(company => {
                        if(company)
                            return Promise.reject('E-Mail Is Already Exists, Please Pick A Different One');
                    })
            }),
        check('password')
            .isLength({min: 8})
            .withMessage('your password is too short, 8 charectar required')
            .trim(),
        check('confirmPassword')
            .custom((value, {req}) => {
                if(value !== req.body.password)
                    throw new Error('Passwords Didn\'t Match');
                return true;
            })
            .trim(),
        check('name')
            .isString()
            .trim(),
        check('phone_number')
            .isString()
            .trim(),
        check('address')
            .isString()
            .trim(),
        check('gender')
            .isString()
            .trim(),
    ], [
        isAuth,
        isAdmin
    ],
    companyController.postAddCompany
);

router.put('/update-company', [
        // checking the incoming data from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail'),
        check('password')
            .isLength({min: 8})
            .withMessage('your password is too short, 8 charectar required')
            .trim(),
        check('name')
            .isString()
            .trim(),
        check('phone_number')
            .isString()
            .trim(),
        check('address')
            .isString()
            .trim(),
        check('gender')
            .isString()
            .trim(),
        check('salary')
            .isFloat(),
        check('employeeOfTheMonth')
            .isBoolean()
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