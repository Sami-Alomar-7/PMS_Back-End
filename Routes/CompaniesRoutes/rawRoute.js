const express = require('express');
const router = express.Router();

// Models
const Raw = require('../../Models/RawsModels/RawModel');
const Company = require('../../Models/CompaniesModels/CompanyModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const rawController = require('../../Controllers/CompaniesController/rawController');

router.get('/display-all', [
        isAuth,
        isAdmin
    ],  
    rawController.getAllRaws
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
        isAuth,
        isAdmin
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
        isAuth,
        isAdmin
    ],
    rawController.getSpecificCompanyRaws
);

module.exports = router;