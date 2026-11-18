import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Service health check & unified email service status
 * @access  Public
 */
router.get('/health', (req, res) => {
  const netlifyRelayUrl =
    process.env.NETLIFY_EMAIL_URL ||
    'https://nomadly-travel.netlify.app/.netlify/functions/send-email';

  res.status(200).json({
    status: 'online',
    platform: 'NOMADLY Travel Reservation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    emailService: {
      configured: true,
      provider: 'netlify-gmail-relay',
      relayEndpoint: netlifyRelayUrl,
    },
  });
});

/**
 * @route   GET /api/test-email
 * @desc    Unified Netlify Serverless Gmail relay diagnostics endpoint
 * @access  Public (Diagnostic)
 */
router.get('/test-email', async (req, res) => {
  const testTo = req.query.to || 'traveler@nomadly.test';
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
        text: 'Success! Your Nomadly unified email relay is verified and delivering invitations.',
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

    return res.status(relayRes.status || 500).json({
      success: false,
      provider: 'netlify-gmail-relay',
      error: relayData.error || `HTTP ${relayRes.status}`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      provider: 'netlify-gmail-relay',
      error: err.message,
    });
  }
});

export default router;
