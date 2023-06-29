// Model
const Product = require('../../Models/ProductsModels/ProductModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // count the records in the products table
    const productCount = await Product.count();
    // get the path for the roles dataset file
    const productsDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/products.csv');
    // intialize the data array for the roles data
    const productsData = [];

    return new Promise((resolve, reject) => {
        // check weather the table doesn't has any record
        if(!productCount){
            // read from the roles dataset file
            fs.createReadStream(productsDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    productsData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    Product.bulkCreate(productsData)
                    .then(() => {
                        console.log('Dataset of Products Table Has Been Added Successfully');
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
