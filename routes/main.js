var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var smtpTransport = require("nodemailer-smtp-transport");
var smtpPool = require('nodemailer-smtp-pool');
var app = express();
var cors = require('cors');
var xoauth2 = require('xoauth2');
var wellknown = require('nodemailer-wellknown');
var swig = require('swig');
var template = swig.compileFile(__dirname + '/../templates/bugreport.html');



var transporter1 = nodemailer.createTransport("SMTP",{
    service: 'gmail',
    auth: {
    XOAuth2: {
      user: "alpinelabsemails@gmail.com", // Your gmail address.
      clientId: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
      refreshToken: process.env.googleRefreshToken
    }
  }
});

var transporter2 = nodemailer.createTransport("SMTP",{
    service: 'Godaddy',
    auth: {
      user: 'bug-reports@alpinelaboratories.com',
      pass: process.env.goDaddyPw
  }
});


router.post('/email', cors(), function(req, res) {

  console.log('request made to the email api');

    var markup = ['<div>Firmware Version: <b>' + req.body.firmwareVersion + '</b></div>',
        '<div>App Version: <b>' + req.body.appVersion + '</b></div>',
        '<div>Device Model: <b>' + req.body.deviceModel + '</b></div>',
        '<div>Device Platform: <b>' + req.body.devicePlatform + '</b></div>',
        '<div>Device OS: <b>' + req.body.deviceVersion + '</b></div>',
        '<div style="margin-top:20px;">' + req.body.comments + '</div>'
    ];
    var html = markup.join('');

    var mailOptions = {

        from: req.body.firstName, // sender address
        to: 'alpinelabsemails@gmail.com', // list of receivers
        subject: req.body.firstName + ' ' + '(' + req.body.email + ')', // Subject line
        html: html
    };

    if (req.body.attachment) {
        mailOptions.attachments = [{
            filename: 'error.log',
            contents: req.body.attachment
        }];
    } else {
        mailOptions.text += ' (No attachment was provided)';
    }

    console.log('attempting to send email');

    // send mail with defined transport object
    transporter1.sendMail(mailOptions, function(error, info) {
      console.log('info is: ' + info);
        if (error) {
            console.log('we got an error' + error);
            res.json('error', {
                error: 'failed to send email'
            });

        } else {
            console.log('bug report submitted successfully');
            res.json({
                success: true
            });

            sendEmailBackToReporter(req.body);
        }
        transporter1.close();
    });
});

function sendEmailBackToReporter(options){
  console.log('sending email back');

    var markup = template({
    pagename: 'awesome people',
    authors: ['Paul', 'Jim', 'Jane']
});
    var html = markup.join('');
    var mailOptions = {

        from: 'bug-reports@alpinelaboratories.com', // sender address
        to: options.email, // list of receivers
        subject: 'Got The Email', // Subject line
        html: html
    };

    // send mail with defined transport object
    transporter2.sendMail(mailOptions, function(error, info) {
      console.log('info is: ' + info);
        if (error) {
            console.log('we got an error' + error);

        } else {
            console.log('Sent email back to user');

        }
        transporter2.close();
    });
}


router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express'
    });

});

module.exports = router;
