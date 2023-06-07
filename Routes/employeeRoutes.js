const express = require('express');
const router = express.Router();

// models
const Employee = require('../Models/AuthModel/Employee');

// Required Middleware
const isAuth = require('../Middleware/isAuth');
const isAdmin = require('../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const employeeController = require('../Controllers/employeeController');

router.get('/profile', isAuth, employeeController.getEmployeeProfile);

router.get('/display-employees', [
        isAuth,
        isAdmin
    ],
    employeeController.getAllEmployees
);

router.post('/add-employee', [
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
            .trim(),
    ], [
        isAuth,
        isAdmin
    ],
    employeeController.postAddEmployee
);

router.put('/update-employee', [
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
    employeeController.putUpdateProfile
);

router.delete('/delete-employee', [
        isAuth,
        isAdmin
    ],
    employeeController.deleteEmployee
);

module.exports = router;