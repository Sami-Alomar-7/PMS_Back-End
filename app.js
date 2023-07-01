// use the express framework
const express = require('express');
const app = express();

//  use the .env file
require('dotenv').config();

// required meiddlware for resiving and sending data
const bodyParser = require('body-parser');

// the connection instance
const sequelize = require('./Util/database');

// Models
    // Auth Model
        const Employee = require('./Models/AuthModels/Employee');
        const EmployeeRole = require('./Models/AuthModels/EmployeeRole');
        const Role = require('./Models/AuthModels/Role');
    // Company Model
        const Company = require('./Models/CompaniesModels/CompanyModel');
        const Debt = require('./Models/CompaniesModels/DebtModel');
        const CompanyProductItem = require('./Models/CompaniesModels/CompanyProductItemModel');
        const CompanyRawItem = require('./Models/CompaniesModels/CompanyRawItemModel');
    // Product Model
        const Product = require('./Models/ProductsModels/ProductModel');
        const Category = require('./Models/ProductsModels/CategoryModel');
        const Type = require('./Models/ProductsModels/TypeModel');
        const Scince = require('./Models/ProductsModels/ScinceModel');
    // Raw Model
        const Raw = require('./Models/RawsModels/RawModel');
        const RawCategory = require('./Models/RawsModels/CategoryModel');


// Routes
const authRoute = require('./Routes/authRoute');
const employeeRoute = require('./Routes/employeeRoutes');
const companyRoute = require('./Routes/CompaniesRoutes/companyRoutes');

// Middleware
    // Multer for file uploading 
    const multer = require('multer');

// Helper
    // for setting up the required data into the database
    const setupDataset = require('./Helper/setupDatabase/setupDatabase');

// middlware that parses the incoming request body as JSON
app.use(bodyParser.json());

// middlware for enable CORES for all requests 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//  Setting the images storage settings using multer middleware
const imageStorage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/images/');
    },
    filename: (req, file, callBack) => {
        callBack(null, Date.now().toString() + '-' + file.originalname);
    }
});

//  Setting a filter to detict the image type
const imageFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true);
    cb(null, false);
};

// Setting multer middleware to all routes
const upload = multer({storage: imageStorage, fileFilter: imageFilter});
app.use(upload.single('image'));

// Useing the Auth Routes
app.use('/api/auth', authRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/company', companyRoute);

// Defines the models and its associations
    // Employees ---> (Employee_Roles) <--- Roles
        Employee.belongsToMany(Role, { through: EmployeeRole });
        Role.belongsToMany(Employee, { through: EmployeeRole });
        Employee.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Employee);
        Role.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Role);
// Companies
    // Companies ---> Debts
        Company.hasMany(Debt);
        Debt.belongsTo(Company);
// Products
    // Categories ---> Products
        Category.hasMany(Product);
        Product.belongsTo(Category);
    // Types ---> Products
        Type.hasMany(Product);
        Product.belongsTo(Type);
    // Scince ---> Products
        Scince.hasMany(Product);
        Product.belongsTo(Scince);
// Raws
    // rawCategories ---> Raws
        RawCategory.hasMany(Raw);
        Raw.belongsTo(RawCategory);
    // Companies ---> (Company_Product_Item) <--- Products
        Company.belongsToMany(Product, { through: CompanyProductItem });
        Product.belongsToMany(Company, { through: CompanyProductItem });
        Company.hasMany(CompanyProductItem);
        CompanyProductItem.belongsTo(Company);
        Product.hasMany(CompanyProductItem);
        CompanyProductItem.belongsTo(Product);
    // Companies --> (Company_Raw_Item) <--- Raw
        Company.belongsToMany(Raw, { through: CompanyRawItem });
        Raw.belongsToMany(Company, { through: CompanyRawItem });
        Company.hasMany(CompanyRawItem);
        CompanyRawItem.belongsTo(Company);
        Raw.hasMany(CompanyRawItem);
        CompanyRawItem.belongsTo(Raw);

// Connecting to the database
sequelize
    .sync()
        .then(() => {
            console.log('Connected To pms Database Successfully..!');
            // check if there is a required data not set...if so insert it into the database
            return setupDataset()
        })
        .then(setted => {
            if(!setted)
                return new Error('Couldn\'t set the required dataset to the database');
            
            // let the server listen on the chosed port 
            app.listen(process.env.SERVER_PORT);
        })
        .then(() =>
            console.log('Running on Port: ' + process.env.SERVER_PORT)
        )
        .catch(err => 
            console.log(err)
        );