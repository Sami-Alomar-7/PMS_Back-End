// Models 
const Employee = require('../Models/AuthModels/Employee');
const EmployeeRole = require('../Models/AuthModels/EmployeeRole');
const Role = require('../Models/AuthModels/Role');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// for hashing and creating tokens
const bcrypt = require('bcryptjs');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../Helper/deleteAfterMulter');
    // for the files reaching
    const path = require('path');

// number of employees which wiil be sent with a single request
const EMPLOYEE_PER_REQUEST = 4;

exports.getAllEmployees = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Employee.findAll({
        offset: (page-1) * EMPLOYEE_PER_REQUEST,
        limit: EMPLOYEE_PER_REQUEST,
        attributes: {
            exclude: ['password','token', 'token_expiration']
        }
    })
    .then(employees => {
        return res.status(200).json({
            operation: 'Succeed',
            employees: employees
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Employee Not Found'
        })
    })
};

exports.getSpecificeEmployee = (req, res, next) => {
    const employeeId = req.body.employeeId;
    
    Employee.findOne({
        where: {id: employeeId},
        attributes: {
            exclude: ['password', 'token', 'token_expiration']
        },
        include: {
            model: Role,
            attributes: ['name'],
            through: {
                model: EmployeeRole,
                attributes: {
                    exclude: ['id', 'employeeId', 'roleId']
                }
            }
        }
    })
    .then(employee => {
        return res.status(200).json({
            operation: 'Succeed',
            employee: employee
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Employee Not Found'
        })
    })
};

exports.getEmployeeProfile = (req, res, next) => {
    const employeeId = req.employeeId;

    Employee.findOne({
        where: {id: employeeId},
        attributes: {
            exclude: ['password', 'token', 'token_expiration']
        },
        include: {
            model: Role,
            attributes: ['name'],
            through: {
                model: EmployeeRole,
                attributes: {
                    exclude: ['id', 'employeeId', 'roleId']
                }
            }
        }
    })
    .then(employee => {
        return res.status(200).json({
            operation: 'Succeed',
            employee: employee
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Employee Not Found'
        })
    })
};

exports.postAddEmployee = (req, res, next) =>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const gender = req.body.gender;
    const salary = req.body.salary;
    const role = req.body.role;
    const image = req.file;
    const errors = validationResult(req);
    let imagePath = '';
    let employeeTemp;

    // check if there is an error in the request
    if(!errors.isEmpty()){
        if(image)
            // if there where an error then delete the stored image
            deleteAfterMulter(image.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }
    
    // if there were no image uploaded set the default image
    if(!image)
        imagePath = path.join(__filename, '..', '/data/default_images/employee/default_employee_profile_picture.jpg').substring(66,131).replace('\'','//');
    // if there were an image uploaded get the path of it
    if(image)
        imagePath = image.path.replace('\'','//');

    // hash the password and store the new record
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const employee = new Employee({
                name: name,
                email: email,
                password: hashedPassword,
                image_url: imagePath,
                address: address,
                gender: gender,
                phone_number: phone_number
            });
            return employee.save()
        })
        .then(employee => {
            employeeTemp = employee;
            const employeeRole = new EmployeeRole({
                employeeId: employee.id,
                roleId: role,
                salary: salary
            });
            return employeeRole.save();
        })
        .then(employeeRole => {
            return res.status(200).json({
                message: 'Succeed',
                employee: employeeTemp,
                employeeRole: employeeRole
            });
        })
        .catch(err => {
            // if there where an error then delete the stored image
            deleteAfterMulter(image.path);
            return res.status(500).json({
                operation: 'Failed',
                message: err
            });            
        })
};

exports.putUpdateProfile = (req, res, next) => {
    const updteEmployeeId = req.body.updateEmployeeId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const updatedPhone_number = req.body.phone_number;
    const updatedAddress = req.body.address;
    const updatedSalary = req.body.salary;
    const updatedEmployeeOfTheMonth = req.body.employeeOfTheMonth;
    const updatedRole = req.body.role;
    const updateImage = req.file;
    const errors = validationResult(req);
    let tempEmployee;

    // check if there is an error in the request
    if(!errors.isEmpty()){
        if(updateImage)
            // if there where an error then delete the stored image
            deleteAfterMulter(updateImage.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()[0].msg
        });
    }
        
    // get the employee and update his data
    Employee.findOne({where: { id: updteEmployeeId}})
    .then(employee => {
        // save an instance of the employee to be used later
        tempEmployee = employee;
        // hash the updated password
        return bcrypt.hash(updatedPassword, 12);
    })
    .then(hashedPassword => {
        if(updateImage){
            // remove the old image if it was updated
            deleteAfterMulter(tempEmployee.image_url);
            tempEmployee.image_url = updateImage.path;
        }
        
        // save the new employee data
        tempEmployee.name = updatedName;
        tempEmployee.email = updatedEmail;
        tempEmployee.password = hashedPassword;
        tempEmployee.phone_number = updatedPhone_number;
        tempEmployee.address = updatedAddress;
        return tempEmployee.save();
    })
    .then(updatedEmployee => {
        // get the employee_role of the current employee for updating its data too
        return EmployeeRole.findOne({where: {employeeId: updatedEmployee.id}});
    })
    .then(employeeRole => {
        // save the new employee_role data
        employeeRole.salary = updatedSalary;
        employeeRole.employee_of_the_month = updatedEmployeeOfTheMonth;
        employeeRole.roleId = updatedRole;
        return employeeRole.save();
    })
    .then(employeeRole => {
        return res.status(200).json({
            operation: 'Succeed',
            updatedEmployee: tempEmployee,
            updatedRole: employeeRole
        })
    })
    .catch(() => {
        if(updateImage)
            // if there where an error then delete the stored image
            deleteAfterMulter(updateImage.path);
        return res.status(404).json({
            operation: 'Failed',
            message: 'Employee Not Found'
        });
    });
};

exports.deleteEmployee = (req, res, next) => {
    const employeeId = req.body.employeeId;

    Employee.findOne({where: {id: employeeId}})
        .then(employee => {
            // delete the employee image
            deleteAfterMulter(employee.image_url);
            
            return Employee.destroy({where: {id: employee.id}});
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                employee: 'Employee Deleted Successfully'
            })
        })
        .catch(() => {
            return res.status(404).json({
                operation: 'Failed',
                message: 'Employee Not Found'
            });
        });
};