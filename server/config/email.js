import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@freelanceplatform.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export default transporter;
