const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment variables. Using default for development.');
  process.env.JWT_SECRET = 'dev_secret_key_123';
}

const app = express();
app.use(compression());
app.use(helmet());

const serverStartedAt = new Date().toISOString();

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
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5188',
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (dev friendly)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
const PORT = process.env.PORT || 5001;



// Database Connection
const seedInitialData = async () => {
  const seedData = require('./seed');
  await seedData();
};

const createMemoryMongoUri = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Using In-Memory MongoDB:', uri);
  return uri;
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri && process.env.NODE_ENV !== 'production') {
      mongoUri = await createMemoryMongoUri();
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
    await seedInitialData();
  } catch (err) {
    console.error('MongoDB Connection Error:', err);

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Trying in-memory MongoDB fallback for local development...');
        const memoryUri = await createMemoryMongoUri();
        await mongoose.connect(memoryUri);
        console.log('MongoDB Connected using in-memory fallback');
        await seedInitialData();
        return;
      } catch (fallbackErr) {
        console.error('In-memory MongoDB fallback failed:', fallbackErr);
      }
    }

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

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    startedAt: serverStartedAt,
    nodeEnv: process.env.NODE_ENV || 'undefined'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || (err.message === 'Not allowed by CORS' ? 403 : 500);
  console.error('Unhandled error:', err);

  const hostname = req.hostname || '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const message =
    err?.message ||
    (typeof err === 'string' ? err : undefined) ||
    (err ? JSON.stringify(err) : undefined) ||
    'Something went wrong!';

  res.status(status).json({
    message,
    error: err?.message || (typeof err === 'string' ? err : undefined),
    stack: (process.env.NODE_ENV !== 'production' || isLocalhost) ? err?.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - Analytics Dashboard Enabled 🚀`);
});


// Force restart to load Razorpay Keys
