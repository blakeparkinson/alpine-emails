var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var smtpTransport = require("nodemailer-smtp-transport");
var smtpPool = require('nodemailer-smtp-pool');
var app = express();
var cors = require('cors');
var xoauth2 = require('xoauth2');
/*var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(process.env.googleClientId, process.env.googleClientSecret, "http://alpinelabsemail.herokuapp.com/main/redirect");

var scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing'
];*/

var transporter = nodemailer.createTransport(smtpPool({
    service: 'gmail',
    auth: {
    XOAuth2: {
      user: "alpinelabsemails@gmail.com", // Your gmail address.
                                            // Not @developer.gserviceaccount.com
      clientId: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
      refreshToken: process.env.googleRefreshToken
    }
  },
    maxConnections: 20,
    maxMessages: Infinity
}));

router.post('/email', cors(), function(req, res) {
  console.log('request made to the email api');

    var markup = ['<div>Firmware Version: <b>' + req.body.firmwareVersion + '</b></div>',
        '<div>App Version: <b>' + req.body.appVersion + '</b></div>',
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
            content: req.body.attachment
        }];
    } else {
        mailOptions.text += ' (No attachment was provided)';
    }

    console.log('attempting to send email');

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
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
        }
        transporter.close();
    });
});


router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express'
    });

});

module.exports = router;
