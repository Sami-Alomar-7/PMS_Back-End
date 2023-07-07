// Models 
const BuyOrder = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const BuyOrderItem = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderItemsModel');
const Product = require('../../../Models/ProductsModels/ProductModel');
const Company = require('../../../Models/CompaniesModels/CompanyModel');
const CompanyProductItem = require('../../../Models/CompaniesModels/CompanyProductItemModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of orders which wiil be sent with a single request
const ORDER_ITEMS_PER_REQUEST = 10;

exports.getSpecificOrder = (req, res, next) => {
    // get the order it from the request params
    const orderId = req.body.orderId;
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
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
                    attributes: ['id', 'quantity'],
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
        // get the total price for each product
        order.company_product_items.forEach(companyProductItem => {
            companyProductItem.buy_order_items.dataValues.totalPrice = companyProductItem.price * companyProductItem.buy_order_items.quantity;
        });
        return res.status(200).json({
            operation: 'Succeed',
            order: order
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.postAddOrder = (req, res, next) => {
    // get the company id which the order will be associated to and the list of the chosed products
    const companyId = req.body.companyId;
    const products = req.body.products;
    let totalPrice = 0, lastOrderNumber;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0]
        });
        
    BuyOrder.findOne({order: [['updatedAt', 'DESC']]})
        .then(order => {
            // get a new order number for the new order
            lastOrderNumber = (order)? order.order_number : 0;
            // calculate the total price for the whole order
            products.forEach(product => {
                totalPrice += product.price * product.quantity;
            })
            // add and save the new order with its data
            return BuyOrder.create({
                companyId: companyId,
                total_price: totalPrice,
                type: true,
                order_number: ++lastOrderNumber
            });
        })
        .then(buyOrder => {
            // add and save each chosed product from the given list after adding the required data to it
            products.forEach(product => {
                BuyOrderItem.create({
                    companyProductItemId: product.id,
                    buyOrderId: buyOrder.id,
                    quantity: product.quantity
                })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Buy_Product_Order Added Successfullt, You Can Check it Under The Number: ' + lastOrderNumber
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.putEditOrder = (req, res, next) => {
    // get the order id and the list of the chosed products
    const orderId = req.body.orderId;
    const products = req.body.products;
    let totalPrice = 0, orderTemp;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0]
        });
        
    BuyOrder.findOne({where: {id: orderId}})
        .then(order => {
            orderTemp = order;
            // re-calculate the total price for the whole order and save it
            products.forEach(product => {
                totalPrice += product.price * product.quantity;
            })
            order.total_price = totalPrice;
            return order.save();
        })
        .then(() => {
            // travers on all the given products and update the quantity of them if it has been modified
            products.forEach(product => {
                return BuyOrderItem.findOne({where: {companyProductItemId: product.id}})
                    .then(buyOrderItem => {
                        buyOrderItem.quantity = product.quantity;
                        return buyOrderItem.save();
                    })
                    .catch(err => {
                        throw new Error('Failed Editing the Buy_Order_Item quantities cause of:\n' + err.message);
                    })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                order: 'Buy_Product_Order Updated Successfully,You Can Check It Under The Number: ' + orderTemp.order_number
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.deleteOrder = (req, res, next) => {
    // get the order id from the request body
    const orderId = req.body.orderId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
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
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err
            })
        })
};