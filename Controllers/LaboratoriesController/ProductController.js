// Models 
const Order = require('../../Models/LaboratoriesModels/LaboratoryOrderMode');
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');
const LaboratoryRaw = require('../../Models/LaboratoriesModels/LaboratoryRawModel');
const LaboratoryProduct = require('../../Models/LaboratoriesModels/LaboratoryProductModel');
const LaboratoryProductRaws = require('../../Models/LaboratoriesModels/LaboratoryProductsRawsModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../../Helper/deleteAfterMulter');
    // for the files reaching
    const path = require('path');
    // for detecting if the image was the default one
    const isDefaultImage = require('../../Helper/isDefaultImage');

// number of orders which wiil be sent with a single request
const PRODUCTS_PER_REQUEST = 10;

exports.getAllProducts = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    
    LaboratoryProduct.findAll({ 
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        include: {
            model: Order,
            attributes: ['quantity', 'order_number'],
            include: {
                model: Laboratory,
                attributes: ['name', 'image_url']
            }
        }
    })
    .then(products => {
        return res.status(200).json({
            operation: 'Succeed',
            products: products
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.getSpecificeProduct = (req, res, next) => {
    const productId = req.body.productId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    LaboratoryProduct.findOne({
        where: {id: productId},
        include: {
            model: Order,
            attributes: ['quantity', 'order_number'],
            include: {
                model: Laboratory,
                attributes: ['name', 'image_url']
            }
        }
    })
    .then(product => {
        return res.status(200).json({
            operation: 'Succeed',
            product: product
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.getSpecificeOrderProducts = (req, res, next) => {
    const orderId = req.body.orderId;
    const page = req.query.page || 1;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    Order.findOne({
        offset: (page-1) * PRODUCTS_PER_REQUEST,
        limit: PRODUCTS_PER_REQUEST,
        where: {id: orderId},
        include: [
            {
                model: LaboratoryProduct,
            }, {
                model: Laboratory,
                attributes: ['name', 'image_url']
            }
        ]
    })
    .then(orderProducts => {
        return res.status(200).json({
            operation: 'Succeed',
            orderProducts: orderProducts
        })
    })
    .catch(err => {
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
    })
};

exports.postAddOrderProduct = (req, res, next) => {
    const orderId = req.body.orderId;
    const barcode = req.body.barcode;
    const name = req.body.name;
    const description = req.body.description;
    const usage = req.body.usage;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const expiration_date = req.body.expiration_date;
    const image = req.file;
    const raws = req.body.raws;
    const errors = validationResult(req);
    let totalPrice;
    
    // check if there is an error in the request
    if(!errors.isEmpty()){
        if(image)
            // if there where an error then delete the stored image
            deleteAfterMulter(image.path);
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }
    
    // if there were no image uploaded set the default image
    if(!image)
        imagePath = path.join(__filename, '..', '..', '/data/default_images/laboratory/products/default_laboratory_product_picture.png').substring(66,144).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'', '//');
    
    Order.findOne({where: {id: orderId}})
        .then(order => {
            // determine whether the order is indeed accepted
            if(order.statu !== 'Accepted')
                throw new Error('The product is not recorded as accepted');
            // determine that the added qantity is equal or less than the ordered one
            if(quantity > order.quantity)
                throw new Error('You Cann\'t add a quantity greater than which you were requested');
            // calculate the total price for the whole raw materials which have been used in the manufacturing process
            raws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            });
            // determine that the selling price is suitable with the cost price
            if(totalPrice > price)
                throw new Error('The Cost of manufactoring cann\'t be greater than the selling price');
            // determine whether the expiration date of the product is valid
            if(expiration_date <= Date.now())
                throw new Error('You Cann\'t add a product with such Expiration date');
            // mark the order as ready 
            order.statu = 'Ready';
            // add the product data and save it
            const laboratoryProduct = new LaboratoryProduct({
                labOrderId: orderId,
                barcode: barcode,
                name: name,
                description: description,
                usage: usage,
                quantity: quantity,
                price: price,
                image_url: imagePath,
                expiration_date: expiration_date
            });
            return laboratoryProduct.save();
        })
        .then(product => {
            // add each raw material which has been used in the manufacturing process
            raws.forEach(raw => {
                return LaboratoryRaw.findOne({where: {id: raw.id}})
                    .then(newRaw => {
                        // determine that the used amount od raw material is already exists in the stock
                        if(raw.quantity > newRaw.quantity)
                            throw new Error('Cann\'t use an amount of raw material greater that the exist amount');
                        // decrease the used the raw material amount with the used amount and save it
                        newRaw.quantity -= raw.quantity;
                        return newRaw.save();
                    })
                    .then(() => {
                        // associate each raw material has been used with the product which has been used for
                        return LaboratoryProductRaws.create({
                            quantity: raw.quantity,
                            price: raw.price,
                            labProductId: product.id,
                            labRawId: raw.id
                        });
                    })
                    .catch(() => {
                        throw new Error('Failed Adding the raw materials which have been used in the manufacturing process');
                    })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Product Added Successfully'
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.putEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updateBarcode = req.body.barcode;
    const updateName = req.body.name;
    const updateDescription = req.body.description;
    const updateUsage = req.body.usage;
    const updateQuantity = req.body.quantity;
    const updatePrice = req.body.price;
    const updateExpiration_date = req.body.expiration_date;
    const updateImage = req.file;
    const updateRaws = req.body.raws;
    const errors = validationResult(req);
    let totalPrice, productRawTemp;
    
    // check if there is an error in the request
    if(!errors.isEmpty()){
        if(updateImage)
            // if there where an error then delete the stored image
            deleteAfterMulter(updateImage.path);
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }

    LaboratoryProduct.findOne({
        where: {id: productId},
        include: {
            model: Order,
            attributes: ['quantity']
        }
    })
        .then(product => {
            // determine that the added qantity is equal or less than the ordered one
            if(updateQuantity > product.lab_order.quantity)
                throw new Error('You Cann\'t add a quantity greater than which you were requested');
            // calculate the total price for the whole raw materials which have been used in the manufacturing process
            updateRaws.forEach(raw => {
                totalPrice += raw.price * raw.quantity;
            });
            // determine that the selling price is suitable with the cost price
            if(totalPrice > updatePrice)
                throw new Error('The Cost of manufactoring cann\'t be greater than the selling price');
            // determine whether the expiration date of the product is valid
            if(updateExpiration_date <= Date.now())
                throw new Error('You Cann\'t add a product with such Expiration date');
            // remove the old image if it was updated and wasn't the default
            if(updateImage)
                if(!isDefaultImage(product.image_url)){
                    deleteAfterMulter(product.image_url);
                    product.image_url = updateImage.path;
                }
            
            // update the order with the new incoming data
            product.barcode = updateBarcode;
            product.name = updateName;
            product.description = updateDescription;
            product.usage = updateUsage;
            product.quantity = updateQuantity;
            product.price = updatePrice;
            product.expiration_date = updateExpiration_date;

            // save the new object with its updated data
            return product.save();
        })
        .then(product => {
            // add each raw material which has been used in the manufacturing process
            updateRaws.forEach(raw => {
                return LaboratoryProductRaws.findOne({
                    where: {labProductId: product.id, labrawId: raw.id},
                    include: LaboratoryRaw
                })
                .then(productRaw => {
                    productRawTemp = productRaw;
                    // determin that the updated quantity of raw material is still available in the stock
                    if(raw.quantity > (productRaw.quantity + productRaw.lab_raw.quantity))
                        throw new Error('Cann\'t use an amount of raw material greater that the exist amount');
                    // update the quantity of raw material which has been used in the manufacturing process
                    productRaw.quantity = raw.quantity;
                    return productRaw.save();
                })
                .then(newProductRaw => {
                    // get the raw material from the stock
                    return LaboratoryRaw.findOne({where: {id: newProductRaw.lab_raw.id}})
                })
                .then(raws => {
                    // update the raw material amount with the new one cause of updating its amount which has been used in manufacturing
                    raws.quantity = (raws.quantity + productRawTemp.quantity) - raw.quantity;
                    return raws.save();
                })
                .catch(err => {
                    throw new Error('Failed Adding the raw materials which have been used in the manufacturing process' + err);
                })
            })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                product: 'Product updated Successfully'
            })
        })
        .catch(err => {
            return res.status(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return res.status(400).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });

    LaboratoryProduct.findOne({where: {id: productId}})
        .then(product => {
            // deltete the product image if it wasn't the default one
            if(!isDefaultImage(product.image_url))
                deleteAfterMulter(product.image_url);
            // just delete the product
            return product.destroy();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Product Deleted Successfully'
            })
        })
        .catch(err => {
            return res.statu(500).json({
                operation: 'Failed',
                message: err.message
            })
        })
};