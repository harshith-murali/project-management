import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "My App",
    link: "https://myapp.com",
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, mailgenContent }) => {
  const emailHTML = mailGenerator.generate(mailgenContent);
  const emailText = mailGenerator.generatePlaintext(mailgenContent);

  await transporter.sendMail({
    from: `"My App" <${process.env.MAILTRAP_SMTP_USER}>`,
    to,
    subject,
    text: emailText,
    html: emailHTML,
  });
};

const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome to our app! We're very excited to have you on board.",
    action: {
      instructions: "To get started with our app, please click here:",
      button: {
        color: "#22BC66",
        text: "Confirm your account",
        link: verificationUrl,
      },
    },
    outro: "Need help, or have questions? Just reply to this email.",
  },
});

const forgotPasswordMailgenContent = (username, resetUrl) => ({
  body: {
    name: username,
    intro:
      "You have received this email because a password reset request for your account was received.",
    action: {
      instructions: "To reset your password, please click here:",
      button: {
        color: "#DC4D2F",
        text: "Reset your password",
        link: resetUrl,
      },
    },
    outro:
      "If you did not request a password reset, no further action is required.",
  },
});

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};
