// Models 
const Company = require('../Models/CompaniesModels/CompanyModel');

// using the .env file
require('dotenv').config();

// for the requests which failes not to fill the storage with unwanted files
const deleteAfterMulter = require('../Helper/deleteAfterMulter');

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// for hashing and creating tokens
const bcrypt = require('bcryptjs');

exports.getAllCompanies = (req, res, next) => {
    Company.findAll({limit: 6})
    .then(company => {
        if(!company)
            return res.status(404).json({
                operation: 'Failed',
                message: 'Could Not Find The Company'
            })
        return res.status(200).json({
            operation: 'Succeed',
            companies: company
        })
    })
    .catch(err => {
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.getCompanyProfile = (req, res, next) => {
    const companyId = param.companyId;

    Company.findOne({where: { id: companyId}})
    .then(company => {
        if(!company)
            return res.status(404).json({
                operation: 'Failed',
                message: 'Could Not Find The Company'
            })
            
        return res.status(200).json({
            operation: 'Succeed',
            company: company
        })
    })
    .catch(err => {
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.postAddCompany = (req, res, next) =>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const location = req.body.location;
    const type = req.body.type;
    const image = req.file;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty()){
        deleteAfterMulter(image.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors[0].msg
        });
    }
    
    // hash the password and store the new record
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const company = new Company({
                name: name,
                email: email,
                password: hashedPassword,
                location: location,
                type: type,
                phone_number: phone_number
            });
            return company.save()
        })
        .catch(err => {
            deleteAfterMulter(image.path);
            return res.status(400).json({
                message: err
            });
        })
};

exports.putUpdateProfile = (req, res, next) => {
    const updateCompanyId = req.body.updateCompanyId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const updatedPhone_number = req.body.phone_number;
    const updatedLocation = req.body.location;
    const updatedType = req.body.type;
    const updateImage = req.file;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty()){
        deleteAfterMulter(updateImage.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors[0].msg
        });
    }
        
    // get the Company and update his data
    Company.findOne({where: { id: updateCompanyId}})
    .then(company => {
        if(!company)
            return res.status(404).json({
                operation: 'Failed',
                message: 'Company Not Found'
            });
            
        company.name = updatedName;
        company.email = updatedEmail;
        company.password = updatedPassword;
        company.phone_number = updatedPhone_number;
        company.location = updatedLocation;
        company.type = updatedType;
        
        return company.save();
    })
    .then(updatedCompany => {
        return res.status(200).json({
            operation: 'Succeed',
            updatedCompany: updatedCompany
        })
    })
    .catch(err => {
        deleteAfterMulter(updateImage.path);
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    });
};

exports.deleteCompany = (req, res, next) => {
    const companyId = req.body.companyId;
    
    Company.destroy({where: {id: companyId}})
        .then(deletedCompany => {
            if(!deletedCompany)
                return res.status(404).json({
                    operation: 'Failed',
                    message: 'Company Not Found'
                });
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Company Deleted Successfully'
            });
        })
        .catch(err => {
            return res.status(400).json({
                operation: 'Failed',
                message: err
            });
        });
};