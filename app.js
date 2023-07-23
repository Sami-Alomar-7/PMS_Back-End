// use the express framework
const express = require('express');
const app = express();

//  use the .env file
require('dotenv').config();

// required meiddlware for resiving and sending data
const bodyParser = require('body-parser');

// for scheduling a function to run every specifice time
const schedule = require('node-schedule');

// the connection instance
const sequelize = require('./Util/database');

// Models
    // Auth Model
        const Employee = require('./Models/AuthModels/Employee');
        const EmployeeRole = require('./Models/AuthModels/EmployeeRole');
        const Role = require('./Models/AuthModels/Role');
    // Company Model
        const Company = require('./Models/CompaniesModels/CompanyModel');
        const CompanyType = require('./Models/CompaniesModels/CompanyType');
        const CompanyProductItem = require('./Models/CompaniesModels/CompanyProductItemModel');
        const CompanyRawItem = require('./Models/CompaniesModels/CompanyRawItemModel');
    // Account Model
        const Account = require('./Models/AccountModels/AccountModel');
        const Debt = require('./Models/AccountModels/DebtModel');
    // Buy Order Model
        const BuyOrder = require('./Models/OrdersModels/BuyOrderModels/BuyOrderModel');
        const BuyOrderItem = require('./Models/OrdersModels/BuyOrderModels/BuyOrderItemsModel');
        const BuyRawOrderItem = require('./Models/OrdersModels/BuyOrderModels/BuyRawOrderItemsMode');
    // Bill Model
        const Bill = require('./Models/BillsModels/BillModel');
        const BillProductItem = require('./Models/BillsModels/BillProductItemModel');
        const BillRawItem = require('./Models/BillsModels/BillRawItemModel');
    // Product Model
        const Product = require('./Models/ProductsModels/ProductModel');
        const Category = require('./Models/ProductsModels/CategoryModel');
        const Type = require('./Models/ProductsModels/TypeModel');
        const Scince = require('./Models/ProductsModels/ScinceModel');
    // Raw Model
        const Raw = require('./Models/RawsModels/RawModel');
        const RawCategory = require('./Models/RawsModels/CategoryModel');
    // Laboratory Model
        const Laboratory = require('./Models/LaboratoriesModels/LaboratoryModel');
        const LaboratoryOrder = require('./Models/LaboratoriesModels/LaboratoryOrderMode');
        const LaboratoryRaw = require('./Models/LaboratoriesModels/LaboratoryRawModel');
        const LaboratoryProduct = require('./Models/LaboratoriesModels/LaboratoryProductModel');
        const LaboratoryProductRaw = require('./Models/LaboratoriesModels/LaboratoryProductsRawsModel');
    // Report Model
        const Report = require('./Models/ReportsModels/ReportModel');

// Routes
    const authRoute = require('./Routes/authRoute');
    const employeeRoute = require('./Routes/employeeRoutes');
    const companyRoute = require('./Routes/CompaniesRoutes/companyRoutes');
    const laboratoryRoute = require('./Routes/LaboratoriesRoutes/LaboratoryRoute');
    const reportRoute = require('./Routes/ReportsRoutes/ReportRoute');

// Middleware
    // Multer for file uploading 
    const multer = require('multer');
    // Request Rate Limiter for managing throttling
    const rateLimiter = require('express-rate-limit');
    // Hemlmet for managing the HTTP headers
    const helmet = require('helmet');
    // Permissions-Policy is a fork of helmet for adding the Permission-Policy header and manage it
    const permissionsPolicy = require('permissions-policy')
    // for forwarding the errors to one place and mange it in there
    const ErrorsMiddleware = require('./Middleware/Errors/ErrorsMiddleware');

// Helper
    // for setting up the required data into the database
    const setupDataset = require('./Helper/setupDatabase/setupDatabase');
    // checking for the authorization to determine the appropriate request rate limit
    const RateLimiterCheck = require('./Helper/RateLimiterCheck');
    // for updating the report table whit the expired products and raw materials
    const reportUpdate = require('./Helper/reportUpdate');

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

// Limit the request rate bassed on the authoriztaion
const authRateLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: (req, res) => {
        if(RateLimiterCheck(req, res))
            return 100;
        return 10;
    },
    message: 'Too many attempts from this IP, please try again after 10 minutes',
    standardHeaders: true, 
    legacyHeaders: false, 
});

// using middlewares for improving the security
app.use('/api',[
    // Applyed the helmet Middleware for improve the security by setting HTTP headers and prevent some
    helmet({
        strictTransportSecurity: {
            maxAge: 31536000,
        }
    }),
    // Applyed the permission-policy header to prevent any potential abuse or misuse
    permissionsPolicy({
        features: {
            geolocation: ['none'],
            camera: ['none'], 
            microphone: ['none']
        }
    }),
    // Applyed the api-request-limiter middleawre to protect the application from any type of 
    // fake requests or other brute force attacks
    authRateLimiter
]);

// schedule to check every day at midnight for updating the reports
const scheduleReport = schedule.scheduleJob('00 00 * * *', () => {
    // update the reports with the new products and raw materials which has exceeded the expiration limit
    reportUpdate();
})

// Useing the Auth Routes
app.use('/api/auth', authRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/company', companyRoute);
app.use('/api/laboratory', laboratoryRoute);
app.use('/api/report', reportRoute);
app.use('/api', ErrorsMiddleware);

// Defines the models and its associations
    // Employees ---> (Employee_Roles) <--- Roles
        Employee.belongsToMany(Role, { through: EmployeeRole });
        Role.belongsToMany(Employee, { through: EmployeeRole });
        Employee.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Employee);
        Role.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Role);
// Companies
    // Companies <--- CompaniesTypes
        CompanyType.hasMany(Company);
        Company.belongsTo(CompanyType);
    // Companies ---> Accounts
        Company.hasMany(Account, { onDelete: 'cascade' });
        Account.belongsTo(Company);
    // Account ---> (Debt) <--- Buy_Orders
        Account.belongsToMany(BuyOrder, { through: Debt, onDelete: 'cascade'});
        BuyOrder.belongsToMany(Account, { through: Debt, onDelete: 'cascade'});
        Account.hasMany(Debt);
        Debt.belongsTo(Account);
        BuyOrder.hasMany(Debt);
        Debt.belongsTo(BuyOrder);
    // Companies ---> BuyOrders
        Company.hasMany(BuyOrder);
        BuyOrder.belongsTo(Company);
// Buy_Orders
    // Buy_Orders ---> (Buy_Orders_Items) <--- Company_Product_Items
        BuyOrder.belongsToMany(CompanyProductItem, { through: BuyOrderItem, onDelete: 'cascade' });
        CompanyProductItem.belongsToMany(BuyOrder, { through: BuyOrderItem });
        BuyOrder.hasMany(BuyOrderItem);
        BuyOrderItem.belongsTo(BuyOrder);
        CompanyProductItem.hasMany(BuyOrderItem);
        BuyOrderItem.belongsTo(CompanyProductItem);
    // Buy_Orders ---> (Buy_Raw_Orders_Items) <--- Company_Raw_Items
        BuyOrder.belongsToMany(CompanyRawItem, { through: BuyRawOrderItem, onDelete: 'cascade' });
        CompanyRawItem.belongsToMany(BuyOrder, { through: BuyRawOrderItem });
        BuyOrder.hasMany(BuyRawOrderItem);
        BuyRawOrderItem.belongsTo(BuyOrder);
        CompanyRawItem.hasMany(BuyRawOrderItem);
        BuyRawOrderItem.belongsTo(CompanyRawItem);
// Bills
    // Buy_Orders ---> Bills
        BuyOrder.hasMany(Bill, { onDelete: 'cascade' });
        Bill.belongsTo(BuyOrder);
    // Bills ---> (Bill_Products_Items) <--- Buy_Orders_Items
        Bill.belongsToMany(BuyOrderItem, { through: BillProductItem, onDelete: 'cascade' });
        BuyOrderItem.belongsToMany(Bill, { through: BillProductItem, onDelete: 'cascade' });
        Bill.hasMany(BillProductItem);
        BillProductItem.belongsTo(Bill);
        BuyOrderItem.hasMany(BillProductItem);
        BillProductItem.belongsTo(BuyOrderItem);
    // Bills ---> (Bill_Raws_Items) <--- Buy_Raw_Orders_Items
        Bill.belongsToMany(BuyRawOrderItem, { through: BillRawItem, onDelete: 'cascade' });
        BuyRawOrderItem.belongsToMany(Bill, { through: BillRawItem, onDelete: 'cascade' });
        Bill.hasMany(BillRawItem);
        BillRawItem.belongsTo(Bill);
        BuyRawOrderItem.hasMany(BillRawItem);
        BillRawItem.belongsTo(BuyRawOrderItem);
    // Laboratories ---> Laboratory_Orders
        Laboratory.hasMany(LaboratoryOrder);
        LaboratoryOrder.belongsTo(Laboratory);
    // Bill_Raws_Items --- Laboratory_Raws
        BillRawItem.hasOne(LaboratoryRaw);
        LaboratoryRaw.belongsTo(BillRawItem);
    // Laboratory_Raws ---> Reports
        LaboratoryRaw.hasMany(Report);
        Report.belongsTo(LaboratoryRaw);
    // Laboratory_Orders ---> Laboratory_Products
        LaboratoryOrder.hasMany(LaboratoryProduct);
        LaboratoryProduct.belongsTo(LaboratoryOrder);
    // Laboratory_Products ---> (Laboratory_Products_Raws) <--- Laboratory_Raws
        LaboratoryProduct.belongsToMany(LaboratoryRaw, { through: LaboratoryProductRaw, onDelete: 'cascade'});
        LaboratoryRaw.belongsToMany(LaboratoryProduct, { through: LaboratoryProductRaw });
        LaboratoryProduct.hasMany(LaboratoryProductRaw, { onDelete: 'cascade' });
        LaboratoryProductRaw.belongsTo(LaboratoryProduct);
        LaboratoryRaw.hasMany(LaboratoryProductRaw);
        LaboratoryProductRaw.belongsTo(LaboratoryRaw);
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
            const httpServer = app.listen(process.env.SERVER_PORT);
            const io = require('./Util/socket').init(httpServer);
            io.on('connection', socket => {
                io.emit('do', {message: 'Yes'});
            });
        })
        .then(() => {
            console.log('Running on Port: ' + process.env.SERVER_PORT)
        }
        )
        .catch(err => 
            console.log(err)
        );