// Models 
const Company = require('../../Models/CompaniesModels/CompanyModel');
const Type = require('../../Models/CompaniesModels/CompanyType');

// using the .env file
require('dotenv').config();

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// Helper
    // for the requests which failes not to fill the storage with unwanted files
    const deleteAfterMulter = require('../../Helper/deleteAfterMulter');

// number of companies which wiil be sent with a single request
const COMPANIES_PER_REQUEST = 10;

exports.getAllCompanies = (req, res, next) => {
    // get the page number if not then we are in the first one
    const page = req.query.page || 1;

    Company.findAll({
        offset: (page-1) * COMPANIES_PER_REQUEST,
        limit: COMPANIES_PER_REQUEST,
        include: {
            model: Type,
            attributes: ['name']
        }
    })
    .then(company => {
        return res.status(200).json({
            operation: 'Succeed',
            companies: company
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Companies Not Found'
        })
    })
};

exports.getSpecificeCompany = (req, res, next) => {
    const companyId = req.body.companyId;

    Company.findOne({
        where: { id: companyId},
        include: {
            model: Type,
            attributes: ['name']
        }
    })
    .then(company => {
        return res.status(200).json({
            operation: 'Succeed',
            company: company
        })
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Company Not Found'
        })
    })
};

exports.putUpdateProfile = (req, res, next) => {
    const updateCompanyId = req.body.updateCompanyId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPhone_number = req.body.phone_number;
    const updatedLocation = req.body.location;
    const updatedType = req.body.type;
    const updateImage = req.file;
    const errors = validationResult(req);

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
    // get the Company and update its data
    Company.findOne({where: { id: updateCompanyId}})
        .then(company => {
            if(updateImage){
                // remove the old image if it was updated
                deleteAfterMulter(company.image_url);
                company.image_url = updateImage.path;
            }
            
            company.name = updatedName;
            company.email = updatedEmail;
            company.phone_number = updatedPhone_number;
            company.location = updatedLocation;
            company.companiesTypeId = updatedType;
            
            return company.save();
        })
        .then(company => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Updated Successfully',
                company: company
            })
        })
        .catch(() => {
            if(updateImage)
                // if there where an error then delete the stored image
                deleteAfterMulter(updateImage.path);
            return res.status(404).json({
                operation: 'Failed',
                message: 'Company Noy Found'
            })
        });
};

exports.deleteCompany = (req, res, next) => {
    const companyId = req.body.companyId;
    
    Company.findOne({where: {id: companyId}})
    .then(company => {
        // delete the company image
        deleteAfterMulter(company.image_url);

        return Company.destroy({where: {id: company.id}})
    })
    .then(() => {
        return res.status(200).json({
            operation: 'Succeed',
            message: 'Company Deleted Successfully'
        });
    })
    .catch(() => {
        return res.status(404).json({
            operation: 'Failed',
            message: 'Company Not Found'
        });
    });
};