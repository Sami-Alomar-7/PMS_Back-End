// Models 
const Product = require('../../Models/ProductsModels/ProductModel');
const Category = require('../../Models/ProductsModels/CategoryModel');
const Type = require('../../Models/ProductsModels/TypeModel');
const Scince = require('../../Models/ProductsModels/ScinceModel');
const CompanyProductItem = require('../../Models/CompaniesModels/CompanyProductItemModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// using the .env file
require('dotenv').config();

// number of products which wiil be sent with a single request
const PRODUCTS_PER_REQUEST = 10;

exports.getAllProducts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Product.findAll({ 
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        include: [
            {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyProductItem,
                    attributes: ['price', 'expiration_date']
                }
            }, {
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

    Product.findOne({
        where: {
            id: productId
        },
        include: [
            {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyProductItem,
                    attributes: {
                        exclude: ['productId', 'companyId']
                    }
                }
            }, {
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
    })
    .then(product => {
        return res.status(200).json({
            operation: 'Succeed',
            product: product
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Product Not Found'
        })
    })
};

exports.getSpecificCompanyProducts = (req, res, next) =>{
    // get the company id from the request body
    const companyId = req.body.companyId;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Company.findOne({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {
            id: companyId
        },
        include: {
            model: Product,
            through: {
                model: CompanyProductItem,
                attributes: {
                    exclude: ['productId', 'companyId']
                }
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
    })
    .then(company => {
        return res.status(200).json({
            operation: 'Succeed',
            company: company
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Company Products Not Found'
        })
    });
};
