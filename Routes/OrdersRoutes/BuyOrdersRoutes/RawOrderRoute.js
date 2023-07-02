const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../../Middleware/isAuth');
const isAdmin = require('../../../Middleware/isAdmin');

// the controllers which the requests forwarded to
const RawOrderController = require('../../../Controllers/OrdersController/BuyOrdersController/RawOrderController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],
    RawOrderController.getAllOrders
);

router.get('/display-order', [
        isAuth,
        isAdmin
    ],
    RawOrderController.getSpecificOrder
);

router.delete('/delete-order', [
        isAuth,
        isAdmin
    ],
    RawOrderController.deleteOrder
);

module.exports = router;