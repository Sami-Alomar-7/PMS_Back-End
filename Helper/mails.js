// using the .env file
require('dotenv').config();

const nodemailer = require('nodemailer');

exports.send = (email, code, type) => {
    // Nodemailer Settings for sending mails
    transport = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        auth: {
            user: process.env.NODEMAILER_AUTH_USER,
            pass: process.env.NODEMAILER_AUTH_PASS
        }
    });  

    if(type === 'verify')
        return transport.sendMail({
            from: process.env.NODEMAILER_FROM_EMAIL,
            to: email,
            subject: 'Verfiy Your Login',
            html:
            `<html>
                <head>
                    <style>
                    /* Style the email body */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    /* Style the email container */
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #f0f0f0;
                        border: 1px solid #cccccc;
                    }
                    /* Style the email header */
                    .header {
                        padding: 20px;
                        text-align: center;
                        background-color: #ffffff;
                    }
                    /* Style the email logo */
                    .logo {
                        max-width: 200px;
                        height: auto;
                    }
                    /* Style the email content */
                    .content {
                        padding: 20px;
                        text-align: left;
                        background-color: #ffffff;
                    }
                    /* Style the email title */
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333333;
                        margin-bottom: 10px;
                    }
                    /* Style the email message */
                    .message {
                        font-size: 16px;
                        color: #333333;
                        line-height: 1.5;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                        <img src="" alt="Logo" class="logo">
                        </div>
                        <div class="content">
                        <h1 class="title">Email Verification</h1>
                        <p class="message">Thank you for logging in with us.</p>
                        <p class="message">Please enter the four digit-code below to verify it's you.</p>
                        <p class="message"> ${code} </p>
                        </div>
                    </div>
                </body>
                </html>
                `
        });

    if(type === 'reset')
        return transport.sendMail({
            from: process.env.NODEMAILER_FROM_EMAIL,
            to: email,
            subject: 'Reset Your Password',
            html:
                `
                <html>
                <head>
                    <style>
                    /* Style the email body */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    /* Style the email container */
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #f0f0f0;
                        border: 1px solid #cccccc;
                    }
                    /* Style the email header */
                    .header {
                        padding: 20px;
                        text-align: center;
                        background-color: #ffffff;
                    }
                    /* Style the email logo */
                    .logo {
                        max-width: 200px;
                        height: auto;
                    }
                    /* Style the email content */
                    .content {
                        padding: 20px;
                        text-align: left;
                        background-color: #ffffff;
                    }
                    /* Style the email title */
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333333;
                        margin-bottom: 10px;
                    }
                    /* Style the email message */
                    .message {
                        font-size: 16px;
                        color: #333333;
                        line-height: 1.5;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                        <img src="" alt="Logo" class="logo">
                        </div>
                        <div class="content">
                            <h1 class="title">Reset Your Password</h1>
                            <p class="message">if you did not do any operation then ignore the mail</p>
                            <p class="message">Please enter the four digit-code below to reset your password.</p>
                            <p class="message"> ${code} </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
};