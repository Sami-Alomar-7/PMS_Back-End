// Model
const Company = require('../../Models/CompaniesModels/CompanyModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // count the records in the company tables
    const companyCount = await Company.count();
    // get the path for the companies dataset file
    const companiesDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/companies.csv');
    // intialize the data array for the roles data
    const companiesData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!companyCount){
            // read from the roles dataset file
            fs.createReadStream(companiesDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    companiesData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    Company.bulkCreate(companiesData)
                    .then(() => {
                        console.log('Dataset of Companies Table Has Been Added Successfully');
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