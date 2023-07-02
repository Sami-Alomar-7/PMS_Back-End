// Models 
const Account = require('../../Models/AccountModels/AccountModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// using the .env file
require('dotenv').config();

// number of accounts which wiil be sent with a single request
const ACCOUNTS_PER_REQUEST = 10;

exports.getAllAccounts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Account.findAll({ 
        offset: (page-1) * ACCOUNTS_PER_REQUEST,
        limit: ACCOUNTS_PER_REQUEST,
        include: {
            model: Company,
            attributes: ['name', 'image_url', 'type']
        }
    })
        .then(accounts => {
            return res.status(200).json({
                operation: 'Succeed',
                accounts: accounts
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Accounts Not Found'
            })
        })
};

exports.getSpecificAccount = (req, res, next) => {
    // get the account it from the request params
    const accountId = req.body.accountId;

    Account.findOne({
        where: {id: accountId},
        include: [
            {
            model: Company,
        }
        // buy_order will be called later here for featching the accounts debts and creadits
    ]
    })
    .then(account => {
        return res.status(200).json({
            operation: 'Succeed',
            account: account
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Account Not Found'
        })
    })
};

exports.deleteAccount = (req, res, next) => {
    // get the account id from the request body
    const accountId = req.body.accountId;
    
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
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Account Not Found'
            })
        })
};