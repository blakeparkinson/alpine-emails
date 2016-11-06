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
var template = swig.compileFile(__dirname + '/../templates/bugreply.html');
var plainTemplate = swig.compileFile(__dirname + '/../templates/bugreply.txt');

var request = require('request');
var querystring = require('querystring');

var transporter1 = nodemailer.createTransport("SMTP", {
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

var transporter2 = nodemailer.createTransport("SMTP", {
    service: 'Godaddy',
    auth: {
        user: 'bug-reports@alpinelaboratories.com',
        pass: process.env.goDaddyPw
    }
});

router.post('/images', cors(), function(req, res) {
  console.log('hi');
  var formData = querystring.stringify({'noise': 1, 'scale': 2, 'style': 'photo',  'url': 'https://s3.amazonaws.com/alpine-misc/pulse-thumb.jpg'});
  request({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*'
    },
    uri: 'http://waifu2x.udp.jp/api',
    method: 'POST',
    body: formData,
    encoding: null
  },function(err, response, body){
    // copy response headers
  for (var key in response.headers) {
    if (response.headers.hasOwnProperty(key)) {
      res.setHeader(key, response.headers[key])
    }
  }
    res.end(response.body);
  });
});


router.post('/email', cors(), function(req, res) {

    console.log('request made to the email api');

    var markup = ['<div>Firmware Version: <b>' + req.body.firmwareVersion + '</b></div>',
        '<div>App Version: <b>' + req.body.appVersion + '</b></div>',
        '<div>Device Model: <b>' + req.body.deviceModel + '</b></div>',
        '<div>Device Platform: <b>' + req.body.devicePlatform + '</b></div>',
        '<div>Device OS: <b>' + req.body.deviceVersion + '</b></div>',
        '<div>Firmware Type: <b>' + req.body.firmwareType + '</b></div>',
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


function sendEmailBackToReporter(options) {

    var fontPath = __dirname + '/../assets/fonts/';
    var imagePath = __dirname + '/../assets/images/alpine-logo.png';


    var html = template({
        firstName: options.firstName,
        fontPath: fontPath,
        imagePath: imagePath
    });
    var plainText = plainTemplate({
        firstName: options.firstName
    });
    var mailOptions = {

        from: 'bug-reports@alpinelaboratories.com', // sender address
        to: options.email, // list of receivers
        subject: 'Thanks for reporting your issue', // Subject line
        html: html,
        text: plainText
    };

    console.log('sending email back to ' + options.email);


    // send mail with defined transport object
    transporter2.sendMail(mailOptions, function(error, info) {
        console.log('info is: ' + info);
        if (error) {
            console.log('we got an error' + error);

        } else {
            console.log('Successfully sent email back to user');

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
