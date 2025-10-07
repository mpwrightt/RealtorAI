// Email templates for various notifications

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// New Buyer Session Created
export function newBuyerSessionEmail(data: {
  buyerName: string;
  agentName: string;
  sessionCode: string;
  portalUrl: string;
}): EmailTemplate {
  return {
    subject: `Welcome to Your Property Search Portal - ${data.agentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Your Property Portal!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.buyerName},</p>
              
              <p>Welcome! ${data.agentName} has created a personalized property search portal just for you.</p>
              
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Browse curated property listings</li>
                <li>Get AI-powered property insights</li>
                <li>Save your favorite properties</li>
                <li>Calculate mortgage payments</li>
                <li>Schedule property tours</li>
                <li>Submit offers directly</li>
                <li>Message your agent anytime</li>
              </ul>
              
              <a href="${data.portalUrl}" class="button">Access Your Portal</a>
              
              <p>Your portal link: <a href="${data.portalUrl}">${data.portalUrl}</a></p>
              
              <p>Save this link - you can return anytime to continue your search!</p>
              
              <p>Best regards,<br>${data.agentName}</p>
            </div>
            <div class="footer">
              <p>Powered by RealtorAI</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Your Property Portal!

Hi ${data.buyerName},

Welcome! ${data.agentName} has created a personalized property search portal just for you.

What you can do:
• Browse curated property listings
• Get AI-powered property insights
• Save your favorite properties
• Calculate mortgage payments
• Schedule property tours
• Submit offers directly
• Message your agent anytime

Access your portal: ${data.portalUrl}

Save this link - you can return anytime to continue your search!

Best regards,
${data.agentName}

---
Powered by RealtorAI
    `.trim(),
  };
}

// New Seller Session Created
export function newSellerSessionEmail(data: {
  sellerName: string;
  agentName: string;
  propertyAddress: string;
  sessionCode: string;
  portalUrl: string;
}): EmailTemplate {
  return {
    subject: `Your Property Analytics Portal - ${data.propertyAddress}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Property Portal is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.sellerName},</p>
              
              <p>${data.agentName} has created a private analytics portal for your property at <strong>${data.propertyAddress}</strong>.</p>
              
              <p><strong>Track your listing performance:</strong></p>
              <ul>
                <li>Real-time view analytics</li>
                <li>Visitor engagement metrics</li>
                <li>Days on market tracking</li>
                <li>Offer management</li>
                <li>AI-powered marketing content</li>
                <li>Open house scheduling</li>
                <li>Direct messaging with agent</li>
              </ul>
              
              <a href="${data.portalUrl}" class="button">View Your Analytics</a>
              
              <p>Your portal link: <a href="${data.portalUrl}">${data.portalUrl}</a></p>
              
              <p>Check back anytime to see how your property is performing!</p>
              
              <p>Best regards,<br>${data.agentName}</p>
            </div>
            <div class="footer">
              <p>Powered by RealtorAI</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Your Property Portal is Ready!

Hi ${data.sellerName},

${data.agentName} has created a private analytics portal for your property at ${data.propertyAddress}.

Track your listing performance:
• Real-time view analytics
• Visitor engagement metrics
• Days on market tracking
• Offer management
• AI-powered marketing content
• Open house scheduling
• Direct messaging with agent

Access your portal: ${data.portalUrl}

Check back anytime to see how your property is performing!

Best regards,
${data.agentName}

---
Powered by RealtorAI
    `.trim(),
  };
}

// New Offer Received
export function newOfferEmail(data: {
  sellerName: string;
  agentName: string;
  propertyAddress: string;
  offerAmount: number;
  buyerName: string;
  portalUrl: string;
}): EmailTemplate {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(data.offerAmount);

  return {
    subject: `New Offer on ${data.propertyAddress} - ${formattedAmount}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .offer-box { background: white; border: 2px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .button { background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Offer Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.sellerName},</p>
              
              <p>Great news! You've received a new offer on your property.</p>
              
              <div class="offer-box">
                <h2>${formattedAmount}</h2>
                <p><strong>Property:</strong> ${data.propertyAddress}</p>
                <p><strong>Buyer:</strong> ${data.buyerName}</p>
              </div>
              
              <p>${data.agentName} will contact you shortly to discuss the offer details and next steps.</p>
              
              <a href="${data.portalUrl}" class="button">View Offer Details</a>
              
              <p>You can review all offer details in your seller portal.</p>
              
              <p>Best regards,<br>${data.agentName}</p>
            </div>
            <div class="footer">
              <p>Powered by RealtorAI</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🎉 New Offer Received!

Hi ${data.sellerName},

Great news! You've received a new offer on your property.

Offer Amount: ${formattedAmount}
Property: ${data.propertyAddress}
Buyer: ${data.buyerName}

${data.agentName} will contact you shortly to discuss the offer details and next steps.

View offer details: ${data.portalUrl}

Best regards,
${data.agentName}

---
Powered by RealtorAI
    `.trim(),
  };
}

// Tour Request Received
export function tourRequestEmail(data: {
  agentName: string;
  agentEmail: string;
  propertyAddress: string;
  buyerName: string;
  requestedDate: string;
  timeSlot: string;
  notes?: string;
}): EmailTemplate {
  return {
    subject: `Tour Request: ${data.propertyAddress} - ${data.requestedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .request-box { background: white; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Tour Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.agentName},</p>
              
              <p>You have a new tour request:</p>
              
              <div class="request-box">
                <p><strong>Property:</strong> ${data.propertyAddress}</p>
                <p><strong>Buyer:</strong> ${data.buyerName}</p>
                <p><strong>Requested Date:</strong> ${data.requestedDate}</p>
                <p><strong>Time:</strong> ${data.timeSlot}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>
              
              <p>Please confirm or suggest alternative times with ${data.buyerName}.</p>
              
              <p>Best regards,<br>RealtorAI System</p>
            </div>
            <div class="footer">
              <p>Powered by RealtorAI</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Tour Request

Hi ${data.agentName},

You have a new tour request:

Property: ${data.propertyAddress}
Buyer: ${data.buyerName}
Requested Date: ${data.requestedDate}
Time: ${data.timeSlot}
${data.notes ? `Notes: ${data.notes}` : ''}

Please confirm or suggest alternative times with ${data.buyerName}.

Best regards,
RealtorAI System

---
Powered by RealtorAI
    `.trim(),
  };
}

// New Message Notification
export function newMessageEmail(data: {
  recipientName: string;
  senderName: string;
  message: string;
  portalUrl: string;
}): EmailTemplate {
  return {
    subject: `New Message from ${data.senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .message-box { background: white; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; font-style: italic; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Message</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              
              <p>You have a new message from ${data.senderName}:</p>
              
              <div class="message-box">
                ${data.message}
              </div>
              
              <a href="${data.portalUrl}" class="button">Reply</a>
              
              <p>You can view and reply to this message in your portal.</p>
            </div>
            <div class="footer">
              <p>Powered by RealtorAI</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Message from ${data.senderName}

Hi ${data.recipientName},

You have a new message from ${data.senderName}:

"${data.message}"

Reply here: ${data.portalUrl}

---
Powered by RealtorAI
    `.trim(),
  };
}
