const express = require('express');
const router = express.Router();

// Models
    const Account = require('../../Models/AccountModels/AccountModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const accountController = require('../../Controllers/AccountController/accountController');

// Routes
    // the account debts routes
    const debtRoute = require('./debtRoute');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    accountController.getAllAccounts
);

router.get('/display-account', [
    check('accountId')
        .exists()
        .custom(value => {
            return Account.findOne({where: {id: value}})
                .then(account => {
                    if(!account)
                        return Promise.reject('No Such debt Exists');
                })
        })
    ], [
        isAuth,
        isAdmin
    ],
    accountController.getSpecificAccount
);

router.get('/display-company-accounts', [
    check('companyId')
        .exists()
        .custom(value => {
            return Account.findOne({where: {companyId: value}})
                .then(account => {
                    if(!account)
                        return Promise.reject('No Such debt Exists');
                })
        })
    ], [
        isAuth,
        isAdmin
    ],
    accountController.getSpecificeCompanyAccount
);

router.delete('/delete-account', [
    check('accountId')
        .exists()
        .custom(value => {
            return Account.findOne({where: {id: value}})
                .then(account => {
                    if(!account)
                        return Promise.reject('No Such debt Exists');
                })
        })
    ], [
        isAuth,
        isAdmin
    ],
    accountController.deleteAccount
);

router.use('/debt', debtRoute);

module.exports = router;