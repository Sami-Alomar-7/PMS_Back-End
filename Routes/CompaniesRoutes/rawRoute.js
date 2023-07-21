const express = require('express');
const router = express.Router();

// Models
const Raw = require('../../Models/RawsModels/RawModel');
const RawCategory = require('../../Models/RawsModels/CategoryModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const rawController = require('../../Controllers/CompaniesController/rawController');

router.get('/display-all', [
        isAuth
    ],  
    rawController.getAllRaws
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    rawController.postAdvancedRawsSearch
);

router.get('/display-raw', [
        check('rawId')
            .exists()
            .withMessage('No rawId had been provided')
            .custom(value => {
                return Raw.findOne({where: {id: value}})
                    .then(raw => {
                        if(!raw)
                            return Promise.reject('No Such Raw Exists');
                    })
            })
    ], [
        isAuth
    ],
    rawController.getSpecificRaw
);

router.get('/display-company-raw', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No Such Company Exists');
                    })
            })
    ], [
        isAuth
    ],
    rawController.getSpecificCompanyRaws
);

router.get('/display-category', [
        check('categoryId')
            .exists()
            .withMessage('No categoryId had been provided')
            .custom(value => {
                return RawCategory.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No such category registered');
                    })
            })
    ], [
        isAuth
    ],
    rawController.getRawsByCategory
);

router.post('/advanced-search-in-company', [
        check('companyId')
            .exists()
            .withMessage('No companyId had been provided')
            .custom(value => {
                return Company.findOne({where: {id: value}})
                    .then(company => {
                        if(!company)
                            return Promise.reject('No Such Company Exists');
                    })
            }),
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    rawController.postAdvancedRawsSearchInCompany
);

module.exports = router;