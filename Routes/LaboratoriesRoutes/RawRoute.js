const express = require('express');
const router = express.Router();

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdminOrLaboratoryWorker = require('../../Middleware/isAdminOrLaboratoryWorker');

// the controllers which the requests forwarded to
const laboratoryRawController = require('../../Controllers/LaboratoriesController/LaboratoryRawController');

router.get('/display-all', [
        isAuth,
        isAdminOrLaboratoryWorker
    ], 
    laboratoryRawController.getLaboratoryRaws
);

module.exports = router;