// Models 
const Raw = require('../../Models/RawsModels/RawModel');
const Category = require('../../Models/RawsModels/CategoryModel');
const CompanyRawItem = require('../../Models/CompaniesModels/CompanyRawItemModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const CompanyType = require('../../Models/CompaniesModels/CompanyType');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Helper
    // for applying the advanced search using string-similarity
    const similarSearch = require('../../Helper/retriveSimilarSearch');

// number of raws which wiil be sent with a single request
const RAW_PER_REQUEST = 10;

exports.getAllRaws = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    Raw.findAll({
        offset: (page-1) * RAW_PER_REQUEST,
        limit: RAW_PER_REQUEST,
        include: [
            {
                model: Category,
                attributes: ['name']
            }, {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyRawItem
                }
            }
        ]
    })
    .then(raws => {
        return res.status(200).json({
            operation: 'Succeed',
            raws: raws
        });
    })
    .catch(() => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedRawsSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the employees using raw for not getting a model instance
    Raw.findAll({raw: true})
        .then(raws => {
            //  send the raws objects with the searched string to get the most similares raws based on thier names
            const resultArray = similarSearch(raws, searchName);
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

exports.getSpecificRaw = (req, res, next) => {
    // get the debt it from the request params
    const rawId = req.body.rawId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 500,
            message: errors.array()[0].msg
        })
    
    Raw.findOne({
        where: {
            id: rawId
        },
        attributes: {
            exclude: ['rawsCategoryId']
        },
        include: [
            {
                model: Category,
                attributes: ['name']
            },
            {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyRawItem
                }
            }
        ]
    })
    .then(raw => {
        return res.status(200).json({
            operation: 'Succeed',
            raw: raw
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getSpecificCompanyRaws = (req, res, next) =>{
    // get the company id from the request body
    const companyId = req.body.companyId;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 500,
            message: err.message
        })
    
    Company.findOne({
        offset: (page-1) * RAW_PER_REQUEST,
        limit: RAW_PER_REQUEST,
        where: {
            id: companyId
        },
        include: [
            {
                model: CompanyType,
                attributes: ['name']
            }, {
                model: Raw,
                through: {
                    model: CompanyRawItem
                },
                include: [
                    {
                        model: Category,
                        attributes: ['name']
                    }
                ]
            }
        ]
    })
    .then(company => {
        return res.status(200).json({
            operation: 'Succeed',
            company: company
        })
    })
    .catch(err => {
        next({
            status: 400,
            message: err.message
        })
    })
};

exports.getRawsByCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const page = req.query.page || 1;
    Raw.findAll({
        offset: (page-1) * RAW_PER_REQUEST,
        limit: RAW_PER_REQUEST,
        where: {rawsCategoryId: categoryId},
        include: Category 
    })
    .then(raws => {
        return res.status(200).json({
            operation: 'Succeed',
            raws: raws
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedRawsSearchInCompany = (req, res, next) => {
    // get the searched string from the request body
    const companyId = req.body.companyId;
    const searchName = req.body.name;
    let plainObjectsRaws = [];
    // get all the raws as a model instance
    CompanyRawItem.findAll({
        where: {companyId: companyId},
        include: Raw
    })
    .then(raws => {
        // get each raws in the array as a plain object 
        raws.forEach(raw => {
            plainObjectsRaws.push(raw.raw.get()); 
        });
        //  send the products objects with the searched string to get the most similares products based on thier names
        const resultArray = similarSearch(plainObjectsRaws, searchName);
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