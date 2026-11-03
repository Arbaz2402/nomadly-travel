import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { User } from '../models/User.js';

let firebaseInitialized = false;

// Attempt Firebase Admin initialization if credentials or serviceAccountKey.json exist
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully from FIREBASE_SERVICE_ACCOUNT environment variable.');
  } else {
    const serviceAccountPath = fs.existsSync('backend/serviceAccountKey.json')
      ? 'backend/serviceAccountKey.json'
      : fs.existsSync('serviceAccountKey.json')
      ? 'serviceAccountKey.json'
      : null;

    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log(`🔥 Firebase Admin SDK initialized successfully from ${serviceAccountPath}.`);
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully from environment variables.');
    } else {
      console.log('ℹ️ Firebase Admin credentials not detected. Utilizing Dual-Mode JWT Auth & Demo Engine.');
    }
  }
} catch (err) {
  console.warn('⚠️ Firebase Admin initialization bypassed:', err.message);
}

const JWT_SECRET = process.env.JWT_SECRET || 'nomadly_super_secret_jwt_key_2026_travel_platform';

export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();

    let decodedEmail = null;
    let decodedUid = null;

    // 1. Try Firebase Admin if initialized
    if (firebaseInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        decodedEmail = decodedToken.email;
        decodedUid = decodedToken.uid;
      } catch (fbErr) {
        // Fallback to JWT if not a valid Firebase token
      }
    }

    // 2. Try native JWT token
    if (!decodedEmail) {
      try {
        const decodedJwt = jwt.verify(token, JWT_SECRET);
        decodedEmail = decodedJwt.email;
        decodedUid = decodedJwt.uid || decodedJwt.id;
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }
    }

    // 3. Resolve user in MongoDB
    let user = await User.findOne({
      $or: [{ email: decodedEmail.toLowerCase() }, { firebaseUid: decodedUid }],
    });

    if (!user) {
      // Create user record automatically on first verified login if not found
      user = await User.create({
        email: decodedEmail.toLowerCase(),
        firebaseUid: decodedUid,
        displayName: decodedEmail.split('@')[0],
        role: decodedEmail.includes('admin') ? 'admin' : 'customer',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended. Please contact customer support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
    });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires ${role} role privileges.`,
      });
    }
    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
