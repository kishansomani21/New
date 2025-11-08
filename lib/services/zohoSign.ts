import axios from 'axios';
import FormData from 'form-data';
import { ZohoSignRequest, ZohoSignResponse } from '../types/onboarding';

const ZOHO_SIGN_API_BASE = 'https://sign.zoho.eu/api/v1'; // Use .eu or .com based on your region

export async function sendDocumentForSignature(
  request: ZohoSignRequest
): Promise<{
  success: boolean;
  data?: ZohoSignResponse;
  error?: string;
}> {
  try {
    const formData = new FormData();

    // Create request data
    const requestData = {
      requests: {
        request_name: request.documentName,
        actions: [
          {
            recipient_name: request.recipientName,
            recipient_email: request.recipientEmail,
            action_type: 'SIGN',
            private_notes: 'Please review and sign this document',
            signing_order: 0,
          },
        ],
        expiration_days: 30,
        is_sequential: true,
        email_reminders: true,
      },
    };

    formData.append('data', JSON.stringify(requestData));

    // Add document - either from URL or base64
    if (request.documentBase64) {
      const buffer = Buffer.from(request.documentBase64, 'base64');
      formData.append('file', buffer, {
        filename: `${request.documentName}.pdf`,
        contentType: 'application/pdf',
      });
    }

    const response = await axios.post(
      `${ZOHO_SIGN_API_BASE}/requests`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_SIGN_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.data.status === 'success') {
      const requestInfo = response.data.requests;
      return {
        success: true,
        data: {
          requestId: requestInfo.request_id,
          status: requestInfo.request_status,
          documentId: requestInfo.document_ids?.[0] || '',
          signingUrl: requestInfo.actions?.[0]?.action_url || '',
        },
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to send document for signature',
      };
    }
  } catch (error: any) {
    console.error('Error sending document to Zoho Sign:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function checkSignatureStatus(requestId: string): Promise<{
  success: boolean;
  status?: 'pending' | 'completed' | 'declined' | 'expired';
  error?: string;
}> {
  try {
    const response = await axios.get(
      `${ZOHO_SIGN_API_BASE}/requests/${requestId}`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_SIGN_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.data.status === 'success') {
      const requestStatus = response.data.requests.request_status;

      let normalizedStatus: 'pending' | 'completed' | 'declined' | 'expired';

      if (requestStatus === 'completed') normalizedStatus = 'completed';
      else if (requestStatus === 'declined') normalizedStatus = 'declined';
      else if (requestStatus === 'expired') normalizedStatus = 'expired';
      else normalizedStatus = 'pending';

      return {
        success: true,
        status: normalizedStatus,
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to check signature status',
      };
    }
  } catch (error: any) {
    console.error('Error checking signature status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function downloadSignedDocument(requestId: string): Promise<{
  success: boolean;
  documentBuffer?: Buffer;
  error?: string;
}> {
  try {
    const response = await axios.get(
      `${ZOHO_SIGN_API_BASE}/requests/${requestId}/pdf`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_SIGN_ACCESS_TOKEN}`,
        },
        responseType: 'arraybuffer',
      }
    );

    return {
      success: true,
      documentBuffer: Buffer.from(response.data),
    };
  } catch (error: any) {
    console.error('Error downloading signed document:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Webhook handler for Zoho Sign events
export function parseZohoSignWebhook(payload: any): {
  requestId: string;
  event: string;
  status: string;
  recipientEmail: string;
} | null {
  try {
    return {
      requestId: payload.requests?.request_id,
      event: payload.requests?.request_type_name,
      status: payload.requests?.request_status,
      recipientEmail: payload.requests?.actions?.[0]?.recipient_email,
    };
  } catch (error) {
    console.error('Error parsing Zoho Sign webhook:', error);
    return null;
  }
}
