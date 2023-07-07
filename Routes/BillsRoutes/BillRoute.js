const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const BillController = require('../../Controllers/BillsController/BillController');

// Route
    // The company productOrders routes
    const ProductBill = require('../BillsRoutes/ProductBillRoute');
    // The company rawOrders routes
    const RawBill = require('../BillsRoutes/RawBillRoute');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    BillController.getAllBills
);

router.use('/product-bill', ProductBill);

router.use('/raw-bill', RawBill);

module.exports = router;