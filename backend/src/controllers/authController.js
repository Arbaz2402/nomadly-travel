import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, preferences, savedTravelers } = req.body;
    const user = req.user;

    if (displayName) user.displayName = displayName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (savedTravelers) user.savedTravelers = savedTravelers;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addSavedTraveler = async (req, res) => {
  try {
    const user = req.user;
    user.savedTravelers.push(req.body);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Saved traveler added',
      data: user.savedTravelers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSavedTraveler = async (req, res) => {
  try {
    const user = req.user;
    user.savedTravelers = user.savedTravelers.filter(
      (t) => t._id.toString() !== req.params.travelerId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Saved traveler removed',
      data: user.savedTravelers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Demo quick-login controller for frictionless evaluation
export const demoLogin = async (req, res) => {
  try {
    const { role = 'customer' } = req.body;

    const email = role === 'admin' ? 'admin@nomadly.travel' : 'traveler@nomadly.travel';
    const displayName = role === 'admin' ? 'Nomadly Administrator' : 'Aarav Sharma';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        displayName,
        role: role === 'admin' ? 'admin' : 'customer',
        preferences: { currency: 'INR', seatPreference: 'window' },
        savedTravelers: [
          {
            title: 'Mr',
            firstName: 'Aarav',
            lastName: 'Sharma',
            gender: 'male',
            nationality: 'Indian',
          },
          {
            title: 'Ms',
            firstName: 'Priya',
            lastName: 'Sharma',
            gender: 'female',
            nationality: 'Indian',
          },
        ],
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Signed in as Demo ${role.toUpperCase()}`,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
