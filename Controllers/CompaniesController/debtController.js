// Models 
const Debt = require('../../Models/CompaniesModels/DebtModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of debts which wiil be sent with a single request
const DEBTS_PER_REQUEST = 10;

exports.getAllDebts = (req, res, next) => {
    // for keep tracking with debts
    let tempDebts;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Debt.findAll({ 
        offset: (page-1) * DEBTS_PER_REQUEST,
        limit: DEBTS_PER_REQUEST
    })
        .then(debts => {
            tempDebts = debts;
            // get each debt's company
            const companyPromises = debts.map(debt => {
                return debt.getCompany()
                    .then(company => {
                        // adding the company name to the retrieved data
                        debt.dataValues.companyName = company.name;
                    });
            });
            // wait for all the promises to be resolved from the previous array of promises before proceeding
            return Promise.all(companyPromises);
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                debts: tempDebts
            });
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Debts Not Found'
            })
        })
};

exports.getSpecificDebt = (req, res, next) => {
    // get the debt it from the request params
    const debtId = req.body.debtId;
    // for keep tracking with debt
    let tempDebt;

    Debt.findOne({where: {id: debtId }})
    .then(debt => {
        tempDebt = debt;
        // get the company which is associated with this debt
        return debt.getCompany();
    })
    .then(company => {
        return res.status(200).json({
            operation: 'Succeed',
            company: company,
            debt: tempDebt
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Debt Not Found'
        })
    })
};

exports.getSpecificCompanyDebts = (req, res, next) =>{
    // get the company id from the request body
    const companyId = req.body.companyId;
    // for keep tracking with comoany
    let tempCompany;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Company.findOne({
        offset: (page-1) * DEBTS_PER_REQUEST,
        limit: DEBTS_PER_REQUEST,
        where: {id: companyId}
    })
        .then(company => {
            tempCompany = company;
            
            // get the debts which are associated with this company
            return company.getDebts();
        })
        .then(debts => {
            return res.status(200).json({
                operation: 'Succeed',
                company: tempCompany,
                debts: debts
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Companies Debts Not Found'
            })
        })
};

exports.postAddDebt = (req, res, next) => {
    const companyId = req.body.companyId;
    const credit = req.body.credit;
    const errors = validationResult(req);
    let debtAmount, newDebtAmount;

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        })

    Company.findOne({
        where: {id: companyId},
        include: [{
            model: Debt,
            order: [['createdAt', 'DESC']],
            limit: 1
        }]
    })
        .then(company => {
            // get the current debt amount
            debtAmount = company.debts[0].dataValues.debt;
            
            // check wether the payed credit amount is greater than the current debt amount
            if(credit > debtAmount)
                throw new Error('You Cann\'t deposit a credit greater than the debt');
            
            // calculate the new debt amount passed on the payed credit amount
            newDebtAmount = debtAmount - credit;

            // create a new debt with this company with the new debt amount
            const newDebtRecord = new Debt({
                debt: newDebtAmount,
                credit: credit,
                companyId: companyId
            });

            return newDebtRecord.save();
        })
        .then(debt => {
            return res.status(200).json({
                operation: 'Succeed',
                debt: debt
            })
        })
        .catch(err => {
            if(err.message === 'You Cann\'t deposit a credit greater than the debt')
                return res.status(401).json({
                    operation: 'Failed',
                    message: err.message
                })
            return res.status(404).json({
                operation: 'Failed',
                message: 'Company Not Found'
            })
        })
};

exports.putEditDebt = (req, res, next) => {
    const companyId = req.body.companyId;
    const updateCredit = req.body.credit;
    const errors = validationResult(req);
    let oldDebt, newDebt;
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        })

    Company.findOne({where: {id: companyId}})
        .then(company => {
            return company.getDebts({
                order: [['createdAt', 'DESC']],
                limit:1
            })
        })
        .then(debts => {
            const debt = debts[0];
            
            oldDebt = debt.dataValues.debt + debt.dataValues.credit;
            newDebt = oldDebt - updateCredit;

            debt.debt = newDebt;
            debt.credit = updateCredit;

            return debt.save();
        })
        .then(debt => {
            return res.status(200).json({
                operation: 'Succeed',
                debt: debt
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Debt Not Found'
            })
        })
};

exports.deleteDebt = (req, res, next) => {
    // get the debt id from the request body
    const debtId = req.body.debtId;
    
    Debt.findOne({where: {id: debtId}})
        .then(debt => {
            // just delete the debt
            return debt.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Debt Deleted Successfully'
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Debt Not Found'
            })
        })
};