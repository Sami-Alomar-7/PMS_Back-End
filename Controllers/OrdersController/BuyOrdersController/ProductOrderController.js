// Models 
const BuyOrder = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const BuyOrderItem = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderItemsModel');
const Product = require('../../../Models/ProductsModels/ProductModel');
const Company = require('../../../Models/CompaniesModels/CompanyModel');
const CompanyProductItem = require('../../../Models/CompaniesModels/CompanyProductItemModel');

// using the .env file
require('dotenv').config();

// number of orders which wiil be sent with a single request
const ORDERS_PER_REQUEST = 6;
const ORDER_ITEMS_PER_REQUEST = 10;

exports.getAllOrders = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    BuyOrder.findAll({ 
        offset: (page-1) * ORDERS_PER_REQUEST,
        limit: ORDERS_PER_REQUEST,
        include: {
            model: Company,
            attributes: ['name', 'image_url', 'type'],
        },
        attributes: {
            exclude: ['id', 'updatedAt', 'companyId']
        }
    })
    .then(orders => {
        return res.status(200).json({
            operation: 'Succeed',
            orders: orders
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Buy_Orders Not Found'
        })
    })
};

exports.getSpecificOrder = (req, res, next) => {
    // get the order it from the request params
    const orderId = req.body.orderId;
    const page = req.query.page || 1;

    BuyOrder.findOne({
        where: {id: orderId},
        include: [
            {
                model: Company,
                attributes: ['name', 'image_url'],
            }
            ,{
                model: CompanyProductItem,
                attributes: ['price', 'expiration_date'],
                through: {
                    model: BuyOrderItem,
                    attributes: ['quantity'],
                    offset: (page-1) * ORDER_ITEMS_PER_REQUEST,
                    limit: ORDER_ITEMS_PER_REQUEST,
                },
                include: {
                    model: Product,
                    attributes: ['barcode', 'name', 'image_url']
                },
            }
        ]
    })
    .then(order => {
        return res.status(200).json({
            operation: 'Succeed',
            order: order
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Buy_Order Not Found'
        })
    })
};

exports.deleteOrder = (req, res, next) => {
    // get the order id from the request body
    const orderId = req.body.orderId;
    
    BuyOrder.findOne({where: {id: orderId}})
        .then(order => {
            // just delete the order
            return order.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Buy_Order Deleted Successfully'
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Buy_Order Not Found'
            })
        })
};