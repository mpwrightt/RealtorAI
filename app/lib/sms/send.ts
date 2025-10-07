// Multi-provider SMS sending service

export interface SendSmsParams {
  to: string;
  body: string;
  // Agent-specific integration (optional)
  integration?: {
    provider: 'twilio' | 'messagebird' | 'vonage' | 'aws-sns';
    // Twilio
    accountSid?: string;
    authToken?: string;
    // MessageBird
    accessKey?: string;
    // Vonage
    apiKey?: string;
    apiSecret?: string;
    // AWS SNS
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsRegion?: string;
    // Common
    phoneNumber: string;
  };
}

export async function sendSms(params: SendSmsParams): Promise<{ 
  success: boolean; 
  messageId?: string; 
  error?: string;
  provider?: string;
}> {
  // Use agent's integration if provided, otherwise fallback to platform defaults
  const provider = params.integration?.provider || 'twilio';
  const fromNumber = params.integration?.phoneNumber || process.env.TWILIO_PHONE_NUMBER;
  
  // If not configured, log and return success (development mode)
  if (!params.integration && !process.env.TWILIO_ACCOUNT_SID) {
    console.log(`[SMS] ${provider} not configured - simulating SMS send`);
    console.log('[SMS] To:', params.to);
    console.log('[SMS] From:', fromNumber);
    console.log('[SMS] Body:', params.body.substring(0, 100) + '...');
    
    return {
      success: true,
      messageId: `simulated_${Date.now()}`,
      provider: 'simulation',
    };
  }

  // Route to appropriate provider
  try {
    switch (provider) {
      case 'twilio':
        return await sendViaTwilio(params);
      case 'messagebird':
        return await sendViaMessageBird(params);
      case 'vonage':
        return await sendViaVonage(params);
      case 'aws-sns':
        return await sendViaAwsSns(params);
      default:
        return { success: false, error: 'Unknown SMS provider' };
    }
  } catch (error: any) {
    console.error(`[SMS] ${provider} error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
      provider,
    };
  }
}

// Twilio implementation
async function sendViaTwilio(params: SendSmsParams) {
  const accountSid = params.integration?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = params.integration?.authToken || process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = params.integration?.phoneNumber || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio credentials missing' };
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    
    const message = await client.messages.create({
      body: params.body,
      from: fromNumber,
      to: params.to,
    });

    console.log('[Twilio] Sent successfully:', message.sid);
    
    return {
      success: true,
      messageId: message.sid,
      provider: 'twilio',
    };
  } catch (error: any) {
    console.error('[Twilio] API error:', error);
    return {
      success: false,
      error: `Failed to send via Twilio: ${error.message}`,
      provider: 'twilio',
    };
  }
}

// MessageBird implementation
async function sendViaMessageBird(params: SendSmsParams) {
  const accessKey = params.integration?.accessKey;
  const fromNumber = params.integration?.phoneNumber;

  if (!accessKey || !fromNumber) {
    return { success: false, error: 'MessageBird credentials missing' };
  }

  try {
    const response = await fetch('https://rest.messagebird.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${accessKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originator: fromNumber,
        recipients: [params.to],
        body: params.body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[MessageBird] API error:', error);
      return {
        success: false,
        error: `Failed to send via MessageBird: ${response.statusText}`,
        provider: 'messagebird',
      };
    }

    const data = await response.json();
    console.log('[MessageBird] Sent successfully:', data.id);
    
    return {
      success: true,
      messageId: data.id,
      provider: 'messagebird',
    };
  } catch (error: any) {
    console.error('[MessageBird] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send via MessageBird',
      provider: 'messagebird',
    };
  }
}

// Vonage (Nexmo) implementation
async function sendViaVonage(params: SendSmsParams) {
  const apiKey = params.integration?.apiKey;
  const apiSecret = params.integration?.apiSecret;
  const fromNumber = params.integration?.phoneNumber;

  if (!apiKey || !apiSecret || !fromNumber) {
    return { success: false, error: 'Vonage credentials missing' };
  }

  try {
    const response = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        api_secret: apiSecret,
        from: fromNumber,
        to: params.to,
        text: params.body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Vonage] API error:', error);
      return {
        success: false,
        error: `Failed to send via Vonage: ${response.statusText}`,
        provider: 'vonage',
      };
    }

    const data = await response.json();
    
    // Vonage returns array of messages
    if (data.messages && data.messages[0]) {
      const msg = data.messages[0];
      if (msg.status === '0') {
        console.log('[Vonage] Sent successfully:', msg['message-id']);
        return {
          success: true,
          messageId: msg['message-id'],
          provider: 'vonage',
        };
      } else {
        return {
          success: false,
          error: `Vonage error: ${msg['error-text']}`,
          provider: 'vonage',
        };
      }
    }

    return {
      success: false,
      error: 'Invalid Vonage response',
      provider: 'vonage',
    };
  } catch (error: any) {
    console.error('[Vonage] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send via Vonage',
      provider: 'vonage',
    };
  }
}

// AWS SNS implementation
async function sendViaAwsSns(params: SendSmsParams) {
  const awsAccessKeyId = params.integration?.awsAccessKeyId;
  const awsSecretAccessKey = params.integration?.awsSecretAccessKey;
  const awsRegion = params.integration?.awsRegion || 'us-east-1';

  if (!awsAccessKeyId || !awsSecretAccessKey) {
    return { success: false, error: 'AWS credentials missing' };
  }

  try {
    // AWS SDK v3 style
    const { SNSClient, PublishCommand } = await import('@aws-sdk/client-sns');
    
    const client = new SNSClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });

    const command = new PublishCommand({
      Message: params.body,
      PhoneNumber: params.to,
    });

    const response = await client.send(command);
    console.log('[AWS SNS] Sent successfully:', response.MessageId);
    
    return {
      success: true,
      messageId: response.MessageId || `sns_${Date.now()}`,
      provider: 'aws-sns',
    };
  } catch (error: any) {
    console.error('[AWS SNS] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send via AWS SNS',
      provider: 'aws-sns',
    };
  }
}

// Helper to validate phone number format
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

// Batch send SMS (with rate limiting)
export async function sendBatchSms(
  messages: SendSmsParams[],
  delayMs: number = 100 // Delay between sends to avoid rate limits
): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
  const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];
  
  for (const message of messages) {
    const result = await sendSms(message);
    results.push(result);
    
    // Delay between sends
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}
