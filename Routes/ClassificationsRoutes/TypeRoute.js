const express = require('express');
const router = express.Router();

// Models
    const Type = require('../../Models/ProductsModels/CategoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const typeController = require('../../Controllers/ClassificationsController/TypeController');

router.get('/display-all', [
        isAuth
    ],  
    typeController.getAllTypes
);

router.get('/display-specifice-type', [
        check('typeId')
            .exists()
            .withMessage('No typeId had been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No Such Type Exists');
                    })
            })
    ], [
        isAuth
    ],
    typeController.getSpecificCategory
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    typeController.postAdvancedTypeSearch
);

router.post('/add-type', [
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    typeController.postAddType
);

router.put('/update-category', [
        check('typeId')
            .exists()
            .withMessage('typeId has not been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No Such type registered');
                    })
            }),
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    typeController.putEditType
);

router.delete('/delete-type', [
        check('typeId')
            .exists()
            .withMessage('typeId has not been provided')
            .custom(value => {
                return Type.findOne({where: {id: value}})
                    .then(type => {
                        if(!type)
                            return Promise.reject('No Such type registered');
                    })
            })
    ],[
        isAuth,
        isAdmin
    ],
    typeController.deleteCategory
);

module.exports = router;