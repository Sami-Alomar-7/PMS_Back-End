// Model
const CompanyProductItem = require('../../Models/CompaniesModels/CompanyProductItemModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // count the records in the company tables
    const companyProductItemCount = await CompanyProductItem.count();
    // get the path for the companies dataset file
    const companiesProductsItemsDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/company_products.csv');
    // intialize the data array for the roles data
    const companiesProductsItemsData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!companyProductItemCount){
            // read from the roles dataset file
            fs.createReadStream(companiesProductsItemsDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    companiesProductsItemsData.push(row);
                })
                .on('end', () => {
                    // insert the whole data from the array to the table calling just one function
                    CompanyProductItem.bulkCreate(companiesProductsItemsData)
                    .then(() => {
                        console.log('Dataset of Companies_Products_Items Table Has Been Added Successfully');
                        resolve(true);
                    })
                    .catch((err) => {
                        // return the promis with an error as there were a probleme
                        reject(new Error('Couldn\'t set the required dataset to the database\n' + err));
                    })
                })
        }
        else
            resolve(true);
    })
}