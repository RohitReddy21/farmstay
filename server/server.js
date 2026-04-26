const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v2: cloudinary } = require('cloudinary');

dotenv.config();
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment variables. Using default for development.');
  process.env.JWT_SECRET = 'dev_secret_key_123';
}

const app = express();
app.use(compression());
app.use(helmet());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5188',
  'https://farmstay-eight.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin.startsWith(allowedOrigin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (dev friendly)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
const PORT = process.env.PORT || 5001;



// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // If local connection fails or for dev convenience, use Memory Server
    // Note: In a real app, you'd want to fail if production DB is missing
    if (!mongoUri && process.env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log('Using In-Memory MongoDB:', mongoUri);
      } catch (err) {
        console.log('MongoMemoryServer not available, trying local URI');
      }
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    // Seed Data
    const seedData = require('./seed');
    await seedData();

  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    // In production, we want to fail fast if DB is missing
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting due to DB connection failure');
      process.exit(1);
    }
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farms', require('./routes/farmRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/db', require('./routes/dbViewerRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('FarmStay API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - Analytics Dashboard Enabled 🚀`);
});


// Force restart to load Razorpay Keys
