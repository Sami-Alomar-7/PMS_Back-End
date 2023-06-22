// Get the file system for deleting images after multer when needed
const fs = require('fs');

module.exports = (imagePath) => {
    fs.unlink(imagePath, (err)=>{
        if(err)
            console.log(err)
        else
            console.log('deleted');
    });
};