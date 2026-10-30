import { PaymentService } from '../services/payments/paymentService.js';
import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount, currency } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, message: 'Booking ID and amount are required.' });
    }

    const orderData = await PaymentService.createOrder({
      bookingId,
      userId: req.user._id,
      amount,
      currency,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment order created.',
      data: orderData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, orderId, paymentId, signature } = req.body;

    if (!bookingId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and order ID are required.',
      });
    }

    const result = await PaymentService.verifyPayment({
      bookingId,
      orderId,
      paymentId,
      signature,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed.',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    // Webhook receiver for Razorpay / payment notifications
    console.log('Payment webhook received:', req.body);
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
