// Models 
const BuyOrder = require('../../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const BuyRawOrderItem = require('../../../Models/OrdersModels/BuyOrderModels/BuyRawOrderItemsMode');
const Raw = require('../../../Models/RawsModels/RawModel');
const Company = require('../../../Models/CompaniesModels/CompanyModel');
const CompanyRawItem = require('../../../Models/CompaniesModels/CompanyRawItemModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Util
    // for sending notifications
    const socket = require('../../../Util/socket');

// number of orders which wiil be sent with a single request
const ORDER_ITEMS_PER_REQUEST = 10;

exports.getSpecificOrder = (req, res, next) => {
    // get the order it from the request params
    const orderId = req.body.orderId;
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
    BuyOrder.findOne({
        where: {id: orderId},
        include: [
            {
                model: Company,
                attributes: ['name', 'image_url'],
            }
            ,{
                model: CompanyRawItem,
                attributes: ['price', 'expiration_date'],
                through: {
                    model: BuyRawOrderItem,
                    attributes: ['quantity'],
                    offset: (page-1) * ORDER_ITEMS_PER_REQUEST,
                    limit: ORDER_ITEMS_PER_REQUEST,
                },
                include: {
                    model: Raw,
                    attributes: ['barcode', 'name', 'image_url']
                }
            }
        ]
    })
    .then(order => {
        // get the total price for each raw
        order.company_raw_items.forEach(companyRawItem => {
            companyRawItem.buy_raw_order_items.dataValues.totalPrice = companyRawItem.price * companyRawItem.buy_raw_order_items.quantity;
        });
        return res.status(200).json({
            operation: 'Succeed',
            order: order
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAddOrder = (req, res, next) => {
    // get the company id which the order will be associated to and the list of the chosed raws
    const companyId = req.body.companyId;
    const raws = req.body.raws;
    let totalPrice = 0, lastOrderNumber, buyOrderTemp;
    const errors = validationResult(req);
    const io = socket.getIo();
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
        
    BuyOrder.findOne({order: [['updatedAt', 'DESC']]})
        .then(order => {
            // get a new order number for the new order
            lastOrderNumber = (order)? order.order_number : 0;
            // calculate the total price for the whole order
            raws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            })
            // add and save the new order with its data
            return BuyOrder.create({
                companyId: companyId,
                total_price: totalPrice,
                type: false,
                order_number: ++lastOrderNumber
            });
        })
        .then(buyOrder => {
            buyOrderTemp = buyOrder;
            // add and save each chosed raw from the given list after adding the required data to it
            const RawPromisesArray = raws.map(async raw => {
                try {
                    await BuyRawOrderItem.create({
                        companyRawItemId: raw.id,
                        buyOrderId: buyOrder.id,
                        quantity: raw.quantity
                    })
                } catch(err) {
                    throw new Error('Failed adding raw materials to buyOrder')
                }
            })
            return Promise.all(RawPromisesArray);
        })
        .then(() => {
            // for sending notification to all connected
            io.emit('BuyOrder', {action: 'create', order: buyOrderTemp});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Buy_Raw_Order Added Successfullt, You Can Check it Under The Number: ' + lastOrderNumber
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.putEditOrder = (req, res, next) => {
    // get the order id and the list of the chosed raws
    const orderId = req.body.orderId;
    const raws = req.body.raws;
    let totalPrice = 0, buyOrderTemp;
    const errors = validationResult(req);
    const io = socket.getIo();
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
        
    BuyOrder.findOne({where: {id: orderId}})
        .then(order => {
            // re-calculate the total price for the whole order and save it
            raws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            })
            order.total_price = totalPrice;
            return order.save();
        })
        .then(buyOrder => {
            buyOrderTemp = buyOrder;
            // travers on all the given raws and update the quantity of them if it has been modified
            const RawPromisesArray = raws.map(raw => {
                return BuyRawOrderItem.findOne({where: {companyRawItemId: raw.id}})
                    .then(buyOrderItem => {
                        buyOrderItem.quantity = raw.quantity;
                        return buyOrderItem.save();
                    })
                    .catch(err => {
                        throw new Error('Failed Editing the Buy_Order_Item quantities cause of:\n' + err.message);
                    })
            })
            return Promise.all(RawPromisesArray);
        })
        .then(() => {
            // for sending notification to all connected
            io.emit('BuyOrder', {action: 'update', order: buyOrderTemp});
            return res.status(200).json({
                operation: 'Succeed',
                order: 'Buy_Raw_Order Updated Successfully,You Can Check It Under The Number: ' + buyOrderTemp.order_number
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.deleteOrder = (req, res, next) => {
    // get the order id from the request body
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    let buyOrderTemp;
    const io = socket.getIo();
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    BuyOrder.findOne({where: {id: orderId}})
        .then(order => {
            buyOrderTemp = order;
            // just delete the order
            return order.destroy();
        })
        .then(() => {
            // for sending notification to all connected
            io.emit('BuyOrder', {action: 'delete', order: buyOrderTemp});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Buy_Order Deleted Successfully'
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};