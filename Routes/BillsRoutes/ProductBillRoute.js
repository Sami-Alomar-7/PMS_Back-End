const express = require('express');
const router = express.Router();

// Models
    const Bill = require('../../Models/BillsModels/BillModel');
    const BuyOrder = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const ProductBillController = require('../../Controllers/BillsController/ProductBillController');

router.get('/display-bill', [
        check('billId')
            .exists()
            .custom(value => {
                return Bill.findOne({where: {id: value}})
                    .then(bill => {
                        if(!bill)
                            return Promise.reject('No Such Bill Exists');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    ProductBillController.getSpecificBill
);

router.post('/add-bill', [
        check('buyOrderId')
            .exists()
            .custom(value => {
                return BuyOrder.findOne({where: {id: value}})
                    .then(buyOrder => {
                        if(!buyOrder)
                            return Promise.reject('No Such Buy_Order Exists')
                    })
            }),
        check('products')
            .exists()
            .custom(value => {
                if(!Array.isArray(value) || value.length === 0)
                    return Promise.reject('Invalid products array')
                else
                    return true
            })
    ], [
        isAuth,
        isAdmin
    ],
    ProductBillController.postAddBill
);

router.put('/edit-bill', [
        check('billId')
            .exists()
            .custom(value => {
                return Bill.findOne({where: {id: value}})
                    .then(Bill => {
                        if(!Bill)
                            return Promise.reject('No Such Bill Exists')
                    })
            }),
            check('products')
                .exists()
                .custom(value => {
                    if(!Array.isArray(value) || value.length === 0)
                        return Promise.reject('Invalid products array')
                    else
                        return true
                })
    ], [
        isAuth,
        isAdmin
    ],

);

router.put('/edit-bill', [
        check('billId')
            .exists()
            .custom(value => {
                return Bill.findOne({where: {id: value}})
                    .then(bill => {
                        if(!bill)
                            return Promise.reject('No Such Bill Exists')
                    })
            }),
            check('products')
                .exists()
                .custom(value => {
                    if(!Array.isArray(value) || value.length === 0)
                        return Promise.reject('Invalid products array')
                    else
                        return true
                })
    ], [
        isAuth,
        isAdmin
    ],
    ProductBillController.putEditOrder
);

router.delete('/delete-bill', [
        check('billId')
            .exists()
            .custom(value => {
                return Bill.findOne({where: {id: value}})
                    .then(bill => {
                        if(!bill)
                            return Promise.reject('No Such Bill Exists');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    ProductBillController.deleteBill
);

module.exports = router;