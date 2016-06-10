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

router.post('/email', cors(), function(req,res){
  console.log(process.env);


    var mailOptions = {

        from: req.body.firstName + ' ' + req.body.lastName, // sender address
        to: 'alpinelabsemails@gmail.com', // list of receivers
        subject: req.body.firstName + ' ' + req.body.lastName + '(' + req.body.email + ')', // Subject line
        text: req.body.comments, // plaintext body
        attachments: [
          {
            filename: 'error.log',
            content: req.body.attachment
          }
        ]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      console.log(mailOptions);
        if(error){
            console.log(error);
            res.json('error',{error: 'failed to send email'});

        }else{
            res.json({success: true});
        }
    });
});

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });

});

module.exports = router;
