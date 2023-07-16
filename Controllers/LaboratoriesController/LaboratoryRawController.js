// Models 
const LaboratoryRaw = require('../../Models/LaboratoriesModels/LaboratoryRawModel');
const BillRawItem = require('../../Models/BillsModels/BillRawItemModel');
const BuyRawOrderItem = require('../../Models/OrdersModels/BuyOrderModels/BuyRawOrderItemsMode');
const CompanyRawItem = require('../../Models/CompaniesModels/CompanyRawItemModel');
const Raw = require('../../Models/RawsModels/RawModel')
const RowCategory = require('../../Models/RawsModels/CategoryModel');

// using the .env file
require('dotenv').config();

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
                        include: RowCategory
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
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};