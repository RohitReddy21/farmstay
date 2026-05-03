const transporter = require('../config/mail.js');

/**
 * Sends an OTP email to the specified address
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password code
 * @returns {Promise<boolean>} - Returns true if email sent successfully, false otherwise
 */
const sendOTP = async (email, otp) => {
    try {
        // Validate inputs
        if (!email || !otp) {
            console.error('❌ Email and OTP are required');
            return false;
        }

        // Professional HTML email template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification - Brown Cows Farm Stay</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #7a5527;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #7a5527;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 24px;
                    color: #211b14;
                    margin-bottom: 10px;
                }
                .otp-container {
                    background: linear-gradient(135deg, #7a5527, #5d3d19);
                    color: white;
                    padding: 25px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 30px 0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin: 15px 0;
                    font-family: 'Courier New', monospace;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 15px;
                    border-radius: 6px;
                    display: inline-block;
                    min-width: 200px;
                }
                .expiry {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-top: 10px;
                }
                .security-warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-size: 14px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #666;
                    font-size: 12px;
                }
                .support-info {
                    margin-top: 15px;
                    font-size: 14px;
                }
                @media (max-width: 600px) {
                    .container {
                        padding: 20px;
                        margin: 10px;
                    }
                    .otp-code {
                        font-size: 28px;
                        letter-spacing: 6px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🐄 Brown Cows Farm Stay</div>
                    <div class="title">Email Verification</div>
                </div>

                <p>Dear User,</p>
                <p>Thank you for choosing Brown Cows Farm Stay! To complete your registration or verify your identity, please use the One-Time Password (OTP) below:</p>

                <div class="otp-container">
                    <div style="font-size: 18px; margin-bottom: 10px;">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="expiry">⏰ This code will expire in 10 minutes</div>
                </div>

                <div class="security-warning">
                    <strong>🔒 Security Notice:</strong><br>
                    • Never share this OTP with anyone<br>
                    • Our staff will never ask for your OTP<br>
                    • This code can only be used once<br>
                    • If you didn't request this code, please ignore this email
                </div>

                <div class="support-info">
                    <strong>Need Help?</strong><br>
                    If you're having trouble with your verification, please don't hesitate to contact our support team:<br>
                    📧 Email: browncowsdairy@gmail.com<br>
                    📞 Phone: +91 XXXXX XXXXX
                </div>

                <div class="footer">
                    <p>This is an automated message from Brown Cows Farm Stay. Please do not reply to this email.</p>
                    <p style="margin-top: 10px;">© 2024 Brown Cows Farm Stay. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email options
        const mailOptions = {
            from: {
                name: 'Brown Cows Farm Stay',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '🔐 OTP Verification - Brown Cows Farm Stay',
            html: htmlTemplate,
            // Alternative plain text version for email clients that don't support HTML
            text: `
BROWN COWS FARM STAY - Email Verification

Dear User,

Your One-Time Password (OTP) for verification is:

OTP: ${otp}

⚠️  This code will expire in 10 minutes.

🔒 SECURITY NOTICE:
• Never share this OTP with anyone
• Our staff will never ask for your OTP
• This code can only be used once
• If you didn't request this code, please ignore this email

Need Help?
Email: browncowsdairy@gmail.com
Phone: +91 XXXXX XXXXX

This is an automated message. Please do not reply.
© 2024 Brown Cows Farm Stay. All rights reserved.
            `
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ OTP email sent successfully to ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);
        
        return true;

    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        
        // Detailed error logging
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASS in environment variables.');
        } else if (error.code === 'ECONNECTION') {
            console.error('Connection failed. Check your internet connection and SMTP settings.');
        } else {
            console.error('Unexpected error:', error.message);
        }
        
        return false;
    }
};

module.exports = { sendOTP };
