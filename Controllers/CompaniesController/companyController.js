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
    // for detecting if the image was the default one
        const isDefaultImage = require('../../Helper/isDefaultImage');
    // for applying the advanced search using string-similarity
    const similarSearch = require('../../Helper/retriveSimilarSearch');

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
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
};

exports.getSpecificeCompany = (req, res, next) => {
    const companyId = req.body.companyId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })

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
    .catch(err => {
        next({
            status: 500,
            message: err.message
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
        // if there where an error then delete the stored image
        if(updateImage)
            if(!isDefaultImage(updateImage.path))
                deleteAfterMulter(updateImage.path);
        return next({
            status: 400,
            message: errors.array()[0].msg
        })
    }
    // get the Company and update its data
    Company.findOne({where: { id: updateCompanyId}})
        .then(company => {
            // remove the old image if it was updated
            if(updateImage){
                if(!isDefaultImage(company.image_url))
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
        .catch(err => {
            // if there where an error then delete the stored image
            if(updateImage)
                if(!isDefaultImage(updateImage.path))
                    deleteAfterMulter(updateImage.path);
            next({
                status: 500,
                message: err.message
            })
        });
};

exports.getCompnayByType = (req, res, next) => {
    const typeId = req.body.typeId;
    const page = req.query.page || 1;
    Company.findAll({
        offset: (page-1) * COMPANIES_PER_REQUEST,
        limit: COMPANIES_PER_REQUEST,
        where: {companiesTypeId: typeId},
        include: Type
    })
    .then(companies => {
        return res.status(200).json({
            operation: 'Succeed',
            companies: companies
        })
    })
    .catch(err => {
        next({
            status: 500,
            message: err.message
        })
    })
}

exports.postAdvancedCompaniesSearch = (req, res, next) => {
    // get the searched string from the request body
    const searchName = req.body.name;
    // get all the compnies using raw for not getting a model instance
    Company.findAll({raw: true})
        .then(companies => {
            // send the comapnies objects with the searched string to get the most similares comapnies to that search
            const resultArray = similarSearch(companies, searchName);
            // return the search result with the similar objects from the most similar to the less
            return res.status(200).json({
                operation: 'Succeed',
                searchResult: resultArray
            })
        })
        .catch(err => {
            // jump into the error middleware to handle the error and send the appropriate message
            next({
                status: 500,
                message: err.message
            })
        })
};

exports.deleteCompany = (req, res, next) => {
    const companyId = req.body.companyId;
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next({
            status: 400,
            message: errors.array()[0].msg
        })

    Company.findOne({where: {id: companyId}})
        .then(company => {
            // delete the company image if it wasn't the default
            if(!isDefaultImage(company.image_url))
                deleteAfterMulter(company.image_url);

            return Company.destroy({where: {id: company.id}})
        })
        .then(() => {
            return res.status(200).json({
                operation: 'Succeed',
                message: 'Company Deleted Successfully'
            });
        })
        .catch(err => {
            next({
                status: 500,
                message: err.message
            })
        })
};