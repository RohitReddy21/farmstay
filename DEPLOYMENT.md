# FarmStay Deployment Guide

Complete step-by-step guide to deploy your FarmStay application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account (for connecting repositories)
- [ ] Git installed locally
- [ ] Your FarmStay project pushed to a GitHub repository
- [ ] Production credentials ready:
  - Strong JWT secret
  - Stripe API keys (if using payments)
  - SendGrid API key (if using emails)
  - Twilio credentials (if using SMS)

### Push to GitHub (if not done already)

```bash
# Initialize git repository (if not already done)
cd "C:\Users\PC\Desktop\farm stays"
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FarmStay application"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/farmstay.git
git branch -M main
git push -u origin main
```

---

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Complete the registration form
4. Verify your email address

### Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (perfect for development/small projects)
3. Select your preferred cloud provider and region:
   - **Provider**: AWS (recommended)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Cluster Name: `FarmStay` (or keep default)
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Set credentials:
   - **Username**: `farmstay_admin`
   - **Password**: Generate a strong password (save it securely!)
5. Database User Privileges: Select **"Read and write to any database"**
6. Click **"Add User"**

> [!IMPORTANT]
> Save your database username and password - you'll need them for the connection string!

### Step 4: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development/testing, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, you should restrict to specific IPs
4. Click **"Confirm"**

> [!WARNING]
> "Allow Access from Anywhere" is convenient but less secure. For production, whitelist only your server IPs.

### Step 5: Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://farmstay_admin:<password>@farmstay.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password
7. Add database name before the `?`:
   ```
   mongodb+srv://farmstay_admin:YOUR_PASSWORD@farmstay.xxxxx.mongodb.net/farmstay?retryWrites=true&w=majority
   ```

> [!NOTE]
> Keep this connection string safe - you'll use it in Render's environment variables.

---

## Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with GitHub (recommended for easy repository access)
4. Authorize Render to access your GitHub repositories

### Step 2: Create New Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - If not connected, click **"Connect account"** and authorize
   - Find and select your `farmstay` repository
3. Click **"Connect"**

### Step 3: Configure Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `farmstay-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** tier (for testing) or **"Starter"** (for production)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and add the following:

Click **"Add Environment Variable"** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Tells app it's in production |
| `PORT` | `5000` | Render will override this automatically |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-strong-secret-here` | Generate a random 32+ character string |
| `CLIENT_URL` | `https://farmstay.vercel.app` | Your Vercel URL (update after frontend deployment) |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Configure after Stripe webhook setup |
| `SENDGRID_API_KEY` | `SG.xxxxx` | Your SendGrid API key (optional) |
| `EMAIL_FROM` | `noreply@farmstay.com` | Sender email address |
| `OWNER_EMAIL` | `owner@farmstay.com` | Owner notification email |
| `TWILIO_ACCOUNT_SID` | `ACxxxxx` | Your Twilio SID (optional) |
| `TWILIO_AUTH_TOKEN` | `xxxxx` | Your Twilio auth token (optional) |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Your Twilio phone number (optional) |
| `OWNER_PHONE` | `+1234567890` | Owner notification phone (optional) |

> [!TIP]
> Generate a strong JWT secret using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Step 5: Deploy Backend

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your backend
3. Wait for deployment to complete (5-10 minutes)
4. Once deployed, you'll see a URL like: `https://farmstay-backend.onrender.com`

### Step 6: Verify Backend Deployment

1. Click on your deployed URL
2. You should see: `FarmStay API is running`
3. Test API endpoint: `https://farmstay-backend.onrender.com/api/farms`
   - Should return farm listings (may be empty initially)

> [!NOTE]
> Save your Render backend URL - you'll need it for frontend configuration!

---

## Frontend Deployment (Vercel)

### Step 1: Create Environment File

Before deploying, create a production environment file:

**File**: `client/.env.production`
```env
VITE_API_URL=https://farmstay-backend.onrender.com
```

Replace with your actual Render backend URL.

**Commit and push this file:**
```bash
cd "C:\Users\PC\Desktop\farm stays"
git add client/.env.production
git commit -m "Add production environment configuration"
git push
```

### Step 2: Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Complete the setup wizard

### Step 3: Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your `farmstay` repository in the list
3. Click **"Import"**

### Step 4: Configure Project Settings

**Framework Preset:**
- Vercel should auto-detect **"Vite"**

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Select `client` folder
- Click **"Continue"**

**Build Settings:**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 5: Add Environment Variables

Click **"Environment Variables"** section:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://farmstay-backend.onrender.com` |

Replace with your actual Render backend URL.

### Step 6: Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (3-5 minutes)
3. Once complete, you'll get a URL like: `https://farmstay-xxxxx.vercel.app`

### Step 7: Set Custom Domain (Optional)

1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain (e.g., `farmstay.com`)
4. Follow DNS configuration instructions

---

## Post-Deployment Configuration

### Update Backend CORS Settings

Now that you have your Vercel URL, update the backend environment variable:

1. Go to Render Dashboard
2. Select your `farmstay-backend` service
3. Go to **"Environment"** tab
4. Update `CLIENT_URL` to your Vercel URL: `https://farmstay-xxxxx.vercel.app`
5. Click **"Save Changes"**
6. Render will automatically redeploy

### Configure Stripe Webhooks (If Using Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://farmstay-backend.onrender.com/api/bookings/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Render environment variables:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx`
7. Save and redeploy

---

## Verification & Testing

### Backend Health Check

```bash
# Test API is running
curl https://farmstay-backend.onrender.com/

# Test farms endpoint
curl https://farmstay-backend.onrender.com/api/farms
```

### Frontend Testing

1. Open your Vercel URL in browser
2. Verify homepage loads correctly
3. Click **"Explore Farms"** - should show farm listings
4. Test user registration:
   - Click **"Login"** → **"Sign Up"**
   - Create a test account
   - Verify you can login

### Full Flow Testing

1. **Browse Farms**: Navigate to farms page
2. **View Farm Details**: Click on a farm
3. **Create Booking**: Select dates and book
4. **Admin Access**: Login with admin credentials
   - Email: `admin@farmstay.com`
   - Password: `admin123`
5. **Admin Dashboard**: Verify you can see users and bookings
6. **Database Viewer**: Check database collections

### Database Verification

1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"**
3. Select `farmstay` database
4. Verify collections exist:
   - `users`
   - `farms`
   - `bookings`

---

## Troubleshooting

### Backend Issues

**Problem**: "Application Error" on Render
- **Solution**: Check Render logs (Dashboard → Logs tab)
- Common causes:
  - Missing environment variables
  - MongoDB connection string incorrect
  - Build/start command errors

**Problem**: CORS errors in browser console
- **Solution**: Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Check CORS configuration in `server.js`

**Problem**: Database connection failed
- **Solution**: 
  - Verify MongoDB Atlas connection string
  - Check database user credentials
  - Ensure IP whitelist includes 0.0.0.0/0 or Render IPs

### Frontend Issues

**Problem**: API calls failing (404 or network errors)
- **Solution**: 
  - Verify `VITE_API_URL` in Vercel environment variables
  - Check that backend is deployed and running
  - Test backend URL directly in browser

**Problem**: Build fails on Vercel
- **Solution**:
  - Check build logs in Vercel dashboard
  - Verify `package.json` has correct dependencies
  - Ensure root directory is set to `client`

**Problem**: Environment variables not working
- **Solution**:
  - Vercel requires `VITE_` prefix for client-side variables
  - Redeploy after adding environment variables
  - Clear cache and redeploy if needed

### Database Issues

**Problem**: No data showing in application
- **Solution**:
  - Check if seed script ran on backend startup
  - Verify MongoDB Atlas connection
  - Check backend logs for database errors

**Problem**: Authentication not working
- **Solution**:
  - Verify `JWT_SECRET` is set in Render
  - Check that cookies are being set (HTTPS required in production)
  - Verify CORS credentials are enabled

---

## Maintenance & Updates

### Deploying Updates

**Backend Updates:**
```bash
# Make changes to server code
git add .
git commit -m "Update backend"
git push
# Render auto-deploys on push to main branch
```

**Frontend Updates:**
```bash
# Make changes to client code
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys on push to main branch
```

### Monitoring

- **Render**: Check logs and metrics in dashboard
- **Vercel**: Monitor deployments and analytics
- **MongoDB Atlas**: Monitor database performance and usage

### Scaling

**Free Tier Limitations:**
- Render: Spins down after 15 minutes of inactivity
- Vercel: 100GB bandwidth/month
- MongoDB Atlas: 512MB storage

**Upgrade Path:**
- Render: Upgrade to Starter ($7/month) for always-on
- Vercel: Pro plan for more bandwidth
- MongoDB Atlas: Upgrade to M10+ for production workloads

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to Git
2. **JWT Secret**: Use strong, random secrets (32+ characters)
3. **Database**: Restrict IP access in production
4. **HTTPS**: Always use HTTPS in production (automatic on Render/Vercel)
5. **API Keys**: Rotate keys regularly
6. **CORS**: Restrict to specific domains in production

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform documentation:
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
3. Check application logs in respective dashboards
4. Verify all environment variables are set correctly

---

## Quick Reference

### Important URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: MongoDB Atlas Dashboard

### Default Credentials
- **Admin Email**: `admin@farmstay.com`
- **Admin Password**: `admin123`

> [!CAUTION]
> Change default admin credentials in production!

### Environment Variables Checklist

**Backend (Render):**
- [ ] NODE_ENV
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] CLIENT_URL
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] SENDGRID_API_KEY (optional)
- [ ] EMAIL_FROM (optional)
- [ ] OWNER_EMAIL (optional)
- [ ] TWILIO credentials (optional)

**Frontend (Vercel):**
- [ ] VITE_API_URL
