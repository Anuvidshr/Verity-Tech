/**
 * Vercel Serverless Function — Verity Flux Contact Handler
 * Endpoint: POST /api/contact
 * 
 * Features:
 * 1. Validates and sanitizes all inbound project enquiry fields.
 * 2. Uses RESEND_API_KEY environment variable.
 * 3. Sends structured agency briefing email to hello@verityflux.in (with client reply_to).
 * 4. Sends client confirmation receipt to the submitted email.
 * 5. Returns structured JSON success / error responses.
 */

// Helper to escape HTML and prevent injection attacks in HTML emails
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Simple RFC-compliant email regex
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(String(email).trim().toLowerCase());
}

export default async function handler(req, res) {
  // 1. Enforce POST method only
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. This endpoint only accepts POST requests.'
    });
  }

  // 2. Parse request body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON payload received.'
      });
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Missing request body.'
    });
  }

  const {
    name,
    businessName = '',
    email,
    phone,
    businessType = 'Other',
    service = 'General Enquiry',
    budget = '',
    message = ''
  } = body;

  // 3. Validation & Sanitization
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  const cleanBusinessName = String(businessName || '').trim();
  const cleanBusinessType = String(businessType || '').trim();
  const cleanService = String(service || '').trim();
  const cleanBudget = String(budget || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid name (at least 2 characters).'
    });
  }

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.'
    });
  }

  if (!cleanPhone || cleanPhone.length < 7) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid phone or WhatsApp number.'
    });
  }

  if (cleanMessage.length > 4000) {
    return res.status(400).json({
      success: false,
      error: 'Project description is too long (maximum 4,000 characters).'
    });
  }

  // 4. Check for Resend API Key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('Server Configuration Error: RESEND_API_KEY is not defined in environment variables.');
    return res.status(500).json({
      success: false,
      error: 'Email service configuration missing. Please ensure RESEND_API_KEY is added to your Vercel project environment variables.'
    });
  }

  // Default sender and recipients
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Verity Flux <hello@verityflux.in>';
  const toAdminEmail = 'hello@verityflux.in';

  // Formatted date string (IST)
  const timestampIST = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  // Prepare sanitized variables for HTML templates
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safePhone = escapeHtml(cleanPhone);
  const safeBusinessName = escapeHtml(cleanBusinessName || 'Not specified');
  const safeBusinessType = escapeHtml(cleanBusinessType);
  const safeService = escapeHtml(cleanService);
  const safeBudget = escapeHtml(cleanBudget);
  const safeMessageHtml = cleanMessage
    ? escapeHtml(cleanMessage).replace(/\n/g, '<br>')
    : '<em style="color: #8C7B6D;">No specific notes provided</em>';

  // 5. Build HTML Template: Admin Inbound Lead Notification
  const adminEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Project Enquiry — Verity Flux</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #231C14; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F3ED; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E6DCCD; box-shadow: 0 12px 32px rgba(35, 28, 20, 0.06);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #16120E; padding: 32px 36px; text-align: left; border-bottom: 3px solid #D4A55A;">
              <div style="font-size: 11px; letter-spacing: 0.16em; font-weight: 800; color: #D4A55A; text-transform: uppercase; margin-bottom: 6px;">INBOUND PROJECT ENQUIRY</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em;">New Client Brief: ${safeName}</h1>
            </td>
          </tr>

          <!-- Summary Strip -->
          <tr>
            <td style="padding: 24px 36px 8px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FBF8F3; border-radius: 12px; border: 1px solid #EFE8DC; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #7C5320; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Service Requested</div>
                    <div style="font-size: 17px; font-weight: 700; color: #16120E;">${safeService}</div>
                  </td>
                  ${cleanBudget ? `
                  <td align="right">
                    <div style="font-size: 12px; font-weight: 700; color: #7C5320; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Budget Range</div>
                    <div style="font-size: 16px; font-weight: 700; color: #B8823A;">${safeBudget}</div>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Details Table -->
          <tr>
            <td style="padding: 16px 36px 28px 36px;">
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #F0E8DC;">
                  <td width="35%" style="padding: 12px 0; color: #786657; font-weight: 600;">Client Name</td>
                  <td style="padding: 12px 0; color: #16120E; font-weight: 700;">${safeName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F0E8DC;">
                  <td style="padding: 12px 0; color: #786657; font-weight: 600;">Business Name</td>
                  <td style="padding: 12px 0; color: #16120E; font-weight: 600;">${safeBusinessName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F0E8DC;">
                  <td style="padding: 12px 0; color: #786657; font-weight: 600;">Email Address</td>
                  <td style="padding: 12px 0;">
                    <a href="mailto:${safeEmail}" style="color: #B8823A; text-decoration: none; font-weight: 600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #F0E8DC;">
                  <td style="padding: 12px 0; color: #786657; font-weight: 600;">Phone / WhatsApp</td>
                  <td style="padding: 12px 0;">
                    <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}" style="color: #B8823A; text-decoration: none; font-weight: 600;">${safePhone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #F0E8DC;">
                  <td style="padding: 12px 0; color: #786657; font-weight: 600;">Industry / Type</td>
                  <td style="padding: 12px 0; color: #16120E;">${safeBusinessType}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0 6px 0; color: #786657; font-weight: 600; vertical-align: top;">Project Brief</td>
                  <td style="padding: 14px 0 6px 0; color: #231C14; line-height: 1.6; vertical-align: top;">
                    <div style="background-color: #FBF8F3; border: 1px solid #EFE8DC; border-radius: 8px; padding: 14px 16px;">
                      ${safeMessageHtml}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Quick Action Bar -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E6DCCD; text-align: center;">
                <a href="mailto:${safeEmail}?subject=Re:%20Verity%20Flux%20—%20Your%20Project%20Enquiry" style="display: inline-block; background-color: #16120E; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-right: 10px;">Reply via Email</a>
                <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${cleanName}, thank you for reaching out to Verity Flux regarding ${cleanService}.`)}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Chat on WhatsApp</a>
              </div>
            </td>
          </tr>

          <!-- Timestamp Footer -->
          <tr>
            <td style="background-color: #FBF8F3; padding: 16px 36px; border-top: 1px solid #EFE8DC; font-size: 12px; color: #8C7B6D; text-align: center;">
              Submitted on ${timestampIST} via verityflux.in contact form
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // 6. Build HTML Template: Client Confirmation Receipt
  const clientConfirmationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>We've Received Your Enquiry — Verity Flux</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #231C14; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F3ED; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E6DCCD; box-shadow: 0 12px 32px rgba(35, 28, 20, 0.06);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #16120E; padding: 32px 36px; text-align: left; border-bottom: 3px solid #D4A55A;">
              <div style="font-size: 12px; letter-spacing: 0.16em; font-weight: 800; color: #D4A55A; text-transform: uppercase; margin-bottom: 6px;">VERITY FLUX STUDIO</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em;">We've received your project enquiry</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px 20px 36px;">
              <p style="font-size: 16px; line-height: 1.6; color: #16120E; margin-top: 0; margin-bottom: 16px;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.65; color: #4A3E31; margin-bottom: 22px;">
                Thank you for reaching out to <strong>Verity Flux</strong>. We have successfully logged your project enquiry for <em>${safeBusinessName}</em> regarding <strong>${safeService}</strong>.
              </p>
              <p style="font-size: 15px; line-height: 1.65; color: #4A3E31; margin-bottom: 26px;">
                A digital strategist from our studio is currently reviewing your brief and technical requirements. We will review your goals and reach out within <strong>24 hours</strong> with initial recommendations and scope next steps.
              </p>

              <!-- Submission Snapshot Table -->
              <div style="background-color: #FBF8F3; border: 1px solid #EFE8DC; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 800; color: #7C5320; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Enquiry Summary</div>
                <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 14px;">
                  <tr>
                    <td width="35%" style="color: #786657; font-weight: 600; padding: 6px 0;">Service:</td>
                    <td style="color: #16120E; font-weight: 700; padding: 6px 0;">${safeService}</td>
                  </tr>
                  ${cleanBudget ? `
                  <tr>
                    <td style="color: #786657; font-weight: 600; padding: 6px 0;">Budget Range:</td>
                    <td style="color: #16120E; font-weight: 600; padding: 6px 0;">${safeBudget}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="color: #786657; font-weight: 600; padding: 6px 0;">Contact Phone:</td>
                    <td style="color: #16120E; padding: 6px 0;">${safePhone}</td>
                  </tr>
                </table>
              </div>

              <!-- Instant WhatsApp Contact -->
              <p style="font-size: 14px; line-height: 1.6; color: #786657; margin-bottom: 12px;">
                Need an immediate answer or have quick questions? You can also reach our team directly on WhatsApp:
              </p>
              <div style="margin-bottom: 24px;">
                <a href="https://wa.me/918982820353?text=${encodeURIComponent(`Hi Verity Flux, this is ${cleanName}. I just submitted an enquiry for ${cleanBusinessName || 'my business'} regarding ${cleanService}.`)}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 8px;">
                  Chat with us on WhatsApp (+91 89828 20353) →
                </a>
              </div>

              <p style="font-size: 14px; color: #786657; margin-top: 24px; margin-bottom: 0;">
                Warm regards,<br>
                <strong style="color: #16120E;">The Verity Flux Team</strong><br>
                <a href="https://verityflux.in" style="color: #B8823A; text-decoration: none;">verityflux.in</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FBF8F3; padding: 18px 36px; border-top: 1px solid #EFE8DC; font-size: 12px; color: #8C7B6D; text-align: center;">
              This is an automated confirmation of your enquiry submitted to Verity Flux.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // 7. Dispatch Emails via Resend REST API
  try {
    // Dispatch Admin Notification Email
    const adminEmailPayload = {
      from: fromEmail,
      to: [toAdminEmail],
      reply_to: cleanEmail,
      subject: `[New Enquiry] ${cleanName} — ${cleanService}${cleanBudget ? ` (${cleanBudget})` : ''}`,
      html: adminEmailHtml
    };

    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminEmailPayload)
    });

    const adminData = await adminResponse.json().catch(() => ({}));

    if (!adminResponse.ok) {
      console.error('Resend API Error (Admin Notification):', adminData);
      const errMsg = adminData.message || adminData.error || 'Failed to dispatch notification email via Resend.';
      return res.status(adminResponse.status >= 400 && adminResponse.status < 500 ? 400 : 502).json({
        success: false,
        error: errMsg,
        hint: 'Please verify that RESEND_API_KEY is active and the sender domain is verified in your Resend dashboard.'
      });
    }

    // Dispatch Client Confirmation Email (asynchronous, non-blocking if fails)
    try {
      const clientEmailPayload = {
        from: fromEmail,
        to: [cleanEmail],
        reply_to: toAdminEmail,
        subject: `We've received your project enquiry — Verity Flux`,
        html: clientConfirmationHtml
      };

      const clientResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientEmailPayload)
      });

      if (!clientResponse.ok) {
        const clientErr = await clientResponse.json().catch(() => ({}));
        console.warn('Resend Client Confirmation Warning:', clientErr);
      }
    } catch (clientSendErr) {
      console.warn('Failed to dispatch client confirmation email:', clientSendErr.message);
      // We don't fail the request if the client copy fails, as the admin notification was successfully recorded.
    }

    return res.status(200).json({
      success: true,
      message: 'Your project enquiry has been sent successfully.',
      id: adminData.id
    });

  } catch (networkError) {
    console.error('Network Error while communicating with Resend:', networkError);
    return res.status(500).json({
      success: false,
      error: 'An unexpected network error occurred while sending your enquiry. Please reach out via WhatsApp.'
    });
  }
}
