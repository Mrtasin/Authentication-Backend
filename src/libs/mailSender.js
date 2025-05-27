import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const mailSender = async (options) => {
  try {
    const mailOpion = {
      from: process.env.MAILTRAP_FROM,
      to: options.email,
      subject: options.subject,
      text: `Please click on the following link:- ${process.env.BASE_URL}/api/v1/users/${options.route}/${options.token}`,
    };

    await transporter.sendMail(mailOpion);
  } catch (err) {
    console.log("Error : ", err);
  }
};

export default mailSender;
