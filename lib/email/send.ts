// Email sending service using Resend

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = params.from || process.env.EMAIL_FROM || 'noreply@realtorproject.com';
  const emailFromName = process.env.EMAIL_FROM_NAME || 'RealtorAI';

  // If Resend is not configured, log and return success (development mode)
  if (!apiKey) {
    console.log('[Email] Resend not configured - simulating email send');
    console.log('[Email] To:', params.to);
    console.log('[Email] Subject:', params.subject);
    console.log('[Email] Text:', params.text.substring(0, 200) + '...');
    
    return {
      success: true,
      messageId: `simulated_${Date.now()}`,
    };
  }

  try {
    // Send via Resend API
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
      console.error('[Email] Resend API error:', error);
      
      return {
        success: false,
        error: `Failed to send email: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    console.log('[Email] Sent successfully:', data.id);
    
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    console.error('[Email] Send error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send email',
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
