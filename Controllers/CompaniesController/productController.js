// Models 
const Product = require('../../Models/ProductsModels/ProductModel');
const Category = require('../../Models/ProductsModels/CategoryModel');
const Type = require('../../Models/ProductsModels/TypeModel');
const Scince = require('../../Models/ProductsModels/ScinceModel');
const CompanyProductItem = require('../../Models/CompaniesModels/CompanyProductItemModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');
const CompanyType = require('../../Models/CompaniesModels/CompanyType');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of products which wiil be sent with a single request
const PRODUCTS_PER_REQUEST = 10;

exports.getAllProducts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Product.findAll({ 
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        attributes: {
            exclude: ['categoryId', 'typeId', 'scinceId']
        },
        include: [
            {
                model: Category,
                attributes: ['name']
            }, {
                model: Type,
                attributes: ['name']
            }, {
                model: Scince,
                attributes: ['name']
            }, {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyProductItem
                }
            }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        });
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Products Not Found'
        })
    })
};

exports.getSpecificProduct = (req, res, next) => {
    // get the debt it from the request params
    const productId = req.body.productId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Product.findOne({
        where: {
            id: productId
        },
        attributes: {
            exclude: ['categoryId', 'typeId', 'scinceId']
        },
        include: [
            {
                model: Category,
                attributes: ['name']
            }, {
                model: Type,
                attributes: ['name']
            }, {
                model: Scince,
                attributes: ['name']
            },
            {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyProductItem
                }
            }
        ]
    })
    .then(product => {
        return res.status(200).json({
            operation: 'Succeed',
            product: product
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.getSpecificCompanyProducts = (req, res, next) =>{
    // get the company id from the request body
    const companyId = req.body.companyId;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    
    Company.findOne({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {
            id: companyId
        },
        attributes: {
            exclude: ['companiesTypeId']
        },
        include: [
            {
                model: CompanyType,
                attributes: ['name']
            }, {
                model: Product,
                attributes: {
                    exclude: ['categoryId', 'typeId', 'scinceId']
                },
                through: {
                    model: CompanyProductItem
                },
                include: [
                    {
                        model: Category,
                        attributes: ['name']
                    }, {
                        model: Type,
                        attributes: ['name']
                    }, {
                        model: Scince,
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
        return res.status(500).json({
            operation: 'Failed',
            message: err
        })
    });
};
