// Models 
const Order = require('../../Models/LaboratoriesModels/LaboratoryOrderMode');
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of orders which wiil be sent with a single request
const ORDERS_PER_REQUEST = 6;

exports.getAllOrders = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Order.findAll({ 
        offset: (page-1) * ORDERS_PER_REQUEST,
        limit: ORDERS_PER_REQUEST,
        include: {
            model: Laboratory,
            attributes: ['name', 'image_url']
        },
        attributes: ['createdAt', 'statu', 'quantity']
    })
    .then(orders => {
        return res.status(200).json({
            operation: 'Succeed',
            orders: orders
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.getSpecificeOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    Order.findOne({
        where: {id: orderId},
        include: {
            model: Laboratory,
            attributes: ['name', 'image_url']
        }
    })
    .then(order => {
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

exports.getSpecificeLaboratoryOrders = (req, res, next) => {
    const laboratoryId = req.body.laboratoryId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    Order.findOne({
        where: {laboratoryId: laboratoryId},
        include: {
            model: Laboratory,
            attributes: ['name', 'image_url']
        }
    })
    .then(order => {
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
}

exports.postAcceptOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Order.findOne({where: {id: orderId}})
        .then(order => {
            if(order.statu !== 'Waiting')
                throw new Error('The Order is Not on state which allowes you to Accept it');
            
            order.statu = 'Accepted'
            return order.save();
        })
        .then(order => {
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
}

exports.postRejectOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Order.findOne({where: {id: orderId}})
        .then(order => {
            if(order.statu !== 'Waiting')
                throw new Error('The Order is Not on state which allowes you to Reject it');
            
            order.statu = 'Rejected'
            return order.save();
        })
        .then(order => {
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
}

exports.postReadyOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Order.findOne({where: {id: orderId}})
        .then(order => {
            if(order.statu !== 'Accepted')
                throw new Error('The Order is Not on a state which allowes you to put it Ready');
            
            order.statu = 'Ready'
            return order.save();
        })
        .then(order => {
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
}

exports.postAddOrder = (req, res, next) => {
    const laboratoryId = req.body.laboratoryId;
    const title = req.body.title;
    const description = req.body.description;
    const usage = req.body.usage;
    const quantity = req.body.quantity;
    const statu = 'Waiting';
    const errors = validationResult(req);
    let lastOrderNumber;

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0]
        });
    
    Order.findOne({order: [['updatedAt', 'DESC']]})
        .then(order => {
            // get a new order number for the new order
            lastOrderNumber = (order)? order.order_number : 0;
            // create a new object to insert a new record with the incming data
            const newOrder = new Order({
                laboratoryId: laboratoryId,
                title: title,
                description: description,
                usage: usage,
                quantity: quantity,
                statu: statu,
                order_number: ++lastOrderNumber
            });
        
            return newOrder.save();    
        })
        .then(order => {
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

exports.putEditOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const updateTitle = req.body.title;
    const updateDescription = req.body.description;
    const updateUsage = req.body.usage;
    const updateQyantity = req.body.quantity;
    const updateStatu = req.body.statu;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    Order.findOne({where: {id: orderId}})
        .then(order => {

            // update the order with the new incoming data
            order.title = updateTitle;
            order.description = updateDescription;
            order.usage = updateUsage;
            order.quantity = updateQyantity;
            order.statu = updateStatu;

            // save the new object with its updated data
            return order.save()
        })
        .then(order => {
            return res.status(200).json({
                operation: 'Succeed',
                order: order
            })
        })
        .catch(err => {
            return res.statu(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.deleteOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    Order.findOne({where: {id: orderId}})
        .then(order => {
            // just delete the order
            return order.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Order Deleted Successfully'
            })
        })
        .catch(err => {
            return res.statu(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};