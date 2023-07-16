const express = require('express');
const router = express.Router();

// Models
const Order = require('../../Models/LaboratoriesModels/LaboratoryOrderMode');
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const productController = require('../../Controllers/LaboratoriesController/ProductController');
const LaboratoryProduct = require('../../Models/LaboratoriesModels/LaboratoryProductModel');

router.get('/display-all', [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    productController.getAllProducts
);

router.get('/display-product',[
        check('productId')
            .exists()
            .withMessage('No productId had been provided')
            .custom(value => {
                return LaboratoryProduct.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('Couldn\'t find the specified product');
                    })
            })
    ] , [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    productController.getSpecificeProduct
);

router.get('/display-order-product',[
        check('orderId')
            .exists()
            .withMessage('No orderId had been provided')
            .custom(value => {
                return Order.findOne({where: {id: value}})
                    .then(order => {
                        if(!order)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            })
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    productController.getSpecificeOrderProducts
);

router.post('/add-product', [
        // checking the incoming data from the request
        check('orderId')
            .exists()
            .withMessage('No orderId had been provided')
            .custom(value => {
                return Order.findOne({where: {id: value}})
                    .then(order => {
                        if(!order)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            }),
        check('barcode')
            .exists()
            .withMessage('Please provide a barcode for the new product')
            .trim(),
        check('name')
            .isString()
            .trim(),
        check('description')
            .isString()
            .trim(),
            check('usage')
            .isString()
            .trim(),
        check('expiration_date')
            .exists()
            .withMessage('Please provide an expiration date for the new product')
            .isString()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    productController.postAddOrderProduct
);

router.put('/update-product', [
        // checking the incoming data from the request
        check('productId')
            .exists()
            .withMessage('No productId had been provided')
            .custom(value => {
                return LaboratoryProduct.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('Couldn\'t find the specified product');
                    })
            }),
            check('barcode')
            .exists()
            .withMessage('Please provide a barcode for the new product')
            .trim(),
        check('name')
            .isString()
            .trim(),
        check('description')
            .isString()
            .trim(),
            check('usage')
            .isString()
            .trim(),
        check('expiration_date')
            .exists()
            .withMessage('Please provide an expiration date for the new product')
            .isString()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    productController.putEditProduct
);

router.delete('/delete-product', [
        check('productId')
            .exists()
            .withMessage('No productId had been provided')
            .custom(value => {
                return LaboratoryProduct.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('Couldn\'t find the specified product');
                    })
            })
    ],[
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    productController.deleteProduct
);

module.exports = router;