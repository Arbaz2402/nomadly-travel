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
    const { displayName, phoneNumber, preferences } = req.body;
    const user = req.user;

    if (displayName) user.displayName = displayName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

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
        preferences: { currency: 'INR' },
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
