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
const tokenHelper = require('../Helper/tokens');
const codeHelper = require('../Helper/code');

// Helper
    // for sending mailes
    const mailsHelper = require('../Helper/mails');
    // for sending reports notifications after logging in
    const sendReportsNotifications = require('../Helper/sendReportsNotifications');

// for comparision operations in database
const { Op } = require('sequelize');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../Helper/deleteAfterMulter');
    // for the files reaching
    const path = require('path');
    // for dtermine whether the image is the default one or not
    const isDefaultImage = require('../Helper/isDefaultImage');

// POST - Register
exports.postRegister = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const gender = req.body.gender;
    const role = 1;
    const image = req.file;
    const errors = validationResult(req);
    let imagePath = '';

    // check if there is an error in the request
    if(!errors.isEmpty()){
        // if there where an error then delete the stored image
        if(image)
            if(!isDefaultImage(image.path))
                deleteAfterMulter(image.path);  
            return next({
                status: 400, 
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
                .then(employee => {
                    const employeeRole = new EmployeeRole({
                        employeeId: employee.id,
                        roleId: role,
                        expiration_limit: 14,
                        run_out_limit: 10,
                        employee_of_the_month: false
                    })
                    return employeeRole.save();
                })
                .then(employeeRole => {
                    return res.status(200).json({
                        operation: 'Succeed',
                        employee: employee,
                        employeeRole: employeeRole
                    });
                })
        })
        .catch(err => {
            // if there where an error then delete the stored image
            if(image)
                if(!isDefaultImage(imagePath))
                    deleteAfterMulter(image.path);
            next({
                status:500, 
                message: err.message
            });
        })
};

exports.getRole = (req, res, next) => {
    Employee.findOne({
        where: { email: req.body.email },
        include: Role
    })
    .then(employee => {
        return res.status(200).json({
            employee: employee,
        });
    })
    .catch(err => {
        next({
            status:500, 
            message: err.message
        });
    });
};

exports.postLogin = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    //check if there is an error 
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        });
    
    // find the employee with the given e-mail
    Employee.findOne({where: {email: email}})
        .then(employee => {
            // Compare with the hashed password using bcrypt pakage
            return bcrypt.compare(password, employee.password)
                .then(doMatch => {
                    if(!doMatch)
                        throw new Error('Wrong Password');
                    
                    // generate the code then store it to the logged in user
                    const {code, expiry} = codeHelper.generat();
                    employee.token = code;
                    employee.token_expiration = expiry;
                    
                    return employee.save();
                })
                .then(employee => {
                    const code = employee.token;
                    /*
                    *   there is a limit just 100 per month so i am commenting this now during development procces
                    *   will be set back when the project is ready
                    */
                    // sending a mail for verifing the login attempt
                    //return mailsHelper.send(email, code, 'verify');
                })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Mail Sent'
            })
        })
        .catch(err => {
            next({
                status: 500, 
                message: err.message
            });
        })
};
    
exports.postVerifyLoggin = (req, res, next) => {
    // get the code from the request body
    const code = req.body.code;
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        });
        
    Employee.findOne({
        where: {
            token: code,
            token_expiration: {
                [Op.gt]: Date.now()
            }
        },
        include: {
            model: EmployeeRole,
            attributes: ['roleId']
        }
    })
    .then(employee => {
        if(!employee)
            throw new Error('Wrong Code, Or Too Late');
        
        // create the token and send it 
        const {token, expiry} = tokenHelper.generat(employee);

        // mark the employee as logged in and save the token and its expiration
        employee.statu = true;
        employee.token = token;
        employee.token_expiration = expiry * 1000;
        
        return employee.save();
    })
    .then(employee => {
        // for sending the unreaded reports as notifications to the logged in employee or admin
        sendReportsNotifications();
        return res.status(200).json({
            operation: 'Succeed',
            message: 'Logged In Successfully',
            employee: employee,
            token: 'Bearer ' + employee.token
        });
    })
    .catch(err => {
        next({
            status: 500, 
            message: err.message
        })
    })
};
    
exports.postResetPassword = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        });
        
    // find the employee with the given email
    Employee.findOne({where: {email: email}})
        .then(employee => {
            if(!employee)
                throw new Error('Invalid E-mail');
            
            // generate the code then store it to the logged in user
            const {code, expiry} = codeHelper.generat();
            employee.token = code;
            employee.token_expiration = expiry;

            return employee.save();
        })
        .then(employee => {
            const code = employee.token;
            /*
            *   there is a limit just 100 per month so i am commenting this now during development procces
            *   will be set back when the project is ready
            */
            // sending a mail for verifing the login attempt
            // return mailsHelper.send(email, code, 'reset');
        })            
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Mail Sent'
            })
        })
        .catch(err => {
            next({
                status: 500, 
                message: err.message
            })
        })
};

exports.postVerifyRestPassword = (req, res, next) => {
    // get the code from the request body
    const code = req.body.code;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        });
        
    // find the employee with that code and check if the 10 min passed
    Employee.findOne({
        where: {
            token: code,
            token_expiration: {
                [Op.gt]: Date.now()
            }
        }
    })
    .then(employee => {
        if(!employee)
            throw new Error('Wrong Code, Or Too Late')
            
        // remove the code and the expiration date from the database
        employee.token = null;
        employee.token_expiration = null;
        
        return employee.save();
    })
    .then(() => {
        return res.status(200).json({
            operation: 'Succeed',
            message: 'Code Submitted Successfully'
        });
    })
    .catch(err => {
        next({
            status: 500, 
            message: err.message
        })
    })
};

exports.postNewPassword = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const errors = validationResult(req);

    //check if there is an error 
    if(!errors.isEmpty())
        return next({
            status: 400, 
            message: errors.array()[0].msg
        });
    
    let employeeTemp;
    Employee.findOne({where: {email: email}})
        .then(employee => {
            employeeTemp = employee;
            
            // compare the two passwrod to make sure it's not the same current one
            return bcrypt.compare(newPassword, employee.password);
        })
        .then(doMatch => {
            if(doMatch)
                return Promise.reject('Your New Password Cannot Be Your Old Password');
            
            // hash the new passord then store it in the database
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            // set the new password for the employee
            employeeTemp.password = hashedPassword;
            
            return employeeTemp.save();
        })
        .then(employee => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Password Updated Successfully',
                employee: employee
            })
        })
        .catch(err => {
            next({
                status: 500, 
                message: err.message
            })
        })
};

exports.postLogout = (req, res, next) => {
    const employeeId = req.employeeId;
    
    // if there were no employee id in the request that means the employee not logged in
    if(!employeeId)
        return next({
            status: 401, 
            message: 'Unauthorized'
        });
    
    Employee.finOne({where: {id: employeeId}})
        .then(employee => {        
            // update the status and delete the token and its expiration
            employee.statu = false;
            employee.token = null;
            employee.token_expiration = null;

            return employee.save();
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                meesage: 'Employee Logged Out'
            });
        })
        .catch(err => {
            next({
                status: 500, 
                message: err.message
            })
        })
};