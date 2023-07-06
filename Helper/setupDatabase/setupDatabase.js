// for checking the tables and inserting the main data into it
const setupRole = require('./setupRole');
const setupCompanyType = require('./setupCompanyType');
const setupCompany = require('./setupCompany');
const setupScince = require('./setupScince');
const setupProductCategory = require('./setupProductCategory');
const setupType = require('./setupType');
const setupProduct = require('./setupProduct');
const setupRawCategory = require('./setupRawCategory');
const setupRaw = require('./setupRaw');
const setupCompanyProductItem = require('./setupCompanyProductItem');
const setupCompanyRawItem = require('./setupCompanyRawItem');
const setuoAccount = require('./setupAccount');

module.exports = async () => {
    return new Promise(async (resolve, reject) => {
        const roleSetted = await setupRole();
        const companyTypeSetted = await setupCompanyType();
        const companySetted = await setupCompany();
        const scinceSetted = await setupScince();
        const productCategorySetted = await setupProductCategory();
        const typeSetted = await setupType();
        const productSetted = await setupProduct();
        const rawCategorySetted = await setupRawCategory();
        const rawSetted = await setupRaw();
        const companyProductItemSetted = await setupCompanyProductItem();
        const companyRawItemSetted = await setupCompanyRawItem();
        const accountSetted = await setuoAccount();

        if(roleSetted && companySetted && scinceSetted && productCategorySetted && typeSetted && 
            productSetted && rawCategorySetted && rawSetted && companyProductItemSetted && 
            companyRawItemSetted && companyTypeSetted && accountSetted)
            return resolve(roleSetted && companySetted && scinceSetted && productCategorySetted && typeSetted && 
                productSetted && rawCategorySetted && rawSetted && companyProductItemSetted && 
                companyProductItemSetted && companyTypeSetted && accountSetted);
        else
            return reject('An Error Accuered When Setting Up The Database');
    })
}