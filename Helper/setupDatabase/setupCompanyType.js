// Model
const CompanyType = require('../../Models/CompaniesModels/CompanyType');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // count the records in the companyType tables
    const CompanyTypesCount = await CompanyType.count();
    // get the path for the companiesTypes dataset file
    const companyTypeDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/companies_types.csv');
    // intialize the data array for the roles data
    const companiesTypesData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!CompanyTypesCount){
            // read from the roles dataset file
            fs.createReadStream(companyTypeDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    companiesTypesData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    CompanyType.bulkCreate(companiesTypesData)
                    .then(() => {
                        console.log('Dataset of Companies_Types Table Has Been Added Successfully');
                        resolve(true);
                    })
                    .catch(() => {
                        // return the promis with an error as there were a probleme
                        reject(new Error('Couldn\'t set the required dataset to the database'));
                    })
                })
        }
        else
            resolve(true);
    })
}