// Models 
const Category = require('../../Models/ProductsModels/CategoryModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../../Helper/deleteAfterMulter');
    // for the files reaching
    const path = require('path');
    // for detectiong whether the image is the default or not
    const isDefaultImage = require('../../Helper/isDefaultImage');

// number of categories which wiil be sent with a single request
const CATEGORIES_PER_REQUEST = 10;

exports.getAllCategories = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    Category.findAll({ 
        offset: (page-1) * CATEGORIES_PER_REQUEST,
        limit: CATEGORIES_PER_REQUEST
    })
    .then(categories => {
        return res.status(200).json({
            operation: 'Succeed',
            categories: categories
        });
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedCategorySearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the category using raw for not getting a model instance
    Category.findAll({raw: true})
        .then(categories => {
            // send the categories objects with the searched string to get the most similares categories based on thier names
            const resultArray = similarSearch(categories, searchName);
            // return the search result with the similar objects from the most similar to the less
            return res.status(200).json({
                operation: 'Succeed',
                searchResult: resultArray
            })
        })
        .catch(err => {
            // jump into the error middleware to handle the error and send the appropriate message
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.getSpecificCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Category.findOne({where: {id: categoryId}})
        .then(category => {
            return res.status(200).json({
                operation: 'Succeed',
                category: category
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.postAddCategory = (req, res, next) => {
    const name = req.body.name;
    const image = req.file;
    const io = socket.getIo();
    // check if there is an error in the request
    if(!errors.isEmpty()){
        // if there where an error then delete the stored image
        if(image)
            if(!isDefaultImage(image.path))
                deleteAfterMulter(image.path);
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    }
    
    // if there were no image uploaded set the default image
    if(!image)
        imagePath = path.join(__filename, '..', '..', '/data/default_images/product_category/pain_killer.png').substring(66,138).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'','//');
    
    const category = new Category.create({
        name,
        image_url: imagePath
    });
    category.save()
        .then(category => {
            // for sending a notification for all the connected
            io.emit('Category', {action: 'create', category: category});
            return res.status(200).json({
                operation: 'Succeed',
                category: category
            })
        })
        .catch(err => {
            // if there where an error then delete the stored image
            if(image)
                if(!isDefaultImage(image.path))
                    deleteAfterMulter(image.path);
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.putEditCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const updateName = req.body.name;
    const updateImage = req.file;
    const io = socket.getIo();
    // check if there is an error in the request
    if(!errors.isEmpty()){
        // if there where an error then delete the stored image
        if(updateImage)
            if(!isDefaultImage(updateImage.path))
                deleteAfterMulter(updateImage.path);
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    }
    
    Category.findOne({where: {id: categoryId}})
        .then(category => {
            // remove the old image if it was updated
            if(updateImage){
                if(!isDefaultImage(category.path))
                    deleteAfterMulter(category.image_url);
                category.image_url = updateImage.path;
            }
            category.name = updateName;
            return category.save()
        })
        .then(category => {
            // for sending a notification for all the connected
            io.emit('Category', {action: 'update', category: category});
            return res.status(200).json({
                operation: 'Succeed',
                category: category
            })
        })
        .catch(err => {
            // if there where an error then delete the stored image
            if(updateImage)
                if(!isDefaultImage(updateImage.path))
                    deleteAfterMulter(updateImage.path);
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.deleteCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const io = socket.getIo();
    let categoryTemp;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    Category.findOne({where: {id: categoryId}})
        .then(category => {
            categoryTemp = category;
            // delete the category image
            if(!isDefaultImage(category.image_url))
                deleteAfterMulter(category.image_url);
            return Category.destroy({where: {id: category.id}});
        })
        .then(() => {
            // for sending a notification to all connected
            io.emit('Category', {action: 'delete', category: categoryTemp});
            return res.status(200).json({
                operation: 'Succeed',
                product: 'Category Deleted Successfully'
            })
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};