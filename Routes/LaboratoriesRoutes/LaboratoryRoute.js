const express = require('express');
const router = express.Router();

// Models
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const laboratoryController = require('../../Controllers/LaboratoriesController/LaboratoryController');

// Routes
    // the Laboratory raws routes
        const laboratoryRaw = require('./RawRoute');
    // the laboratory orders routes
        const laboratoryOrder = require('./OrderRoute');
    // the laboratory products routes
        const laboratoryProduct = require('./ProductRoute');

router.get('/display-all', [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryController.getLaboratories
);

router.get('/display-specifice-laboratory', [
        check('laboratoryId')
            .exists()
            .withMessage('No laboratoryId had been provided')
            .custom(value => {
                return Laboratory.findOne({where: {id: value}})
                    .then(laboratory => {
                        if(!laboratory)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            })
    ],[
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryController.getSpecificeLaboratory
);

router.post('/add-laboratory', [
        // checking the incoming data from the request
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail')
            .exists()
            .withMessage('No Email had been provided')
            .normalizeEmail()
            .custom(value => {
                return Laboratory.findOne({where: {email: value}})
                    .then(laboratory => {
                        if(laboratory)
                            return Promise.reject('E-Mail Is Already Exists, Please Pick A Different One');
                    })
            }),
        check('name')
            .isString()
            .trim(),
        check('phone_number')
            .isString()
            .trim()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryController.postAddLaboratory
);

router.put('/update-laboratory', [
        // checking the incoming data from the request
        check('laboratoryId')
            .exists()
            .withMessage('No laboratoryId had been provided')
            .custom(value => {
                return Laboratory.findOne({where: {id: value}})
                    .then(laboratory => {
                        if(!laboratory)
                            return Promise.reject('Couldn\'t find the specified order');
                    })
            }),
        check('email')
            .isEmail()
            .withMessage('Please Enter A Valid E-mail')
            .normalizeEmail()
            .custom(value => {
                return Laboratory.findOne({where: {email: value}})
                    .then(laboratory => {
                        if(laboratory)
                            return Promise.reject('E-Mail Is Already Exists, Please Pick A Different One');
                    })
            }),
        check('name')
            .isString()
            .trim(),
        check('phone_number')
            .isString()
            .trim()
    ], [
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryController.putUpdateLaboratory
);

router.delete('/delete-laboratory', [
        check('laboratoryId')
            .exists()
            .withMessage('No laboratoryId had been provided')
                .custom(value => {
                    return Laboratory.findOne({where: {id: value}})
                        .then(laboratory => {
                            if(!laboratory)
                                return Promise.reject('Couldn\'t find the specified order');
                        })
                }),
    ],[
        isAuth,
        isAdminOrLaboratoryWorker
    ],
    laboratoryController.deleteLaboratory
);

router.use('/raw', laboratoryRaw);

router.use('/order', laboratoryOrder);

router.use('/product', laboratoryProduct);

module.exports = router;