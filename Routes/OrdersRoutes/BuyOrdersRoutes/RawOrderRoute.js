const express = require('express');
const router = express.Router();

// Models
    const BuyOrder = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
    const Company = require('../../../Models/CompaniesModels/CompanyModel');

// Required Middleware
const isAuth = require('../../../Middleware/isAuth');
const isAdmin = require('../../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const RawOrderController = require('../../../Controllers/OrdersController/BuyOrdersController/RawOrderController');

router.get('/display-order', [
        check('orderId')
            .exists()
            .withMessage('No orderId had been provided')
            .custom(value => {
                return BuyOrder.findOne({where: {id: value}})
                    .then(buyOrder => {
                        if(!buyOrder)
                            return Promise.reject('No Such Buy_Order Exists');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    RawOrderController.getSpecificOrder
);

router.post('/add-order', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No Such Company Exists')
                    })
            }),
        check('raws')
            .exists()
            .custom(value => {
                if(!Array.isArray(value) || value.length === 0)
                    return Promise.reject('Invalid raws array')
                else
                    return true
            })
    ], [
        isAuth,
        isAdmin
    ],
    RawOrderController.postAddOrder
);

router.put('/edit-order', [
        check('orderId')
            .exists()
            .withMessage('No orderId had been provided')
            .custom(value => {
                return BuyOrder.findOne({where: {id: value}})
                    .then(buyOrder => {
                        if(!buyOrder)
                            return Promise.reject('No Such Buy_Order Exists')
                    })
            }),
            check('raws')
                .exists()
                .custom(value => {
                    if(!Array.isArray(value) || value.length === 0)
                        return Promise.reject('Invalid raws array')
                    else
                        return true
                })
    ], [
        isAuth,
        isAdmin
    ],
    RawOrderController.putEditOrder
);

router.delete('/delete-order', [
        check('orderId')
            .exists()
            .withMessage('No orderId had been provided')
            .custom(value => {
                return BuyOrder.findOne({where: {id: value}})
                    .then(buyOrder => {
                        if(!buyOrder)
                            return Promise.reject('No Such Buy_Order Exists');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    RawOrderController.deleteOrder
);

module.exports = router;