
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key:process.env.SENDGRID_API_KEY,
        },
    })
);

module.exports = (to,subject,html) => { 
    // transporter.sendMail({
    //     to: to,
    //     from: "shop@visions-sa.com",
    //     subject: subject,
    //     html: html,
    // });
}