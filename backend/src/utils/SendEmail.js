import nodemailer from "nodemailer"
 
 const sendEmail = async (options) => {
   const transporter = nodemailer.createTransport({
     port: 465,
     host: process.env.HOST_NAME,
     secure:true,
     service: process.env.SMTP_SERVICE,
     auth: {
       user: process.env.SMTP_EMAIL,
       pass: process.env.SMTP_PASSWORD,
     },
   });
 
   const mailOptions = {
     from: process.env.SMTP_EMAIL,
     to: options.email,
     subject: options.subject,
     html: options.message
   }
 
   transporter.sendMail(mailOptions)
 
 }
 
 export default sendEmail