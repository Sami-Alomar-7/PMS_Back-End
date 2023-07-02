const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../../Middleware/isAuth');
const isAdmin = require('../../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const ProductOrderController = require('../../../Controllers/OrdersController/BuyOrdersController/ProductOrderController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    ProductOrderController.getAllOrders
);

router.get('/display-order', [
        isAuth,
        isAdmin
    ],
    ProductOrderController.getSpecificOrder
)

router.delete('/delete-order', [
        isAuth,
        isAdmin
    ],
    ProductOrderController.deleteOrder
);

module.exports = router;