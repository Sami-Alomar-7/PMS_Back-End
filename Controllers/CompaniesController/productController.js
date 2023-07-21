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

// Helper
    // for applying the advanced search using string-similarity
    const similarSearch = require('../../Helper/retriveSimilarSearch');

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
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedProductsSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the employees using raw for not getting a model instance
    Product.findAll({raw: true})
        .then(products => {
            //  send the products objects with the searched string to get the most similares products based on thier names
            const resultArray = similarSearch(products, searchName);
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

exports.getSpecificProduct = (req, res, next) => {
    // get the debt it from the request params
    const productId = req.body.productId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
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
        next({
            status: 500,
            message: err.message
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
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
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
        next({
            status: 500,
            message: err.message
        })
    });
};

exports.getProductsByCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const page = req.query.page || 1;
    Product.findAll({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {categoryId: categoryId},
        include: [
            { model: Category },
            { model: Scince },
            { model: Type }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
}

exports.getProductsByType = (req, res, next) => {
    const typeId = req.body.typeId;
    const page = req.query.page || 1;
    Product.findAll({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {typeId: typeId},
        include: [
            { model: Category },
            { model: Scince },
            { model: Type }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
}

exports.postAdvancedProductsSearchInCompany = (req, res, next) => {
    // get the searched string from the request body
    const companyId = req.body.companyId;
    const searchName = req.body.name;
    let plainObjectsProducts = [];
    // get all the products as a model instance
    CompanyProductItem.findAll({
        where: {companyId: companyId},
        include: Product
    })
    .then(products => {
        // get each product in the array as a plain object 
        products.forEach(product => {
            plainObjectsProducts.push(product.product.get()); 
        });
        //  send the products objects with the searched string to get the most similares products based on thier names
        const resultArray = similarSearch(plainObjectsProducts, searchName);
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