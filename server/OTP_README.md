# Email OTP Authentication System

A production-ready email OTP (One-Time Password) authentication system using Gmail SMTP and Nodemailer for the Brown Cows Farm Stay application.

## 🚀 Features

- **Secure OTP Generation**: Cryptographically secure 6-digit OTPs
- **Email Delivery**: Professional HTML email templates with Brown Cows branding
- **Rate Limiting**: Built-in attempt limits and expiry times
- **Memory Management**: Automatic cleanup of expired OTPs
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Input validation using express-validator
- **Production Ready**: Configurable for development and production

## 📁 File Structure

```
server/
├── config/
│   └── mail.js              # Gmail SMTP transporter configuration
├── services/
│   └── otpService.js        # Core OTP business logic
├── utils/
│   ├── sendOTP.js           # Email sending utility
│   └── testEmail.js         # Test utility for development
├── routes/
│   └── otpRoutes.js         # API endpoints for OTP operations
└── .env.example             # Environment variables template
```

## ⚙️ Configuration

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration for OTP
EMAIL_USER=browncowsdairy@gmail.com
EMAIL_PASS=rjdcxvnlnbtkuueh
```

### 2. Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `EMAIL_PASS`

## 🔧 API Endpoints

### Send OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpId": "uuid-string",
  "expiresIn": 600
}
```

### Verify OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "otpId": "uuid-string",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

### Resend OTP
```http
POST /api/otp/resend
Content-Type: application/json

{
  "otpId": "uuid-string"
}
```

### Get OTP Status (Debug)
```http
GET /api/otp/status/:otpId
```

## 📧 Email Template Features

The OTP email includes:

- **Professional Design**: Brown Cows Farm Stay branding
- **Clear OTP Display**: Large, readable 6-digit code
- **Security Information**: Warning messages about OTP safety
- **Expiry Information**: Clear expiry time display
- **Contact Support**: Help information for users
- **Responsive Design**: Mobile-friendly email template
- **Plain Text Fallback**: For email clients that don't support HTML

## 🔒 Security Features

### OTP Security
- **6-digit random codes** using crypto.randomInt()
- **10-minute expiry** by default
- **Maximum 3 attempts** per OTP
- **One-time use** - OTP deleted after successful verification
- **Automatic cleanup** of expired OTPs every 5 minutes

### Rate Limiting
- **IP-based rate limiting** (500 requests per 15 minutes)
- **Attempt limiting** (3 failed attempts = new OTP required)
- **Session management** with unique OTP IDs

### Input Validation
- **Email validation** using express-validator
- **OTP format validation** (6-digit numbers only)
- **Required field validation**

## 🧪 Testing

### Test Email Sending
```javascript
import { testEmailOTP } from './utils/testEmail.js';

// Test OTP sending
await testEmailOTP('your-test-email@example.com');
```

### Manual Testing
1. Start your server: `npm start`
2. Send OTP: `POST /api/otp/send` with email
3. Check email for OTP code
4. Verify OTP: `POST /api/otp/verify` with otpId and code

## 📝 Usage Examples

### Frontend Integration

```javascript
// Send OTP
const sendOTP = async (email) => {
  const response = await fetch('/api/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  return data.otpId;
};

// Verify OTP
const verifyOTP = async (otpId, otp) => {
  const response = await fetch('/api/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otpId, otp })
  });
  return await response.json();
};
```

### Integration with Auth Routes

```javascript
// In your authRoutes.js
import { generateAndSendOTP, verifyOTP } from '../services/otpService.js';

// Send OTP for login/register
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const result = await generateAndSendOTP(email);
  res.json(result);
});

// Verify OTP for login/register
router.post('/verify-otp', async (req, res) => {
  const { otpId, otp } = req.body;
  const result = await verifyOTP(otpId, otp);
  
  if (result.success) {
    // Create user session or token
    // ... your auth logic
  }
  
  res.json(result);
});
```

## 🚨 Important Notes

### Gmail App Password
- **Never use your regular Gmail password**
- **Always use an App Password** for SMTP authentication
- **Keep app passwords secure** and don't commit them to git

### Production Considerations
- **Use Redis or Database** for OTP storage in production (instead of in-memory Map)
- **Implement proper logging** for security audits
- **Monitor email delivery rates** and failed attempts
- **Consider rate limiting per email** in addition to IP-based limiting

### Error Handling
- **Comprehensive error messages** for different failure scenarios
- **Detailed logging** for debugging
- **User-friendly error responses** for frontend integration

## 🔧 Customization

### Change OTP Length
```javascript
// In otpService.js
const otp = generateAndSendOTP(email, 8, 15); // 8-digit, 15 minutes
```

### Customize Email Template
Edit the HTML template in `utils/sendOTP.js` to match your branding:

```javascript
const htmlTemplate = `
<!-- Your custom email template -->
`;
```

### Change Expiry Time
```javascript
// Default is 10 minutes
const result = await generateAndSendOTP(email, 6, 5); // 5 minutes
```

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication failed" error**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Ensure you're using an App Password, not your regular password
   - Verify 2-factor authentication is enabled

2. **"Connection failed" error**
   - Check internet connection
   - Verify Gmail SMTP settings
   - Check firewall/blocking rules

3. **OTP not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check server logs for errors

4. **"Invalid or expired OTP"**
   - OTP may have expired (default 10 minutes)
   - Check if maximum attempts exceeded
   - Verify OTP code is correct

### Debug Mode
Add this to your server for debugging:

```javascript
// In development only
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 OTP Debug Mode Enabled');
  // Add debug logging as needed
}
```

## 📞 Support

For issues with the OTP system:
1. Check the server logs
2. Verify environment variables
3. Test email configuration using the test utility
4. Check Gmail App Password setup

---

**Brown Cows Farm Stay** - Secure Email OTP Authentication System 🐄✉️
