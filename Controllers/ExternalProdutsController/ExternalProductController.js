// Models 
const ExternalProduct = require('../../Models/ProductsModels/ExternalProductModel');
const Category = require('../../Models/ProductsModels/CategoryModel');
const Type = require('../../Models/ProductsModels/TypeModel');
const Scince = require('../../Models/ProductsModels/ScinceModel');

// using the .env file
require('dotenv').config();

// Util
    // for sending notifications
    const socket = require('../../Util/socket');

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../../Helper/deleteAfterMulter');
    // for the files reaching
    const path = require('path');
    // for applying the advanced search using string-similarity
    const similarSearch = require('../../Helper/retriveSimilarSearch');
    // for detectiong whether the image is the default or not
    const isDefaultImage = require('../../Helper/isDefaultImage');

// number of products which wiil be sent with a single request
const PRODUCTS_PER_REQUEST = 10;

exports.getAllExternalProducts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    ExternalProduct.findAll({ 
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        attributes: {
            exclude: ['categoryId', 'typeId', 'scinceId']
        },
        include: [
            {
                model: Category,
                attributes: ['name']
            }, {
                model: Type,
                attributes: ['name']
            }, {
                model: Scince,
                attributes: ['name']
            }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        });
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedExternalProductsSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the products using raw for not getting a model instance
    ExternalProduct.findAll({raw: true})
        .then(products => {
            // send the products objects with the searched string to get the most similares products based on thier names
            const resultArray = similarSearch(products, searchName);
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

exports.getSpecificExternalProduct = (req, res, next) => {
    // get the debt it from the request params
    const productId = req.body.productId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
    ExternalProduct.findOne({
        where: {
            id: productId
        },
        attributes: {
            exclude: ['categoryId', 'typeId', 'scinceId']
        },
        include: [
            {
                model: Category,
                attributes: ['name']
            }, {
                model: Type,
                attributes: ['name']
            }, {
                model: Scince,
                attributes: ['name']
            }
        ]
    })
    .then(product => {
        return res.status(200).json({
            operation: 'Succeed',
            product: product
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getExternalProductsByCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;
    const page = req.query.page || 1;
    ExternalProduct.findAll({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {categoryId: categoryId},
        include: [
            { model: Category },
            { model: Scince },
            { model: Type }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
}

exports.getExternalProductsByType = (req, res, next) => {
    const typeId = req.body.typeId;
    const page = req.query.page || 1;
    ExternalProduct.findAll({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {typeId: typeId},
        include: [
            { model: Category },
            { model: Scince },
            { model: Type }
        ]
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};


exports.postAddExternalProduct = (req, res, next) => {
    const barcode = req.body.barcode;
    const name = req.body.name;
    const dosage = req.body.dosage;
    const manufactorerName = req.body.manufactorerName;
    const description = req.body.description;
    const image = req.file;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const expiration_date = req.body.expiration_date;
    const categoryId = req.body.categoryId;
    const typeId = req.body.typeId;
    const scinceId = req.body.scinceId;
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
        imagePath = path.join(__filename, '..', '..', '/data/default_images/product/default_external_product_image.png').substring(66,128).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'','//');
    
    const externalProduct = new ExternalProduct.create({
        barcode,
        name,
        dosage,
        manufactorerName,
        description,
        quantity,
        price,
        expiration_date,
        image_url: imagePath,
        categoryId,
        typeId,
        scinceId
    });

    externalProduct.save()
        .then(externalProduct => {
            // for sending a notification for all the connected
            io.emit('ExternalProduct', {action: 'create', product: externalProduct});
            return res.status(200).json({
                operation: 'Succeed',
                product: externalProduct
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

exports.putEditExternalProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updateBarcode = req.body.barcode;
    const updateName = req.body.name;
    const updateDosage = req.body.dosage;
    const updateManufactorerName = req.body.manufactorerName;
    const updateDescription = req.body.description;
    const updateImage = req.file;
    const updateQuantity = req.body.quantity;
    const updatePrice = req.body.price;
    const updateExpiration_date = req.body.expiration_date;
    const updateCategoryId = req.body.categoryId;
    const upadteTypeId = req.body.typeId;
    const updateScinceId = req.body.scinceId;
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
    
    ExternalProduct.findOne({where: {id: productId}})
        .then(product => {
            // remove the old image if it was updated
            if(updateImage){
                if(!isDefaultImage(product.path))
                    deleteAfterMulter(product.image_url);
                product.image_url = updateImage.path;
            }
            product.barcode = updateBarcode;
            product.name = updateName;
            product.dosage = updateDosage;
            product.manufactorerName = updateManufactorerName;
            product.description = updateDescription;
            product.quantity = updateQuantity;
            product.price = updatePrice;
            product.expiration_date = updateExpiration_date;
            product.categoryId = updateCategoryId;
            product.typeId = upadteTypeId;
            product.scinceId = updateScinceId;
            return product.save();
        })
        .then(externalProduct => {
            // for sending a notification for all the connected
            io.emit('ExternalProduct', {action: 'update', product: externalProduct});
            return res.status(200).json({
                operation: 'Succeed',
                product: externalProduct
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

exports.deleteExternalProduct = (req, res, next) => {
    const productId = req.body.productId;
    const io = socket.getIo();
    let productTemp;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    ExternalProduct.findOne({where: {id: productId}})
        .then(product => {
            productTemp = product;
            // delete the product image
            if(!isDefaultImage(product.image_url))
                deleteAfterMulter(product.image_url);
            return ExternalProduct.destroy({where: {id: product.id}});
        })
        .then(() => {
            // for sending a notification to all connected
            io.emit('ExternalProduct', {action: 'delete', product: productTemp});
            return res.status(200).json({
                operation: 'Succeed',
                product: 'External Product Deleted Successfully'
            })
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};