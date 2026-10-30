import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import trainRoutes from './routes/trainRoutes.js';
import busRoutes from './routes/busRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS origin blocked by policy.'));
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', generalLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'NOMADLY Travel Reservation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount V1 API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/trains', trainRoutes);
app.use('/api/v1/buses', busRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
