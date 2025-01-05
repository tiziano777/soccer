var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tizianofinizzi@gmail.com',
    pass: 'Tiziano2000'
  }
});
exports.send=async function(msg){
    var mailOptions = {
        from: 'tizianofinizzi@gmail.com',
        to: 'tizianofinizzi@gmail.com',
        subject: 'node error',
        text: msg
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}
