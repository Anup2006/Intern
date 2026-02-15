import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export {
    generateOTP,
    sendOTPEmail,
}
