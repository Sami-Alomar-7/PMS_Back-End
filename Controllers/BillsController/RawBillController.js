// Models 
const Bill = require('../../Models/BillsModels/BillModel');
const BuyOrder = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const Type = require('../../Models/CompaniesModels/CompanyType');
const BillRawItem = require('../../Models/BillsModels/BillRawItemModel');
const BuyRawOrderItem = require('../../Models/OrdersModels/BuyOrderModels/BuyRawOrderItemsMode');
const CompanyRawItem = require('../../Models/CompaniesModels/CompanyRawItemModel');
const Raw = require('../../Models/RawsModels/RawModel');
const LaboratoryRaw = require('../../Models/LaboratoriesModels/LaboratoryRawModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of orders which wiil be sent with a single request
const BILL_ITEMS_PER_REQUEST = 10;

exports.getSpecificBill = (req, res, next) => {
    // get the order it from the request params
    const billId = req.body.billId;
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Bill.findOne({
        where: {id: billId},
        include: [
            {
                model: BuyOrder,
                attributes: ['id', 'total_price'],
                include: {
                    model: Company,
                    attributes: ['name', 'image_url'],
                    include: {
                        model: Type,
                        attributes: ['name']
                    }
                }
            }, {
                model: BuyRawOrderItem,
                attributes: ['quantity'],
                through: {
                    model: BillRawItem,
                    attributes: ['id', 'price', 'quantity', 'expiration_date'],
                    offset: (page-1) * BILL_ITEMS_PER_REQUEST,
                    limit: BILL_ITEMS_PER_REQUEST,
                }, 
                include: {
                    model: CompanyRawItem,
                    attributes: {
                        exclude: ['id', 'companyId', 'rawId']
                    },
                    include: {    
                        model: Raw,
                        attributes: ['barcode', 'name', 'image_url'],
                    },
                }
            }
        ]
    })
    .then(bill => {
        // get the total price for each raw in the bill
        bill.buy_raw_order_items.forEach(buyRawOrderItem => {
            buyRawOrderItem.bill_raws_items.dataValues.totalPrice = buyRawOrderItem.bill_raws_items.price * buyRawOrderItem.bill_raws_items.quantity;
        });
        return res.status(200).json({
            operation: 'Succeed',
            bill: bill
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.postAddBill = (req, res, next) => {
    // get the buy_order id which the bill will be associated to and the list of the incoming raws
    const buyOrderId = req.body.buyOrderId;
    const raws = req.body.raws;
    let totalPrice = 0;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0]
        });
        
    BuyOrder.findOne({where: {id: buyOrderId}})
        .then(order => {
            // calculate the total price for the whole order
            raws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            })
            // add and save the new bill with its data
            return Bill.create({
                buyOrderId: order.id,
                total_price: totalPrice,
                type: order.type,
                order_number: order.order_number
            });
        })
        .then(bill => {
            // add and save each bill-raw from the given list after adding the required data to it
            raws.forEach(raw => {
                BillRawItem.create({
                    billId: bill.id,
                    buyRawOrderItemId: raw.id,
                    quantity: raw.quantity,
                    price: raw.price,
                    expiration_date: raw.expiration_date
                })
                .then(newRaw => {
                    // add and save each raw from the bill to the laboratory stock                
                    LaboratoryRaw.create({
                        billRawsItemId: newRaw.id,
                        quantity: newRaw.quantity
                    })
                })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Raw_Bill Added Successfullt'
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
    // get the bill id and the list of the bill-raws
    const billId = req.body.billId;
    const raws = req.body.raws;
    let totalPrice = 0, billTemp;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0]
        });
        
    Bill.findOne({where: {id: billId}})
        .then(bill => {
            billTemp = bill;
            // re-calculate the total price for the whole bill and save it
            raws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            })
            bill.total_price = totalPrice;
            return bill.save();
        })
        .then(() => {
            // travers on all the given raws and update the quantity of them if it has been modified
            raws.forEach(raw => {
                return BillRawItem.findOne({where: {id: raw.id}})
                    .then(billRawItem => {
                        billRawItem.quantity = raw.quantity;
                        billRawItem.price = raw.price;
                        return billRawItem.save();
                    })
                    .catch(err => {
                        throw new Error('Failed Editing the Bill_Raw_Item quantities cause of:\n' + err.message);
                    })
            })
        })
        .then(() => {
            // travers on all the given raws in the laboratory and update the quantity of them if it has been modified
            raws.forEach(raw => {
                return LaboratoryRaw.findOne({where: {billRawItemId: raw.id}})
                    .then(laboratoryRaw => {
                        laboratoryRaw.quantity = raw.quantity;
                        return laboratoryRaw.save();
                    })
                    .catch(err => {
                        throw new Error('Failed Editing the Laboratory_Raws quantities cause of:\n' + err.message);
                    })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                order: 'Bill_Raw Updated Successfully,You Can Check It Under The Number: ' + billTemp.order_number
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.deleteBill = (req, res, next) => {
    // get the bill id from the request body
    const billId = req.body.billId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Bill.findOne({where: {id: billId}})
        .then(bill => {
            // just delete the bill
            return bill.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'bill Deleted Successfully'
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err
            })
        })
};