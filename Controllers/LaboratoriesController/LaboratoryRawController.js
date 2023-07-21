// Models 
const LaboratoryRaw = require('../../Models/LaboratoriesModels/LaboratoryRawModel');
const BillRawItem = require('../../Models/BillsModels/BillRawItemModel');
const BuyRawOrderItem = require('../../Models/OrdersModels/BuyOrderModels/BuyRawOrderItemsMode');
const CompanyRawItem = require('../../Models/CompaniesModels/CompanyRawItemModel');
const Raw = require('../../Models/RawsModels/RawModel')
const RawCategory = require('../../Models/RawsModels/CategoryModel');

// using the .env file
require('dotenv').config();

// Helper
    // for applying the advanced search using string-similarity
    const similarSearch = require('../../Helper/retriveSimilarSearch');

// number of laboratory raws which wiil be sent with a single request
    const LABORATORY_RAWS_PER_REQUEST = 10;

exports.getLaboratoryRaws = (req, res, next) => {
    const page = req.query.page || 1;

    LaboratoryRaw.findAll({
        offset: (page-1) * LABORATORY_RAWS_PER_REQUEST,
        limit: LABORATORY_RAWS_PER_REQUEST,
        include: 
            {
            model: BillRawItem,
            attributes: ['price', 'expiration_date'],
            include: {
                model: BuyRawOrderItem,
                attributes: ['buyOrderId'],
                include: {
                    model: CompanyRawItem,
                    include: {
                        model: Raw,
                        include: RawCategory
                    } 
                }
            }
        }
    })
    .then(laboratoryRaws => {
        return res.status(200).json({
            operation: 'Succeed',
            laboratoryRaws: laboratoryRaws
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedLaboratoryRawsSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    let plainObjectLaboratoryRaws = [];
    // get all the laboratrory raws
    LaboratoryRaw.findAll({
        include: {
            model: BillRawItem,
            attributes: ['price'],
            include: {
                model: BuyRawOrderItem,
                attributes: ['buyOrderId'],
                include: {
                    model: CompanyRawItem,
                    include: RawCategory
                }
            }
        }
    })
    .then(raws => {
        // get each laboratory raw in the array as a plain object 
        raws.forEach(raw => {
            plainObjectLaboratoryRaws.push(raw.bill_raws_item.buy_raw_order_item.company_raw_item.raw.get()); 
        });
        //  send the laboratory raws objects with the searched string to get the most similares laboratory raws based on thier names
        const resultArray = similarSearch(plainObjectLaboratoryRaws, searchName);
        // return the search result with the similar objects from the most similar to the less
        return res.status(200).json({
            operation: 'Succeed',
            searchResult: resultArray
        })
    })
    .catch(err => {
        // jump into the error middleware to handle the error and send the appropriate message
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getLaboratoryRawsByCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const page = req.query.page || 1;
    let resultArray = [];
    LaboratoryRaw.findAll({
        offset: (page-1) * LABORATORY_RAWS_PER_REQUEST,
        limit: LABORATORY_RAWS_PER_REQUEST,
        include: {
            model: BillRawItem,
            attributes: ['price'],
            include: {
                model: BuyRawOrderItem,
                attributes: ['buyOrderId'],
                include: {
                    model: CompanyRawItem,
                    attributes: ['rawId']
                    ,
                    include: {
                        model: Raw,
                        include: {
                            model: RawCategory,
                            where: {id: categoryId},
                        }
                    }
                }
            }
        }
    })
    .then(raws => {
        raws.forEach(raw => {
            if(raw.bill_raws_item.buy_raw_order_item.company_raw_item.raw)
                resultArray.push(raw)
        });
        return res.status(200).json({
            operation: 'Succeed',
            raws: resultArray
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};