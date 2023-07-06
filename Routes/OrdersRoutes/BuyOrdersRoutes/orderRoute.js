const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../../Middleware/isAuth');
const isAdmin = require('../../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const OrderController = require('../../../Controllers/OrdersController/BuyOrdersController/OrderController');

// Route
    // The company productOrders routes
    const ProductOrder = require('../../OrdersRoutes/BuyOrdersRoutes/ProductOrderRoute');
    // The company rawOrders routes
    const RawOrder = require('../../OrdersRoutes/BuyOrdersRoutes/RawOrderRoute');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    OrderController.getAllOrders
);

router.use('/product-order', ProductOrder);

router.use('/raw-order', RawOrder);

module.exports = router;