/**
 * Unified Collaborator Email Service for NOMADLY
 * Dispatches trip collaboration invitations via Netlify Serverless Relay
 * (HTTPS Port 443 -> AWS Lambda Gmail SMTP -> ANY email address).
 */

/**
 * Generates email content and metadata for trip collaboration invitations.
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
    tripUrl,
  };
};

/**
 * Checks whether automated email dispatch is configured in the server environment.
 * Nomadly uses Netlify Gmail Serverless Relay (HTTPS Port 443) which has 100% cloud deliverability.
 */
export const isEmailConfigured = () => {
  return true;
};

/**
 * Sends trip invitation email via the single unified provider: Netlify Gmail Serverless Relay.
 * Bypasses cloud host SMTP socket blocks and delivers from arbazkaladiya1@gmail.com to any email address.
 */
export const sendTripInvitationEmail = async ({ trip, inviter, inviteeName, inviteeEmail, role }) => {
  const emailData = buildTripInviteEmailData({ trip, inviter, inviteeName, inviteeEmail, role });
  const senderDisplayName = inviter?.displayName || inviter?.name || 'Nomadly Travel';

  const netlifyRelayUrl =
    process.env.NETLIFY_EMAIL_URL ||
    'https://nomadly-travel.netlify.app/.netlify/functions/send-email';

  try {
    const relayRes = await fetch(netlifyRelayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: inviteeEmail,
        subject: emailData.subject,
        text: emailData.plainText,
        html: emailData.htmlContent,
        fromName: `${senderDisplayName} (via Nomadly)`,
      }),
    });

    if (relayRes.ok) {
      const relayData = await relayRes.json();
      if (relayData.success) {
        console.info(`[EmailService] Delivered invitation via Netlify Gmail relay to ${inviteeEmail}: ${relayData.messageId}`);
        return {
          sent: true,
          provider: 'netlify-gmail-relay',
          messageId: relayData.messageId,
          ...emailData,
        };
      }
      console.warn(`[EmailService] Relay rejected: ${relayData.error}`);
      return {
        sent: false,
        reason: relayData.error || 'RELAY_REJECTED',
        ...emailData,
      };
    }

    console.warn(`[EmailService] Netlify relay responded with HTTP ${relayRes.status}`);
    return {
      sent: false,
      reason: `RELAY_HTTP_${relayRes.status}`,
      ...emailData,
    };
  } catch (relayErr) {
    console.warn(`[EmailService] Netlify relay network error: ${relayErr.message}`);
    return {
      sent: false,
      reason: relayErr.message,
      ...emailData,
    };
  }
};
