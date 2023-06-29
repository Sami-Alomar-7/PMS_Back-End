const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../Middleware/isAuth');
const isAdmin = require('../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const debtController = require('../Controllers/debtController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    debtController.getAllDebts
);

router.get('/display-debt/:debtId', [
        isAuth,
        isAdmin
    ],
    debtController.getSpecificDebt
);

router.post('/display-company-debts', [
        isAuth,
        isAdmin
    ],
    debtController.getSpecificCompanyDebts
);

router.post('/add-debt', [
        // checking the incoming data from the request    
        check('debt')
            .exists()
            .isFloat(),
        check('credit')
            .exists()
            .isFloat()
    ], [
        isAuth,
        isAdmin
    ],
    debtController.postAddDebt
);

router.put('/update-debt', [
        // checking the incoming data from the request
        check('debt')
            .exists()
            .isFloat(),
        check('credit')
            .exists()
            .isFloat()
    ], [
        isAuth,
        isAdmin
    ],
    debtController.putEditDebt
);

router.delete('/delete-debt', [
        isAuth,
        isAdmin
    ],
    debtController.deleteDebt
);

module.exports = router;