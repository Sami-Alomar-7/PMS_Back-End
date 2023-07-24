const express = require('express');
const router = express.Router();

// Models
    const ExternalProduct = require('../../Models/ProductsModels/ExternalProductModel');
    const Category = require('../../Models/ProductsModels/CategoryModel');
    const Type = require('../../Models/ProductsModels/TypeModel');
    const Scince = require('../../Models/ProductsModels/ScinceModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const externalProduct = require('../../Controllers/ExternalProdutsController/ExternalProductController');

router.get('/display-all', [
        isAuth
    ],  
    externalProduct.getAllExternalProducts
);

router.get('/display-specifice-product', [
        check('productId')
            .exists()
            .withMessage('No productId had been provided')
            .custom(value => {
                return ExternalProduct.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('No Such External Product Exists');
                    })
            })
    ], [
        isAuth
    ],
    externalProduct.getSpecificExternalProduct
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    externalProduct.postAdvancedExternalProductsSearch
);

router.get('/display-category', [
        check('categoryId')
            .exists()
            .withMessage('No categoryId had been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No such category registered');
                    })
            })
    ], [
        isAuth
    ],
    externalProduct.getExternalProductsByCategory
);

router.get('/display-type', [
        check('typeId')
            .exists()
            .withMessage('No typeId had been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No such type registered');
                    })
            })
    ], [
        isAuth
    ],
    externalProduct.getExternalProductsByType
);

router.post('/add-external-product', [
        check('barcode')
            .exists()
            .withMessage('barcode has not been provided'),
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
        check('dosage')
            .exists()
            .isString()
            .withMessage('dosage has not been provided'),
        check('manufactorerName')
            .exists()
            .isString()
            .withMessage('manufactorer Name has not been provided'),
        check('description')
            .exists()
            .isString()
            .withMessage('Description has not been provided'),
        check('quantity')
            .exists()
            .withMessage('Quantity has not been provided'),
        check('price')
            .exists()
            .isFloat()
            .withMessage('Price has not been provided'),
        check('expirationDate')
            .exists()
            .isDate()
            .withMessage('Expiration Date has not been provided'),
        check('categoryId')
            .exists()
            .withMessage('categoryId has not been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No such category registered')
                    })
            }),
        check('typeId')
            .exists()
            .withMessage('typeId has not been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No Such type registered')
                    })
            }),
        check('scinceId')
            .exists()
            .withMessage('scinceId has not been provided')
            .custom(value => {
                return Scince.findOne({where: {id: value}})
                    .then(scince => {
                        if(!scince)
                            return Promise.reject('No Such Scince registered')
                    })
            })
    ], [
        isAuth,
    ],
    externalProduct.postAddExternalProduct
);

router.put('/update-external-product', [
        check('productId')
            .exists()
            .withMessage('productId has not been provided')
            .custom(value => {
                return ExternalProduct.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('No Such external product registered');
                    })
            }),
        check('barcode')
            .exists()
            .withMessage('barcode has not been provided'),
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
        check('dosage')
            .exists()
            .isString()
            .withMessage('dosage has not been provided'),
        check('manufactorerName')
            .exists()
            .isString()
            .withMessage('manufactorer Name has not been provided'),
        check('description')
            .exists()
            .isString()
            .withMessage('Description has not been provided'),
        check('quantity')
            .exists()
            .withMessage('Quantity has not been provided'),
        check('price')
            .exists()
            .isFloat()
            .withMessage('Price has not been provided'),
        check('expirationDate')
            .exists()
            .isDate()
            .withMessage('Expiration Date has not been provided'),
        check('categoryId')
            .exists()
            .withMessage('categoryId has not been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No such category registered')
                    })
            }),
        check('typeId')
            .exists()
            .withMessage('typeId has not been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No Such type registered')
                    })
            }),
        check('scinceId')
            .exists()
            .withMessage('scinceId has not been provided')
            .custom(value => {
                return Scince.findOne({where: {id: value}})
                    .then(scince => {
                        if(!scince)
                            return Promise.reject('No Such Scince registered')
                    })
            })
    ], [
        isAuth,
    ],
        externalProduct.postAddExternalProduct
);

router.delete('/delete-external-product', [
        check('productId')
        .exists()
        .withMessage('productId has not been provided')
        .custom(value => {
            return ExternalProduct.findOne({where: {id: value}})
                .then(product => {
                    if(!product)
                        return Promise.reject('No Such external product registered');
                })
        })
    ],[
        isAuth,
        isAdmin
    ],
    externalProduct.deleteExternalProduct
);

module.exports = router;