# Quick Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment
- [ ] Code pushed to GitHub repository
- [ ] All placeholder credentials replaced with production values
- [ ] `.env` files added to `.gitignore`
- [ ] Production environment variables documented

## MongoDB Atlas
- [ ] Account created
- [ ] Free tier cluster created
- [ ] Database user created (username & password saved)
- [ ] Network access configured (0.0.0.0/0 for testing)
- [ ] Connection string copied and saved

## Backend Deployment (Render)
- [ ] Render account created (signed up with GitHub)
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables added:
  - [ ] NODE_ENV=production
  - [ ] MONGO_URI (from MongoDB Atlas)
  - [ ] JWT_SECRET (generated strong secret)
  - [ ] CLIENT_URL (will update after frontend deployment)
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] Other optional variables
- [ ] Service deployed successfully
- [ ] Backend URL saved: `https://_____.onrender.com`
- [ ] API health check verified

## Frontend Deployment (Vercel)
- [ ] `.env.production` file created with backend URL
- [ ] Changes committed and pushed to GitHub
- [ ] Vercel account created (signed up with GitHub)
- [ ] Project imported from GitHub
- [ ] Root directory set to `client`
- [ ] Build settings verified (auto-detected)
- [ ] Environment variable added: VITE_API_URL
- [ ] Project deployed successfully
- [ ] Frontend URL saved: `https://_____.vercel.app`

## Post-Deployment Configuration
- [ ] Updated CLIENT_URL in Render to Vercel URL
- [ ] Render service redeployed with new CLIENT_URL
- [ ] Stripe webhook configured (if using payments)
- [ ] STRIPE_WEBHOOK_SECRET added to Render

## Testing & Verification
- [ ] Backend health check: `curl https://your-backend.onrender.com/`
- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] User login works
- [ ] Farm listings display
- [ ] Booking flow works
- [ ] Admin dashboard accessible
- [ ] Database viewer works
- [ ] MongoDB Atlas shows data in collections

## Optional Enhancements
- [ ] Custom domain configured on Vercel
- [ ] SSL certificate verified (automatic on Vercel/Render)
- [ ] MongoDB Atlas IP whitelist restricted to specific IPs
- [ ] Monitoring and alerts set up
- [ ] Changed default admin password
- [ ] Backup strategy configured

## Troubleshooting Completed
- [ ] Checked Render logs for errors
- [ ] Checked Vercel deployment logs
- [ ] Verified all environment variables
- [ ] Tested CORS configuration
- [ ] Verified database connection

---

## Important URLs

**Frontend**: ___________________________________

**Backend**: ___________________________________

**MongoDB Atlas**: https://cloud.mongodb.com

**Render Dashboard**: https://dashboard.render.com

**Vercel Dashboard**: https://vercel.com/dashboard

---

## Credentials to Save

**MongoDB Atlas:**
- Username: ___________________________________
- Password: ___________________________________
- Connection String: ___________________________________

**Admin Account:**
- Email: admin@farmstay.com
- Password: admin123 (⚠️ CHANGE IN PRODUCTION!)

**JWT Secret:** ___________________________________

---

## Next Steps After Deployment

1. Test all features thoroughly
2. Change default admin credentials
3. Set up monitoring and logging
4. Configure backup strategy
5. Plan for scaling if needed
6. Document any custom configurations
7. Share URLs with stakeholders

---

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
