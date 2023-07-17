const Employee = require('../Models/AuthModels/Employee');

module.exports = (req, res, next) => {
    
    // get the the employees count number 
    Employee.count()
    .then(employeeCount => {
        // check for the existens of employees if so...then return a failear error
        if(employeeCount)
            return next({
                status: 401,
                message: 'Already Registered A First Admin'
            })
        else
        // continue to the next stage
        next();
    })
    .catch(err => {
        return next({
            status: 500,
            message: err.message
        })
    })
}