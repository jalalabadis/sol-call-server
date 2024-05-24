const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25, // Default SMTP port for hMailServer
    secure: false, // Set to false since hMailServer does not use SSL/TLS by default
    auth: {
        user: 'admin@hmail.com',
        pass: 'P@ssw0rd!'
    }
});

const sendConfirmationEmail = async (email, token) => {
    const confirmationLink = `http://your-website.com/confirm/${token}`;
    const mailOptions = {
        from: 'admin@hmail.com',
        to: 'jony@hmail.com',
        subject: 'Email Confirmation',
        text: `Please confirm your email by clicking the following link: ${confirmationLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = sendConfirmationEmail;
