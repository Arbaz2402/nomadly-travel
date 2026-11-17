import nodemailer from 'nodemailer';

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      },
      body: '',
    };
  }

  // Handle health check GET
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'online',
        service: 'Nomadly Netlify Email Relay',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { to, subject, html, text, fromName } = body;

    if (!to || !subject) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Fields "to" and "subject" are required' }),
      };
    }

    const smtpUser = (process.env.EMAIL_USER || process.env.GMAIL_USER || 'arbazkaladiya1@gmail.com').trim();
    const rawPass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || 'okgmoyrrjbelpsuw').trim();
    const smtpPass = rawPass.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"${fromName || 'Nomadly Travel'}" <${smtpUser}>`,
      replyTo: smtpUser,
      to,
      subject,
      text: text || '',
      html: html || '',
      headers: {
        'X-Entity-Ref-ID': `relay-${Date.now()}`,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    });

    console.log(`[Netlify Relay] Successfully dispatched email to ${to}: ${info.messageId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
      }),
    };
  } catch (err) {
    console.error('[Netlify Relay] Error dispatching email:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
};
