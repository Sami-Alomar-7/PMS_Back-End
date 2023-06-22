const Employee = require('../Models/AuthModels/Employee');

module.exports = (req, res, next) => {

    // get the the employees count number 
    const employeeCount = Employee.count();
    
    // check for the existens of employees if so...then return a failear error
    if(employeeCount)
        return res.status(400).json({
            onperation: 'Failed',
            message: 'Already Registered A First Admin'
        });

    // continue to the next stage
    next();
}