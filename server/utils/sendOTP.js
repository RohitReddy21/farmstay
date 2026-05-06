const { sendEmail } = require('./email');

const sendOTP = async (email, otp) => {
    if (!email || !otp) {
        console.error('Email and OTP are required');
        return false;
    }

    return sendEmail(email, otp);
};

module.exports = { sendOTP };
