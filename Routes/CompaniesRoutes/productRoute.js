const express = require('express');
const router = express.Router();

// Models
    const Product = require('../../Models/ProductsModels/ProductModel');
    const Company = require('../../Models/CompaniesModels/CompanyModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const productController = require('../../Controllers/CompaniesController/productController');
const Category = require('../../Models/ProductsModels/CategoryModel');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],  
    productController.getAllProducts
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    productController.postAdvancedProductsSearch
);

router.get('/display-product', [
        check('productId')
            .exists()
            .withMessage('No productId had been provided')
            .custom(value => {
                return Product.findOne({where: {id: value}})
                    .then(product => {
                        if(!product)
                            return Promise.reject('No Such Product Exists');
                    })
            })
    ], [
        isAuth
    ],
    productController.getSpecificProduct
);

router.get('/display-company-products', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No Such Company Exists');
                    })
            })
    ], [
        isAuth
    ],
    productController.getSpecificCompanyProducts
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
    productController.getProductsByCategory
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
    productController.getProductsByType
);

router.post('/advanced-search-in-company', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No Such Company Exists');
                    })
            }),
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    productController.postAdvancedProductsSearchInCompany
);

module.exports = router;