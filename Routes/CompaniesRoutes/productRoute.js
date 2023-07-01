const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const productController = require('../../Controllers/CompaniesController/productController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],  
    productController.getAllProducts
);

router.get('/display-product', [
        isAuth,
        isAdmin
    ],
    productController.getSpecificProduct
);

router.get('/display-company-products', [
        isAuth,
        isAdmin
    ],
    productController.getSpecificCompanyProducts
);

module.exports = router;