const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_Host,
    port: process.env.SMTP_PORT, 
    secure: false, 
    auth: {
        user: process.env.SMTP_Email,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendConfirmationEmail = async (req, token) => {
    const confirmationLink = `${req.protocol}://${req.get('host')}/auth/confirm/${token}`;
    const mailOptions = {
        from: process.env.SMTP_Email,
        to: req.body.email,
        subject: 'Verify email address for leadsworker.com',
        html: `Welcome to Leadsworker! <br>

        Your Leadsworker account has been created successfully<br><br>
        Click the activation link below to verify your email address<br><br>
        
       <a href="${confirmationLink}">${confirmationLink}</a><br><br>
        
        If the above verification link does not work, please copy and paste the entire link into your browser address bar.<br>
        
        Kindly note that this verification link will expire after 24 hours. You may signup again after the link expires.<br>
        
        ---------------------------------------------------<br>
        <b>Email:</b> ${req.body.email}<br>
        <b>Password:</b> ****** (hidden for privacy)<br>
        ---------------------------------------------------<br>
        <br><br>
        If this was not you, please disregard; someone may have mistyped their email address.<br><br>
        <br>
        Regards,
        Leadsworker.com
        
        <br><br>
        ---------------------------------------------------
        <br><br>
        This is an automated message from Leadsworker
        Do not reply to this email.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = sendConfirmationEmail;
