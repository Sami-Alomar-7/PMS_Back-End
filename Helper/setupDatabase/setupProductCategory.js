// Model
const ProductCategory = require('../../Models/ProductsModels/CategoryModel');

// for parsing the csv files from its path reading it
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // counst the records in the product_scinces table
    const prductCategoryCount = await ProductCategory.count();

    // get the path for the roles dataset file
    const productCategoryDataFilePath = path.join(__dirname, '..', '..', 'Imports/database/products_categories.csv');
    // intialize the data array for the roles data
    const productCategoriesData = [];

    return new Promise( async (resolve, reject) => {
        // check weather the table doesn't has any record
        if(!prductCategoryCount){
            // read from the roles dataset file
            fs.createReadStream(productCategoryDataFilePath)
            .pipe(csv())
                .on('data', (row) => {
                    // pust the data from the file into the roles data array 
                    productCategoriesData.push(row);
                })
                .on('end', () => {        
                    // insert the whole data from the array to the table calling just one function
                    ProductCategory.bulkCreate(productCategoriesData)
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