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
const laboratoryRawController = require('../../Controllers/LaboratoriesController/LaboratoryRawController');

router.get('/display-all', [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    laboratoryRawController.getLaboratoryRaws
);

module.exports = router;