// Model
const Role = require('../../Models/AuthModels/Role');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module. exports = async () => {
    // count the records in the roles table
    const roleCount = await Role.count();
    // get the path for the roles dataset file
    const rolesDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/roles.csv');
    // intialize the data array for the roles data
    const rolesData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!roleCount){
            // read from the roles dataset file
            fs.createReadStream(rolesDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    rolesData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    Role.bulkCreate(rolesData)
                    .then(() => {
                        console.log('Dataset of Roles Table Has Been Added Successfully');
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