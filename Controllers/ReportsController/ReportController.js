// Models 
const Report = require('../../Models/ReportsModels/ReportModel');

// using the .env file
require('dotenv').config();

// Util
    // for sending notifications
    const socket = require('../../Util/socket');

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// number of reports which wiil be sent with a single request
const REPORTS_PER_REQUEST = 10;

exports.getAllReports = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;
    Report.findAll({
        offset: (page-1) * REPORTS_PER_REQUEST,
        limit: REPORTS_PER_REQUEST,
        attributes: ['title', 'type']
    })
    .then(report => {
        return res.status(200).json({
            operation: 'Succeed',
            report: report
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getSpecificeReport = (req, res, next) => {
    const reportId = req.body.reportId;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Report.findOne({where: { id: reportId}})
    .then(report => {
        return res.status(200).json({
            operation: 'Succeed',
            report: report
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.postMarkReportAsRead = (req, res, next) => {
    const reportId = req.body.reportId;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Report.findOne({where: {id: reportId}})
        .then(report => {
            report.read = true;
            return report.save();
        })
        .then(report => {
            return res.status(200).json({
                operation: 'Succeed',
                report: report
            })
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.deleteReport = (req, res, next) => {
    const reportId = req.body.reportId;
    const errors = validationResult(req);
    let reportTemp;
    const io = socket.getIo();
    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    Report.findOne({where: {id: reportId}})
        .then(report => {
            reportTemp = report;
            return Report.destroy({where: {id: report.id}})
        })
        .then(() => {
            // for sending a notification to all connected
            io.emit('Report', {action: 'delete', report: reportTemp});
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Report Deleted Successfully'
            });
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};