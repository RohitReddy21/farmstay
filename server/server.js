const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // If local connection fails or for dev convenience, use Memory Server
    // Note: In a real app, you'd want to fail if production DB is missing
    if (process.env.NODE_ENV !== 'production') {
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
    // process.exit(1); // Keep running to show error
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farms', require('./routes/farmRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/db', require('./routes/dbViewerRoutes'));

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
  console.log(`Server running on port ${PORT}`);
});
