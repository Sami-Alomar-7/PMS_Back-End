const express = require('express');
const router = express.Router();

// Models
const Order = require('../../Models/LaboratoriesModels/LaboratoryOrderMode');
const LaboratoryProduct = require('../../Models/LaboratoriesModels/LaboratoryProductModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const laboratoryProductController = require('../../Controllers/LaboratoriesController/ProductController');

router.get('/display-all', [
        isAuth
    ],
    laboratoryProductController.getAllProducts
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
        isAuth
    ], 
    laboratoryProductController.getSpecificeProduct
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
        isAuth
    ], 
    laboratoryProductController.getSpecificeOrderProducts
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
            .isString(),
        check('raws')
            .custom(value => {
                if(!Array.isArray(value) || value.length === 0)
                    return Promise.reject('Invalid raws array')
                else
                    return true
            })
    ], [
        isAuth
    ],
    laboratoryProductController.postAddOrderProduct
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
            .isString(),
        check('raws')
            .custom(value => {
                if(!Array.isArray(value) || value.length === 0)
                    return Promise.reject('Invalid raws array')
                else
                    return true
            })
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryProductController.putEditProduct
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    laboratoryProductController.postAdvancedLaboratoryProductsSearch
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
        isAdmin
    ],
    laboratoryProductController.deleteProduct
);

module.exports = router;