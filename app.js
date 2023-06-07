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
const Employee = require('./Models/AuthModel/Employee');
const EmployeeRole = require('./Models/AuthModel/EmployeeRole');
const Role = require('./Models/AuthModel/Role');

// Routes
const authRoute = require('./Routes/authRoute');
const employeeRoute = require('./Routes/employeeRoutes');

// middlware that parses the incoming request body as JSON
app.use(bodyParser.json());

// middlware for enable CORES for all requests 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Useing the Auth Routes
app.use('/api/auth', authRoute);
app.use('/api/employee', employeeRoute);

// Defines the relationships
    // Employees ---> (Employee_Roles) <--- Roles
        Employee.belongsToMany(Role, { through: EmployeeRole });
        Role.belongsToMany(Employee, { through: EmployeeRole });
        Employee.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Employee);
        Role.hasMany(EmployeeRole);
        EmployeeRole.belongsTo(Role);

// Connecting to the database
sequelize
    .sync()
        .then(() => {
            console.log('Connected To pms Database Successfully..!');
            app.listen(process.env.SERVER_PORT);
        })
        .then(() =>
            console.log('Running on Port: ' + process.env.SERVER_PORT)
        )
        .catch(err => 
            console.log(err)
        );