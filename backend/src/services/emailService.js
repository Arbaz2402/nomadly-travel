import nodemailer from 'nodemailer';

/**
 * Generates email content and Gmail Web Compose URL for trip collaboration invitations
 */
export const buildTripInviteEmailData = ({ trip, inviter, inviteeName, inviteeEmail, role }) => {
  const clientBaseUrl = process.env.CLIENT_URL || 'https://nomadly-travel.netlify.app';
  const tripUrl = `${clientBaseUrl}/journeys/${trip._id}`;

  const inviterName = inviter?.displayName || inviter?.name || inviter?.email || 'A fellow traveler';
  const tripTitle = trip?.title || 'Trip Itinerary';
  const destination = trip?.destination || 'Upcoming Destination';
  const roleName = (role || 'editor').toUpperCase();

  const formattedDates = trip?.startDate
    ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${trip?.endDate ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`
    : 'Upcoming Journey';

  const subject = `Invitation to collaborate on "${tripTitle}" (${destination}) on Nomadly`;

  const plainText = `Hi ${inviteeName || 'there'},

${inviterName} has invited you to collaborate on the trip "${tripTitle}" (${destination}) as an ${roleName} on Nomadly!

Trip Summary:
• Destination: ${destination}
• Dates: ${formattedDates}
• Your Role: ${roleName} (${role === 'editor' ? 'Can add, edit, and organize activities & split expenses' : 'Can view itinerary & maps'})

To accept this invitation and view the interactive itinerary, map stops, and expenses, open the link below:
${tripUrl}

We look forward to planning an amazing journey with you!

Happy Travels,
The Nomadly Team
${clientBaseUrl}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inviteeEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070d1e; color: #f1f5f9; padding: 32px 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ff5e3a;">NOMADLY</span>
        <span style="display: block; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Smart Travel & Collaboration</span>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px;">You've Been Invited to a Journey!</h2>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
          <strong>${inviterName}</strong> invited you to collaborate on <strong>"${tripTitle}"</strong> as an <strong>${roleName}</strong>.
        </p>
        <div style="background: #0b1528; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #14b8a6;">
          <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;"><strong>📍 Destination:</strong> <span style="color: #f1f5f9;">${destination}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;"><strong>📅 Dates:</strong> <span style="color: #f1f5f9;">${formattedDates}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;"><strong>👥 Role:</strong> <span style="color: #14b8a6; font-weight: 600;">${roleName}</span> (${role === 'editor' ? 'Full editing & expense tracking' : 'Read-only viewer'})</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${tripUrl}" style="display: inline-block; background: #ff5e3a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 94, 58, 0.4);">
            Accept & View Journey
          </a>
        </div>
      </div>
      <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
        If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;

  return {
    subject,
    plainText,
    htmlContent,
    gmailComposeUrl,
    tripUrl,
  };
};

/**
 * Sends trip invitation email via configured SMTP (e.g. Gmail App Password, Sendgrid, etc.)
 * If SMTP credentials are not configured, gracefully logs and returns Gmail compose URL.
 */
export const sendTripInvitationEmail = async ({ trip, inviter, inviteeName, inviteeEmail, role }) => {
  const emailData = buildTripInviteEmailData({ trip, inviter, inviteeName, inviteeEmail, role });

  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (!smtpUser || !smtpPass) {
    console.info(`[EmailService] SMTP credentials not set. Invitation URL generated for Gmail compose: ${emailData.gmailComposeUrl}`);
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
      ...emailData,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Nomadly Travel" <${smtpUser}>`,
      to: inviteeEmail,
      subject: emailData.subject,
      text: emailData.plainText,
      html: emailData.htmlContent,
    });

    console.info(`[EmailService] Collaboration invitation sent to ${inviteeEmail}: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
      ...emailData,
    };
  } catch (error) {
    console.warn(`[EmailService] Failed to dispatch email via SMTP: ${error.message}`);
    return {
      sent: false,
      reason: error.message,
      ...emailData,
    };
  }
};
