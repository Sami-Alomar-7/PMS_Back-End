// Models 
const Type = require('../../Models/ProductsModels/TypeModel');

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
const TYPES_PER_REQUEST = 10;

exports.getAllTypes = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    Type.findAll({ 
        offset: (page-1) * TYPES_PER_REQUEST,
        limit: TYPES_PER_REQUEST
    })
    .then(types => {
        return res.status(200).json({
            operation: 'Succeed',
            types: types
        });
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedTypeSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the types using raw for not getting a model instance
    Type.findAll({raw: true})
        .then(types => {
            // send the types objects with the searched string to get the most similares types based on thier names
            const resultArray = similarSearch(types, searchName);
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
    const typeId = req.body.typeId;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Type.findOne({where: {id: typeId}})
        .then(type => {
            return res.status(200).json({
                operation: 'Succeed',
                type: type
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.postAddType = (req, res, next) => {
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
        imagePath = path.join(__filename, '..', '..', '/data/default_images/type/pills.png').substring(66,120).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'','//');
    
    const type = new Type.create({
        name,
        image_url: imagePath
    });
    type.save()
        .then(type => {
            // for sending a notification for all the connected
            io.emit('Type', {action: 'create', type: type});
            return res.status(200).json({
                operation: 'Succeed',
                type: type
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

exports.putEditType = (req, res, next) => {
    const typeId = req.body.typeId;
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
    
    Type.findOne({where: {id: typeId}})
        .then(type => {
            // remove the old image if it was updated
            if(updateImage){
                if(!isDefaultImage(type.path))
                    deleteAfterMulter(type.image_url);
                type.image_url = updateImage.path;
            }
            type.name = updateName;
            return type.save();
        })
        .then(type => {
            // for sending a notification for all the connected
            io.emit('Type', {action: 'update', category: category});
            return res.status(200).json({
                operation: 'Succeed',
                type: type
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
    const typeId = req.body.typeId;
    const io = socket.getIo();
    let typeTemp;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    Type.findOne({where: {id: typeId}})
        .then(type => {
            typeTemp = type;
            // delete the type image
            if(!isDefaultImage(type.image_url))
                deleteAfterMulter(type.image_url);
            return Type.destroy({where: {id: type.id}});
        })
        .then(() => {
            // for sending a notification to all connected
            io.emit('Type', {action: 'delete', type: typeTemp});
            return res.status(200).json({
                operation: 'Succeed',
                product: 'Type Deleted Successfully'
            })
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};