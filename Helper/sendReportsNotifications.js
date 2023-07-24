const Report = require('../Models/ReportsModels/ReportModel');

const socket = require('../Util/socket');

module.exports = () => {
    const io = socket.getIo();
    Report.findAll({
        limit: 15
    })
    .then(reports => {
        const reportsPromisesArray = reports.map(report => {
            if(report.read === false)
                io.emit('Report', {Statu: 'Unreaded Report', report: report});
        })
        return Promise.all(reportsPromisesArray);
    })
    .catch(err => {
        throw new Error('Failed to send the unreaded reports cause of: ' + err.message);
    })
}