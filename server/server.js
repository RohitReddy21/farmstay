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

// Trust proxy for Render deployment (1 for single proxy)
app.set('trust proxy', 1);

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
  'http://127.0.0.1:5173',
  'https://farmstay-eight.vercel.app',
  'https://stays.browncowsdairy.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ]
}));

app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sendHealthResponse = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    message: 'Server running',
    uptime: process.uptime(),
    startedAt: serverStartedAt
  });
};

// Lightweight uptime checks. No auth, no DB calls, no heavy work.
app.get('/', (req, res) => {
  res.status(200).send('Server is alive');
});

app.get('/health', sendHealthResponse);

app.get('/ping', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).send('pong');
});

// Backward-compatible health route for existing checks.
app.get('/api/health', sendHealthResponse);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Production: 100, Dev: 500
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: { trustProxy: false }, // Disable internal validation as Express handles trust proxy
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
