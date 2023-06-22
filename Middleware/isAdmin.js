const Employee = require('../Models/AuthModels/Employee');
const Role = require('../Models/AuthModels/Role');

module.exports = (req, res, next) => {
    // get the employee id from the request which had already set by the 'isAuth' Middleware
    const employeeId = req.employeeId;
    
    // get the employee which has that id and check if he was an admin
    Employee.findOne({
        where: { id: employeeId },
        include: Role
    })
    .then(employee => {
        if(!employee)
            return res.status(404).json({
                operation: 'Failed',
                message: 'No Such Admin Registered'
            });
        
        // get the role name
        const Role = employee.roles[0].name;
        if(Role !== 'admin')
            return res.status(401).json({
                operation: 'Failed',
                message: 'Only Admins Allowed'
            });
        
        // if reached here means that it's an admin request so continue to the next stage
        next();
    })
    .catch(err => {
        return res.status(400).json({
            operation: 'Failed',
            message: err
        });
    });
};