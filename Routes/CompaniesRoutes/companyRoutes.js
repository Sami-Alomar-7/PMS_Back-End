const express = require('express');
const router = express.Router();

// Models
const Company = require('../../Models/CompaniesModels/CompanyModel');

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
        isAuth
    ],
    companyController.getAllCompanies
);

router.get('/display-specifice-company', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No such comapny registered');
                    })
            })
    ],[
        isAuth
    ],
    companyController.getSpecificeCompany
);

router.put('/update-company', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No such comapny registered');
                    })
            })
    ], [
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

router.get('/display-type', [
        check('typeId')
            .exists()
            .withMessage('No typeId had been provided')
            .custom(value => {
                if(value <= 0)
                    return Promise.reject('Wrong typeId, Cann\'t be less than 0')
                if(value > 7)
                    return Promise.reject('No such typeId had been registered');
            })
    ], [
        isAuth
    ],
    companyController.getCompnayByType
)

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    companyController.postAdvancedCompaniesSearch
);

router.delete('/delete-company', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No such comapny registered');
                    })
            })
    ], [
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