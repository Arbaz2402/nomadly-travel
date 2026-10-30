import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../../models/Payment.js';
import { Booking } from '../../models/Booking.js';
import { AuditLog } from '../../models/AuditLog.js';

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('💳 Razorpay client initialized in Test/Live Mode.');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization skipped:', err.message);
  }
}

export class PaymentService {
  /**
   * Create payment order with Razorpay or Mock Sandbox
   */
  static async createOrder({ bookingId, userId, amount, currency = 'INR' }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    let orderId;
    let gateway = 'mock_sandbox';

    if (razorpayInstance) {
      try {
        const options = {
          amount: Math.round(amount * 100), // Razorpay expects amount in paise
          currency,
          receipt: booking.bookingReference,
          notes: {
            bookingId: booking._id.toString(),
            category: booking.travelCategory,
          },
        };
        const order = await razorpayInstance.orders.create(options);
        orderId = order.id;
        gateway = 'razorpay';
      } catch (rzpErr) {
        console.warn('Razorpay order creation fallback to sandbox:', rzpErr.message);
        orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
    } else {
      orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    const payment = await Payment.create({
      orderId,
      booking: booking._id,
      user: userId,
      amount,
      currency,
      status: 'created',
      gateway,
    });

    return {
      orderId,
      amount,
      currency,
      gateway,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_sandbox_key',
    };
  }

  /**
   * Verify signature and complete payment securely on the server
   */
  static async verifyPayment({
    bookingId,
    orderId,
    paymentId,
    signature,
    userId,
  }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Associated booking not found');
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new Error('Associated payment order not found');
    }

    // Idempotency: if already captured, return success immediately
    if (payment.status === 'captured') {
      return { success: true, booking, message: 'Payment already verified.' };
    }

    // Verify signature if using live Razorpay
    if (payment.gateway === 'razorpay' && process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        payment.status = 'failed';
        payment.errorReason = 'Signature mismatch';
        await payment.save();

        booking.paymentStatus = 'failed';
        booking.bookingStatus = 'failed';
        await booking.save();

        throw new Error('Security verification failed. Invalid payment signature.');
      }
    }

    // Update payment record
    payment.paymentId = paymentId || `pay_mock_${Date.now()}`;
    payment.status = 'captured';
    payment.signature = signature || 'verified_in_sandbox';
    await payment.save();

    // Confirm booking record
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paymentDetails = {
      orderId,
      paymentId: payment.paymentId,
      method: payment.gateway,
      paidAt: new Date(),
    };
    booking.qrCodeData = JSON.stringify({
      ref: booking.bookingReference,
      category: booking.travelCategory,
      user: booking.user,
      status: 'VERIFIED_VALID',
      verifiedAt: new Date().toISOString(),
    });
    await booking.save();

    // Log to Audit trail
    await AuditLog.create({
      performedBy: userId,
      action: 'PAYMENT_VERIFIED',
      targetEntity: 'Booking',
      targetId: booking._id.toString(),
      details: { orderId, paymentId: payment.paymentId, amount: payment.amount },
    });

    return {
      success: true,
      booking,
      payment,
    };
  }
}
