// Models 
const BuyOrder = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const Company = require('../../../Models/CompaniesModels/CompanyModel');
const Type = require('../../../Models/CompaniesModels/CompanyType');

// using the .env file
require('dotenv').config();

// number of orders which wiil be sent with a single request
const ORDERS_PER_REQUEST = 6;

exports.getAllOrders = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    BuyOrder.findAll({ 
        offset: (page-1) * ORDERS_PER_REQUEST,
        limit: ORDERS_PER_REQUEST,
        include: {
            model: Company,
            attributes: ['name', 'image_url'],
            include: {
                model: Type,
                attributes: ['name']
            }
        },
        attributes: {
            exclude: ['updatedAt', 'companyId']
        }
    })
    .then(orders => {
        return res.status(200).json({
            operation: 'Succeed',
            orders: orders
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};