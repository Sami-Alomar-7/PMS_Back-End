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

router.get('/display-all', [
        isAuth,
        isAdmin
    ],  
    productController.getAllProducts
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
        isAuth,
        isAdmin
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
        isAuth,
        isAdmin
    ],
    productController.getSpecificCompanyProducts
);

module.exports = router;