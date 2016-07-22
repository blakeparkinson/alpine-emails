var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var smtpTransport = require("nodemailer-smtp-transport");
var app = express();
var cors = require('cors')

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    auth: {
        user: process.env.emailUsername || config.gmail_un,
        pass: process.env.emailPassword || config.gmail_pw
    }
}));

router.get('/:search', cors(), function(req, res) {
  var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don't be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you're afraid to live. What a way to exist."}
];
  console.log('we made it');
    res.json(quotes);
});

router.post('/email', cors(), function(req, res) {

    var markup = ['<div>Firmware Version: <b>' + req.body.firmwareVersion + '</b></div>',
        '<div>App Version: <b>' + req.body.appVersion + '</b></div>',
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

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        console.log(mailOptions);
        if (error) {
            console.log(error);
            res.json('error', {
                error: 'failed to send email'
            });

        } else {
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
