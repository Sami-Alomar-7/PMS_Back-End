const express = require('express');
const router = express.Router();

// Models
const Report = require('../../Models/ReportsModels/ReportModel');

// Required Middleware
const isAuth = require('../../Middleware/isAuth');
const isAdmin = require('../../Middleware/isAdmin');

// for validate the incoming requsts
const { check } = require('express-validator');

// the controllers which the requests forwarded to
const reportController = require('../../Controllers/ReportsController/ReportController');

router.get('/display-all', [
        isAuth
    ],
    reportController.getAllReports
);

router.get('/display-specifice-report', [
        check('reportId')
            .exists()
            .withMessage('No reportId had been provided')
            .custom(value => {
                return Report.findOne({where: {id: value}})
                    .then(report => {
                        if(!report)
                            return Promise.reject('No such report registered');
                    })
            })
    ],[
        isAuth
    ],
    reportController.getSpecificeReport
);

router.post('/mark-as-read', [
        check('reportId')
            .exists()
            .withMessage('No reportId had been provided')
            .custom(value => {
                return Report.findOne({where: {id: value}})
                    .then(report => {
                        if(!report)
                            return Promise.reject('No such report registered');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    reportController.postMarkReportAsRead
);

router.delete('/delete-report', [
        check('reportId')
            .exists()
            .withMessage('No reportId had been provided')
            .custom(value => {
                return Report.findOne({where: {id: value}})
                    .then(report => {
                        if(!report)
                            return Promise.reject('No such report registered');
                    })
            })
    ], [
        isAuth,
        isAdmin
    ],
    reportController.deleteReport
);

module.exports = router;