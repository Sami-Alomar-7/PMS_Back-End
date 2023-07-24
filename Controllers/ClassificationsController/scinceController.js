// Models 
const Scince = require('../../Models/ProductsModels/ScinceModel');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of scince which wiil be sent with a single request
const SCINCES_PER_REQUEST = 10;

exports.getAllScinces = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    Scince.findAll({ 
        offset: (page-1) * SCINCES_PER_REQUEST,
        limit: SCINCES_PER_REQUEST
    })
    .then(scince => {
        return res.status(200).json({
            operation: 'Succeed',
            scince: scince
        });
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postAdvancedScinceSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the types using raw for not getting a model instance
    Scince.findAll({raw: true})
        .then(scinces => {
            // send the scince objects with the searched string to get the most similares scince based on thier names
            const resultArray = similarSearch(scinces, searchName);
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

exports.getSpecificScince = (req, res, next) => {
    const scinceId = req.body.scinceId;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Scince.findOne({where: {id: scinceId}})
        .then(scince => {
            return res.status(200).json({
                operation: 'Succeed',
                scince: scince
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.postAddScince = (req, res, next) => {
    const name = req.body.name;
    const io = socket.getIo();
    // check if there is an error in the request
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    
    const scince = new Scince.create({name});
    scince.save()
        .then(scince => {
            // for sending a notification for all the connected
            io.emit('Scince', {action: 'create', scince});
            return res.status(200).json({
                operation: 'Succeed',
                scince: scince
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.putEditScince = (req, res, next) => {
    const scinceId = req.body.scinceId;
    const updateName = req.body.name;
    const io = socket.getIo();
    // check if there is an error in the request
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    
    Scince.findOne({where: {id: scinceId}})
        .then(scince => {
            scince.name = updateName;
            return scince.save();
        })
        .then(scince => {
            // for sending a notification for all the connected
            io.emit('Scince', {action: 'update', scince: scince});
            return res.status(200).json({
                operation: 'Succeed',
                scince: scince
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.deleteScince = (req, res, next) => {
    const scinceId = req.body.scinceId;
    const io = socket.getIo();
    let scinceTemp;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        })
    Scince.findOne({where: {id: scinceId}})
        .then(scince => {
            scinceTemp = scince;
            return Scince.destroy({where: {id: scince.id}});
        })
        .then(() => {
            // for sending a notification to all connected
            io.emit('Scince', {action: 'delete', scince: scinceTemp});
            return res.status(200).json({
                operation: 'Succeed',
                product: 'Scince Deleted Successfully'
            })
        })
        .catch(() => {
            next({
                status: 500,
                message: err.message
            })
        })
};