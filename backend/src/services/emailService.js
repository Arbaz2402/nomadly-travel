import nodemailer from 'nodemailer';

/**
 * Generates email content and Gmail Web Compose URL for trip collaboration invitations.
 * Uses high-deliverability email standards to prevent spam filtering.
 */
export const buildTripInviteEmailData = ({ trip, inviter, inviteeName, inviteeEmail, role }) => {
  // Never put http://localhost in emails because Google spam filters instantly flag localhost as phishing/spam
  let clientBaseUrl = process.env.CLIENT_URL || 'https://nomadly-travel.netlify.app';
  if (!clientBaseUrl.startsWith('https://') || clientBaseUrl.includes('localhost')) {
    clientBaseUrl = 'https://nomadly-travel.netlify.app';
  }
  const tripUrl = `${clientBaseUrl}/journeys/${trip._id}`;

  const inviterName = inviter?.displayName || inviter?.name || 'A fellow traveler';
  const tripTitle = trip?.title || 'Trip Itinerary';
  const destination = trip?.destination || 'our destination';
  const roleName = (role || 'editor').toLowerCase();

  const formattedDates = trip?.startDate
    ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${trip?.endDate ? ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`
    : 'Upcoming Travel';

  // Natural human subject line (reduces spam score)
  const subject = `${inviterName} invited you to join a trip to ${destination}`;

  const plainText = `Hi ${inviteeName || 'there'},

${inviterName} invited you to collaborate on their upcoming trip to ${destination}: "${tripTitle}".

Trip Details:
• Destination: ${destination}
• Dates: ${formattedDates}
• Role: ${roleName === 'editor' ? 'Editor (collaborate on itinerary and track expenses)' : 'Viewer (view itinerary and map stops)'}

Accept your invitation and view the trip:
${tripUrl}

Happy travels,
Nomadly Team
${clientBaseUrl}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inviteeEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%); text-align: left;">
              <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">NOMADLY</span>
              <span style="font-size: 11px; color: #94a3b8; margin-left: 8px; text-transform: uppercase; letter-spacing: 1.5px;">Trip Collaboration</span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${inviterName} invited you to join their trip!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                You have been invited to plan and collaborate on <strong>${tripTitle}</strong> as an <strong>${roleName === 'editor' ? 'Editor' : 'Viewer'}</strong>.
              </p>

              <!-- Trip Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 28px; border-left: 4px solid #0d9488;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                      <strong>📍 Destination:</strong> ${destination}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                      <strong>📅 Dates:</strong> ${formattedDates}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #334155;">
                      <strong>👥 Permission:</strong> <span style="color: #0d9488; font-weight: 600;">${roleName === 'editor' ? 'Full editing & expense tracking' : 'View itinerary & maps'}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${tripUrl}" target="_blank" style="display: inline-block; background-color: #ff5e3a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(255, 94, 58, 0.25);">
                      Accept & View Journey
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                Or paste this URL in your browser: <br>
                <a href="${tripUrl}" style="color: #0d9488; text-decoration: underline; word-break: break-all;">${tripUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                This invitation was sent by ${inviterName} via <a href="${clientBaseUrl}" style="color: #64748b; text-decoration: none;">Nomadly Travel</a>.<br>
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    plainText,
    htmlContent,
    gmailComposeUrl,
    tripUrl,
  };
};

/**
 * Checks whether SMTP credentials are fully provided in the server environment.
 */
export const isEmailConfigured = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  return Boolean(user && pass);
};

/**
 * Sends trip invitation email via configured SMTP (e.g. Gmail App Password, Sendgrid, etc.)
 * Configured with anti-spam headers and deliverability standards.
 */
export const sendTripInvitationEmail = async ({ trip, inviter, inviteeName, inviteeEmail, role }) => {
  const emailData = buildTripInviteEmailData({ trip, inviter, inviteeName, inviteeEmail, role });

  const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  const cleanPass = rawPass.replace(/\s+/g, ''); // automatically strip spaces from 16-character Google App Passwords
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (!smtpUser || !cleanPass) {
    console.warn(`[EmailService] SMTP credentials not set on server. EMAIL_USER=${smtpUser ? 'SET' : 'MISSING'}, EMAIL_PASS=${cleanPass ? 'SET' : 'MISSING'}.`);
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
      ...emailData,
    };
  }

  try {
    const transporter = nodemailer.createTransport(
      smtpHost && smtpHost !== 'smtp.gmail.com'
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: cleanPass,
            },
          }
        : {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS on port 587 for maximum cloud provider deliverability
            auth: {
              user: smtpUser,
              pass: cleanPass,
            },
            tls: {
              rejectUnauthorized: true,
            },
            connectionTimeout: 12000,
          }
    );

    const senderDisplayName = inviter?.displayName || inviter?.name || 'Nomadly Travel';

    const info = await transporter.sendMail({
      from: `"${senderDisplayName} (via Nomadly)" <${smtpUser}>`,
      replyTo: inviter?.email || smtpUser,
      to: inviteeEmail,
      subject: emailData.subject,
      text: emailData.plainText,
      html: emailData.htmlContent,
      headers: {
        'X-Entity-Ref-ID': `${trip._id}-${Date.now()}`,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    });

    console.info(`[EmailService] Collaboration invitation successfully sent to ${inviteeEmail}: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
      ...emailData,
    };
  } catch (error) {
    console.error(`[EmailService] Failed to dispatch email via SMTP: ${error.message}`);
    return {
      sent: false,
      reason: error.message,
      ...emailData,
    };
  }
};
