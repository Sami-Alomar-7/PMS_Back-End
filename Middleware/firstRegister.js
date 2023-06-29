const Employee = require('../Models/AuthModels/Employee');

module.exports = (req, res, next) => {
    
    // get the the employees count number 
    Employee.count()
    .then(employeeCount => {
        // check for the existens of employees if so...then return a failear error
        if(employeeCount){
            console.log(employeeCount)
            return res.status(400).json({
                onperation: 'Failed',
                message: 'Already Registered A First Admin'
            });
        }
        else
        // continue to the next stage
        next();
    })
    .catch(err => {
        return res.status(500).json({
            onperation: 'Failed',
            meesage: err
        })
    })
}