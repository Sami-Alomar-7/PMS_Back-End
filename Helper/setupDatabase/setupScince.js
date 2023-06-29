// Model
const Scince = require('../../Models/ProductsModels/ScinceModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');


module.exports = async () => {
    // counst the records in the product_scinces table
    const scinceCount = await Scince.count();

    // get the path for the roles dataset file
    const scincesDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/scinces.csv');
    // intialize the data array for the roles data
    const scincesData = [];

    return new Promise( async (resolve, reject) => {
        // check weather the table doesn't has any record
        if(!scinceCount){
            // read from the roles dataset file
            fs.createReadStream(scincesDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    scincesData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    Scince.bulkCreate(scincesData)
                    .then(() => {
                        console.log('Dataset of Scinces Table Has Been Added Successfully');
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