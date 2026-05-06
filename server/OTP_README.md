# Email OTP With Resend

The backend sends OTP email through Resend.

## Environment

Set this in local `.env` and in Render:

```env
RESEND_API_KEY=your_resend_api_key
```

Optional custom sender:

```env
RESEND_FROM=Brown Cows Dairy <onboarding@resend.dev>
```

## Files

- `server/utils/email.js` exports `sendEmail(email, otp)` for OTP emails.
- `server/utils/sendOTP.js` keeps the existing `sendOTP(email, otp)` wrapper used by the OTP service.

## Important Resend Note

`onboarding@resend.dev` is useful for testing. For production delivery to arbitrary customer emails, Resend may require a verified sending domain. If customer emails fail with a Resend validation error, verify a domain in Resend and set `RESEND_FROM` to an address on that domain.
