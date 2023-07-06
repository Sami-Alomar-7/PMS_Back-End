const express = require('express');
const router = express.Router();

// Models
const Debt = require('../../Models/AccountModels/DebtModel');
const Account = require('../../Models/AccountModels/AccountModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const debtController = require('../../Controllers/AccountController/debtController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    debtController.getAllDebts
);

router.get('/display-debt', [
        check('debtId')
            .exists()
            .custom(value => {
                return Debt.findOne({where: {id: value}})
                    .then(debt => {
                        if(!debt)
                            return Promise.reject('No Such debt Exists');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    debtController.getSpecificDebt
);

router.get('/display-account-debts', [
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
    debtController.getSpecificeAccountDebts
);

router.post('/add-debt', [
        check('debtId')
            .exists()
            .custom(value => {
                return Debt.findOne({where: {id: value}})
                    .then(debt => {
                        if(!debt)
                            return Promise.reject('No Such debt Exists');
                    })
            }),
        check('credit')
            .exists()
            .isFloat()
    ], [
        isAuth,
        isAdmin
    ],
    debtController.postAddDebt
)

router.put('/edit-Debt', [
        check('debtId')
            .exists()
            .custom(value => {
                return Debt.findOne({where: {id: value}})
                    .then(debt => {
                        if(!debt)
                            return Promise.reject('No Such debt Exists');
                    })
            }),
        check('credit')
            .exists()
            .isFloat()
    ], [
        isAuth,
        isAdmin
    ],
    debtController.putEditDebt
)

module.exports = router;