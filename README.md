# FarmStay - Farm Booking Platform

A full-stack MERN application for booking farm stays with user authentication, payment integration, and admin dashboard.

## Features

- 🏡 Browse and book farm stays
- 🔐 User authentication with JWT
- 💳 Payment integration (INR currency)
- 👨‍💼 Admin dashboard for managing users and bookings
- 📱 Responsive design with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 🖼️ Image gallery for farm listings

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

### Backend
- Node.js + Express
- MongoDB (with in-memory fallback for development)
- JWT Authentication
- Stripe Payment Integration
- Role-Based Access Control (RBAC)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd farm-stays
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   
   Create `.env` file in the `server` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/farmstay
   JWT_SECRET=your_jwt_secret_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   CLIENT_URL=http://localhost:5173
   SENDGRID_API_KEY=SG.your_sendgrid_key
   EMAIL_FROM=noreply@farmstay.com
   OWNER_EMAIL=owner@farmstay.com
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   OWNER_PHONE=your_phone_number
   ```

### Running Locally

1. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```
   Backend runs on: `https://farmstay-backend.onrender.com/`

2. **Start Frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

## Default Credentials

### Admin Account
- **Email**: `admin@farmstay.com`
- **Password**: `admin123`

## Project Structure

```
farm-stays/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── index.css      # Global styles
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features in Detail

### User Features
- Browse farm listings with filters
- View detailed farm information with image gallery
- Book farm stays with date selection
- Secure payment processing (mock mode for development)
- User registration and login

### Admin Features
- View all registered users
- View all bookings
- Access database viewer
- Role-based access control

### Payment System
- INR (₹) currency support
- Mock payment flow for development
- Stripe integration ready for production

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas

## Environment Setup

### Development
- Uses in-memory MongoDB (no local installation required)
- Mock payment processing
- Hot reload enabled

### Production
- MongoDB Atlas for database
- Real Stripe payment processing
- Environment variables for configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Farms
- `GET /api/farms` - Get all farms
- `GET /api/farms/:id` - Get farm by ID

### Bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/webhook` - Stripe webhook

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/db/view` - View database contents

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@farmstay.com or open an issue in the repository.

## Acknowledgments

- Images from Unsplash
- Icons from Lucide React
- UI inspiration from modern booking platforms
