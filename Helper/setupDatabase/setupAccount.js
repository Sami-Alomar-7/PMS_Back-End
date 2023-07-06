// Model
const Account = require('../../Models/AccountModels/AccountModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // count the records in the account tables
    const accountsCount = await Account.count();
    // get the path for the accounts dataset file
    const accountsDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/accounts.csv');
    // intialize the data array for the roles data
    const accountsData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!accountsCount){
            // read from the roles dataset file
            fs.createReadStream(accountsDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    accountsData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    Account.bulkCreate(accountsData)
                    .then(() => {
                        console.log('Dataset of Accounts Table Has Been Added Successfully');
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