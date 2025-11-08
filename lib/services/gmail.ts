import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { EmailPayload } from '../types/onboarding';

// Create Gmail OAuth2 client
export async function getGmailTransporter() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  auth.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await auth.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token || '',
    },
  });

  return transporter;
}

// Send email using Gmail API
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = await getGmailTransporter();

    const mailOptions: any = {
      from: process.env.GMAIL_USER,
      to: payload.to,
      subject: payload.subject,
      html: payload.htmlContent,
      text: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
    };

    if (payload.attachments && payload.attachments.length > 0) {
      mailOptions.attachments = payload.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/octet-stream',
      }));
    }

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Send Google Form link via email
export async function sendGoogleFormEmail(
  recipientName: string,
  recipientEmail: string,
  formUrl: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Our Services!</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          <p>Thank you for choosing our accounting services. To get started with your onboarding, we need some additional information from you.</p>
          <p>Please complete the following form at your earliest convenience:</p>
          <div style="text-align: center;">
            <a href="${formUrl}" class="button">Complete Client Information Form</a>
          </div>
          <p>This form should only take about 5-10 minutes to complete. Once we receive your information, we'll prepare your engagement letter and set up your account.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>Your Accounting Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Complete Your Client Onboarding Form',
    htmlContent,
  });
}

// Send engagement letter email notification
export async function sendEngagementLetterEmail(
  recipientName: string,
  recipientEmail: string,
  zohoSignUrl: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Engagement Letter is Ready</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          <p>Thank you for completing our client information form. We've prepared your engagement letter for your review and signature.</p>
          <p>Please click the button below to review and electronically sign your engagement letter:</p>
          <div style="text-align: center;">
            <a href="${zohoSignUrl}" class="button">Review & Sign Engagement Letter</a>
          </div>
          <p>Once signed, we'll proceed with setting up your payment details and finalizing your account.</p>
          <p>If you have any questions about the engagement letter, please contact us.</p>
          <p>Best regards,<br>Your Accounting Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Please Sign Your Engagement Letter',
    htmlContent,
  });
}

// Send GoCardless payment link email
export async function sendGoCardlessEmail(
  recipientName: string,
  recipientEmail: string,
  paymentLinkUrl: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Set Up Your Payment Details</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          <p>To complete your account setup, please authorize our payment collection via GoCardless Direct Debit.</p>
          <p>This is a secure, easy way to ensure your monthly fees are paid automatically.</p>
          <div style="text-align: center;">
            <a href="${paymentLinkUrl}" class="button">Set Up Direct Debit</a>
          </div>
          <p><strong>What is GoCardless?</strong><br>
          GoCardless is a trusted Direct Debit provider used by thousands of businesses. Your bank details are securely stored and protected.</p>
          <p>If you have any questions about setting up Direct Debit, please contact us.</p>
          <p>Best regards,<br>Your Accounting Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Set Up Your Direct Debit Payment',
    htmlContent,
  });
}

// Send request for missing information (UTR, auth code, etc.)
export async function sendMissingInfoRequest(
  recipientName: string,
  recipientEmail: string,
  missingFields: string[]
): Promise<{ success: boolean; error?: string }> {
  const fieldsList = missingFields.map(field => `<li>${field}</li>`).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        ul { background: white; padding: 20px 40px; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Additional Information Required</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          <p>To complete your onboarding, we need the following additional information:</p>
          <ul>
            ${fieldsList}
          </ul>
          <p>Please reply to this email with the requested information, or contact us if you need assistance locating these details.</p>
          <p><strong>Where to find your UTR number:</strong><br>
          Your UTR (Unique Taxpayer Reference) can be found on correspondence from HMRC, including tax returns and notices to file.</p>
          <p>Best regards,<br>Your Accounting Team</p>
        </div>
        <div class="footer">
          <p>Please reply with the requested information.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Additional Information Required for Your Account',
    htmlContent,
  });
}
