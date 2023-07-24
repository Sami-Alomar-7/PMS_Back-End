const express = require('express');
const router = express.Router();

// Models
    const Scince = require('../../Models/ProductsModels/ScinceModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const scinceController = require('../../Controllers/ClassificationsController/scinceController');

router.get('/display-all', [
        isAuth
    ],  
    scinceController.getAllScinces
);

router.get('/display-specifice-scince', [
        check('scinceId')
            .exists()
            .withMessage('No scinceId had been provided')
            .custom(value => {
                return Scince.findOne({where: {id: value}})
                    .then(scince => {
                        if(!scince)
                            return Promise.reject('No Such Scince Exists');
                    })
            })
    ], [
        isAuth
    ],
    scinceController.getSpecificScince
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    scinceController.postAdvancedScinceSearch
);

router.post('/add-scince', [
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    scinceController.postAddScince
);

router.put('/update-scince', [
        check('scinceId')
            .exists()
            .withMessage('scinceId has not been provided')
            .custom(value => {
                return Scince.findOne({where: {id: value}})
                    .then(scince => {
                        if(!scince)
                            return Promise.reject('No Such scince registered');
                    })
            }),
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    scinceController.putEditScince
);

router.delete('/delete-scince', [
        check('scinceId')
            .exists()
            .withMessage('scinceId has not been provided')
            .custom(value => {
                return Scince.findOne({where: {id: value}})
                    .then(scince => {
                        if(!scince)
                            return Promise.reject('No Such scince registered');
                    })
            })
    ],[
        isAuth,
        isAdmin
    ],
    scinceController.deleteScince
);

module.exports = router;