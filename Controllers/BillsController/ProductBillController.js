// Models 
const Bill = require('../../Models/BillsModels/BillModel');
const BuyOrder = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const Type = require('../../Models/CompaniesModels/CompanyType');
const BillProductItem = require('../../Models/BillsModels/BillProductItemModel');
const BuyOrderItem = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderItemsModel');
const CompanyProductItem = require('../../Models/CompaniesModels/CompanyProductItemModel');
const Product = require('../../Models/ProductsModels/ProductModel');

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
                model: BuyOrderItem,
                attributes: ['quantity'],
                through: {
                    model: BillProductItem,
                    attributes: ['id', 'price', 'quantity', 'expiration_date'],
                    offset: (page-1) * BILL_ITEMS_PER_REQUEST,
                    limit: BILL_ITEMS_PER_REQUEST,
                }, 
                include: {
                    model: CompanyProductItem,
                    attributes: {
                        exclude: ['id', 'companyId', 'productId']
                    },
                    include: {    
                        model: Product,
                        attributes: ['barcode', 'name', 'image_url'],
                    },
                }
            }
        ]
    })
    .then(bill => {
        // get the total price for each product in the bill
        bill.buy_order_items.forEach(buyOrderItem => {
            buyOrderItem.bill_products_items.dataValues.totalPrice = buyOrderItem.bill_products_items.price * buyOrderItem.bill_products_items.quantity;
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
    // get the buy_order id which the bill will be associated to and the list of the incoming products
    const buyOrderId = req.body.buyOrderId;
    const products = req.body.products;
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
            products.forEach(product => {
                totalPrice += product.price * product.quantity;
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
            // add and save each bill-product from the given list after adding the required data to it
            products.forEach(product => {
                BillProductItem.create({
                    billId: bill.id,
                    buyOrderItemId: product.id,
                    quantity: product.quantity,
                    price: product.price,
                    expiration_date: product.expiration_date
                })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Product_Bill Added Successfullt'
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
    // get the bill id and the list of the bill-products
    const billId = req.body.billId;
    const products = req.body.products;
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
            products.forEach(product => {
                totalPrice += product.price * product.quantity;
            })
            bill.total_price = totalPrice;
            return bill.save();
        })
        .then(() => {
            // travers on all the given products and update the quantity of them if it has been modified
            products.forEach(product => {
                return BillProductItem.findOne({where: {id: product.id}})
                    .then(billProductItem => {
                        billProductItem.quantity = product.quantity;
                        billProductItem.price = product.price;
                        return billProductItem.save();
                    })
                    .catch(err => {
                        throw new Error('Failed Editing the Bill_Product_Item quantities cause of:\n' + err.message);
                    })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                order: 'Bill_Peoduct Updated Successfully,You Can Check It Under The Number: ' + billTemp.order_number
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