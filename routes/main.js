var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var smtpTransport = require("nodemailer-smtp-transport");
var app = express();
var cors = require('cors')


router.post('/email', cors(), function(req, res) {
  console.log('request made to the email api');

  var transporter = nodemailer.createTransport(smtpTransport({
      service: 'Gmail',
      auth: {
          user: process.env.emailUsername || config.gmail_un,
          pass: process.env.emailPassword || config.gmail_pw
      }
  }));

  console.log(transporter);

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
    });
});

router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express'
    });

});

module.exports = router;
