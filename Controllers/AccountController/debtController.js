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

// number of debts which wiil be sent with a single request
const DEBTS_PER_REQUEST = 10;

exports.getAllDebts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Debt.findAll({ 
        offset: (page-1) * DEBTS_PER_REQUEST,
        limit: DEBTS_PER_REQUEST,
        include: [
            {
                model: Account,
                include: {
                    model: Company,
                    attributes: ['name', 'image_url'],
                    include: {
                        model: Type,
                        attributes: ['name']
                    }
                }
            }
        ]
    })
    .then(debts => {
        return res.status(200).json({
            operation: 'Succeed',
            debts: debts
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Accounts Not Found'
        })
    })
};

exports.getSpecificDebt = (req, res, next) => {
    // get the debt id from the request body
    const debtId = req.body.debtId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Debt.findOne({
        where: {id: debtId},
        include: [
            {
                model: Account,
                include: {
                    model: Company,
                    attributes: ['name', 'image_url'],
                    include: {
                        model: Type,
                        attributes: ['name']
                    }
                }
            },
            {
                model: BuyOrder
            }
        ]
    })
    .then(debt => {
        return res.status(200).json({
            operation: 'Succeed',
            debt: debt
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.getSpecificeAccountDebts = (req, res, next) => {
    // get the account id from the request body
    const accountId = req.body.accountId;
    const errors = validationResult(req);
    const page = req.query.page || 1;
    let accountTemp;

    if(!errors.isEmpty()){
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }
    
    Account.findOne({
        where: {id: accountId},
        include: {
            model: Company,
            attributes: ['name', 'image_url'],
            include: {
                model: Type,
                attributes: ['name']
            }
        }
    })
    .then(account => {
        accountTemp = account;

        return account.getDebts({
            offset: (page-1) * DEBTS_PER_REQUEST,
            limit: DEBTS_PER_REQUEST
        });
    })
    .then(debts => {
        return res.status(200).json({
            operation: 'Succeed',
            account: accountTemp,
            debts: debts
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.postAddDebt = (req, res, next) => {
    // get the debtId and the payed credit amount from the request body
    const debtId = req.body.debtId;
    const credit = req.body.credit;
    const errors = validationResult(req);
    let orderTemp, debtTemp, accountTemp;

    if(!errors.isEmpty()){
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }

    Debt.findOne({where: {id: debtId}})
        .then(debt =>{
            debtTemp = debt;
            // determine the credit amount is valid
            if(credit > debtTemp.debt)
                throw new Error('You Cann\'t Credit With Amount More Than The Debt Amount');
            
            // the debt amount will be decreased by the payment credit amount
            debtTemp.credit = credit;
            debtTemp.debt -= credit;
            
            // get the order which is associated with that debt
            return BuyOrder.findOne({where: {id: debt.buyOrderId}});
        })
        .then(orders => {
            orderTemp = orders;
            return debtTemp.getAccount();
        })
        .then(accounts => {
            accountTemp = accounts;
            // the new debt amount of the main-account will be decreased by the credit amount
            accountTemp.debt -= credit;
            
            if(debtTemp.debt == 0)
                // after the debt is fully payed decrese the account credit amount from this order price
                accountTemp.dataValues.credit = (accountTemp.credit + credit) - orderTemp.dataValues.total_price;
            else
                // if the debt is not fully payed then incrase the credit amount of the account with the credit payed amount
                accountTemp.credit += credit;

            // save the new account data
            return accountTemp.save();
        })
        .then(() => {
            // save the new debt data
            return debtTemp.save();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                account: accountTemp,
                debt: debtTemp
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.putEditDebt = (req, res, next) => {
    // get the debtId and the payed credit amount from the request body
    const debtId = req.body.debtId;
    const newCredit = req.body.credit;
    const errors = validationResult(req);
    let oldDebtTemp, debtTemp, accountTemp;

    if(!errors.isEmpty()){
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }

    Debt.findOne({where: {id: debtId}})
        .then(debt =>{
            debtTemp = debt;
            
            oldDebtTemp = debtTemp.debt;
            // 
            debtTemp.debt = debtTemp.debt + (debtTemp.credit - newCredit);
            debtTemp.credit = newCredit;
            
            // determine the new credit amount is valid
            if(debtTemp.debt < 0)
                throw new Error('You Cann\'t Credit With Amount More Than The Debt Amount');
            
            // get the order which is associated with that debt
            return BuyOrder.findOne({where: {id: debt.buyOrderId}});
        })
        .then(orders => {
            orderTemp = orders;
            return debtTemp.getAccount();
        })
        .then(account => {
            accountTemp = account;
        
            // get to the base account credit amount
            if(oldDebtTemp == 0)
                accountTemp.credit += debtTemp.debt + debtTemp.credit;
            else 
                accountTemp.credit += oldDebtTemp;
            
            // decrase the account credit amount from the debt amount
            accountTemp.credit -= debtTemp.debt;
            // when the debt is fully paued then the credit amount will of that debt wont matter anymore
            if(debtTemp.debt === 0)
                accountTemp.credit -= debtTemp.credit;
            
            
            // get the base account debt amount
            accountTemp.debt -= oldDebtTemp;
            // incrase the debt amount with the 
            accountTemp.debt += debtTemp.debt;
            // save the new account data
            return accountTemp.save();
        })
        .then(() => {
            // save the new debt data
            return debtTemp.save();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                account: accountTemp,
                debt: debtTemp
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
}