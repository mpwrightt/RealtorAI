// Multi-provider email sending service

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  // Agent-specific integration (optional)
  integration?: {
    provider: 'resend' | 'sendgrid' | 'mailgun';
    apiKey: string;
    fromEmail?: string;
  };
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Use agent's integration if provided, otherwise fallback to platform defaults
  const provider = params.integration?.provider || 'resend';
  const apiKey = params.integration?.apiKey || process.env.RESEND_API_KEY;
  
  // Allow per-agent customization, fallback to env defaults
  const emailFrom = params.integration?.fromEmail || params.from || process.env.EMAIL_FROM || 'noreply@realtorproject.com';
  const emailFromName = params.fromName || process.env.EMAIL_FROM_NAME || 'RealtorAI';

  // If not configured, log and return success (development mode)
  if (!apiKey) {
    console.log(`[Email] ${provider} not configured - simulating email send`);
    console.log('[Email] To:', params.to);
    console.log('[Email] Subject:', params.subject);
    console.log('[Email] Text:', params.text.substring(0, 200) + '...');
    
    return {
      success: true,
      messageId: `simulated_${Date.now()}`,
    };
  }

  // Route to appropriate provider
  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(apiKey, emailFrom, emailFromName, params);
      case 'sendgrid':
        return await sendViaSendGrid(apiKey, emailFrom, emailFromName, params);
      case 'mailgun':
        return await sendViaMailgun(apiKey, emailFrom, emailFromName, params);
      default:
        return { success: false, error: 'Unknown email provider' };
    }
  } catch (error: any) {
    console.error(`[Email] ${provider} error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

// Resend implementation
async function sendViaResend(apiKey: string, emailFrom: string, emailFromName: string, params: SendEmailParams) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${emailFromName} <${emailFrom}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Resend] API error:', error);
    return {
      success: false,
      error: `Failed to send via Resend: ${response.statusText}`,
    };
  }

  const data = await response.json();
  console.log('[Resend] Sent successfully:', data.id);
  
  return {
    success: true,
    messageId: data.id,
  };
}

// SendGrid implementation
async function sendViaSendGrid(apiKey: string, emailFrom: string, emailFromName: string, params: SendEmailParams) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: params.to }],
        subject: params.subject,
      }],
      from: {
        email: emailFrom,
        name: emailFromName,
      },
      reply_to: params.replyTo ? { email: params.replyTo } : undefined,
      content: [
        { type: 'text/plain', value: params.text },
        { type: 'text/html', value: params.html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[SendGrid] API error:', error);
    return {
      success: false,
      error: `Failed to send via SendGrid: ${response.statusText}`,
    };
  }

  // SendGrid returns 202 with X-Message-Id header
  const messageId = response.headers.get('X-Message-Id') || `sg_${Date.now()}`;
  console.log('[SendGrid] Sent successfully:', messageId);
  
  return {
    success: true,
    messageId,
  };
}

// Mailgun implementation
async function sendViaMailgun(apiKey: string, emailFrom: string, emailFromName: string, params: SendEmailParams) {
  // Mailgun domain must be extracted from emailFrom or configured separately
  const domain = emailFrom.split('@')[1] || 'mg.yourdomain.com';
  
  const formData = new URLSearchParams();
  formData.append('from', `${emailFromName} <${emailFrom}>`);
  formData.append('to', params.to);
  formData.append('subject', params.subject);
  formData.append('text', params.text);
  formData.append('html', params.html);
  if (params.replyTo) formData.append('h:Reply-To', params.replyTo);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Mailgun] API error:', error);
    return {
      success: false,
      error: `Failed to send via Mailgun: ${response.statusText}`,
    };
  }

  const data = await response.json();
  console.log('[Mailgun] Sent successfully:', data.id);
  
  return {
    success: true,
    messageId: data.id,
  };
}
}

// Helper to validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Batch send emails (with rate limiting)
export async function sendBatchEmails(
  emails: SendEmailParams[],
  delayMs: number = 100 // Delay between sends to avoid rate limits
): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
  const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];
  
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    
    // Delay between sends
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}
