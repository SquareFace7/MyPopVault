const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, username, token) => {
  // Support dynamic environment variables for Backend API URL (API_URL, BACKEND_URL, BASE_URL) with secure production domain fallback
  const rawApiUrl = process.env.API_URL || process.env.BACKEND_URL || process.env.BASE_URL || 'https://api.mypopvault.online';
  const apiUrl = (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1') || rawApiUrl.includes('54.145.')) && process.env.NODE_ENV === 'production'
    ? 'https://api.mypopvault.online'
    : (rawApiUrl.replace(/\/+$/, '') || 'https://api.mypopvault.online');

  const verificationEndpoint = apiUrl.endsWith('/api') 
    ? `${apiUrl}/auth/verify/${token}` 
    : `${apiUrl}/api/auth/verify/${token}`;
  const verificationUrl = verificationEndpoint;
  console.log(`✉️ [Verification Email Log]`);
  console.log(`To: ${email}`);
  console.log(`Verification URL: ${verificationUrl}`);
  console.log(`-----------------------------------`);

  let transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Custom SMTP server configuration (e.g., Brevo)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587/other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail or default SMTP service configuration fallback
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  } else {
    // Local development fallback using Ethereal email
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
    } catch (err) {
      console.warn('⚠️ Ethereal email account creation failed, skipping SMTP send. Use the verification URL logged above.');
      return;
    }
  }

  const mailOptions = {
    from: '"MyPopVault" <eliadhagag3@gmail.com>',
    to: email,
    subject: 'Lock in Your Vault - Verify Your Email',
    html: `
      <div dir="ltr" style="font-family: sans-serif; border: 4px solid #1f2937; border-radius: 16px; padding: 24px; max-width: 600px; margin: auto; box-shadow: 4px 4px 0px rgba(0,0,0,0.1);">
        <h2 style="color: #06b6d4; font-weight: 900; text-transform: uppercase;">Welcome, ${username}!</h2>
        <p style="font-size: 16px; font-weight: bold; color: #4b5563;">Thank you for registering at MyPopVault. Please verify your email to unlock your personal vault.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; border: 3px solid #1f2937; font-weight: 900; display: inline-block; box-shadow: 3px 3px 0px #1f2937;">VERIFY EMAIL</a>
        </div>
        <p style="font-size: 12px; color: #9ca3af;">If the button above does not work, copy and paste this URL into your browser:</p>
        <p style="font-size: 12px; font-weight: bold; color: #2563eb; word-break: break-all;">${verificationUrl}</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (!process.env.EMAIL_USER) {
      console.log(`✉️ Ethereal email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`✉️ Verification email sent successfully to ${email}`);
    }
  } catch (err) {
    console.error('❌ Error sending verification email:', err);
    throw err;
  }
};

const sendPasswordResetEmail = async (email, username, token) => {
  const rawFrontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.BASE_URL || 'https://mypopvault.online';
  const frontendUrl = (rawFrontendUrl.includes('localhost') || rawFrontendUrl.includes('127.0.0.1') || rawFrontendUrl.includes('54.145.')) && process.env.NODE_ENV === 'production'
    ? 'https://mypopvault.online'
    : (rawFrontendUrl.replace(/\/+$/, '') || 'https://mypopvault.online');
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  console.log(`✉️ [Password Reset Email Log]`);
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`-----------------------------------`);

  let transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Custom SMTP server configuration (e.g., Brevo)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587/other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail or default SMTP service configuration fallback
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  } else {
    // Local development fallback using Ethereal email
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
    } catch (err) {
      console.warn('⚠️ Ethereal email account creation failed, skipping SMTP send. Use the reset URL logged above.');
      return;
    }
  }

  const mailOptions = {
    from: '"MyPopVault" <eliadhagag3@gmail.com>',
    to: email,
    subject: 'Reset Your Password - MyPopVault',
    html: `
      <div dir="ltr" style="font-family: sans-serif; border: 4px solid #1f2937; border-radius: 16px; padding: 24px; max-width: 600px; margin: auto; box-shadow: 4px 4px 0px rgba(0,0,0,0.1);">
        <h2 style="color: #ec4899; font-weight: 900; text-transform: uppercase;">Hello, ${username}!</h2>
        <p style="font-size: 16px; font-weight: bold; color: #4b5563;">You requested to reset your password. Please click the button below to set a new password. This link is valid for 15 minutes.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; border: 3px solid #1f2937; font-weight: 900; display: inline-block; box-shadow: 3px 3px 0px #1f2937;">RESET PASSWORD</a>
        </div>
        <p style="font-size: 12px; color: #9ca3af;">If the button above does not work, copy and paste this URL into your browser:</p>
        <p style="font-size: 12px; font-weight: bold; color: #2563eb; word-break: break-all;">${resetUrl}</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (!process.env.EMAIL_USER) {
      console.log(`✉️ Ethereal email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`✉️ Password reset email sent successfully to ${email}`);
    }
  } catch (err) {
    console.error('❌ Error sending password reset email:', err);
    throw err;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
