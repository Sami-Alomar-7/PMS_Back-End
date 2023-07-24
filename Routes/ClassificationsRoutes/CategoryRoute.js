const express = require('express');
const router = express.Router();

// Models
    const Category = require('../../Models/ProductsModels/CategoryModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const categoryController = require('../../Controllers/ClassificationsController/CategoryController');

router.get('/display-all', [
        isAuth
    ],  
    categoryController.getAllCategories
);

router.get('/display-specifice-category', [
        check('categoryId')
            .exists()
            .withMessage('No categoryId had been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No Such Category Exists');
                    })
            })
    ], [
        isAuth
    ],
    categoryController.getSpecificCategory
);

router.post('/advanced-search', [
        check('name')
            .exists()
            .withMessage('No search name had been provided')
            .isString()
    ], [
        isAuth
    ],
    categoryController.postAdvancedCategorySearch
);

router.post('/add-category', [
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    categoryController.postAddCategory
);

router.put('/update-category', [
        check('categoryId')
            .exists()
            .withMessage('categoryId has not been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No Such category registered');
                    })
            }),
        check('name')
            .exists()
            .isString()
            .withMessage('name has not been provided'),
    ], [
        isAuth,
    ],
    categoryController.putEditCategory
);

router.delete('/delete-category', [
        check('categoryId')
            .exists()
            .withMessage('categoryId has not been provided')
            .custom(value => {
                return Category.findOne({where: {id: value}})
                    .then(category => {
                        if(!category)
                            return Promise.reject('No Such category registered');
                    })
            })
    ],[
        isAuth,
        isAdmin
    ],
    categoryController.deleteCategory
);

module.exports = router;