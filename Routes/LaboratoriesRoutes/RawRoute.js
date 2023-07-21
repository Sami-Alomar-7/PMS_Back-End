const express = require('express');
const router = express.Router();

// Models
const RawCategory = require('../../Models/RawsModels/CategoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// the controllers which the requests forwarded to
const laboratoryRawController = require('../../Controllers/LaboratoriesController/LaboratoryRawController');

// for validate the incoming requsts
const { check } = require('express-validator');

router.get('/display-all', [
        isAuth
    ], 
    laboratoryRawController.getLaboratoryRaws
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    laboratoryRawController.postAdvancedLaboratoryRawsSearch
);

router.get('/display-raws-by-category', [
        check('categoryId')
            .exists()
            .withMessage('No categoryId had been provided')
            .custom(value => {
                return RawCategory.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No such category had been registered')
                    })
            })
    ],
    laboratoryRawController.getLaboratoryRawsByCategory
);

module.exports = router;