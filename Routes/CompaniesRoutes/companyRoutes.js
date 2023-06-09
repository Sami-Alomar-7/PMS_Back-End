const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const companyController = require('../../Controllers/CompaniesController/companyController');

// Route
    // The company products routes
    const productRoute = require('./productRoute');
    // The company raws routes
    const rawRoute = require('./rawRoute');
    // The company debts routes
    const accountRoute = require('../AccountsRoutes/AccountRoute');
    // The company Orders routes
    const orderRoute = require('../OrdersRoutes/BuyOrdersRoutes/orderRoute');
    // The company Bills routes
    const billRoutes = require('../BillsRoutes/BillRoute');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    companyController.getAllCompanies
);

router.get('/display-specifice-company', [
        isAuth,
        isAdmin
    ],
    companyController.getSpecificeCompany
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

router.use('/products', productRoute);

router.use('/raw', rawRoute);

router.use('/account', accountRoute);

router.use('/order', orderRoute);

router.use('/bill', billRoutes);

module.exports = router;