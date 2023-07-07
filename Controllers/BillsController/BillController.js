// Models 
const Bill = require('../../Models/BillsModels/BillModel');
const BuyOrder = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const Type = require('../../Models/CompaniesModels/CompanyType');

// using the .env file
require('dotenv').config();

// number of bills which wiil be sent with a single request
const BILLS_PER_REQUEST = 6;

exports.getAllBills = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Bill.findAll({ 
        offset: (page-1) * BILLS_PER_REQUEST,
        limit: BILLS_PER_REQUEST,
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'BuyOrderId']
        },
        include: {
            model: BuyOrder,
            attributes: ['total_price'],
            include: {
                model: Company,
                attributes: ['name', 'image_url'],
                include: {
                    model: Type,
                    attributes: ['name']
                }
            }
        }
    })
    .then(bills => {
        return res.status(200).json({
            operation: 'Succeed',
            bills: (bills.length)? bills : 'There Is No Bills Yet...!'
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Buy_Orders Not Found'
        })
    })
};