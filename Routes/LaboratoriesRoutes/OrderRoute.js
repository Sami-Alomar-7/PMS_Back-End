const express = require('express');
const router = express.Router();

// Models
const Order = require('../../Models/LaboratoriesModels/OrderMode');
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const orderController = require('../../Controllers/LaboratoriesController/OrderController');

router.get('/display-all', [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    orderController.getAllOrders
);

router.get('/get-specifice-order',[
        check('orderId')
            .custom(value => {
                return Order.findOne({where: {id: value}})
                    .then(order => {
                        if(!order)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            })
    ] , [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    orderController.getSpecificeOrder
);

router.get('/get-specifice-laboratory-orders',[
        check('laboratoryId')
            .custom(value => {
                return Laboratory.findOne({where: {id: value}})
                    .then(laboratory => {
                        if(!laboratory)
                            return Promise.reject('Couldn\'t find the specified laboratory');
                    })
            })
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    orderController.getSpecificeOrder
);

router.post('/add-order', [
        // checking the incoming data from the request
        check('laboratoryId')
            .custom(value => {
                return Laboratory.findOne({where: {id: value}})
                    .then(laboratory => {
                        if(!laboratory)
                            return Promise.reject('Couldn\'t find the specified laboratory');
                    })
            }),
        check('title')
            .isEmail()
            .trim(),
        check('description')
            .isString()
            .trim(),
        check('usage')
            .isString()
            .trim(),
        check('quantity')
            .isInt()
            .trim()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    orderController.postAddOrder
);

router.put('/update-order', [
        // checking the incoming data from the request
        check('orderId')
            .custom(value => {
                return Order.findOne({where: {id: value}})
                    .then(order => {
                        if(!order)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            }),
        check('title')
            .isEmail()
            .trim(),
        check('description')
            .isString()
            .trim(),
        check('usage')
            .isString()
            .trim(),
        check('quantity')
            .isString()
            .trim()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    orderController.putEditOrder
);

router.delete('/delete-order', [
        check('orderId')
            .custom(value => {
                return Order.findOne({where: {id: value}})
                    .then(order => {
                        if(!order)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            })
    ],[
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    orderController.deleteOrder
);

module.exports = router;