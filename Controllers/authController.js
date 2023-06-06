// Models 
const Employee = require('../Models/AuthModel/Employee');
const EmployeeRole = require('../Models/AuthModel/EmployeeRole');
const Role = require('../Models/AuthModel/Role');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// for hashing and creating tokens
const bcrypt = require('bcryptjs');
const tokenHelper = require('../Helper/tokens');
const codeHelper = require('../Helper/code');

// for sending mailes
const mailsHelper = require('../Helper/mails');

// 
const { Op } = require('sequelize');

// POST - Register
exports.postRegister = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const gender = req.body.gender;
    const role = req.body.role;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty())
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()
        });
    
    // hash the password and store the new record
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const employee = new Employee({
                name: name,
                email: email,
                password: hashedPassword,
                address: address,
                gender: gender,
                phone_number: phone_number
            });
            return employee.save()
                .then(employee => {
                    const employeeRole = new EmployeeRole({
                        employeeId: employee.id,
                        roleId: role,
                    })
                    return employeeRole.save();
                })
                .then(employeeRole => {
                    return res.status(200).json({
                        message: 'Succeed',
                        employee: employee,
                        employeeRole: employeeRole
                    });
                })
        })
        .catch(err => {
            return res.status(400).json({
                message: err
            });
        })
};

exports.getRole = (req, res, next) => {
    Employee.findOne({
        where: { email: req.body.email },
        include: Role
    })
    .then(employee => {
        res.status(200).json({
            employee: employee,
        });
    })
    .catch(err => console.log(err));
};

exports.postLogin = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    //check if there is an error 
    if(!errors.isEmpty())
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array(),
        });
    
    // find the employee with the given e-mail
    Employee.findOne({where: {email: email}})
        .then(employee => {
            if(!employee)
                return res.status(401).json({
                    operation: 'Failed',
                    message: 'Invalid E-mail'
                });
            // Compare with the hashed password using bcrypt pakage
            return bcrypt.compare(password, employee.password)
                .then(doMatch => {
                    if(!doMatch)
                        return res.status(401).json({
                            operation: 'Failed',
                            message: 'Wrong Password'
                        });
                    
                    // generate the code then store it to the logged in user
                    const {code, expiry} = codeHelper.generat();
                    employee.token = code;
                    employee.token_expiration = expiry;
                    
                    return employee.save();
                })
                .then(employee => {
                    const code = employee.token;
                    // sending a mail for verifing the login attempt
                    return mailsHelper.send(email, code, 'verify');
                })
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                mail: 'Mail Sent',
                employee: email
            })
        })
        .catch(err => {
            return res.status(400).json({
                operation: 'Failed',
                message: err
            });
        });
    };
    
exports.postVerifyLoggin = (req, res, next) => {
    // get the code from the request body
    const code = req.body.code;
        
    if(!code)
    return res.status(404).json({
        operation: 'Failed',
        message: 'Code Not Found'
    });
        
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
            return res.status(401).json({
                operation: 'Failed',
                message: 'Wrong Code Or Too Late'
            });
    
        // mark the employee as logged in
        employee.statu = true;
        return employee.save()
            .then(employee => {
                // create the token and store it 
                const {token, expiry} = tokenHelper.generat(employee);
                employee.token = token;
                employee.token_expiration = expiry;
                    
                return employee.save()
            })
            .then(employee => {
                return res.status(200).json({
                    operation: 'Succeed',
                    message: 'Logged In Successfully',
                    employee: employee,
                    token: 'Bearer ' + employee.token
                })
            })
    })
    .catch(err => {
        return res.status(401).json({
            operation: 'Failed',
            message: err
        })
    });
};
    
exports.postResetPassword = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty())
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()
        });
        
    // find the employee with the given email
    Employee.findOne({where: {email: email}})
        .then(employee => {
            if(!employee)
                return res.status(401).json({
                    operation: 'Failed',
                    message: 'Invalid E-mail'
                });
            
            // generate the code then store it to the logged in user
            const {code, expiry} = codeHelper.generat();
            employee.token = code;
            employee.token_expiration = expiry;

            return employee.save();
        })
        .then(employee => {
            const code = employee.token;
            // sending a mail for verifing the login attempt
            return mailsHelper.send(email, code, 'reset');
        })            
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                mail: 'Mail Sent'
            })
        })
        .catch(err => {
            return res.status(400).json({
                operation: 'Failed',
                message: err
            });
        });
};

exports.postVerifyRestPassword = (req, res, next) => {
    // get the code from the request body
    const code = req.body.code;

    if(!code)
        return res.status(404).json({
            operation: 'Failed',
            message: 'Code Not Found'
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
            return res.status(401).json({
                operation: 'Failed',
                message: 'Wrong Code Or Too Late'
            });
            
        // remove the code and the expiration date from the database
        employee.token = null;
        employee.token_expiration = null;
        
        return employee.save();
    })
    .then(employee => {
        return res.status(200).json({
            operation: 'Succeed',
            message: 'Code Submitted Successfully',
            email: employee.email
        });
    })
    .catch(err => {
        return res.status(401).json({
            operation: 'Failed',
            message: err
        });
    });
};

exports.postNewPassword = (req, res, next) => {
    // get the data from the request body
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const errors = validationResult(req);

    //check if there is an error 
    if(!errors.isEmpty())
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array(),
        });
    
    let employeeTemp;
    Employee.findOne({where: {email: email}})
        .then(employee => {
            if(!employee)
                return res.status(401).json({
                    operation: 'Failed',
                    message: 'There is No User With Such E-Mail'
                });
            
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
            console.log(err)
            return res.status(401).json({
                operation: 'Failed',
                message: err
            })
        });
};