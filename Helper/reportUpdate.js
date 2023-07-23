// Model
const Report = require('../Models/ReportsModels/ReportModel');
const laboratoryRaw = require('../Models/LaboratoriesModels/LaboratoryRawModel');
const billRawItem = require('../Models/BillsModels/BillRawItemModel');

// get the limit specified
const limits = require('./getLimits');

module.exports = () => {
    // get the expiration date limit from
    limits()
    .then(({ expiration_limit }) => {
        // get all the laboratory raw materials
        laboratoryRaw.findAll({
            include: billRawItem
        })
        .then(raws => {
            // iterate for each raw material and check if its expiration limit exceeded then added to the reports
            const rawsPromisesArray = raws.map(async raw => {
                try {
                    // create a new report when the raw materal exceed the expiration limit
                    if(raw.bill_raws_item.expiration_date <= expiration_limit)
                        await Report.create({
                            title: 'Expiration Limit Exceeded',    
                            description: 'Raw material ' + raw + ' is about to expire after two weeks',
                            type: false,
                            read: false,
                            labRawId: raw.id
                        })
                } catch(err) {
                    throw new Error('Failed add the expired raw materials to the report table ' + err.message);
                }
            })
            return Promise.all(rawsPromisesArray);
        })
    })
    .catch(err => {
        throw new Error('Failed updating the report table at the specified time caus of: ' + err.message);
    })
};