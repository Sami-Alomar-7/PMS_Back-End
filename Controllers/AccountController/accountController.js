// Models 
const Account = require('../../Models/AccountModels/AccountModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const Type = require('../../Models/CompaniesModels/CompanyType');
const BuyOrder = require('../../Models/OrdersModels/BuyOrderModels/BuyOrderModel');
const Debt = require('../../Models/AccountModels/DebtModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of accounts which wiil be sent with a single request
const ACCOUNTS_PER_REQUEST = 10;
// number of debts which wiil be sent with a single request
const DEBTS_PER_REQUEST = 10;

exports.getAllAccounts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Account.findAll({ 
        offset: (page-1) * ACCOUNTS_PER_REQUEST,
        limit: ACCOUNTS_PER_REQUEST,
        include: {
            model: Company,
            attributes: ['name', 'image_url'],
            include: {
                model: Type,
                attributes: ['name']
            }
        }
    })
        .then(accounts => {
            return res.status(200).json({
                operation: 'Succeed',
                accounts: accounts
            })
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.getSpecificAccount = (req, res, next) => {
    // get the account it from the request params
    const accountId = req.body.accountId;
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })

    Account.findOne({
        where: {id: accountId},
        include: [
            {
                model: Company,
                attributes: ['name', 'image_url'],
                include: {
                    model: Type,
                    attributes: ['name']
                }
            },
            {
                model: BuyOrder,
                offset: (page-1) * DEBTS_PER_REQUEST,
                limit: DEBTS_PER_REQUEST,
                attributes: ['order_number'],
                throgh: {
                    model: Debt,
                    attributes: ['debt', 'credit', 'updatedAt']
                }
            }
        ]
    })
    .then(account => {
        return res.status(200).json({
            operation: 'Succeed',
            account: account
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getSpecificeCompanyAccount = (req, res, next) => {
    const companyId = req.body.companyId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })

    Account.findOne({
        where: {companyId: companyId},
        include: [
            {
                model: Company,
                attributes: ['name', 'image_url'],
                include: {
                    model: Type,
                    attributes: ['name']
                }
            },
            {
                model: BuyOrder,
                attributes: ['order_number'],
                throgh: {
                    model: Type,
                    attributes: ['debt', 'credit', 'updatedAt']
                }
            }
        ]
    })
    .then(account => {
        return res.status(200).json({
            operation: 'Succeed',
            account: account
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.deleteAccount = (req, res, next) => {
    // get the account id from the request body
    const accountId = req.body.accountId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
    Account.findOne({where: {id: accountId}})
        .then(account => {
            // just delete the account
            return account.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Account Deleted Successfully'
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};