import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Service health check & email service status
 * @access  Public
 */
router.get('/health', (req, res) => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const netlifyRelayUrl = process.env.NETLIFY_EMAIL_URL;

  res.status(200).json({
    status: 'online',
    platform: 'NOMADLY Travel Reservation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    emailService: {
      configured: Boolean((emailUser && emailPass) || resendApiKey || netlifyRelayUrl),
      provider: netlifyRelayUrl
        ? 'netlify-relay'
        : resendApiKey
        ? 'resend-https'
        : emailUser
        ? 'nodemailer-smtp'
        : 'none',
      sender: emailUser ? `${emailUser.slice(0, 3)}***@${emailUser.split('@')[1] || ''}` : null,
    },
  });
});

/**
 * @route   GET /api/test-email
 * @desc    SMTP, Resend & Netlify relay diagnostics endpoint
 * @access  Public (Diagnostic)
 */
router.get('/test-email', async (req, res) => {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  const cleanPass = rawPass.replace(/\s+/g, '');
  const testTo = req.query.to || smtpUser || 'traveler@nomadly.test';

  // 1. Primary: Netlify Serverless Relay
  const netlifyRelayUrl =
    process.env.NETLIFY_EMAIL_URL ||
    'https://nomadly-travel.netlify.app/.netlify/functions/send-email';

  try {
    const relayRes = await fetch(netlifyRelayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testTo,
        subject: 'Nomadly Live Verification Test',
        text: 'Success! Your Nomadly email relay is verified and delivering invitations.',
        fromName: 'Nomadly Travel',
      }),
    });
    const relayData = await relayRes.json();
    if (relayRes.ok && relayData.success) {
      return res.json({
        success: true,
        provider: 'netlify-gmail-relay',
        recipient: testTo,
        messageId: relayData.messageId,
      });
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Secondary: Resend HTTPS API (Port 443)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Nomadly Travel <onboarding@resend.dev>',
          to: [testTo],
          subject: 'Nomadly Resend HTTPS Live Verification',
          text: 'Success! Your Nomadly email integration via Resend HTTPS (Port 443) is working.',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return res.json({ success: true, provider: 'resend-https', recipient: testTo, messageId: data.id });
      }
      return res.status(400).json({ success: false, provider: 'resend-https', error: data });
    } catch (err) {
      return res.status(500).json({ success: false, provider: 'resend-https', error: err.message });
    }
  }

  // 3. Fallback: Direct Nodemailer SMTP
  if (!smtpUser || !cleanPass) {
    return res.status(400).json({
      success: false,
      message: 'Email credentials not configured in environment',
      user: smtpUser ? 'set' : 'missing',
      pass: cleanPass ? 'set' : 'missing',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_PORT === '465',
      auth: { user: smtpUser, pass: cleanPass },
      tls: { rejectUnauthorized: true },
      connectionTimeout: 8000,
    });

    await transporter.verify();

    if (req.query.send === 'true') {
      const info = await transporter.sendMail({
        from: `"Nomadly Travel" <${smtpUser}>`,
        to: testTo,
        subject: 'Nomadly SMTP Live Verification',
        text: 'Success! Your Nomadly SMTP connection is delivering emails.',
      });
      return res.json({ success: true, provider: 'smtp', verified: true, sent: true, recipient: testTo, messageId: info.messageId });
    }

    return res.json({
      success: true,
      provider: 'smtp',
      verified: true,
      sent: false,
      message: 'SMTP connection verified successfully. Append ?send=true to dispatch a test email.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      provider: 'smtp',
      error: err.message,
      code: err.code,
    });
  }
});

export default router;
