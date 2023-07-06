const express = require('express');
const router = express.Router();

// Models
const Employee = require('../Models/AuthModels/Employee');

// Required Middleware
const firstRegister = require('../Middleware/firstRegister');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const authController = require('../Controllers/authController');

// POST - Register (localhost:7000/api/auth/register)
router.post('/register', [
        // checking the incoming data from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail')
            .normalizeEmail()
            .custom(value => {
                return Employee.findOne({where: {email: value}})
                    .then(employee => {
                        if(employee)
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
            .trim()
    ],
    // Just The First Admin Who Buys The App Register Himself
    firstRegister,
    authController.postRegister
);

// GET - GetRole (localhost:7000/api/auth/getRole)
router.get('/getRole', [
        check('email')
            .normalizeEmail()
            .trim()
    ],
    authController.getRole
);

// POST - Login (localhost:7000/api/auth/login)
router.post('/login',[
        // checking the incoming fata from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail')
            .normalizeEmail()
            .custom(value => {
                return Employee.findOne({where: {email: value}})
                    .then(employee => {
                        if(!employee)
                            return Promise.reject('E-mail Is Not Exists, Please Enter A Valid E-mail');
                    });
            }),
        check('password')
            .isLength({min: 8})
            .trim()
    ], 
    authController.postLogin
);

// POST - Login (localhost:7000/api/auth/verify-login)
router.post('/verify-login', authController.postVerifyLoggin);

// POST - Login (localhost:7000/api/auth/resset-password)
router.post('/reset-password', [
        check('email')
            .isEmail()
            .normalizeEmail()
            .custom(value => {
                return Employee.findOne({where: {email: value}})
                    .then(employee => {
                        if(!employee)
                            return Promise.reject('E-mail Is Not Exists, Please Enter A Valid E-mail');
                    });
            })
    ],
    authController.postResetPassword
);

// POST - Login (localhost:7000/api/auth/verify-reset-password)
router.post('/verify-reset-password', authController.postVerifyRestPassword);

// POST - Login (localhost:7000/api/auth/new-password)
router.post('/new-password', [
        check('email')
            .isEmail()
            .normalizeEmail()
            .custom(value => {
                return Employee.findOne({where: {email: value}})
                    .then(employee => {
                        if(!employee)
                            return Promise.reject('E-mail Is Not Exists, Please Enter A Valid E-mail');
                    });
            }),
        check('newPassword')
            .isLength({min: 8})
            .withMessage('your password is too short, 8 charectar required')
            .trim(),
        check('confirmNewPassword')
            .custom((value, {req}) => {
                if(value !== req.body.newPassword)
                    throw new Error('Passwords Didn\'t Match');
                return true;
            })
            .trim()
    ],
    authController.postNewPassword
);

module.exports = router;