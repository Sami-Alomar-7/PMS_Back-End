// Models 
const Raw = require('../../Models/RawsModels/RawModel');
const Category = require('../../Models/RawsModels/CategoryModel');
const CompanyRawItem = require('../../Models/CompaniesModels/CompanyRawItemModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// using the .env file
require('dotenv').config();

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
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyRawItem,
                    attributes: ['price', 'expiration_date']
                }
            }, {
                model: Category,
                attributes: ['name']
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
        return res.status(404).json({
            operation: 'Failed',
            message: 'Products Not Found'
        })
    })
};

exports.getSpecificRaw = (req, res, next) => {
    // get the debt it from the request params
    const rawId = req.body.rawId;

    Raw.findOne({
        where: {
            id: rawId
        },
        include: [
            {
                model: Company,
                attributes: ['name','image_url'],
                through: {
                    model: CompanyRawItem,
                    attributes: {
                        exclude: ['rawId', 'companyId']
                    }
                }
            }, {
                model: Category,
                attributes: ['name']
            }
        ]
    })
    .then(raw => {
        return res.status(200).json({
            operation: 'Succeed',
            raw: raw
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Product Not Found'
        })
    })
};

exports.getSpecificCompanyRaws = (req, res, next) =>{
    // get the company id from the request body
    const companyId = req.body.companyId;
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Company.findOne({
        offset: (page-1) * RAW_PER_REQUEST,
        limit: RAW_PER_REQUEST,
        where: {
            id: companyId
        },
        include: {
            model: Raw,
            through: {
                model: CompanyRawItem,
                attributes: {
                    exclude: ['rawId', 'companyId']
                }
            },
            include: [
                {
                    model: Category,
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