// Models 
const Laboratory = require('../../Models/LaboratoriesModels/LaboratoryModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Util
    // for sending notifications
    const socket = require('../../Util/socket');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
        const deleteAfterMulter = require('../../Helper/deleteAfterMulter');
    // for the files reaching
        const path = require('path');
    // for detecting if the image was the default one
        const isDefaultImage = require('../../Helper/isDefaultImage');

// number of laboratory which wiil be sent with a single request
    const LABORATORY_PER_REQUEST = 5;

exports.getLaboratories = (req, res, next) => {
    const page = req.query.page || 1;

    Laboratory.findOne({
        offset: (page-1) * LABORATORY_PER_REQUEST,
        limit: LABORATORY_PER_REQUEST,
    })
        .then(laboratories => {
            return res.status(200).json({
                operation: 'Succeed',
                laboratories: laboratories
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.getSpecificeLaboratory = (req, res, next) => {
    const laboratoryId = req.body.laboratoryId;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    
    Laboratory.findOne({where: {id: laboratoryId}})
        .then(laboratory => {
            return res.status(200).json({
                operation: 'Failed',
                laboratory: laboratory
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
}

exports.postAddLaboratory = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const image = req.file;
    const expirationLimit = req.body.expirationLimit;
    const runOutLimit = req.body.runOutLimit;
    const errors = validationResult(req);
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
        imagePath = path.join(__filename, '..', '..', '/data/default_images/laboratory/default_laboratory_profile_picture.jpg').substring(66,135).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'','//');

    const laboratory = new Laboratory({
        name: name,
        email: email,
        phone_number: phone_number,
        image_url: imagePath,
        expiration_limit: expirationLimit,
        run_out_limit: runOutLimit
    });

    laboratory.save()
        .then(laboratory => {
            // for sending notification to all connected
            io.emit('Laboratory', {action: 'create', laboratory: laboratory});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Laboratory Added Successfully'
            })
        })
        .catch(() => {
            if(image)
                if(!isDefaultImage(image.path))
                    deleteAfterMulter(imagePath);
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.putUpdateLaboratory = (req, res, next) => {
    const laboratoryId = req.body.laboratoryId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPhone_number = req.body.phone_number;
    const updateImage = req.file;
    const upadteExpirationLimit = req.body.expirationLimit;
    const updateRunOurLimit = req.body.run_out_limit;
    const errors = validationResult(req);
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
    // get the Laboratory and update its data
    Laboratory.findOne({where: {id: laboratoryId}})
        .then(laboratory => {
            if(updateImage)
                if(!isDefaultImage(laboratory.image_url)){
                    // remove the old image if it was updated
                    deleteAfterMulter(laboratory.image_url);
                    laboratory.image_url = updateImage.path;
                }
            
            laboratory.name = updatedName;
            laboratory.email = updatedEmail;
            laboratory.phone_number = updatedPhone_number;
            laboratory.expiration_limit = upadteExpirationLimit
            laboratory.run_out_limit = updateRunOurLimit;
            
            return laboratory.save();
        })
        .then(laboratory => {
            // for sending notification to all connected
            io.emit('Laboratory', {action: 'update', laboratory: laboratory});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Updated Successfully',
                laboratory: laboratory
            })
        })
        .catch(() => {
            // if there where an error then delete the stored image
            if(updateImage)
                if(!isDefaultImage(updateImage.path))
                    deleteAfterMulter(updateImage.path);
            next({
                status: 500,
                message: err.message
            })
        });
};

exports.deleteLaboratory = (req, res, next) => {
    const laboratoryId = req.body.laboratoryId;
    const errors = validationResult(req);
    const io = socket.getIo();
    let laboratoryTemp;
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Laboratory.findOne({where: {id: laboratoryId}})
        .then(laboratory => {
            laboratoryTemp = laboratory;
            // delete the laboratory image if it wasn't the default
            if(!isDefaultImage(laboratory.image_url))
                deleteAfterMulter(laboratory.image_url);
            
            return Laboratory.destroy({where: {id: laboratory.id}})
        })
        .then(() => {
            // for sending notification to all connected
            io.emit('Laboratory', {action: 'delete', laboratory: laboratoryTemp});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Laboratory Deleted Successfully'
            });
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};